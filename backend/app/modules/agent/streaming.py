import json
from typing import AsyncGenerator

from app.modules.agent.graph import agent_graph


NODE_LABELS = {
    "observe": "Observing usage data",
    "load_world_model": "Loading world model",
    "planner": "Planning investigation",
    "queue": "Building execution queue",
    "execute": "Executing tool",
    "collect_evidence": "Collecting evidence",
    "evaluate": "Evaluating evidence",
    "gap_analyzer": "Analyzing information gaps",
    "replan": "Replanning",
    "critic": "Running critic validation",
    "respond": "Generating response",
    "action_planner": "Planning action",
    "approval": "Checking approval",
    "execute_action": "Executing action",
    "save_memory": "Saving memory",
    "learn": "Learning from execution",
    "update_world_model": "Updating world model",
}


def _initial_state(question: str) -> dict:
    return {
        "question": question,
        "usage_logs": [],
        "memory": [],
        "world_model": {},
        "task_queue": [],
        "completed_tools": [],
        "current_tool": None,
        "tool_results": {},
        "evidence": [],
        "missing_information": [],
        "recommended_tools": [],
        "confidence": 0.0,
        "strategy": "",
        "goal": "",
        "planned_action": {},
        "approved": False,
        "action_result": {},
        "scratchpad": [],
        "observations": [],
        "messages": [],
        "reasoning": "",
        "iteration": 0,
        "answer": "",
        "finished": False,
    }


async def stream_agent(question: str) -> AsyncGenerator[str, None]:
    state = _initial_state(question)

    yield _sse({"type": "start", "message": "Starting investigation"})

    final_state = state

    async for event in agent_graph.astream(state, stream_mode="updates"):
        for node_name, update in event.items():
            label = NODE_LABELS.get(node_name, node_name)
            payload = {
                "type": "step",
                "node": node_name,
                "label": label,
                "confidence": update.get("confidence"),
                "current_tool": update.get("current_tool"),
                "completed_tools": update.get("completed_tools"),
            }
            yield _sse(payload)
            final_state = {**final_state, **update}

    planned_action = final_state.get("planned_action") or {}
    action = None
    if planned_action.get("should_execute"):
        action = {
            "should_execute": True,
            "action_name": planned_action.get("action_name"),
            "status": final_state.get("action_result", {}).get("status"),
        }

    yield _sse({
        "type": "done",
        "answer": final_state.get("answer", ""),
        "confidence": final_state.get("confidence", 0.0),
        "goal": final_state.get("goal", ""),
        "strategy": final_state.get("strategy", ""),
        "tools_used": final_state.get("completed_tools", []),
        "action": action,
        "state": final_state,
    })


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, default=str)}\n\n"
