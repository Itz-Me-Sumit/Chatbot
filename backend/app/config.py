import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openrouter_api_key: str
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    langsmith_tracing: bool = False
    langsmith_api_key: str | None = None
    langsmith_project: str = "chatbot-dev"


settings = Settings()

# LangSmith env vars se hi kaam karta hai, isliye unhe os.environ me
# dalna zaroori hai (pydantic sirf .env padhta hai, os.environ me nahi daalta).
if settings.langsmith_tracing and settings.langsmith_api_key:
    os.environ["LANGSMITH_TRACING"] = "true"
    os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
    os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project