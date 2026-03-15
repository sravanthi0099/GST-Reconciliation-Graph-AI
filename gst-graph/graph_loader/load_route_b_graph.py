import os
import pandas as pd
from neo4j import GraphDatabase
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

invoices_path = os.path.join(BASE_DIR, "invoices.csv")
irn_path = os.path.join(BASE_DIR, "irn.csv")
returns_path = os.path.join(BASE_DIR, "returns.csv")
taxpayers_path = os.path.join(BASE_DIR, "taxpayers.csv")

invoices_df = pd.read_csv(invoices_path)
irn_df = pd.read_csv(irn_path)
returns_df = pd.read_csv(returns_path)
taxpayers_df = pd.read_csv(taxpayers_path)

def clear_graph(tx):
    tx.run("MATCH (n) DETACH DELETE n")

def create_constraints(tx):
    queries = [
        "CREATE CONSTRAINT taxpayer_gstin IF NOT EXISTS FOR (n:Taxpayer) REQUIRE n.gstin IS UNIQUE",
        "CREATE CONSTRAINT vendor_gstin IF NOT EXISTS FOR (n:Vendor) REQUIRE n.gstin IS UNIQUE",
        "CREATE CONSTRAINT gstr1_invoice_id IF NOT EXISTS FOR (n:GSTR1Invoice) REQUIRE n.invoice_id IS UNIQUE",
        "CREATE CONSTRAINT gstr2b_invoice_id IF NOT EXISTS FOR (n:GSTR2BInvoice) REQUIRE n.invoice_id IS UNIQUE",
        "CREATE CONSTRAINT purchase_invoice_id IF NOT EXISTS FOR (n:PurchaseRegister) REQUIRE n.invoice_id IS UNIQUE",
        "CREATE CONSTRAINT einvoice_invoice_id IF NOT EXISTS FOR (n:EInvoice) REQUIRE n.invoice_id IS UNIQUE",
    ]
    for q in queries:
        tx.run(q)

def load_taxpayers(tx, rows):
    for row in rows:
        tx.run(
            """
            MERGE (t:Taxpayer {gstin: $gstin})
            SET t.name = $name,
                t.state = $state
            """,
            gstin=row["gstin"],
            name=row["name"],
            state=row["state"],
        )

def load_invoices(tx, rows):
    for row in rows:
        tx.run(
            """
            MERGE (supplier:Vendor {gstin: $supplier_gstin})
            MERGE (buyer:Taxpayer {gstin: $buyer_gstin})

            MERGE (g1:GSTR1Invoice {invoice_id: $invoice_id})
            SET g1.amount = $gst_amount,
                g1.taxable_value = $taxable_value,
                g1.period = $period,
                g1.mismatch_type = $mismatch_type,
                g1.mismatch_flag = $mismatch_flag

            MERGE (g2:GSTR2BInvoice {invoice_id: $invoice_id})
            SET g2.amount = $gst_amount,
                g2.taxable_value = $taxable_value,
                g2.period = $period,
                g2.matched = CASE WHEN $mismatch_flag THEN false ELSE true END

            MERGE (p:PurchaseRegister {invoice_id: $invoice_id})
            SET p.amount = $gst_amount,
                p.taxable_value = $taxable_value,
                p.period = $period

            MERGE (supplier)-[:ISSUED_BY]->(g1)
            MERGE (g1)-[:IN_GSTR2B]->(g2)
            MERGE (g1)-[:IN_PURCHASE_REGISTER]->(p)
            MERGE (buyer)-[:IN_GSTR2B]->(g2)
            MERGE (buyer)-[:IN_PURCHASE_REGISTER]->(p)
            """,
            invoice_id=row["invoice_id"],
            supplier_gstin=row["supplier_gstin"],
            buyer_gstin=row["buyer_gstin"],
            taxable_value=float(row["taxable_value"]),
            gst_amount=float(row["gst_amount"]),
            period=row["period"],
            mismatch_type=row["mismatch_type"],
            mismatch_flag=bool(row["mismatch_flag"]),
        )

def load_irn(tx, rows):
    for row in rows:
        tx.run(
            """
            MERGE (e:EInvoice {invoice_id: $invoice_id})
            SET e.irn = $irn_id,
                e.valid = true

            WITH e
            MATCH (g1:GSTR1Invoice {invoice_id: $invoice_id})
            MERGE (g1)-[:HAS_EINVOICE]->(e)
            """,
            invoice_id=row["invoice_id"],
            irn_id=row["irn_id"],
        )

def load_returns(tx, rows):
    for row in rows:
        tx.run(
            """
            MERGE (buyer:Taxpayer {gstin: $gstin})
            MERGE (g2:GSTR2BInvoice {invoice_id: $invoice_id})
            SET g2.claimed_itc = $claimed_itc,
                g2.period = $period

            MERGE (buyer)-[:CLAIMED_ITC {
                return_id: $return_id,
                claimed_itc: $claimed_itc,
                period: $period
            }]->(g2)
            """,
            gstin=row["gstin"],
            invoice_id=row["invoice_id"],
            claimed_itc=float(row["claimed_itc"]),
            period=row["period"],
            return_id=row["return_id"],
        )

with driver.session() as session:
    session.execute_write(clear_graph)
    session.execute_write(create_constraints)
    session.execute_write(load_taxpayers, taxpayers_df.to_dict("records"))
    session.execute_write(load_invoices, invoices_df.to_dict("records"))
    session.execute_write(load_irn, irn_df.to_dict("records"))
    session.execute_write(load_returns, returns_df.to_dict("records"))

driver.close()
print("Route-B graph loaded successfully.")