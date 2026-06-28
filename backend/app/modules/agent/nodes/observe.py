from app.modules.agent.data_loader import data_loader


async def observe_node(state):

    usage_logs = await data_loader.load()

    state["usage_logs"] = usage_logs

    state["completed_tools"] = []

    state["tool_results"] = {}

    state["scratchpad"] = []

    state["current_tool"] = None

    state["finished"] = False

    return state
