from langchain_openai import AzureChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.config.credentials import settings
from dotenv import load_dotenv
load_dotenv()

import getpass
import os

if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter your Groq API key: ")

class AvaialbleModels:
    def __init__(self):
        self.OpenAI: None = self.loadOpenAI()
        # self.Gemini: None = self.loadGemini()
        self.Groq: ChatGroq = self.loadGroq()

    def loadOpenAI(self):
        return AzureChatOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
            api_version=settings.OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        )

    def loadGroq(slef):
        return ChatGroq(
            model="qwen/qwen3-32b",
            temperature=0,
            max_tokens=None,
            reasoning_format="parsed",
            timeout=None,
            max_retries=2,
        )


model = AvaialbleModels()
