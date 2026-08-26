import httpx
from mcp_server.config.credentilas import settings


async def scan_heasders(target: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url=f"http://localhost:8001/scan-headers", params={"target": target}
            )
            if response.status_code:
                return response.json()

    except Exception as error:
        return {"[ERROR]": str(error)}
