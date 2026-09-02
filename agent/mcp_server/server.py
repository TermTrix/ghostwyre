from fastmcp import FastMCP

from starlette.applications import Starlette
from starlette.routing import Mount
from .tools.web_header_scan import build_web_server
from .tools.network.icmp import build_network_server

from fastmcp.server.event_store import EventStore
from key_value.aio.stores.redis import RedisStore

from mcp_server.config.credentilas import settings

redis_store = RedisStore(url=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0")
event_store = EventStore(
    storage=redis_store,
    max_events_per_stream=100,  # Keep last 100 events per stream
    ttl=3600,  # Events expire after 1 hour
)


ROOT_URL = "http://localhost:8002"
MOUNT_PREFIX = "/api"
MCP_PATH = "/mcp"

mcp = FastMCP(name="GhostWyre")

mcp.mount(build_web_server(), namespace="web")
mcp.mount(build_network_server(), namespace="network")


mcp_app = mcp.http_app(path=MCP_PATH,event_store=event_store)

# Assemble the application
app = Starlette(
    routes=[
        Mount(MOUNT_PREFIX, app=mcp_app),
        
    ],
    lifespan=mcp_app.lifespan,
)
