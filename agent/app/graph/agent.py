from langgraph.graph import START, END, StateGraph
from app.graph.state import GhostState
from app.graph.nodes.initial_node import final_node
from app.graph.nodes.ghost_nodes import parse_node, planning_node, chat_node
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import ToolNode
from app.graph.mcp_client import client

check_pointer = InMemorySaver()


async def ghoseAgent():
    try:
        tools = await client.get_tools()
        tool_node = ToolNode(tools)

        print(tools, "TOOLS")

        graph = StateGraph(GhostState)
        graph.add_node("initial_node", parse_node)
        graph.add_node("chat_node", chat_node)
        graph.add_node("planning_node", planning_node)
        graph.add_node("tool_node", tool_node)
        graph.add_node("final_node", final_node)

        graph.add_edge(START, "initial_node")
        graph.add_conditional_edges(source="initial_node", path=route_based_on_intent,path_map={
            "chat_node":"chat_node",
            "planning_node":"planning_node"
        })
        graph.add_edge("chat_node",END)
        graph.add_edge("planning_node", "tool_node")
        graph.add_edge("tool_node", "final_node")
        graph.add_edge("final_node", END)

        agent = graph.compile(checkpointer=check_pointer)

        return agent
    except Exception as error:
        print("[ERROR _>]", str(error))


def route_based_on_intent(state: GhostState):
    if state["intent"] == "chat":
        return "chat_node"
    return "planning_node"
