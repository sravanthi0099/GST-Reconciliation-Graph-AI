import streamlit as st
import pandas as pd
from neo4j import GraphDatabase
import plotly.express as px

# ------------------------------
# Neo4j Connection
# ------------------------------
URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "gstgraph123"

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))


# ------------------------------
# Fetch Risk Data
# ------------------------------
def get_supplier_risk_data():
    query = """
    MATCH (s:Taxpayer)-[:ISSUED]->(i:Invoice)
    WHERE i.mismatch_type IS NOT NULL AND i.mismatch_type <> "MATCHED"

    WITH s,
         count(i) AS issue_count,
         sum(i.gst_amount) AS total_risk_amount

    MATCH (s)-[:ISSUED]->(inv:Invoice)
    WITH s, issue_count, total_risk_amount,
         count(inv) AS total_invoices

    RETURN s.gstin AS supplier,
           total_invoices,
           issue_count,
           total_risk_amount
    ORDER BY total_risk_amount DESC
    LIMIT 20
    """

    with driver.session() as session:
        result = session.run(query)
        data = [dict(record) for record in result]

    return pd.DataFrame(data)


# ------------------------------
# Risk Level Classification
# ------------------------------
def classify_risk(amount):
    if amount >= 150000:
        return "HIGH"
    elif amount >= 80000:
        return "MEDIUM"
    else:
        return "LOW"


# ------------------------------
# Streamlit UI
# ------------------------------
st.set_page_config(layout="wide")
st.title("Intelligent GST Reconciliation Dashboard")

df = get_supplier_risk_data()

if df.empty:
    st.warning("No risk data found.")
    st.stop()

# Add risk level column
df["risk_level"] = df["total_risk_amount"].apply(classify_risk)

# ------------------------------
# Top Risk Table
# ------------------------------
st.subheader("Top Risk Suppliers")
st.dataframe(df, use_container_width=True)

# ------------------------------
# Financial Exposure Chart
# ------------------------------
st.subheader("Financial Exposure Chart")

fig_bar = px.bar(
    df,
    x="supplier",
    y="total_risk_amount",
    title="Supplier Financial Exposure",
)

st.plotly_chart(fig_bar, use_container_width=True)

# ------------------------------
# Risk Distribution Pie Chart
# ------------------------------
st.subheader("Risk Distribution")

risk_counts = df["risk_level"].value_counts()

fig_pie = px.pie(
    values=risk_counts.values,
    names=risk_counts.index,
    title="Risk Level Distribution"
)

st.plotly_chart(fig_pie, use_container_width=True)

driver.close()