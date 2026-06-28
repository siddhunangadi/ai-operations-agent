from app.modules.agent.registry import TOOL_REGISTRY


async def execute_node(state):

    tool_name = state["current_tool"]

    if tool_name is None:
        return state

    tool = TOOL_REGISTRY[tool_name]

    task = None

    for t in state["task_queue"]:
        if t["tool"] == tool_name:
            task = t
            break

    try:

        result = await tool.ainvoke(
            {
                "usage_logs": state["usage_logs"]
            }
        )

        state["tool_results"][tool_name] = result

        task["status"] = "COMPLETED"

        if tool_name not in state["completed_tools"]:
            state["completed_tools"].append(tool_name)

    except Exception as e:

        task["attempts"] += 1

        task["last_error"] = str(e)

        if task["attempts"] >= 3:
            task["status"] = "FAILED"
        else:
            task["status"] = "RETRY"

    return state
