
from pydantic import BaseModel
from typing import Literal,List


class ParsedIntent(BaseModel):
    intent: Literal["scan", "analyze", "report", "explain","chat"]
    target: str        # IP, domain, or URL extracted from query
    scan_type: Literal["port", "vuln", "dns", "whois", "full", "unknown"]
    summary: str       # one-line restatement of what the user wants



class PlanStep(BaseModel):
    tool: Literal["nmap_scan", "whois_lookup", "dns_enum", "cve_lookup","vul_scan"]
    reason: str  

class StucturePlaning(BaseModel):
    plan: List[PlanStep]




class ChatResponse(BaseModel):
    message:str