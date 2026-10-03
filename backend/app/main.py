from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.graph import build_graph
from app.api.chat import router as chat_router

from app.config import settings
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.db import create_pool, init_db
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.api.conversations import router as conversations_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = create_pool()
    await pool.open()
    try:
        checkpointer = AsyncPostgresSaver(pool)
        await checkpointer.setup()
        await init_db(pool)

        mcp_client = MultiServerMCPClient(
            {
                "tools": {
                    "url": settings.mcp_server_url,
                    "transport": "streamable_http",
                }
            }
        )
        tools = await mcp_client.get_tools()
        print("Loaded MCP tools:", [t.name for t in tools])

        app.state.pool = pool
        app.state.graph = build_graph(checkpointer, tools)
        yield
    finally:
        await pool.close()

app = FastAPI(title="Chatbot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React (Vite) dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(conversations_router)

@app.get("/health")
async def health():
    return {"status": "ok"}