"""Simple GTFS cleaner for the Shizuoka PTAL prototype.

Reads merged master CSV files from data/processed/merged and writes cleaned CSV
files to data/processed/cleaned.

Run:
    python clean_gtfs.py
"""

from pathlib import Path
import json
import sys
from datetime import datetime, timezone

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MERGED_DIR = PROJECT_ROOT / "data" / "processed" / "merged"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "cleaned"
MERGE_SUMMARY = MERGED_DIR / "merge_summary.json"

INPUTS = {
    "stops": "master_stops.csv",
    "routes": "master_routes.csv",
    "trips": "master_trips.csv",
    "stop_times": "master_stop_times.csv",
    "calendar": "master_calendar.csv",
    "calendar_dates": "master_calendar_dates.csv",
    "shapes": "master_shapes.csv",
}

OUTPUTS = {
    "stops": "cleaned_stops.csv",
    "routes": "cleaned_routes.csv",
    "trips": "cleaned_trips.csv",
    "stop_times": "cleaned_stop_times.csv",
    "calendar": "cleaned_calendar.csv",
    "calendar_dates": "cleaned_calendar_dates.csv",
    "shapes": "cleaned_shapes.csv",
}


def read_csv(file_name: str) -> pd.DataFrame:
    return pd.read_csv(MERGED_DIR / file_name, dtype=str, keep_default_na=False, encoding="utf-8")


def clean_text(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
    return df


def clean_coordinates(df: pd.DataFrame, lat_col: str, lon_col: str) -> pd.DataFrame:
    lat = pd.to_numeric(df[lat_col], errors="coerce")
    lon = pd.to_numeric(df[lon_col], errors="coerce")
    valid = lat.notna() & lon.notna() & lat.between(-90, 90) & lon.between(-180, 180)
    out = df.loc[valid].copy()
    out[lat_col] = lat.loc[valid]
    out[lon_col] = lon.loc[valid]
    return out


def require_merge_passed() -> None:
    if not MERGE_SUMMARY.exists():
        raise FileNotFoundError("Run merge_gtfs.py before clean_gtfs.py")
    with MERGE_SUMMARY.open("r", encoding="utf-8") as f:
        summary = json.load(f)
    if summary.get("status") != "passed":
        raise ValueError("Merge summary is not passed.")


def main() -> int:
    try:
        require_merge_passed()
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        tables = {name: clean_text(read_csv(file_name)) for name, file_name in INPUTS.items()}
        input_counts = {name: len(df) for name, df in tables.items()}

        print("Cleaning stops...")
        stops = tables["stops"]
        stops = stops[(stops["stop_id"] != "") & (stops["stop_name"] != "")]
        stops = clean_coordinates(stops, "stop_lat", "stop_lon")
        stops = stops.drop_duplicates("stop_id")

        print("Cleaning routes...")
        routes = tables["routes"]
        routes = routes[(routes["route_id"] != "") & (routes["route_type"] != "")]
        routes = routes.drop_duplicates("route_id")

        print("Cleaning trips...")
        trips = tables["trips"]
        trips = trips[(trips["trip_id"] != "") & (trips["route_id"] != "") & (trips["service_id"] != "")]
        trips = trips.drop_duplicates("trip_id")
        trips = trips[trips["route_id"].isin(routes["route_id"])]

        print("Cleaning stop times...")
        stop_times = tables["stop_times"]
        stop_times = stop_times[(stop_times["trip_id"] != "") & (stop_times["stop_id"] != "") & (stop_times["stop_sequence"] != "")]
        stop_times = stop_times.drop_duplicates(["trip_id", "stop_sequence"])
        stop_times = stop_times[stop_times["trip_id"].isin(trips["trip_id"])]
        stop_times = stop_times[stop_times["stop_id"].isin(stops["stop_id"])]

        print("Cleaning shapes...")
        shapes = tables["shapes"]
        shapes = shapes[(shapes["shape_id"] != "") & (shapes["shape_pt_sequence"] != "")]
        shapes = clean_coordinates(shapes, "shape_pt_lat", "shape_pt_lon")
        shapes = shapes.drop_duplicates(["shape_id", "shape_pt_sequence"])

        print("Pruning unused records...")
        trips = trips[trips["trip_id"].isin(stop_times["trip_id"])]
        routes = routes[routes["route_id"].isin(trips["route_id"])]
        stops = stops[stops["stop_id"].isin(stop_times["stop_id"])]

        if "shape_id" in trips.columns:
            used_shapes = set(trips.loc[trips["shape_id"] != "", "shape_id"])
            shapes = shapes[shapes["shape_id"].isin(used_shapes)]

        used_services = set(trips["service_id"])
        calendar = tables["calendar"]
        calendar_dates = tables["calendar_dates"]
        if "service_id" in calendar.columns:
            calendar = calendar[calendar["service_id"].isin(used_services)]
        if "service_id" in calendar_dates.columns:
            calendar_dates = calendar_dates[calendar_dates["service_id"].isin(used_services)]

        cleaned = {
            "stops": stops,
            "routes": routes,
            "trips": trips,
            "stop_times": stop_times,
            "calendar": calendar,
            "calendar_dates": calendar_dates,
            "shapes": shapes,
        }

        for name, df in cleaned.items():
            output_path = OUTPUT_DIR / OUTPUTS[name]
            df.to_csv(output_path, index=False, encoding="utf-8")
            print(f"Saved {OUTPUTS[name]}: {len(df)} rows")

        summary = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "passed",
            "input_rows": input_counts,
            "output_rows": {name: len(df) for name, df in cleaned.items()},
        }
        with (OUTPUT_DIR / "cleaning_summary.json").open("w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print("GTFS cleaning completed.")
        return 0
    except Exception as exc:
        print(f"GTFS cleaning failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
