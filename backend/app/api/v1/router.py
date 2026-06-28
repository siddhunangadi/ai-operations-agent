from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.modules.agent.router import router as agent_router
from app.modules.auth.router import router as auth_router
from app.modules.dashboard.router import router as dashboard_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(agent_router)
api_router.include_router(dashboard_router)
