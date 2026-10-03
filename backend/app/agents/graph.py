from langchain_core.messages import SystemMessage
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.agents.llm import get_llm

SYSTEM_PROMPT = (
    "You are a helpful assistant. Reply in the same language as the user. "
    "Be clear and concise. "
    "Use the web_search tool for recent events, current facts, or anything "
    "you are unsure about, and use current_datetime when the date or time matters. "
    "Do not use tools for simple questions you can answer directly."
)


def build_graph(checkpointer=None, tools=None):
    tools = tools or []
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools) if tools else llm

    async def chatbot_node(state: MessagesState):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    builder = StateGraph(MessagesState)
    builder.add_node("chatbot", chatbot_node)
    builder.add_edge(START, "chatbot")

    if tools:
        builder.add_node("tools", ToolNode(tools))
        # chatbot ne tool call kiya to "tools" par jao, warna END
        builder.add_conditional_edges("chatbot", tools_condition)
        builder.add_edge("tools", "chatbot")
    else:
        builder.add_edge("chatbot", END)

    return builder.compile(checkpointer=checkpointer)