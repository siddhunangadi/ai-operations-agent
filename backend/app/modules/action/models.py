from enum import Enum

from pydantic import BaseModel


class ActionStatus(str, Enum):

    PENDING = "PENDING"

    APPROVED = "APPROVED"

    EXECUTING = "EXECUTING"

    SUCCESS = "SUCCESS"

    FAILED = "FAILED"

    REJECTED = "REJECTED"


class Action(BaseModel):

    name: str

    description: str

    parameters: dict

    risk: str = "LOW"

    requires_approval: bool = False
