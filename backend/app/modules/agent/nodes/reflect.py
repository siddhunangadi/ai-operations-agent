async def reflect_node(state):

    tool = state["current_tool"]

    for task in state["task_queue"]:

        if task["tool"] != tool:
            continue

        if task["status"] == "COMPLETED":

            state["completed_tools"].append(tool)

            state["observations"].append(

                f"{tool} completed successfully."

            )

        elif task["status"] == "FAILED":

            state["observations"].append(

                f"{tool} permanently failed."

            )

        elif task["status"] == "RETRY":

            state["observations"].append(

                f"{tool} will retry."

            )

        break

    state["iteration"] += 1

    return state
