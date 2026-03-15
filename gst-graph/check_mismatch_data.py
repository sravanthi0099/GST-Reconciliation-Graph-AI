from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
USERNAME = os.getenv("NEO4J_USER", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "gstgraph123")

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

query = """
MATCH (i:GSTR1Invoice)
RETURN
count(i) AS total_invoices,
sum(CASE WHEN i.mismatch_type <> 'NONE' THEN 1 ELSE 0 END) AS mismatch_invoices
"""

with driver.session() as session:
    result = session.run(query)
    record = result.single()
    print("Total invoices:", record["total_invoices"])
    print("Invoices with mismatches:", record["mismatch_invoices"])

driver.close()