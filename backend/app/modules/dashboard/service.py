from app.modules.action.repositories.action_history_repository import (
    action_history_repository,
)
from app.modules.agent.data_loader import data_loader
from app.modules.agent.repositories.learning_repository import learning_repository
from app.modules.agent.repositories.world_model_repository import (
    world_model_repository,
)
from app.modules.agent.tools.budget import get_budget_summary
from app.modules.agent.tools.cost import get_cost_summary
from app.modules.agent.tools.forecast import get_cost_forecast
from app.modules.agent.tools.provider import get_provider_summary
from app.modules.agent.tools.recommendation import get_optimization_recommendations
from app.modules.agent.tools.usage import get_usage_summary
from app.modules.health.engine import health_engine


class DashboardService:

    async def _load_usage_logs(self) -> list:
        return await data_loader.load() or []

    async def get_usage(self):
        usage_logs = await self._load_usage_logs()
        return await get_usage_summary.ainvoke({"usage_logs": usage_logs})

    async def get_cost(self):
        usage_logs = await self._load_usage_logs()
        return await get_cost_summary.ainvoke({"usage_logs": usage_logs})

    async def get_providers(self):
        usage_logs = await self._load_usage_logs()
        return await get_provider_summary.ainvoke({"usage_logs": usage_logs})

    async def get_forecast(self):
        usage_logs = await self._load_usage_logs()
        return await get_cost_forecast.ainvoke({"usage_logs": usage_logs})

    async def get_budget(self):
        usage_logs = await self._load_usage_logs()
        return await get_budget_summary.ainvoke({"usage_logs": usage_logs})

    async def get_recommendations(self):
        usage_logs = await self._load_usage_logs()
        return await get_optimization_recommendations.ainvoke(
            {"usage_logs": usage_logs}
        )

    async def get_world_model(self):
        return await world_model_repository.load()

    async def get_health(self):
        world_model = await self.get_world_model()
        health = health_engine.calculate(world_model)
        return {
            **health,
            "world_model": world_model,
        }

    async def get_learning(self, limit: int = 20):
        return await learning_repository.recent(limit=limit)

    async def get_actions(self, limit: int = 50):
        return await action_history_repository.list(limit=limit)

    async def get_goals(self):
        world_model = await self.get_world_model()
        return world_model.get("goals", [])

    async def get_timeline(self, limit: int = 30):
        actions = await self.get_actions(limit=limit)
        learning = await self.get_learning(limit=limit)

        events = []

        for action in actions:
            events.append(
                {
                    "id": action.get("id", action.get("action_name", "")),
                    "type": "action",
                    "title": action.get("action_name", "Action executed"),
                    "description": action.get("description", ""),
                    "status": action.get("status", "unknown"),
                    "timestamp": action.get("created_at"),
                    "metadata": action,
                }
            )

        for lesson in learning:
            events.append(
                {
                    "id": lesson.get("id", lesson.get("lesson", "")),
                    "type": "learning",
                    "title": lesson.get("lesson_type", "Lesson learned"),
                    "description": lesson.get("lesson", ""),
                    "status": "completed",
                    "timestamp": lesson.get("created_at"),
                    "metadata": lesson,
                }
            )

        events.sort(
            key=lambda event: event.get("timestamp") or "",
            reverse=True,
        )

        return events[:limit]

    async def get_dashboard(self):
        usage_logs = await self._load_usage_logs()

        usage = await get_usage_summary.ainvoke({"usage_logs": usage_logs})
        cost = await get_cost_summary.ainvoke({"usage_logs": usage_logs})
        providers = await get_provider_summary.ainvoke({"usage_logs": usage_logs})
        forecast = await get_cost_forecast.ainvoke({"usage_logs": usage_logs})
        recommendations = await get_optimization_recommendations.ainvoke(
            {"usage_logs": usage_logs}
        )
        world_model = await world_model_repository.load()
        health = health_engine.calculate(world_model)
        actions = await action_history_repository.list(limit=10)
        learning = await learning_repository.recent(limit=5)
        goals = world_model.get("goals", [])
        timeline = await self.get_timeline(limit=10)

        return {
            "health": health,
            "usage": usage,
            "cost": cost,
            "providers": providers,
            "forecast": forecast,
            "recommendations": recommendations,
            "world_model": world_model,
            "recent_actions": actions,
            "learning_summary": learning,
            "goals": goals,
            "timeline": timeline,
        }


dashboard_service = DashboardService()
