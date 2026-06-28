from app.modules.action.approval import approve


async def approval_node(state):
    planned_action = state.get("planned_action")

    state["approved"] = await approve(planned_action)

    return state
