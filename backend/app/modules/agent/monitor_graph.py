from langgraph.graph import StateGraph
from langgraph.graph import START
from langgraph.graph import END

from app.modules.agent.state import AgentState

from app.modules.agent.nodes.monitor import monitor_node
from app.modules.agent.nodes.alert import alert_node


builder = StateGraph(AgentState)

builder.add_node("monitor", monitor_node)

builder.add_node("alert", alert_node)

builder.add_edge(START, "monitor")

builder.add_edge("monitor", "alert")

builder.add_edge("alert", END)

monitor_graph = builder.compile()
