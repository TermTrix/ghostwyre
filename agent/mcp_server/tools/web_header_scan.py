from fastmcp import FastMCP
from mcp_server.ghots import scan_heasders


def build_web_server() -> FastMCP:
    mcp = FastMCP(name="GhostWyre.web")

    @mcp.tool(
        name="web_header_scanner",
        description="scan websites and detect vulnarable headers",
        meta={"version": "0.0.1", "author": "termtrix"},
    )
    async def header_analyzer(target: str) -> dict:
        try:
            response = await scan_heasders(target=target)
            return response
        except Exception as error:
            return {"status": False, "Error": str(error)}

    return mcp



