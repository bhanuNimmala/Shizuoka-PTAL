"""
Calculate PTAL scores from walking accessibility results.

Input:
    data/processed/ptal/grid_accessibility.csv
    data/processed/ptal/analysis_grid.geojson

Outputs:
    data/processed/ptal/ptal_results.csv
    data/processed/ptal/ptal_grid.geojson

Method:
    For each grid point and reachable stop:
        Total Access Time (TAT) = walking_time_min + avg_wait_min
        Equivalent Doorstep Frequency (EDF) = 30 / TAT

    For each grid point:
        Accessibility Index (AI) = sum(EDF)
        PTAL band = category based on AI

Prototype note:
    This implementation uses a simplified PTAL-style calculation suitable for
    the Shizuoka City prototype.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import geopandas as gpd
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_ACCESSIBILITY = PROJECT_ROOT / "data" / "processed" / "ptal" / "grid_accessibility.csv"
DEFAULT_GRID = PROJECT_ROOT / "data" / "processed" / "ptal" / "analysis_grid.geojson"
DEFAULT_RESULTS_CSV = PROJECT_ROOT / "data" / "processed" / "ptal" / "ptal_results.csv"
DEFAULT_RESULTS_GEOJSON = PROJECT_ROOT / "data" / "processed" / "ptal" / "ptal_grid.geojson"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Calculate PTAL scores.")
    parser.add_argument("--accessibility", type=Path, default=DEFAULT_ACCESSIBILITY)
    parser.add_argument("--grid", type=Path, default=DEFAULT_GRID)
    parser.add_argument("--output-csv", type=Path, default=DEFAULT_RESULTS_CSV)
    parser.add_argument("--output-geojson", type=Path, default=DEFAULT_RESULTS_GEOJSON)
    return parser.parse_args()


def ptal_band(ai: float) -> str:
    if ai <= 0:
        return "0"
    if ai < 2.5:
        return "1a"
    if ai < 5:
        return "1b"
    if ai < 10:
        return "2"
    if ai < 15:
        return "3"
    if ai < 20:
        return "4"
    if ai < 25:
        return "5"
    if ai < 40:
        return "6a"
    return "6b"


def main() -> int:
    args = parse_args()

    try:
        if not args.accessibility.exists():
            print(f"Accessibility file not found: {args.accessibility}")
            return 1

        if not args.grid.exists():
            print(f"Analysis grid file not found: {args.grid}")
            return 1

        print("Loading walking accessibility data...")
        accessibility = pd.read_csv(args.accessibility)

        required_columns = {
            "grid_id",
            "stop_id",
            "walking_time_min",
            "avg_wait_min",
            "trips_per_hour",
        }
        missing = required_columns - set(accessibility.columns)

        if missing:
            print(f"Missing required columns: {sorted(missing)}")
            return 1

        print("Calculating Total Access Time and EDF...")
        accessibility["total_access_time_min"] = (
            accessibility["walking_time_min"] + accessibility["avg_wait_min"]
        )

        accessibility = accessibility[accessibility["total_access_time_min"] > 0].copy()
        accessibility["edf"] = 30 / accessibility["total_access_time_min"]

        print("Aggregating PTAL by grid point...")
        grouped = (
            accessibility.groupby("grid_id")
            .agg(
                accessibility_index=("edf", "sum"),
                reachable_stop_count=("stop_id", "nunique"),
                min_walking_time_min=("walking_time_min", "min"),
                avg_walking_time_min=("walking_time_min", "mean"),
                max_trips_per_hour=("trips_per_hour", "max"),
            )
            .reset_index()
        )

        grouped["accessibility_index"] = grouped["accessibility_index"].round(3)
        grouped["min_walking_time_min"] = grouped["min_walking_time_min"].round(2)
        grouped["avg_walking_time_min"] = grouped["avg_walking_time_min"].round(2)
        grouped["ptal_band"] = grouped["accessibility_index"].apply(ptal_band)

        print("Loading full grid...")
        grid = gpd.read_file(args.grid)

        if grid.crs is None:
            grid = grid.set_crs("EPSG:4326")

        grid["grid_id"] = grid["grid_id"].astype(str)
        grouped["grid_id"] = grouped["grid_id"].astype(str)

        print("Merging PTAL results with grid...")
        result_grid = grid.merge(grouped, on="grid_id", how="left")

        result_grid["accessibility_index"] = result_grid["accessibility_index"].fillna(0)
        result_grid["reachable_stop_count"] = result_grid["reachable_stop_count"].fillna(0).astype(int)
        result_grid["min_walking_time_min"] = result_grid["min_walking_time_min"].fillna(0)
        result_grid["avg_walking_time_min"] = result_grid["avg_walking_time_min"].fillna(0)
        result_grid["max_trips_per_hour"] = result_grid["max_trips_per_hour"].fillna(0)
        result_grid["ptal_band"] = result_grid["ptal_band"].fillna("0")

        output_table = result_grid.drop(columns="geometry").copy()

        args.output_csv.parent.mkdir(parents=True, exist_ok=True)

        output_table.to_csv(args.output_csv, index=False, encoding="utf-8")
        result_grid.to_file(args.output_geojson, driver="GeoJSON")

        print(f"Saved PTAL CSV: {args.output_csv}")
        print(f"Saved PTAL GeoJSON: {args.output_geojson}")

        print("PTAL summary:")
        print(result_grid["ptal_band"].value_counts().sort_index().to_string())

        print("PTAL calculation completed successfully.")
        return 0

    except Exception as exc:
        print(f"PTAL calculation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
