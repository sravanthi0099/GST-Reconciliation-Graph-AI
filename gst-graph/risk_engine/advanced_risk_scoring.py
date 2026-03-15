from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))

def calculate_supplier_risk(tx):

    query = """
MATCH (s:Taxpayer)-[:ISSUED]->(i:Invoice)
OPTIONAL MATCH (s)-[:FILED]->(g1:Return {type:"GSTR1", period:i.period})
OPTIONAL MATCH (b:Taxpayer)-[:CLAIMED_ITC]->(i)
OPTIONAL MATCH (b)-[:FILED]->(g2:Return {type:"GSTR2B", period:i.period})
OPTIONAL MATCH (i)-[:HAS_IRN]->(irn:IRN)

WITH s, i,
CASE
    WHEN g1.filed = false THEN "NO_GSTR1"
    WHEN g2 IS NULL THEN "NOT_IN_GSTR2B"
    WHEN irn IS NULL THEN "MISSING_IRN"
    WHEN i.mismatch_type <> "NONE" THEN i.mismatch_type
    ELSE "MATCHED"
END AS issue

WITH s,
     count(i) AS total_invoices,
     sum(CASE WHEN issue <> "MATCHED" THEN 1 ELSE 0 END) AS issue_count,
     sum(CASE WHEN issue <> "MATCHED" THEN i.gst_amount ELSE 0 END) AS total_risk_amount

WITH s, total_invoices, issue_count, total_risk_amount,

     (toFloat(issue_count) / total_invoices) * 40 +
     (total_risk_amount / 200000.0) * 60 AS raw_score

WITH s, total_invoices, issue_count, total_risk_amount,

CASE
    WHEN raw_score > 100 THEN 100
    ELSE raw_score
END AS risk_score

RETURN s.gstin AS supplier,
       total_invoices,
       issue_count,
       total_risk_amount,
       round(risk_score,2) AS risk_score,
       CASE
           WHEN risk_score >= 80 THEN "HIGH"
           WHEN risk_score >= 50 THEN "MEDIUM"
           ELSE "LOW"
       END AS risk_level

ORDER BY risk_score DESC
LIMIT 20
"""

    return tx.run(query).data()


with driver.session() as session:
    results = session.execute_read(calculate_supplier_risk)

    print("\n--- Supplier Risk Ranking ---")
    for r in results:
        print(r)

driver.close()