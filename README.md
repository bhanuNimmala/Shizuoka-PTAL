# 静岡市 PTAL

A prototype web-based **Public Transport Accessibility Level (PTAL)** analysis system for **Shizuoka City, Japan**.

This project calculates PTAL using the official Shizuoka City GTFS datasets and visualizes the results through an interactive web dashboard.

---

# Project Overview

The objective of this project is to:

- Process official GTFS datasets
- Calculate PTAL values
- Generate GeoJSON datasets
- Visualize accessibility using an interactive web map

---

# Technology Stack

## Backend

- Python
- Django
- Django REST Framework

## Frontend

- React
- Vite
- Leaflet
- Axios

## Data Processing

- Pandas
- GeoPandas
- Shapely
- PyProj

## Data Formats

- GTFS
- GeoJSON
- CSV

---

# Project Structure

```text
静岡市PTAL/
│
├── backend/                 # Django backend
├── frontend/                # React + Vite frontend
├── data/
│   ├── raw/                 # Original datasets
│   ├── processed/           # Processed datasets
│   └── exports/             # Exported datasets
│
├── scripts/                 # Data processing modules
├── reports/                 # Final report and project documents
├── requirements.txt
├── .gitignore
└── README.md
```

---

# Project Workflow

```text
GTFS Data
      │
      ▼
Data Cleaning
      │
      ▼
GTFS Processing
      │
      ▼
GeoJSON Generation
      │
      ▼
PTAL Calculation
      │
      ▼
Django REST API
      │
      ▼
React + Leaflet Dashboard
```

---

# Project Scope

This prototype includes:

- Official Shizuoka City Community Bus GTFS datasets
- GTFS data processing
- PTAL calculation
- GeoJSON generation
- Interactive web dashboard
- Bus stop visualization
- Bus route visualization
- PTAL visualization

---

# Prototype Limitations

The following are outside the scope of this prototype:

- Railway GTFS integration
- Shinkansen
- Shizutetsu Justline GTFS
- Population overlay
- Time-based PTAL analysis
- Public facility accessibility analysis

---

# Data Sources

- Official Shizuoka City GTFS datasets
- Shizuoka City administrative boundary (to be collected)

---

# Notes

Official GTFS datasets for JR Central (JR Tokaido Main Line), Shizuoka Railway, and Shizutetsu Justline were investigated through public GTFS repositories but were not available during this project.

Therefore, this prototype evaluates accessibility using the officially available Shizuoka City community bus GTFS datasets only.

---

# Future Enhancements

Potential future improvements include:

- Railway GTFS integration
- Shizutetsu Justline GTFS integration
- Population overlay
- Time-based PTAL analysis
- Public facility accessibility analysis
- Performance optimization
- Production deployment