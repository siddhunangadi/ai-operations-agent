from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass
class UsageRecord:

    id: str

    organization_id: str

    project_id: str

    provider: str

    model: str

    endpoint: str

    prompt_tokens: int

    completion_tokens: int

    total_tokens: int

    latency_ms: int

    request_cost: Decimal

    success: bool

    created_at: datetime
