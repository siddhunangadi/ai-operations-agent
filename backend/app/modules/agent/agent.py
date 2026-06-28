from app.modules.agent.data_loader import data_loader
from app.modules.agent.executor import Executor
from app.modules.agent.planner import Planner
from app.modules.agent.reflector import Reflector
from app.modules.agent.responder import Responder


class Agent:

    MAX_ITERATIONS = 6

    def __init__(self):

        self.planner = Planner()

        self.executor = Executor()

        self.reflector = Reflector()

        self.responder = Responder()

    async def run(
        self,
        question: str,
    ):

        usage_logs = await data_loader.load()

        completed_tools = []

        tool_results = {}

        for _ in range(self.MAX_ITERATIONS):

            plan = await self.planner.plan(question)

            remaining = [

                tool

                for tool in plan.tools

                if tool not in completed_tools

            ]

            if not remaining:

                break

            next_tool = remaining[0]

            result = await self.executor.execute(

                {

                    "tools": [next_tool]

                },

                usage_logs,

            )

            tool_results.update(result)

            completed_tools.append(next_tool)

            finished = await self.reflector.reflect(

                question,

                tool_results,

            )

            if finished:

                break

        answer = await self.responder.respond(

            question,

            tool_results,

        )

        return {

            "answer": answer,

            "tools_used": completed_tools,

            "tool_results": tool_results,

        }
