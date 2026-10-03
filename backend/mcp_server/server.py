import asyncio
from datetime import datetime, timezone

from ddgs import DDGS
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("chatbot-tools", host="0.0.0.0", port=8001)


@mcp.tool()
async def web_search(query: str, max_results: int = 5) -> str:
    """Search the web for current information. Use this for recent events,
    facts you are unsure about, or anything that needs up-to-date data.

    Args:
        query: The search query.
        max_results: Number of results to return (1-10).
    """
    max_results = max(1, min(max_results, 10))

    def _search():
        return DDGS().text(query, max_results=max_results)

    try:
        results = await asyncio.to_thread(_search)
    except Exception as e:
        return f"Search failed: {e}"

    if not results:
        return "No results found."

    lines = []
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. {r.get('title', '')}\n   {r.get('href', '')}\n   {r.get('body', '')}")
    return "\n\n".join(lines)


@mcp.tool()
async def current_datetime() -> str:
    """Get the current date and time in UTC."""
    return datetime.now(timezone.utc).strftime("%A, %d %B %Y, %H:%M UTC")


if __name__ == "__main__":
    mcp.run(transport="streamable-http")