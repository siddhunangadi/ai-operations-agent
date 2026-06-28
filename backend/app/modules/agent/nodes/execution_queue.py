async def execution_queue_node(state):

    for task in state["task_queue"]:

        if task["status"] == "PENDING":

            state["current_tool"] = task["tool"]

            return state

        if task["status"] == "RETRY":

            state["current_tool"] = task["tool"]

            return state

    state["finished"] = True

    state["current_tool"] = None

    return state
