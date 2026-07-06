import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

DATA_DIR = BASE_DIR / "data" / "processed"


def load_geojson(relative_path: str):
    file_path = DATA_DIR / relative_path

    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} not found")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_ptal():
    return load_geojson("ptal/ptal_grid_cells.geojson")


def load_stops():
    return load_geojson("geojson/stops.geojson")


def load_routes():
    return load_geojson("geojson/routes.geojson")