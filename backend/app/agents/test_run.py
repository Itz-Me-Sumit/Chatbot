import asyncio

from app.agents.graph import build_graph


async def main():
    graph = build_graph()
    inputs = {"messages": [("user", "LangGraph kya hai? 2 line me batao.")]}

    async for chunk, _meta in graph.astream(inputs, stream_mode="messages"):
        print(chunk.content, end="", flush=True)
    print()


asyncio.run(main())