from app.graph.state import GhostState
from app.config.modelConfig import model
from app.schemas.agent_schemas import ParsedIntent, StucturePlaning
from langchain_core.prompts import ChatPromptTemplate
from app.config.redisConfig import redis_client
import json

import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")


_template = ChatPromptTemplate(
    [
        ("system", "Extract the security task from the user query. Be concise."),
        ("human", "{user_input}"),
    ]
)

_structured_model = model.OpenAI.with_structured_output(ParsedIntent)
_chain = _template | _structured_model


async def parse_node(state: GhostState) -> GhostState:
    try:
        result: ParsedIntent = await _chain.ainvoke({"user_input": state["query"]})
        
        await redis_client.publish(
            f"ghostWyre:{state['sid']}",
            json.dumps({
                "type": "progress",
                "step": "parse_node",
                "payload": result.summary,
                "room": state["sid"],
            })
        )
        # print(result, "[RESULT]")
        return {
            "intent": result.intent,
            "parsed": result.model_dump(),
        }
    except Exception as error:
        print("[ERROR parse_node]", error)


_template_for_planinig_node = ChatPromptTemplate([
    ("system",
     "You are a security planning agent. "
     "Given a task, return a structured list of tool steps to execute. "
     "Available tools: nmap_scan, whois_lookup, dns_enum, cve_lookup. "
     "Always invoke the provided function — never respond conversationally."),
    ("human", "Task: {summary}\nTarget: {target}\nScan type: {scan_type}"),
])


_structured_planing_model = model.Groq.with_structured_output(StucturePlaning)
_chain_for_plan = _template_for_planinig_node | _structured_planing_model


import asyncio 

async def planning_node(state: GhostState) -> GhostState:
    try:
        parsed_data = state["parsed"]
        target = parsed_data.get("target")
        scan_type = parsed_data.get("scan_type")
        summary = parsed_data.get("summary")

        result: StucturePlaning = await _chain_for_plan.ainvoke(
            {"summary": summary, "scan_type": scan_type, "target": target}
        )
        stuctured_result = result.model_dump()
        
        
        for plan in stuctured_result.get("plan", []):
            
            await redis_client.publish(
                f"ghostWyre:{state['sid']}",
                json.dumps({
                    "type": "progress",
                    "step": "planning_node",
                    "payload": plan.get("reason"),
                    "room": state["sid"],
                })
            )
            await asyncio.sleep(2)
        return {"plan": stuctured_result.get("plan", [])}
    except Exception as error:
        print("[ERROR planning_node]", error)
