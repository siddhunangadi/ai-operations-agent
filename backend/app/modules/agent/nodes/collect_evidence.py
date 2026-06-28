async def collect_evidence_node(state):

    tool = state["current_tool"]

    result = state["tool_results"].get(tool)

    if result is None:

        return state

    state["evidence"].append(

        {

            "tool": tool,

            "result": result,

        }

    )

    return state
