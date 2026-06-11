import socketio

sio = socketio.AsyncServer(
    cors_allowed_origins="*", client_manager=socketio.AsyncRedisManager(url="")
)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}--->>>>>>{environ}")
    
    
@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")