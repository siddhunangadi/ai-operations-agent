from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.modules.agent.repositories.learning_repository import learning_repository

settings = get_settings()


class Lesson(BaseModel):

    lesson_type: str

    lesson: dict

    confidence: float


llm = ChatGoogleGenerativeAI(

    model="gemini-2.5-flash",

    google_api_key=settings.GEMINI_API_KEY,

    temperature=0,

).with_structured_output(Lesson)


SYSTEM_PROMPT = """
You are the Learning Engine.

Your job is NOT to summarize.

Extract reusable organizational knowledge.

Examples:

Provider Preference

Cost Trend

Performance Trend

Optimization Rule

Budget Insight

Operational Insight

Return only one high-value lesson.
"""


async def learn_node(state):

    result = await llm.ainvoke(

        [

            ("system", SYSTEM_PROMPT),

            (

                "human",

f"""

Question

{state["question"]}


Evidence

{state["evidence"]}


Answer

{state["answer"]}

"""

            )

        ]

    )

    await learning_repository.save(

        {

            "organization_id": "org_1",

            "lesson_type": result.lesson_type,

            "lesson": result.lesson,

            "confidence": result.confidence,

        }

    )

    return state
