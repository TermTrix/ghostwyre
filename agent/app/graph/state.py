from typing import TypedDict, Dict, List, Any,Optional,Annotated
from app.schemas.agent_schemas import ParsedIntent
from langgraph.graph.message import add_messages

class GhostState(TypedDict):
    sid: str
    query: str
    intent: str
    parsed: Optional[ParsedIntent] = None
    plan: List[Dict[str,str]]
    tool_results: List[Dict]
    session: str
    response: str
    messages:Annotated[list,add_messages]
    