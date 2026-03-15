import pandas as pd
import random
from faker import Faker

fake = Faker()

NUM_TAXPAYERS = 500
NUM_INVOICES = 5000

# -------------------
# Generate Taxpayers
# -------------------

taxpayers = []

for _ in range(NUM_TAXPAYERS):
    taxpayers.append({
        "gstin": fake.unique.bothify(text="##????#####?Z#"),
        "name": fake.company(),
        "state": fake.state()
    })

taxpayers_df = pd.DataFrame(taxpayers)
taxpayers_df.to_csv("taxpayers.csv", index=False)

print("Generated taxpayers:", len(taxpayers_df))


# -------------------
# Generate Invoices
# -------------------

invoices = []

for i in range(NUM_INVOICES):

    supplier = random.choice(taxpayers)
    buyer = random.choice(taxpayers)

    taxable_value = random.randint(1000, 100000)
    gst_amount = round(taxable_value * 0.18, 2)

    mismatch_type = "NONE"
    mismatch_flag = False

    r = random.random()

    # Inject fraud / mismatch cases
    if r < 0.05:
        mismatch_type = "NO_GSTR1"
        mismatch_flag = True

    elif r < 0.10:
        gst_amount *= 1.5
        mismatch_type = "GST_MISMATCH"
        mismatch_flag = True

    elif r < 0.15:
        mismatch_type = "HIGH_VALUE_SUSPICIOUS"
        mismatch_flag = True

    elif r < 0.20:
        mismatch_type = "LATE_FILING"
        mismatch_flag = True

    invoices.append({
        "invoice_id": f"INV{i}",
        "supplier_gstin": supplier["gstin"],
        "buyer_gstin": buyer["gstin"],
        "taxable_value": taxable_value,
        "gst_amount": gst_amount,
        "period": random.choice(["2024-01", "2024-02", "2024-03"]),
        "mismatch_type": mismatch_type,
        "mismatch_flag": mismatch_flag
    })

invoices_df = pd.DataFrame(invoices)
invoices_df.to_csv("invoices.csv", index=False)

print("Generated invoices:", len(invoices_df))


# -------------------
# Generate Returns (GSTR3B / ITC claims)
# -------------------

returns = []

for inv in invoices:

    claimed_itc = inv["gst_amount"]

    # create ITC mismatch in some cases
    if inv["mismatch_type"] == "GST_MISMATCH":
        claimed_itc = inv["gst_amount"] * 0.7

    returns.append({
        "return_id": fake.uuid4(),
        "gstin": inv["buyer_gstin"],
        "invoice_id": inv["invoice_id"],
        "claimed_itc": claimed_itc,
        "period": inv["period"]
    })

returns_df = pd.DataFrame(returns)
returns_df.to_csv("returns.csv", index=False)

print("Generated returns:", len(returns_df))


# -------------------
# Generate IRN (e-Invoice)
# -------------------

irns = []

for inv in invoices:

    irns.append({
        "irn_id": fake.uuid4(),
        "invoice_id": inv["invoice_id"]
    })

irn_df = pd.DataFrame(irns)
irn_df.to_csv("irn.csv", index=False)

print("Generated IRNs:", len(irn_df))


print("\nAdvanced GST dataset generated successfully.")