import pandas as pd
import random

taxpayers = pd.read_csv("taxpayers.csv")

periods = ["2024-01", "2024-02", "2024-03"]

returns = []

for _, row in taxpayers.iterrows():
    for period in periods:

        # GSTR1
        returns.append({
            "return_id": f"{row['gstin']}_GSTR1_{period}",
            "gstin": row["gstin"],
            "type": "GSTR1",
            "period": period,
            "filed": random.random() > 0.1
        })

        # GSTR2B  ← THIS WAS MISSING
        returns.append({
            "return_id": f"{row['gstin']}_GSTR2B_{period}",
            "gstin": row["gstin"],
            "type": "GSTR2B",
            "period": period,
            "filed": True
        })

        # GSTR3B
        returns.append({
            "return_id": f"{row['gstin']}_GSTR3B_{period}",
            "gstin": row["gstin"],
            "type": "GSTR3B",
            "period": period,
            "filed": random.random() > 0.05
        })

pd.DataFrame(returns).to_csv("returns.csv", index=False)

print("returns.csv regenerated with GSTR1, GSTR2B, GSTR3B")