from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "gstgraph123"

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

def compute_risk(tx):
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
    
    RETURN t.gstin AS supplier,
           total_invoices,
           invoice_issues,
           missed_returns,
           weighted_risk
    ORDER BY weighted_risk DESC
    LIMIT 10
    """
    result = tx.run(query)
    return [record.data() for record in result]

if __name__ == "__main__":
    with driver.session() as session:
        results = session.execute_read(compute_risk)

    print("\n--- Risk Scoring ---\n")
    for r in results:
        print(r)

    driver.close()