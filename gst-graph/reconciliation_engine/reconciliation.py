from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))


def classify_mismatches(tx):
    result = tx.run("""
    MATCH (s:Taxpayer)-[:ISSUED]->(i:Invoice)<-[:CLAIMED_ITC]-(b:Taxpayer)
    WHERE i.mismatch_type <> "NONE"
    RETURN i.mismatch_type AS type,
           count(*) AS occurrences
    ORDER BY occurrences DESC
    """)
    return result.data()


def vendor_risk_scores(tx):
    result = tx.run("""
    MATCH (t:Taxpayer)-[:ISSUED]->(i:Invoice)
    WITH t,
         count(i) AS total_invoices,
         sum(CASE WHEN i.mismatch_type <> "NONE" THEN 1 ELSE 0 END) AS mismatches
    RETURN t.gstin AS gstin,
           total_invoices,
           mismatches,
           round(toFloat(mismatches) / total_invoices, 3) AS risk_score
    ORDER BY risk_score DESC
    LIMIT 10
    """)
    return result.data()


def generate_audit_report(tx):
    result = tx.run("""
    MATCH (s:Taxpayer)-[:ISSUED]->(i:Invoice)<-[:CLAIMED_ITC]-(b:Taxpayer)
    WHERE i.mismatch_type <> "NONE"
    RETURN s.gstin AS supplier,
           b.gstin AS buyer,
           i.invoice_id AS invoice,
           i.mismatch_type AS issue
    LIMIT 5
    """)
    return result.data()


with driver.session() as session:

    print("\n--- Mismatch Classification ---")
    mismatches = session.execute_read(classify_mismatches)
    for row in mismatches:
        print(row)

    print("\n--- Top Risk Vendors ---")
    risks = session.execute_read(vendor_risk_scores)
    for row in risks:
        print(row)

    print("\n--- Sample Audit Trail ---")
    audits = session.execute_read(generate_audit_report)
    for row in audits:
        print(row)

driver.close()