import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = FastAPI(title="GST Risk Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/reconciliation/summary")
def reconciliation_summary():
    query = """
    MATCH (g1:GSTR1Invoice)
    WITH
      count(g1) AS total_invoices,
      sum(CASE WHEN g1.mismatch_type <> 'NONE' THEN 1 ELSE 0 END) AS mismatch_invoices,
      sum(CASE WHEN g1.mismatch_type IN ['FAKE_INVOICE','ITC_MISMATCH'] THEN 1 ELSE 0 END) AS high_risk,
      sum(CASE WHEN g1.mismatch_type IN ['VALUE_MISMATCH','LATE_FILING'] THEN 1 ELSE 0 END) AS medium_risk
    RETURN
      total_invoices,
      mismatch_invoices,
      high_risk,
      medium_risk,
      (total_invoices - high_risk - medium_risk) AS low_risk
    """
    with driver.session() as session:
        record = session.run(query).single()
        return dict(record)

@app.get("/api/vendors/risk-scores")
def vendor_risk_scores():
    query = """
    MATCH (v:Vendor)-[:ISSUED_BY]->(g1:GSTR1Invoice)
    OPTIONAL MATCH (g1)-[:IN_GSTR2B]->(g2:GSTR2BInvoice)
    WITH v, collect(g1) AS invoices, count(g1) AS total_invoices,
         sum(CASE WHEN g1.mismatch_type IN ['FAKE_INVOICE','ITC_MISMATCH'] THEN 1 ELSE 0 END) AS high_count,
         sum(CASE WHEN g1.mismatch_type IN ['VALUE_MISMATCH','LATE_FILING'] THEN 1 ELSE 0 END) AS medium_count
    WITH v, total_invoices, high_count, medium_count,
         CASE
           WHEN total_invoices = 0 THEN 0
           ELSE round(((high_count * 1.0 + medium_count * 0.5) / total_invoices) * 10000) / 100
         END AS risk_score
    RETURN
      v.gstin AS vendor_gstin,
      total_invoices,
      high_count,
      medium_count,
      risk_score,
      CASE
        WHEN risk_score >= 70 THEN 'HIGH'
        WHEN risk_score >= 40 THEN 'MEDIUM'
        ELSE 'LOW'
      END AS risk_level,
      'This supplier has a GST risk score of ' + toString(risk_score) + '%. The system detected unusual invoice patterns compared with other vendors.' AS explanation,
      CASE
        WHEN high_count > 0 AND medium_count > 0 THEN
          ['' + toString(high_count) + ' invoices are classified as HIGH risk.',
           '' + toString(medium_count) + ' invoices are classified as MEDIUM risk.']
        WHEN high_count > 0 THEN
          ['' + toString(high_count) + ' invoices are classified as HIGH risk.']
        WHEN medium_count > 0 THEN
          ['' + toString(medium_count) + ' invoices are classified as MEDIUM risk.']
        ELSE []
      END AS reasons,
      CASE
        WHEN risk_score >= 40 THEN 'Monitor this supplier and verify invoices.'
        ELSE 'No immediate action required.'
      END AS recommendation,
      'This supplier is connected to ' + toString(total_invoices) + ' invoice records in the transaction graph.' AS graph_insight
    ORDER BY risk_score DESC
    """
    with driver.session() as session:
        return [dict(r) for r in session.run(query)]

@app.get("/audit/high-risk")
def audit_high_risk():
    query = """
    MATCH (v:Vendor)-[:ISSUED_BY]->(g1:GSTR1Invoice)
    WITH v,
         count(g1) AS total_invoices,
         sum(CASE WHEN g1.mismatch_type IN ['FAKE_INVOICE','ITC_MISMATCH'] THEN 1 ELSE 0 END) AS high_count,
         sum(CASE WHEN g1.mismatch_type IN ['VALUE_MISMATCH','LATE_FILING'] THEN 1 ELSE 0 END) AS medium_count
    WITH v, total_invoices, high_count, medium_count,
         CASE
           WHEN total_invoices = 0 THEN 0
           ELSE round(((high_count * 1.0 + medium_count * 0.5) / total_invoices) * 10000) / 100
         END AS risk_score
    WHERE risk_score >= 40 OR high_count > 0
    RETURN
      v.gstin AS vendor_gstin,
      total_invoices,
      high_count,
      medium_count,
      risk_score
    ORDER BY risk_score DESC
    """
    with driver.session() as session:
        return [dict(r) for r in session.run(query)]

@app.get("/network/exposure/{gstin}")
def network_exposure(gstin: str):
    query = """
    MATCH (v:Vendor {gstin: $gstin})-[:ISSUED_BY]->(g1:GSTR1Invoice)
    OPTIONAL MATCH (g1)-[:IN_GSTR2B]->(g2:GSTR2BInvoice)
    OPTIONAL MATCH (g1)-[:IN_PURCHASE_REGISTER]->(p:PurchaseRegister)
    OPTIONAL MATCH (g1)-[:HAS_EINVOICE]->(e:EInvoice)
    RETURN
      v.gstin AS gstin,
      collect(DISTINCT {
        invoice_id: g1.invoice_id,
        period: g1.period,
        mismatch_type: g1.mismatch_type,
        amount: g1.amount
      }) AS gstr1_invoices,
      collect(DISTINCT {
        invoice_id: g2.invoice_id,
        period: g2.period,
        amount: g2.amount
      }) AS gstr2b_invoices,
      collect(DISTINCT {
        invoice_id: p.invoice_id,
        period: p.period,
        amount: p.amount
      }) AS purchase_register,
      collect(DISTINCT {
        invoice_id: e.invoice_id,
        irn: e.irn,
        valid: e.valid
      }) AS e_invoices
    """
    with driver.session() as session:
        record = session.run(query, gstin=gstin).single()
        return dict(record) if record else {"gstin": gstin, "gstr1_invoices": [], "gstr2b_invoices": [], "purchase_register": [], "e_invoices": []}