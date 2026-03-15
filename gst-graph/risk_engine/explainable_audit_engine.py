from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))


def generate_explainable_audit(tx):
    query = """
    MATCH (s:Taxpayer)-[:ISSUED]->(i:Invoice)
    WHERE i.mismatch_type IS NOT NULL AND i.mismatch_type <> "MATCHED"
    
    WITH s,
         count(i) AS issue_count,
         sum(i.gst_amount) AS total_risk_amount
    
    MATCH (s)-[:ISSUED]->(allInv:Invoice)
    WITH s, issue_count, total_risk_amount,
         count(allInv) AS total_invoices
    
    MATCH (s)-[:ISSUED]->(i2:Invoice)
    WHERE i2.mismatch_type IS NOT NULL AND i2.mismatch_type <> "MATCHED"
    
    WITH s, total_invoices, issue_count, total_risk_amount,
         collect(DISTINCT i2.mismatch_type) AS issue_types
    
    RETURN s.gstin AS supplier,
           total_invoices,
           issue_count,
           total_risk_amount,
           issue_types
    ORDER BY total_risk_amount DESC
    LIMIT 10
    """

    result = tx.run(query)
    return [record.data() for record in result]


with driver.session() as session:
    print("\n--- Explainable Audit Report ---\n")
    records = session.execute_read(generate_explainable_audit)

    for r in records:
        risk_ratio = r["issue_count"] / r["total_invoices"]

        if risk_ratio > 0.7:
            risk_level = "HIGH"
        elif risk_ratio > 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        explanation = f"""
Supplier: {r['supplier']}
Total Invoices Issued: {r['total_invoices']}
Problematic Invoices: {r['issue_count']}
Total Financial Exposure: ₹{round(r['total_risk_amount'], 2)}
Issue Categories: {', '.join(r['issue_types'])}
Overall Compliance Risk Level: {risk_level}
"""

        print(explanation)
        print("-" * 70)

driver.close()