import socketio
from app.config.credentials import settings
from app.config.redisConfig import redis_client
from app.config.firebase import verify_socket_token
from app.services import session_registry
import json

mgr = socketio.AsyncRedisManager(
    url=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_interval=25,
    ping_timeout=60,
    # client_manager=mgr
)


@sio.event
async def connect(sid, environ, auth):
    payload = verify_socket_token(environ)
    if not payload:
        print("UNAUTHORIZED USER SOCKET")
        # Rejects the handshake; the client receives a `connect_error`.
        raise ConnectionRefusedError("unauthorized")

    await sio.save_session(sid, {"user": payload})
    print(f"Client connected: {sid} ({payload.get('email')})")


@sio.event
async def disconnect(sid):
    session_registry.drop(sid)
    print(f"Client disconnected: {sid}")


from app.graph.agent import ghoseAgent


async def run_agent(query: str, session: str, sid: str):
    graph = await ghoseAgent()

    # The session id is the conversation thread, so the checkpointer resumes
    # the same thread on every message instead of starting a fresh one.
    config = {"configurable": {"thread_id": session, "session_id": session}}
    await graph.ainvoke(
        {
            "session": session,
            "query": query,
            "sid": sid,
        },
        config=config,
    )


@sio.on("client")
async def client_message(sid, data):
    query = data.get("message")
    session = data.get("client_id")

    if not query or not session:
        print(f"[Ghostwyre] dropped malformed client message from {sid}: {data}")
        return

    # Bind this conversation to the authenticated socket user on first contact,
    # so the thread_id is tied to a verified user and cleaned up on disconnect.
    entry = session_registry.get(sid)
    if entry is None:
        socket_session = await sio.get_session(sid)
        entry = session_registry.register(sid, socket_session.get("user"), session)

    # `first_msg` only marks the start of a conversation; every message runs
    # the graph the same way, and progress streams back on ghostWyre:{sid}.
    await run_agent(query=query, session=entry["thread_id"], sid=sid)

    # await redis_client.publish(
    #     channel=f"ghostWyre:{sid}",
    #     message=json.dumps(
    #         {
    #             "type": "ghostWyre",
    #             "payload":data,
    #             "room": sid,
    #         }
    #     ),
    # )
