async def replan_node(state):

    for tool in state["recommended_tools"]:

        exists = any(

            task["tool"] == tool

            for task in state["task_queue"]

        )

        if exists:

            continue

        state["task_queue"].append(

            {

                "tool": tool,

                "status": "PENDING",

                "attempts": 0,

                "last_error": None,

            }

        )

    return state
