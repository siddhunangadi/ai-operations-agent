from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings

settings = get_settings()


class CriticOutput(BaseModel):
    approved: bool
    confidence: float
    feedback: str


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
).with_structured_output(CriticOutput)


SYSTEM_PROMPT = """
You are a senior AI Operations reviewer.

Review the evidence collected by another AI agent.

Reject answers that:
- are unsupported
- ignore evidence
- make assumptions
- contradict tool results

Return JSON only.

IMPORTANT:
confidence MUST be a decimal number between 0.0 and 1.0.
Never return values greater than 1.0.
"""


async def critic_node(state):

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


Tool Results

{state["tool_results"]}

""",
            ),
        ]
    )

    confidence = float(result.confidence)

    if confidence < 0.0:
        confidence = 0.0
    elif confidence > 1.0:
        confidence = 1.0

    state["confidence"] = confidence

    state["scratchpad"].append(
        f"Critic ({confidence:.2f}): {result.feedback}"
    )

    if not result.approved:
        state["finished"] = False

    return state
