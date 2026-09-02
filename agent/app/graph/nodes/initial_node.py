from app.graph.state import GhostState
from app.services.socker_service import sio

async def initial_node(state : GhostState) -> GhostState:
    try:
        session = state['session']
        # message = state['client_message']
        return {
            "room":"HELLLLO",
            "session":"helllo"
        }
    except Exception as error:
        print("[ERROR]",error)
        

async def second_node(state:GhostState) -> GhostState:
    try:
        print("__>>>")
        print(state)
    except Exception as error:
        print("[ERROR]",error)
        

async def final_node(state:GhostState)->GhostState:
    try:
        print("__>>> FINAL NODE :)",state)
    except Exception as error:
        print("[ERROR]",error)