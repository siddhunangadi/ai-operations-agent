from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings

settings = get_settings()


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
)


class Responder:

    async def respond(
        self,
        question: str,
        results: dict,
    ):

        prompt = f"""
Question:

{question}

Tool Results:

{results}

Write a professional answer.

Never invent data.

Only use the supplied tool results.
"""

        response = llm.invoke(prompt)

        return response.content
