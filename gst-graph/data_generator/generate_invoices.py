import pandas as pd
import random

taxpayers = pd.read_csv("taxpayers.csv")

periods = ["2024-01", "2024-02", "2024-03"]

invoices = []

for i in range(5000):
    supplier = taxpayers.sample(1).iloc[0]["gstin"]
    buyer = taxpayers.sample(1).iloc[0]["gstin"]

    # prevent self invoice
    while buyer == supplier:
        buyer = taxpayers.sample(1).iloc[0]["gstin"]

    invoice_id = f"INV{i+1}"
    period = random.choice(periods)
    taxable_value = random.randint(10000, 100000)
    gst_amount = round(taxable_value * 0.18, 2)

    mismatch_options = ["NONE", "VALUE_MISMATCH", "DUPLICATE", "FAKE_ITC"]
    mismatch_type = random.choices(mismatch_options, weights=[0.6, 0.15, 0.15, 0.1])[0]

    invoices.append({
        "invoice_id": invoice_id,
        "supplier_gstin": supplier,
        "buyer_gstin": buyer,
        "taxable_value": taxable_value,
        "gst_amount": gst_amount,
        "period": period,
        "mismatch_type": mismatch_type,
        "irn_id": f"IRN_{invoice_id}"
    })

pd.DataFrame(invoices).to_csv("invoices.csv", index=False)

print("invoices.csv generated successfully with IRN")