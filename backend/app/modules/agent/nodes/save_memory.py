from app.modules.agent.memory_repository import memory_repository


async def save_memory_node(state):
    await memory_repository.save(
        question=state.get("question", ""),
        answer=state.get("answer", ""),
        plan={
            "goal": state.get("goal"),
            "strategy": state.get("strategy"),
            "reasoning": state.get("reasoning"),
            "planned_action": state.get("planned_action"),
        },
        completed_tools=state.get("completed_tools", []),
    )

    return state
