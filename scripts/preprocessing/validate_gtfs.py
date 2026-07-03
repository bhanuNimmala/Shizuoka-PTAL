"""Simple GTFS validator for the Shizuoka PTAL prototype.

Reads raw GTFS folders from data/raw/gtfs and writes validation results to
 data/processed/validation.

Run:
    python validate_gtfs.py
"""

from pathlib import Path
import json
import re
import sys
from datetime import datetime, timezone

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = PROJECT_ROOT / "data" / "raw" / "gtfs"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "validation"

REQUIRED_FILES = [
    "stops.txt",
    "routes.txt",
    "trips.txt",
    "stop_times.txt",
    "shapes.txt",  # required because the dashboard must display routes
]

REQUIRED_COLUMNS = {
    "stops.txt": ["stop_id", "stop_name", "stop_lat", "stop_lon"],
    "routes.txt": ["route_id", "route_type"],
    "trips.txt": ["route_id", "service_id", "trip_id"],
    "stop_times.txt": ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"],
    "calendar.txt": ["service_id", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "start_date", "end_date"],
    "calendar_dates.txt": ["service_id", "date", "exception_type"],
    "shapes.txt": ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"],
}


def feed_id_from_folder(folder_name: str) -> str:
    """Create a safe prefix from a GTFS folder name."""
    feed_id = re.sub(r"[^0-9A-Za-z]+", "_", folder_name).strip("_").lower()
    return feed_id or "feed"


def read_gtfs(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def add_issue(issues: list[dict], feed: str, file_name: str, issue: str) -> None:
    issues.append({"feed_folder": feed, "file": file_name, "issue": issue})


def validate_feed(feed_folder: Path) -> dict:
    feed_name = feed_folder.name
    feed_id = feed_id_from_folder(feed_name)
    issues: list[dict] = []
    tables: dict[str, pd.DataFrame] = {}

    print(f"Checking {feed_name}...")

    for file_name in REQUIRED_FILES:
        if not (feed_folder / file_name).exists():
            add_issue(issues, feed_name, file_name, "missing required file")

    if not (feed_folder / "calendar.txt").exists() and not (feed_folder / "calendar_dates.txt").exists():
        add_issue(issues, feed_name, "calendar.txt", "missing calendar.txt or calendar_dates.txt")

    for txt_path in sorted(feed_folder.glob("*.txt")):
        file_name = txt_path.name
        try:
            df = read_gtfs(txt_path)
        except Exception as exc:
            add_issue(issues, feed_name, file_name, f"cannot read file: {exc}")
            continue

        tables[file_name] = df
        required = REQUIRED_COLUMNS.get(file_name, [])
        missing = [col for col in required if col not in df.columns]
        if missing:
            add_issue(issues, feed_name, file_name, "missing columns: " + ", ".join(missing))

    # Basic quality checks.
    if "stops.txt" in tables and {"stop_id", "stop_lat", "stop_lon"}.issubset(tables["stops.txt"].columns):
        stops = tables["stops.txt"]
        if stops["stop_id"].duplicated().any():
            add_issue(issues, feed_name, "stops.txt", "duplicate stop_id values")
        lat = pd.to_numeric(stops["stop_lat"], errors="coerce")
        lon = pd.to_numeric(stops["stop_lon"], errors="coerce")
        bad = lat.isna() | lon.isna() | ~lat.between(-90, 90) | ~lon.between(-180, 180)
        if bad.any():
            add_issue(issues, feed_name, "stops.txt", f"{int(bad.sum())} invalid stop coordinates")

    if "routes.txt" in tables and "trips.txt" in tables:
        if {"route_id"}.issubset(tables["routes.txt"].columns) and {"route_id"}.issubset(tables["trips.txt"].columns):
            missing = set(tables["trips.txt"]["route_id"]) - set(tables["routes.txt"]["route_id"])
            missing.discard("")
            if missing:
                add_issue(issues, feed_name, "trips.txt", f"{len(missing)} route_id values missing from routes.txt")

    if "trips.txt" in tables and "stop_times.txt" in tables:
        if {"trip_id"}.issubset(tables["trips.txt"].columns) and {"trip_id"}.issubset(tables["stop_times.txt"].columns):
            missing = set(tables["stop_times.txt"]["trip_id"]) - set(tables["trips.txt"]["trip_id"])
            missing.discard("")
            if missing:
                add_issue(issues, feed_name, "stop_times.txt", f"{len(missing)} trip_id values missing from trips.txt")

    if "stops.txt" in tables and "stop_times.txt" in tables:
        if {"stop_id"}.issubset(tables["stops.txt"].columns) and {"stop_id"}.issubset(tables["stop_times.txt"].columns):
            missing = set(tables["stop_times.txt"]["stop_id"]) - set(tables["stops.txt"]["stop_id"])
            missing.discard("")
            if missing:
                add_issue(issues, feed_name, "stop_times.txt", f"{len(missing)} stop_id values missing from stops.txt")

    return {
        "feed_folder": feed_name,
        "feed_id": feed_id,
        "status": "passed" if not issues else "failed",
        "issue_count": len(issues),
        "issues": issues,
    }


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not RAW_DIR.exists():
        print(f"GTFS raw folder not found: {RAW_DIR}")
        return 1

    feed_folders = sorted(path for path in RAW_DIR.iterdir() if path.is_dir())
    if not feed_folders:
        print(f"No GTFS feed folders found in: {RAW_DIR}")
        return 1

    results = [validate_feed(folder) for folder in feed_folders]
    all_issues = [issue for result in results for issue in result["issues"]]

    pd.DataFrame(all_issues or [{"feed_folder": "all", "file": "all", "issue": "passed"}]).to_csv(
        OUTPUT_DIR / "gtfs_validation_issues.csv", index=False, encoding="utf-8"
    )

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "passed" if not all_issues else "failed",
        "feed_count": len(results),
        "feeds": [{k: v for k, v in result.items() if k != "issues"} for result in results],
    }
    with (OUTPUT_DIR / "gtfs_validation_summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        f.write("\n")

    if all_issues:
        print(f"Validation failed with {len(all_issues)} issue(s). See gtfs_validation_issues.csv")
        return 1

    print("Validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
