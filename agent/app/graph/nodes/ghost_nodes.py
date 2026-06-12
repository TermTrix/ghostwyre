from app.graph.state import GhostState
from app.config.modelConfig import model
from app.schemas.agent_schemas import ParsedIntent, StucturePlaning
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

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
        # print(result, "[RESULT]")
        return {
            "intent": result.intent,
            "parsed": result.model_dump(),
        }
    except Exception as error:
        print("[ERROR parse_node]", error)


_template_for_planinig_node = PromptTemplate(
    template=(
        "Available tools: nmap_scan, whois_lookup, dns_enum, vuls_scan, cve_lookup.\n"
        "Task: {summary}\nTarget: {target}\nScan type: {scan_type}\n"
        "Return only the tools needed in order, with a one-line reason each."
    ),
    input_variables=["summary", "scan_type", "target"],
)


_structured_planing_model = model.OpenAI.with_structured_output(StucturePlaning)
_chain_for_plan = _template_for_planinig_node | _structured_planing_model


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

        return {"plan": stuctured_result.get("plan", [])}
    except Exception as error:
        print("[ERROR parse_node]", error)
