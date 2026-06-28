from app.modules.action.planner import plan_action


async def action_planner_node(state):

    result=await plan_action(

        state["question"],

        state["answer"],

        state["world_model"],

    )

    state["planned_action"]=result.model_dump()

    return state
