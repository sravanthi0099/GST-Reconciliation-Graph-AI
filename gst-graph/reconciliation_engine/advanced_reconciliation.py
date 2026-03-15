from neo4j import GraphDatabase

# ----------------------------------
# Neo4j Connection
# ----------------------------------
uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))


# ----------------------------------
# Multi-Hop GST Reconciliation
# ----------------------------------
def run_reconciliation(tx):

    query = """
    MATCH (buyer:Taxpayer)-[:CLAIMED_ITC]->(i:Invoice)
    MATCH (supplier:Taxpayer)-[:ISSUED]->(i)

    OPTIONAL MATCH (supplier)-[:FILED]->(r1:Return {type:"GSTR1", period:i.period})
    OPTIONAL MATCH (supplier)-[:FILED]->(r3:Return {type:"GSTR3B", period:i.period})
    OPTIONAL MATCH (buyer)-[:FILED]->(r2:Return {type:"GSTR2B", period:i.period})

    WITH i, supplier, buyer, r1, r2, r3

    WITH i, supplier, buyer,

         CASE
            WHEN r1 IS NULL OR r1.filed = false THEN "NO_GSTR1"
            WHEN r3 IS NULL OR r3.filed = false THEN "NO_GSTR3B"
            WHEN r2 IS NULL OR r2.filed = false THEN "NO_GSTR2B"
            ELSE "MATCHED"
         END AS issue_type

    WITH i, supplier, buyer, issue_type,

         CASE
            WHEN issue_type = "MATCHED" THEN "LOW"
            WHEN issue_type <> "MATCHED" AND i.gst_amount < 10000 THEN "MEDIUM"
            WHEN issue_type <> "MATCHED" AND i.gst_amount >= 10000 THEN "HIGH"
         END AS risk_level

    SET i.mismatch_type = issue_type,
        i.risk_level = risk_level,
        i.explanation =
            CASE
                WHEN issue_type = "NO_GSTR1" THEN
                    "Supplier did not file GSTR-1 for period " + i.period
                WHEN issue_type = "NO_GSTR3B" THEN
                    "Supplier did not file GSTR-3B for period " + i.period
                WHEN issue_type = "NO_GSTR2B" THEN
                    "Invoice not reflected in buyer GSTR-2B for period " + i.period
                ELSE
                    "All GST validations passed"
            END,
        i.financial_risk =
            CASE
                WHEN risk_level = "HIGH" THEN i.gst_amount
                WHEN risk_level = "MEDIUM" THEN i.gst_amount * 0.5
                ELSE 0
            END

    RETURN i.invoice_id AS invoice,
           supplier.gstin AS supplier,
           issue_type,
           risk_level,
           i.financial_risk AS financial_risk
    LIMIT 20
    """

    result = tx.run(query)
    return [record.data() for record in result]


# ----------------------------------
# Execute
# ----------------------------------
with driver.session() as session:
    print("\nRunning Multi-Hop GST Reconciliation...\n")
    results = session.execute_write(run_reconciliation)

    for r in results:
        print(r)

driver.close()