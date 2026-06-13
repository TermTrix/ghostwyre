import asyncio
import json
from app.config.redisConfig import redis_client
from uuid import uuid4


class GhostAgentWorker:
    def __init__(self, sio):
        self.sio_client = sio
        self.redis_client = redis_client
        self.pub_sub = None
        self.task = None

    async def _start(self):
        try:
            self.pub_sub = self.redis_client.pubsub()
            await self.pub_sub.psubscribe("ghostWyre:*")
            print("[Ghost Activated :)]")
            self.task = asyncio.create_task(self._listen())
        except Exception as error:
            print("[ERROR]", str(error))

    async def _listen(self):
        try:
            async for message in self.pub_sub.listen():
                if message["type"] != "pmessage":
                    continue
                data = message["data"]

                print(type(data), "++++++++++")
                if isinstance(data, bytes):
                    data = data.decode("utf-8")

                try:
                    payload = json.loads(data)
                    print(payload)
                    room = payload.get("room")
                    if room:
                        ghost_response = {
                            "id": str(uuid4()),
                            "content": payload.get("payload"),
                        }
                        await self.sio_client.emit("agent", ghost_response, to=room)
                except Exception:
                    print("❌ Failed to parse JSON from Redis")
                    continue
        except Exception as error:
            print("[ERROR]", error)

    async def _stop(self):
        if self.pub_sub:
            await self.pub_sub.punsubscribe("ghostWyre:*")
            print(
                "[STOPPED] -> 🛑 Unsubscribed from ghostWyre:* and closed pub/sub connection"
            )
