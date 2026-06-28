from datetime import datetime
import calendar

from langchain_core.tools import tool


@tool
async def get_cost_forecast(
    usage_logs: list,
):
    """
    Forecast end-of-month AI spending based on current usage.
    """

    today = datetime.utcnow()

    days_in_month = calendar.monthrange(
        today.year,
        today.month,
    )[1]

    current_day = max(today.day, 1)

    current_cost = sum(
        float(row["request_cost"])
        for row in usage_logs
    )

    daily_average = current_cost / current_day

    forecast = daily_average * days_in_month

    return {

        "today": current_day,

        "days_in_month": days_in_month,

        "current_spend": round(current_cost, 4),

        "daily_average": round(daily_average, 4),

        "forecast_month_end": round(forecast, 4),

    }
