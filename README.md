# 静岡市 PTAL (Shizuoka City Public Transport Accessibility Level)

A prototype web-based **Public Transport Accessibility Level (PTAL)** analysis system developed for **Shizuoka City, Japan**.

The project processes official GTFS datasets, calculates PTAL values based on the Transport for London (TfL) PTAL methodology, and visualizes public transport accessibility through an interactive web dashboard.

---

## Project Overview

The objective of this project is to evaluate public transport accessibility across Shizuoka City by integrating GTFS data, spatial analysis, and web-based visualization.

The prototype performs the following tasks:

- Process official GTFS datasets
- Calculate PTAL accessibility values
- Generate GeoJSON datasets for visualization
- Provide an interactive web dashboard for accessibility analysis

---

## Dashboard Preview

### Main Dashboard

![Main Dashboard](images/Dashboard%20Main%20Page.png)

The main dashboard displays the PTAL accessibility map together with selectable transport layers and analysis controls.

### PTAL Accessibility Layer

![PTAL Layer and Score](images/PTAL%20Score.png)
![PTAL Layer and Score](images/PTAL%20Score%202.png)

### Population Overlay

![Population](images/Population%20Layer.png)

### Population and PTAL Overlay

![Population and PTAL](images/Population%20and%20PTAL%20Layer.png)

### Daywise PTAL

![Daywise PTAL Score](images/Daywise%20PTAL%201.png)
![Daywise PTAL Score](images/Daywise%20PTAL%202.png)

### Bus Stops and Routes

![Bus Stops and Routes](images/Bus%20stops%20and%20Routes.png)

---

## Features

- PTAL calculation based on GTFS service frequency
- Interactive PTAL map visualization
- Bus stop visualization
- Bus route visualization
- Population overlay
- Day-of-week accessibility analysis
- Layer controls for map visualization
- Interactive information panels

---

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework

### Frontend

- React
- Vite
- React Leaflet
- Axios

### Data Processing

- Pandas
- GeoPandas
- Shapely
- PyProj
- OSMnx
- NetworkX

### Data Formats

- GTFS
- GeoJSON
- CSV

---

## Project Structure

```text
Shizuoka-PTAL/
│
├── backend/                 # Django backend and REST APIs
├── frontend/                # React + Vite dashboard
├── data/
│   ├── raw/                 # Original datasets
│   └── processed/           # Processed GeoJSON and CSV files
│
├── scripts/                 # Data processing scripts
├── requirements.txt
├── .gitignore
└── README.md
```

---

## Project Workflow

```text
GTFS Data
      │
      ▼
GTFS Validation
      │
      ▼
GTFS Merge
      │
      ▼
Data Cleaning
      │
      ▼
Service Frequency Analysis
      │
      ▼
Walking Accessibility Analysis
      │
      ▼
PTAL Calculation
      │
      ▼
Jenks Natural Breaks Classification
      │
      ▼
GeoJSON Generation
      │
      ▼
Django REST API
      │
      ▼
React + Leaflet Dashboard
```

---

## PTAL Methodology

This prototype is based on the Transport for London (TfL) Public Transport Accessibility Level (PTAL) methodology.

The accessibility evaluation consists of:

- Walking Time (WT)
- Average Waiting Time (AWT)
- Total Access Time (TAT)
- Equivalent Doorstep Frequency (EDF)
- Accessibility Index (AI)

To suit the characteristics of Shizuoka City's public transport network, two implementation adaptations were made:

- The Accessibility Index (AI) is calculated as the sum of the Equivalent Doorstep Frequencies (EDF) of all accessible services.
- PTAL bands are classified using Jenks Natural Breaks instead of the fixed Accessibility Index thresholds defined in the original TfL methodology.

These adaptations preserve the overall PTAL evaluation framework while producing accessibility classifications that are more representative of Shizuoka City's public transport network.

---

## Project Scope

This prototype includes:

- Official Shizuoka City Community Bus GTFS datasets
- GTFS validation and preprocessing
- GTFS data cleaning and merging
- Service frequency analysis
- Walking accessibility analysis
- PTAL calculation
- GeoJSON generation
- Interactive web dashboard
- PTAL visualization
- Bus stop visualization
- Bus route visualization
- Population overlay
- Day-of-week accessibility analysis

---

## Data Sources

The prototype uses the following publicly available datasets:

- Official Shizuoka City Community Bus GTFS datasets
- OpenStreetMap road network
- e-Stat 500 m Population Mesh
- Shizuoka City administrative boundary

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/bhanuNimmala/Shizuoka-PTAL.git
cd Shizuoka-PTAL
```

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Usage

1. Start the Django backend.
2. Start the React frontend.
3. Open the dashboard in your browser.
4. Select the analysis day.
5. Toggle map layers as required.
6. Explore PTAL values, routes, bus stops, and population distribution.

---

## Prototype Limitations

This prototype has the following limitations:

- Railway GTFS data was not publicly available during the project.
- Shizutetsu Justline GTFS data was not publicly available.
- Accessibility evaluation is limited to officially available Shizuoka City Community Bus GTFS datasets.
- The application is intended as a prototype for accessibility evaluation and demonstration purposes.

---

## Future Enhancements

Potential future improvements include:

- Railway GTFS integration
- Shizutetsu Justline GTFS integration
- Real-time GTFS support
- Public facility accessibility analysis
- Additional accessibility indicators
- Performance optimization
- Production deployment

---

## Notes

Official GTFS datasets for **JR Central (JR Tokaido Main Line)**, **Shizuoka Railway**, and **Shizutetsu Justline** were investigated through publicly available GTFS repositories but were not available during this project.

Consequently, the prototype evaluates accessibility using only the officially available **Shizuoka City Community Bus GTFS datasets**.

---

## Project Status

This repository contains a research and development prototype created for PTAL accessibility analysis in Shizuoka City.

The project was developed for evaluation and demonstration purposes and is not intended as a production-ready system.