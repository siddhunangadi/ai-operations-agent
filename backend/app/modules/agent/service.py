from app.modules.agent.graph import agent_graph


class AgentService:

    async def chat(
        self,
        question: str,
    ):
        state = {
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

        result = await agent_graph.ainvoke(state)

        planned_action = result.get("planned_action") or {}

        action = None

        if planned_action.get("should_execute"):
            action = {
                "should_execute": True,
                "action_name": planned_action.get("action_name"),
                "status": result.get("action_result", {}).get("status"),
            }

        return {
            "success": True,
            "answer": result.get("answer", ""),
            "confidence": result.get("confidence", 0.0),
            "goal": result.get("goal", ""),
            "strategy": result.get("strategy", ""),
            "tools_used": result.get("completed_tools", []),
            "action": action,
        }

    async def chat_debug(
        self,
        question: str,
    ):
        state = {
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

        return {
            "state": await agent_graph.ainvoke(state)
        }
