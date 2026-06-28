from fastapi import APIRouter, Depends, Query

from app.core.auth import CurrentUser, get_current_user
from app.modules.dashboard.service import dashboard_service

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
async def get_dashboard(_user: CurrentUser = Depends(get_current_user)):
    return await dashboard_service.get_dashboard()


@router.get("/usage")
async def get_usage():
    return await dashboard_service.get_usage()


@router.get("/cost")
async def get_cost():
    return await dashboard_service.get_cost()


@router.get("/providers")
async def get_providers():
    return await dashboard_service.get_providers()


@router.get("/forecast")
async def get_forecast():
    return await dashboard_service.get_forecast()


@router.get("/budget")
async def get_budget():
    return await dashboard_service.get_budget()


@router.get("/recommendations")
async def get_recommendations():
    return await dashboard_service.get_recommendations()


@router.get("/health")
async def get_health():
    return await dashboard_service.get_health()


@router.get("/world-model")
async def get_world_model():
    return await dashboard_service.get_world_model()


@router.get("/learning")
async def get_learning(
    limit: int = Query(default=20, ge=1, le=100),
):
    return await dashboard_service.get_learning(limit=limit)


@router.get("/actions")
async def get_actions(
    limit: int = Query(default=50, ge=1, le=100),
):
    return await dashboard_service.get_actions(limit=limit)


@router.get("/goals")
async def get_goals():
    return await dashboard_service.get_goals()


@router.get("/timeline")
async def get_timeline(
    limit: int = Query(default=30, ge=1, le=100),
):
    return await dashboard_service.get_timeline(limit=limit)
