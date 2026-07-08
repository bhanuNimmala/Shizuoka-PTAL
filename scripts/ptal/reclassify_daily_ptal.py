from __future__ import annotations

import json
from pathlib import Path

import geopandas as gpd
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PTAL_DIR = PROJECT_ROOT / "data" / "processed" / "ptal"
BREAKS_FILE = PTAL_DIR / "global_jenks_breaks.json"

DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

BANDS = ["1a", "1b", "2", "3", "4", "5", "6a", "6b"]


def classify(ai: float, breaks: list[float]) -> str:
    if pd.isna(ai) or ai <= 0:
        return "0"

    for i in range(1, len(breaks)):
        if ai <= breaks[i]:
            return BANDS[i - 1]

    return BANDS[-1]


def main() -> int:
    if not BREAKS_FILE.exists():
        print(f"Breaks file not found: {BREAKS_FILE}")
        return 1

    with open(BREAKS_FILE, "r", encoding="utf-8") as f:
        breaks = json.load(f)["breaks"]

    print("Using global Jenks breaks:")
    print(breaks)

    for day in DAYS:
        geojson_path = PTAL_DIR / f"ptal_{day}_full_day.geojson"
        csv_path = PTAL_DIR / f"ptal_{day}_full_day.csv"

        if not geojson_path.exists():
            print(f"Missing GeoJSON: {geojson_path}")
            continue

        print(f"\nReclassifying {day}...")

        gdf = gpd.read_file(geojson_path)

        if "accessibility_index" not in gdf.columns:
            print(f"Missing accessibility_index in: {geojson_path}")
            continue

        gdf["accessibility_index"] = gdf["accessibility_index"].fillna(0)
        gdf["ptal_band"] = gdf["accessibility_index"].apply(
            lambda ai: classify(float(ai), breaks)
        )

        gdf.to_file(geojson_path, driver="GeoJSON")
        gdf.drop(columns="geometry").to_csv(csv_path, index=False, encoding="utf-8")

        print(gdf["ptal_band"].value_counts().sort_index().to_string())

    print("\nDaily PTAL files reclassified successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())