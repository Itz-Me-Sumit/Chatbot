from fastapi import APIRouter, HTTPException, Request

from app.api.schemas import RenameRequest

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("")
async def list_conversations(request: Request):
    async with request.app.state.pool.connection() as conn:
        cur = await conn.execute(
            "SELECT thread_id, title, created_at, updated_at "
            "FROM conversations ORDER BY updated_at DESC"
        )
        return await cur.fetchall()


@router.get("/{thread_id}/messages")
async def get_messages(thread_id: str, request: Request):
    graph = request.app.state.graph
    state = await graph.aget_state({"configurable": {"thread_id": thread_id}})
    msgs = state.values.get("messages", []) if state and state.values else []

    out = []
    for m in msgs:
        if m.type in ("human", "ai") and isinstance(m.content, str) and m.content.strip():
            out.append(
                {
                    "role": "user" if m.type == "human" else "assistant",
                    "content": m.content.strip(),
                }
            )
    return {"thread_id": thread_id, "messages": out}


@router.patch("/{thread_id}")
async def rename_conversation(thread_id: str, body: RenameRequest, request: Request):
    async with request.app.state.pool.connection() as conn:
        cur = await conn.execute(
            "UPDATE conversations SET title = %s WHERE thread_id = %s "
            "RETURNING thread_id, title",
            (body.title.strip(), thread_id),
        )
        row = await cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return row


@router.delete("/{thread_id}")
async def delete_conversation(thread_id: str, request: Request):
    async with request.app.state.pool.connection() as conn:
        cur = await conn.execute(
            "DELETE FROM conversations WHERE thread_id = %s RETURNING thread_id",
            (thread_id,),
        )
        row = await cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    # LangGraph ke checkpoint tables se bhi is thread ka data hata do
    await request.app.state.graph.checkpointer.adelete_thread(thread_id)
    return {"deleted": thread_id}