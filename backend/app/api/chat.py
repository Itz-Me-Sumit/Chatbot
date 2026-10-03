import json
import uuid

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.api.schemas import ChatRequest
from app.db import touch_conversation

from langchain_core.messages import AIMessageChunk, ToolMessage

router = APIRouter(prefix="/api", tags=["chat"])


def sse(event: str, data: dict) -> str:
    # SSE ka format: event line, data line, phir ek khali line
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    graph = request.app.state.graph
    thread_id = req.thread_id or str(uuid.uuid4())
    await touch_conversation(request.app.state.pool, thread_id, req.message)
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": 12}

    inputs = {"messages": [("user", req.message)]}

    async def event_gen():
        yield sse("start", {"thread_id": thread_id})
        try:
            async for chunk, meta in graph.astream(
                inputs, config=config, stream_mode="messages"
            ):
                if meta.get("langgraph_node") == "chatbot" and chunk.content:
                    yield sse("token", {"content": chunk.content})
            yield sse("done", {})
        except Exception as e:
            yield sse("error", {"message": str(e)})

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )