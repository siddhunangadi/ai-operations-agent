from typing import Any

from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class ActionResponse(BaseModel):
    should_execute: bool
    action_name: str | None = None
    status: str | None = None


class ChatResponse(BaseModel):
    success: bool
    answer: str
    confidence: float
    goal: str
    strategy: str
    tools_used: list[str]
    action: ActionResponse | None = None


class DebugChatResponse(BaseModel):
    state: dict[str, Any]
