# Intelligent GST Reconciliation using Knowledge Graphs

This project implements a **Graph-based GST reconciliation engine** that models GST data using a **Neo4j knowledge graph** instead of traditional relational tables.

The system connects **taxpayers, vendors, invoices, IRNs, and GST returns** as graph nodes and performs **multi-hop traversal** to detect mismatches, classify financial risk, and generate explainable audit insights.

## Features

- Knowledge Graph model of GST ecosystem
- Graph-based invoice reconciliation
- Vendor compliance risk scoring
- Automated mismatch detection
- Explainable audit alerts
- Interactive React dashboard

## Tech Stack

**Graph Database**

- Neo4j

**Backend**

- Python
- FastAPI
- Neo4j Python Driver

**Frontend**

- React
- Recharts
- Framer Motion

## Architecture

React Dashboard → FastAPI API → Neo4j Knowledge Graph

## Project Structure
GST reconciliation

frontend/ — React dashboard  

gst-graph/ — Backend graph engine  

gst-graph/api/ — FastAPI backend  

gst-graph/graph_loader/ — CSV → Neo4j ingestion scripts  

gst-graph/reconciliation_engine/ — risk scoring logic  

CSV files — GST mock data  

README.md — project documentation