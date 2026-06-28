from app.modules.agent.tools.repository import usage_repository


class DataLoader:

    async def load(self):

        rows = await usage_repository.get_all()

        return rows


data_loader = DataLoader()
