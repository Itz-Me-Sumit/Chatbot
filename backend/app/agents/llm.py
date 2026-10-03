from langchain_openai import ChatOpenAI

from app.config import settings


def get_llm() -> ChatOpenAI:
    # OpenRouter OpenAI-compatible hai, isliye sirf base_url badalna hai
    return ChatOpenAI(
    model=settings.openrouter_model,
    api_key=settings.openrouter_api_key,
    base_url=settings.openrouter_base_url,
    temperature=0.7,
    streaming=True,
    timeout=60,
    max_retries=1,
    )