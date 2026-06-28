from collections import defaultdict

from langchain_core.tools import tool


@tool
async def get_cost_summary(
    usage_logs: list,
):
    """
    Returns AI cost analytics including total cost,
    provider-wise cost, project-wise cost and model-wise cost.
    """

    total_cost = 0.0

    provider_costs = defaultdict(float)
    project_costs = defaultdict(float)
    model_costs = defaultdict(float)

    for row in usage_logs:

        cost = float(row["request_cost"])

        total_cost += cost

        provider_costs[row["provider"]] += cost
        project_costs[row["project_name"]] += cost
        model_costs[row["model"]] += cost

    return {
        "total_cost": round(total_cost, 4),
        "provider_breakdown": dict(provider_costs),
        "project_breakdown": dict(project_costs),
        "model_breakdown": dict(model_costs),
    }
