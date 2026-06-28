from typing import Any
from typing_extensions import TypedDict


class AgentState(TypedDict):

    question:str

    usage_logs:list[dict[str,Any]]

    memory:list[dict]

    world_model:dict

    task_queue:list[dict]

    completed_tools:list[str]

    current_tool:str|None

    tool_results:dict[str,Any]

    evidence:list[dict]

    missing_information:list[str]

    recommended_tools:list[str]

    confidence:float

    strategy:str

    goal:str

    planned_action:dict

    approved:bool

    action_result:dict

    scratchpad:list[str]

    observations:list[str]

    messages:list[dict]

    reasoning:str

    iteration:int

    answer:str

    finished:bool
