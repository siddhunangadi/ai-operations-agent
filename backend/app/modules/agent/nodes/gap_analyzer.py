from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.modules.agent.registry import TOOL_DESCRIPTIONS

settings = get_settings()


class GapOutput(BaseModel):

    missing_information: list[str]

    recommended_tools: list[str]

    reasoning: str


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
).with_structured_output(GapOutput)


SYSTEM_PROMPT = """
You are an AI Operations investigation agent.

The agent already has evidence.

Your job is NOT to answer the user.

Determine:

1. What information is still missing.
2. Which available tools should be executed next.

Only recommend tools that have NOT already been executed.

Return JSON only.
"""


async def gap_analyzer_node(state):

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


Completed Tools

{state["completed_tools"]}


Available Tools

{TOOL_DESCRIPTIONS}

"""

            )

        ]

    )

    state["scratchpad"].append(

        "Gap Analysis: " + result.reasoning

    )

    state["missing_information"] = result.missing_information

    state["recommended_tools"] = result.recommended_tools

    return state
