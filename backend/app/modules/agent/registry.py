from app.modules.agent.tools import TOOLS

TOOL_REGISTRY = {}

TOOL_DESCRIPTIONS = {}

for tool in TOOLS:

    TOOL_REGISTRY[tool.name] = tool

    TOOL_DESCRIPTIONS[tool.name] = tool.description
