from langgraph.graph import START,END,StateGraph
from app.graph.state import GhostState
from app.graph.nodes.initial_node import initial_node,second_node,final_node
from app.graph.nodes.ghost_nodes import parse_node,planning_node
from langgraph.checkpoint.memory import InMemorySaver


check_pointer = InMemorySaver()

async def ghoseAgent():
    try:
        graph = StateGraph(GhostState)
        graph.add_node("initial_node",parse_node)
        graph.add_node("second_node",planning_node)
        graph.add_node("final_node",final_node)
        
        
        graph.add_edge(START,"initial_node")
        graph.add_edge("initial_node","second_node")
        graph.add_edge("second_node","final_node")
        graph.add_edge("final_node",END)
        
        agent = graph.compile(checkpointer=check_pointer)
        
        return agent
    except Exception as error:
        print("[ERROR _>]",str(error))