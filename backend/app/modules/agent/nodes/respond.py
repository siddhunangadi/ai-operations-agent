from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings

settings = get_settings()


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
)


async def respond_node(state):

    prompt = f"""
You are a Senior AI Operations Engineer.

User Question:
{state["question"]}

Reasoning History:
{state["scratchpad"]}

Collected Tool Results:
{state["tool_results"]}

Write a concise executive response.

Rules:

- Never mention internal tools.
- Never mention reasoning.
- Answer directly.
- Give recommendations if appropriate.
- Use markdown.
"""

    response = await llm.ainvoke(prompt)

    state["answer"] = response.content

    state["finished"] = True

    return state
