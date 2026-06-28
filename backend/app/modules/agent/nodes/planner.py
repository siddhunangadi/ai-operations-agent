from app.modules.agent.planner import create_plan


async def planner_node(state):

    if state["task_queue"]:

        return state

    result = await create_plan(

        question=state["question"],

        world_model=state["world_model"],

        memory=state["memory"],

    )

    state["strategy"] = result.strategy

    state["goal"] = result.goal

    state["plan"] = result.steps

    state["task_queue"] = [

        {

            "tool": tool,

            "status": "PENDING",

            "attempts": 0,

            "last_error": None,

        }

        for tool in result.steps

    ]

    state["scratchpad"].append(

        result.reasoning

    )

    return state
