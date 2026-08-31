from pydantic_settings import BaseSettings,SettingsConfigDict


class Settings(BaseSettings):
    
    # REDIS
    REDIS_HOST:str
    REDIS_PORT:str
    REDIS_USER_NAME :str
    
    AZURE_OPENAI_ENDPOINT:str
    AZURE_OPENAI_API_KEY:str
    OPENAI_API_VERSION:str
    AZURE_OPENAI_DEPLOYMENT:str
    
    # FIREBASE (Project settings -> Service accounts -> Generate new private key)
    FIREBASE_PROJECT_ID : str
    FIREBASE_CLIENT_EMAIL : str
    FIREBASE_PRIVATE_KEY : str
    
    model_config = SettingsConfigDict(
         env_file=".env",
         env_file_encoding="utf-8",
         extra="ignore"
     )
     
settings = Settings()