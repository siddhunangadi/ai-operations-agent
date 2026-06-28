from app.modules.agent.tools.repository import usage_repository


async def monitor_node(state):

    usage = await usage_repository.get_usage_summary()

    cost = await usage_repository.get_cost_summary()

    alerts = []

    if cost["total_cost"] > 100:

        alerts.append(
            "Daily AI spend exceeded $100."
        )

    for provider, value in cost["provider_breakdown"].items():

        if value > 50:

            alerts.append(
                f"{provider} spend exceeded $50."
            )

    state["usage_logs"] = usage["records"]

    state["alerts"] = alerts

    return state
