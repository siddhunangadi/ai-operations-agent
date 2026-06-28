from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.modules.agent.registry import TOOL_DESCRIPTIONS

settings = get_settings()


class PlanOutput(BaseModel):

    reasoning: str

    strategy: str

    goal: str

    steps: list[str]


llm = ChatGoogleGenerativeAI(

    model="gemini-2.5-flash",

    google_api_key=settings.GEMINI_API_KEY,

    temperature=0,

).with_structured_output(PlanOutput)


SYSTEM_PROMPT = """
You are the Planning Brain of an autonomous AI Operations Agent.

You NEVER answer the user's question.

Your responsibilities:

1. Understand the user's objective.
2. Understand the organization's current state.
3. Select an investigation strategy.
4. Produce the minimum sequence of tools needed.

Available strategies:

- Usage Investigation
- Cost Investigation
- Budget Investigation
- Forecast Investigation
- Provider Investigation
- Optimization Investigation
- Mixed Investigation

Rules:

• Reuse knowledge from the World Model whenever possible.
• Avoid redundant investigations.
• Never execute unnecessary tools.
• Choose only tools that are relevant.
• Return JSON only.
"""


async def create_plan(

    question: str,

    world_model: dict,

    memory: list,

):

    prompt = f"""

USER QUESTION

{question}


CURRENT WORLD MODEL

{world_model}


RECENT MEMORY

{memory[-5:] if memory else []}


AVAILABLE TOOLS

{TOOL_DESCRIPTIONS}


Return:

reasoning

strategy

goal

steps

"""

    return await llm.ainvoke(

        [

            ("system", SYSTEM_PROMPT),

            ("human", prompt),

        ]

    )
