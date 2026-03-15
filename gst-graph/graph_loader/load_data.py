import pandas as pd
from neo4j import GraphDatabase

# ------------------------------
# Neo4j Connection
# ------------------------------
uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))

# ------------------------------
# Load CSV Files
# ------------------------------
taxpayers = pd.read_csv("taxpayers.csv")
invoices = pd.read_csv("invoices.csv")
returns = pd.read_csv("returns.csv")


# ------------------------------
# Clear Old Graph
# ------------------------------
def clear_database(tx):
    tx.run("MATCH (n) DETACH DELETE n")


# ------------------------------
# Load Taxpayers
# ------------------------------
def load_taxpayers(tx):
    for _, row in taxpayers.iterrows():
        tx.run(
        """
        MERGE (t:Taxpayer {gstin: $gstin})
        SET t.name = $name,
            t.state = $state
        """,
        gstin=row["gstin"],
        name=row["name"],
        state=row["state"]
        )


# ------------------------------
# Load Invoices + IRN
# ------------------------------
def load_invoices(tx):

    for _, row in invoices.iterrows():

        tx.run(
        """
        MATCH (supplier:Taxpayer {gstin:$supplier})
        MATCH (buyer:Taxpayer {gstin:$buyer})

        CREATE (i:Invoice {
            invoice_id:$invoice_id,
            taxable_value:$taxable_value,
            gst_amount:$gst_amount,
            period:$period,
            mismatch_type:$mismatch_type,
            mismatch_flag:$mismatch_flag
        })

        MERGE (supplier)-[:ISSUED]->(i)
        MERGE (buyer)-[:PURCHASED]->(i)

        CREATE (irn:IRN {irn_id:$invoice_id})
        MERGE (i)-[:HAS_IRN]->(irn)
        """,
        supplier=row["supplier_gstin"],
        buyer=row["buyer_gstin"],
        invoice_id=row["invoice_id"],
        taxable_value=row["taxable_value"],
        gst_amount=row["gst_amount"],
        period=row["period"],
        mismatch_type=row["mismatch_type"],
        mismatch_flag=row["mismatch_flag"]
        )


# ------------------------------
# Load Returns
# ------------------------------
def load_returns(tx):

    for _, row in returns.iterrows():

        tx.run(
        """
        MATCH (buyer:Taxpayer {gstin:$gstin})
        MATCH (i:Invoice {invoice_id:$invoice_id})

        MERGE (r:Return {return_id:$return_id})

        SET r.period=$period,
            r.claimed_itc=$claimed_itc

        MERGE (buyer)-[:FILED]->(r)
        MERGE (r)-[:CLAIMED_ITC]->(i)
        """,
        return_id=row["return_id"],
        gstin=row["gstin"],
        invoice_id=row["invoice_id"],
        period=row["period"],
        claimed_itc=row["claimed_itc"]
        )


# ------------------------------
# Execute All Steps
# ------------------------------
with driver.session() as session:

    print("Clearing old graph...")
    session.execute_write(clear_database)

    print("Loading taxpayers...")
    session.execute_write(load_taxpayers)

    print("Loading invoices + IRN...")
    session.execute_write(load_invoices)

    print("Loading returns...")
    session.execute_write(load_returns)

driver.close()

print("Graph data loaded successfully with full schema.")