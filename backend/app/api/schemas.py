from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    thread_id: str | None = None

class RenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)

