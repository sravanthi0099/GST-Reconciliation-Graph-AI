from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "gstgraph123"

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))


def get_high_risk_suppliers(tx):
    query = """
    MATCH (t:Taxpayer)
    OPTIONAL MATCH (t)-[:ISSUED]->(i:Invoice)
    OPTIONAL MATCH (t)-[:FILED]->(r:Return {type:"GSTR1"})
    
    WITH t,
         count(i) AS total_invoices,
         sum(CASE WHEN i.mismatch_type <> "NONE" THEN 1 ELSE 0 END) AS invoice_issues,
         sum(CASE WHEN r.filed = false THEN 1 ELSE 0 END) AS missed_returns
    
    WITH t,
         total_invoices,
         invoice_issues,
         missed_returns,
         (0.7 * invoice_issues + 1.0 * missed_returns) AS weighted_risk
    
    WHERE weighted_risk > 20
    
    RETURN t.gstin AS supplier,
           total_invoices,
           invoice_issues,
           missed_returns,
           weighted_risk
    ORDER BY weighted_risk DESC
    LIMIT 5
    """
    result = tx.run(query)
    return [record.data() for record in result]


with driver.session() as session:
    suppliers = session.execute_read(get_high_risk_suppliers)

print("\n========== GST Audit Report ==========\n")

for s in suppliers:
    risk_level = "HIGH" if s["weighted_risk"] > 25 else "MEDIUM"

    explanation = f"""
Supplier GSTIN: {s['supplier']}

• Total Invoices Issued: {s['total_invoices']}
• Invoices with Mismatches: {s['invoice_issues']}
• GSTR1 Returns Not Filed: {s['missed_returns']}

Computed Risk Score: {round(s['weighted_risk'], 2)}
Risk Classification: {risk_level}

Audit Interpretation:
This supplier shows repeated compliance failures and invoice inconsistencies.
Immediate review recommended.

------------------------------------------------------------
"""
    print(explanation)

driver.close()