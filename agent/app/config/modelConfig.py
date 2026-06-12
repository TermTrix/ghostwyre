
from langchain_openai import AzureChatOpenAI
from app.config.credentials import settings

class AvaialbleModels:
    def __init__(self):
        self.OpenAI:None = self.loadOpenAI()
    
    def loadOpenAI(self):
        return AzureChatOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
            api_version=settings.OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
    


model = AvaialbleModels()
