
from redis.asyncio import Redis
from app.config.credentials import settings
from arq.connections import RedisSettings

class RedisConfig:
    def __init__(self) -> None:
        self.async_instance: Redis = self.load_async()
        self.arq_worker_setting = RedisSettings(
            host=settings.REDIS_HOST,
            username=settings.REDIS_USER_NAME,
            port=settings.REDIS_PORT
        )
    def load_async(self):
        aio_redis = Redis(host=settings.REDIS_HOST, username=settings.REDIS_USER_NAME, port=6379)
        return aio_redis
    
init_redis = RedisConfig()

redis_client = init_redis.async_instance
REDIS_SETTINGS = init_redis.arq_worker_setting