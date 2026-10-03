from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from app.config import settings


def create_pool() -> AsyncConnectionPool:
    return AsyncConnectionPool(
        conninfo=settings.database_url,
        max_size=10,
        open=False,
        kwargs={"autocommit": True, "prepare_threshold": 0, "row_factory": dict_row},
    )


async def init_db(pool: AsyncConnectionPool) -> None:
    async with pool.connection() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                thread_id  TEXT PRIMARY KEY,
                title      TEXT NOT NULL DEFAULT 'New chat',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_conversations_updated "
            "ON conversations (updated_at DESC)"
        )


async def touch_conversation(pool: AsyncConnectionPool, thread_id: str, first_message: str) -> None:
    # Naya thread ho to title pehle message se banta hai, purana ho to sirf updated_at badhta hai
    title = " ".join(first_message.split())[:50] or "New chat"
    async with pool.connection() as conn:
        await conn.execute(
            """
            INSERT INTO conversations (thread_id, title) VALUES (%s, %s)
            ON CONFLICT (thread_id) DO UPDATE SET updated_at = now()
            """,
            (thread_id, title),
        )