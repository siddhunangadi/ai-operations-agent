async def goal_manager_node(state):

    if state["finished"]:
        return state

    if state["current_step"] >= len(state["plan"]):
        state["finished"] = True
        return state

    tool = state["plan"][state["current_step"]]

    if tool in state["completed_tools"]:

        state["current_step"] += 1

    return state
