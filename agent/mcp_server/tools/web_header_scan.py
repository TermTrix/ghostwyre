from fastmcp import FastMCP
from mcp_server.ghots import scan_heasders


def register_ghost_tools(mcp: FastMCP):
    @mcp.tool(
        name="web_header_scanner",
        description="scan websites and detect vulnarable headers",
        meta={"version": "0.0.1", "author": "termtrix"},
    )
    async def header_analyzer(target: str) -> FastMCP:
        try:
            response = await scan_heasders(target=target)
            return response
        except Exception as error:
            return {"status": False, "Error": str(error)}



