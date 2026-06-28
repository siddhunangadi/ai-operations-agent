from app.modules.agent.registry import registry


class Executor:

    async def execute(
        self,
        plan: dict,
        usage_logs: list,
    ) -> dict:

        results = {}

        for tool_name in plan["tools"]:

            tool = registry.get(tool_name)

            if tool is None:
                continue

            results[tool_name] = await tool.ainvoke(
                {
                    "usage_logs": usage_logs,
                }
            )

        return results
