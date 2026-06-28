from collections import defaultdict

from langchain_core.tools import tool


@tool
async def get_provider_summary(
    usage_logs: list,
):
    """
    Returns provider-wise analytics including requests,
    tokens, costs and average latency.
    """

    provider_stats = defaultdict(
        lambda: {
            "requests": 0,
            "tokens": 0,
            "cost": 0.0,
            "latencies": [],
        }
    )

    for row in usage_logs:

        provider = row["provider"]

        provider_stats[provider]["requests"] += 1
        provider_stats[provider]["tokens"] += row["total_tokens"]
        provider_stats[provider]["cost"] += float(row["request_cost"])
        provider_stats[provider]["latencies"].append(row["latency_ms"])

    result = {}

    for provider, stats in provider_stats.items():

        result[provider] = {
            "requests": stats["requests"],
            "tokens": stats["tokens"],
            "cost": round(stats["cost"], 4),
            "average_latency_ms": round(
                sum(stats["latencies"]) / len(stats["latencies"]),
                2,
            ),
        }

    return result
