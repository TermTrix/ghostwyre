import socketio
from app.config.credentials import settings
from app.config.redisConfig import redis_client
from app.config.firebase import verify_socket_token
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
    print(payload,"------------")
    if not payload:
        # Rejects the handshake; the client receives a `connect_error`.
        raise ConnectionRefusedError("unauthorized")

    await sio.save_session(sid, {"user": payload})
    print(f"Client connected: {sid} ({payload.get('email')})")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


from app.graph.agent import ghoseAgent
from uuid import uuid4

async def test_node(query:str,session:str,sid:str):
    graph = await ghoseAgent()
        
    thread_id = str(uuid4())

    config = {"configurable": {"thread_id": thread_id, "session_id": session}}
    await graph.ainvoke(
        {
            "session": "12345",
            "query":query,
            "sid":sid
        },
        config=config,
    )




@sio.on("client")
async def client_message(sid, data):
    print("[DATA]", data,"DIF__>",sid)
    
    is_first_msg = data.get("first_msg",False)
    
    if is_first_msg:
        await test_node(
            query=data.get("message"),
            session=data.get("client_id"),
            sid=sid
        )
        
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
