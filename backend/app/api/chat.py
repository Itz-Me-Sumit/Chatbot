import json
import uuid
import logging

logger = logging.getLogger("chat")

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
                node = meta.get("langgraph_node")
                if node == "chatbot" and isinstance(chunk, AIMessageChunk):
                    for tc in chunk.tool_call_chunks:
                        if tc.get("name"):
                            yield sse("tool_start", {"name": tc["name"]})
                    if chunk.content:
                        yield sse("token", {"content": chunk.content})
                elif node == "tools" and isinstance(chunk, ToolMessage):
                    yield sse("tool_end", {"name": chunk.name})

            yield sse("done", {})
        except Exception:
            logger.exception("stream failed")
            yield sse("error", {"message": "Model se connection me dikkat aayi, dobara try karo."})

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )