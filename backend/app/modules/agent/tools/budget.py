from langchain_core.tools import tool

from app.db.supabase import supabase


@tool
async def get_budget_summary(
    usage_logs: list,
):
    """
    Returns project budget utilization,
    remaining budget and usage percentage.
    """

    response = (
        supabase
        .table("budgets")
        .select("*")
        .execute()
    )

    budgets = response.data

    spend = {}

    for row in usage_logs:

        project = row["project_name"]

        spend.setdefault(project, 0.0)

        spend[project] += float(
            row["request_cost"]
        )

    result = []

    for budget in budgets:

        project = budget["project_name"]

        limit = float(
            budget["monthly_budget"]
        )

        used = spend.get(
            project,
            0.0,
        )

        result.append(
            {
                "project": project,
                "budget": limit,
                "used": round(used, 4),
                "remaining": round(limit - used, 4),
                "usage_percent": round(
                    (used / limit) * 100,
                    2,
                ),
            }
        )

    return result
