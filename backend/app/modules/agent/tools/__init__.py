from app.modules.agent.tools.budget import get_budget_summary
from app.modules.agent.tools.cost import get_cost_summary
from app.modules.agent.tools.forecast import get_cost_forecast
from app.modules.agent.tools.provider import get_provider_summary
from app.modules.agent.tools.recommendation import get_optimization_recommendations
from app.modules.agent.tools.usage import get_usage_summary

TOOLS = [
    get_usage_summary,
    get_cost_summary,
    get_provider_summary,
    get_optimization_recommendations,
    get_budget_summary,
    get_cost_forecast,
]
