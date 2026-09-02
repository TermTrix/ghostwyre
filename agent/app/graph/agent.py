from langgraph.graph import START, END, StateGraph
from app.graph.state import GhostState
from app.graph.nodes.initial_node import final_node
from app.graph.nodes.ghost_nodes import parse_node, planning_node, chat_node
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import ToolNode
from app.graph.mcp_client import client

# InMemorySaver keeps conversation state per thread_id, but loses it on restart.
# Swap for a Redis/Postgres checkpointer to make threads survive restarts.
check_pointer = InMemorySaver()

# The compiled graph is cached so MCP tools are fetched and the graph is built
# only once for the whole process, not on every incoming message.
_compiled_graph = None


async def build_graph():
    """Compile the agent graph once and reuse it for every conversation turn."""
    global _compiled_graph
    if _compiled_graph is not None:
        return _compiled_graph

    try:
        tools = await client.get_tools()
        tool_node = ToolNode(tools)

        graph = StateGraph(GhostState)
        graph.add_node("initial_node", parse_node)
        graph.add_node("chat_node", chat_node)
        graph.add_node("planning_node", planning_node)
        graph.add_node("tool_node", tool_node)
        graph.add_node("final_node", final_node)

        graph.add_edge(START, "initial_node")
        graph.add_conditional_edges(source="initial_node", path=route_based_on_intent, path_map={
            "chat_node": "chat_node",
            "planning_node": "planning_node"
        })
        graph.add_edge("chat_node", END)
        graph.add_edge("planning_node", "tool_node")
        graph.add_edge("tool_node", "final_node")
        graph.add_edge("final_node", END)

        _compiled_graph = graph.compile(checkpointer=check_pointer)
        return _compiled_graph
    except Exception as error:
        print("[ERROR _>]", str(error))


# Backwards-compatible alias: existing callers still say `ghoseAgent()`.
async def ghoseAgent():
    return await build_graph()


def route_based_on_intent(state: GhostState):
    if state["intent"] == "chat":
        return "chat_node"
    return "planning_node"
