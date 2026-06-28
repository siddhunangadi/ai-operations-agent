from langchain_core.tools import tool


@tool
async def get_optimization_recommendations(
    usage_logs: list,
):
    """
    Returns AI optimization recommendations
    based on usage, latency and provider costs.
    """

    recommendations = []

    total_cost = sum(
        float(row["request_cost"])
        for row in usage_logs
    )

    openai_cost = sum(
        float(row["request_cost"])
        for row in usage_logs
        if row["provider"] == "OpenAI"
    )

    if openai_cost > 0:

        recommendations.append(
            {
                "title": "Reduce OpenAI Spend",
                "priority": "HIGH",
                "estimated_savings": round(
                    openai_cost * 0.35,
                    4,
                ),
                "recommendation":
                    "Move suitable GPT-5 workloads to Gemini 2.5 Flash or GPT-5 Mini.",
            }
        )

    high_latency = [
        row
        for row in usage_logs
        if row["latency_ms"] > 1000
    ]

    if high_latency:

        recommendations.append(
            {
                "title": "High Latency",
                "priority": "MEDIUM",
                "recommendation":
                    "Consider faster models for high latency workloads.",
                "affected_requests": len(high_latency),
            }
        )

    return {
        "total_cost": round(total_cost, 4),
        "recommendations": recommendations,
    }
