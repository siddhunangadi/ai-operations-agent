from langchain_core.tools import tool


@tool
async def get_usage_summary(
    usage_logs: list,
):
    """
    Returns AI usage summary including requests,
    tokens, total cost and usage records.
    """

    total_requests = len(usage_logs)

    total_tokens = sum(
        row["total_tokens"]
        for row in usage_logs
    )

    total_cost = sum(
        float(row["request_cost"])
        for row in usage_logs
    )

    return {
        "total_requests": total_requests,
        "total_tokens": total_tokens,
        "total_cost": round(total_cost, 4),
        "records": usage_logs,
    }
