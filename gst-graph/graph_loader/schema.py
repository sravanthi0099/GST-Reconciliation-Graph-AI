from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "gstgraph123"))

def create_schema(tx):
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Taxpayer) REQUIRE t.gstin IS UNIQUE")
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (i:Invoice) REQUIRE i.invoice_id IS UNIQUE")
    tx.run("CREATE INDEX IF NOT EXISTS FOR (r:Return) ON (r.period)")

with driver.session() as session:
    session.execute_write(create_schema)

driver.close()
print("Schema created successfully.")