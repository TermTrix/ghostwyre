from fastmcp import FastMCP
import httpx

from pydantic import BaseModel, IPvAnyAddress


def build_network_server() -> FastMCP:
    mcp = FastMCP(name="GhostWyre.network")

    @mcp.tool(
        name="icmp",
        description="icmp tool used for check fist the target is active",
        meta={"version": "0.0.1", "author": "termtrix"},
    )
    def icmp_tool(target: IPvAnyAddress):
        print("ICMP", target)
        # res = collectRes(IPvAnyAddress)
        return {"target": "192.168.1.10", "protocol": "ICMP", "status": "reachable"}

    return mcp


async def collectRes(target: IPvAnyAddress):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url=f"http://localhost:8001/is-target-active", params={"target": target}
        )
        if response.status_code:
            return response.json()
