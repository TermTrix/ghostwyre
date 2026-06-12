from typing import TypedDict, Dict, List, Any,Optional
from app.schemas.agent_schemas import ParsedIntent

class GhostState(TypedDict):
    sid: str
    query: str
    intent: str
    parsed: Optional[ParsedIntent] = None
    plan: List[Dict[str,str]]
    tool_results: List[Dict]
    session: str
    response: str
    