from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.modules.action.registry import ACTION_REGISTRY

settings = get_settings()


class ActionPlan(BaseModel):

    should_execute: bool

    action_name: str | None = None

    parameters: dict = {}

    reasoning: str


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
).with_structured_output(ActionPlan)


SYSTEM_PROMPT = """
You are the Action Planner.

Based on the completed investigation,
decide whether an operational action should be executed.

Only choose actions from the registry.

Return JSON only.

If no action should be executed:

should_execute = false

action_name = null

parameters = {}
"""


async def plan_action(

    question,

    answer,

    world_model,

):

    prompt = f"""

Question

{question}


Answer

{answer}


World Model

{world_model}


Available Actions

{list(ACTION_REGISTRY.keys())}

"""

    return await llm.ainvoke(

        [

            ("system", SYSTEM_PROMPT),

            ("human", prompt),

        ]

    )
