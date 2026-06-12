import socketio
from app.config.credentials import settings
from app.config.redisConfig import redis_client
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
async def connect(sid, environ):
    print(f"Client connected: {sid}--->>>>>")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.on("client")
async def client_message(sid, data):
    print("[DATA]", data)
    await redis_client.publish(
        channel=f"ghostWyre:{sid}",
        message=json.dumps(
            {
                "type": "ghostWyre",
                "payload":data,
                "room": sid,
            }
        ),
    )
