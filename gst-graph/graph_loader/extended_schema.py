from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "YOUR_PASSWORD"))

def create_extended_schema(tx):
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Taxpayer) REQUIRE t.gstin IS UNIQUE")
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (i:Invoice) REQUIRE i.invoice_id IS UNIQUE")
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (r:Return) REQUIRE r.return_id IS UNIQUE")
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (irn:IRN) REQUIRE irn.irn_id IS UNIQUE")

with driver.session() as session:
    session.execute_write(create_extended_schema)

driver.close()
print("Extended schema created.")