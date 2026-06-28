from app.modules.action.executor import execute_action
from app.modules.action.repositories.action_history_repository import (
    action_history_repository,
)


async def execute_action_node(state):
    if not state.get("approved", False):
        return state

    planned_action = state.get("planned_action")

    if not planned_action or not planned_action.get("should_execute", False):
        return state

    result = await execute_action(planned_action)

    if planned_action and planned_action.get("action_name"):
        await action_history_repository.save(
            {
                "organization_id": "org_1",
                "action_name": planned_action["action_name"],
                "parameters": planned_action.get("parameters", {}),
                "status": result.get("status", "unknown"),
                "result": result,
            }
        )

    state["action_result"] = result

    return state
