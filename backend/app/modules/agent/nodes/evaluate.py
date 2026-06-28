from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings

settings = get_settings()


class EvaluationOutput(BaseModel):
    confidence: float
    enough_evidence: bool
    reasoning: str


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0,
).with_structured_output(EvaluationOutput)


SYSTEM_PROMPT = """
You are evaluating whether the AI Operations Agent has gathered enough evidence.

Return:

confidence: value between 0 and 1

enough_evidence: true or false

reasoning: short explanation

Be conservative.

If important information is still missing, return enough_evidence=false.

IMPORTANT:
confidence MUST always be a decimal number between 0.0 and 1.0.
Never return values greater than 1.
"""


async def evaluate_node(state):

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

""",
            ),
        ]
    )

    confidence = float(result.confidence)

    # Clamp confidence to [0.0, 1.0]
    if confidence < 0.0:
        confidence = 0.0
    elif confidence > 1.0:
        confidence = 1.0

    state["confidence"] = confidence
    state["finished"] = result.enough_evidence

    state["scratchpad"].append(
        f"Confidence={confidence:.2f} : {result.reasoning}"
    )

    return state
