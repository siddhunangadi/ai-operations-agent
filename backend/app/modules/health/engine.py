class HealthEngine:

    def calculate(

        self,

        world_model,

    ):

        score = 100

        reasons = []

        total_cost = world_model.get(

            "total_cost",

            0,

        )

        if total_cost > 500:

            score -= 20

            reasons.append(

                "High AI spending"

            )

        providers = world_model.get(

            "providers",

            {},

        )

        for provider,data in providers.items():

            latency=data.get(

                "average_latency_ms",

                0,

            )

            if latency>1000:

                score-=10

                reasons.append(

                    f"{provider} latency high"

                )

        return {

            "score":max(score,0),

            "reasons":reasons,

        }


health_engine=HealthEngine()
