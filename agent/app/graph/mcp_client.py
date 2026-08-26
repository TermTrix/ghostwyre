from langchain_mcp_adapters.client import MultiServerMCPClient
from mcp.client.streamable_http import streamablehttp_client
client = MultiServerMCPClient(
    {"ghost_tools": {"transport": "http", "url": "http://localhost:8001/api/mcp/"}}
)



# async def main_():
#     tools = await client.get_tools()
    
#     print(tools)