from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.auth import CurrentUser, get_current_user
from app.modules.agent.schemas import (
    ChatRequest,
    ChatResponse,
    DebugChatResponse,
)
from app.modules.agent.service import AgentService
from app.modules.agent.streaming import stream_agent

router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)

service = AgentService()


@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
    _user: CurrentUser = Depends(get_current_user),
):
    return await service.chat(request.question)


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    _user: CurrentUser = Depends(get_current_user),
):
    return StreamingResponse(
        stream_agent(request.question),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/chat/debug",
    response_model=DebugChatResponse,
)
async def chat_debug(
    request: ChatRequest,
    _user: CurrentUser = Depends(get_current_user),
):
    return await service.chat_debug(request.question)
