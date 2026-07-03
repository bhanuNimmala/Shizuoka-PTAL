"""Simple GTFS merger for the Shizuoka PTAL prototype.

Reads validated raw GTFS folders from data/raw/gtfs and writes merged master
CSV files to data/processed/merged.

Run:
    python merge_gtfs.py
"""

from pathlib import Path
import json
import re
import sys
from datetime import datetime, timezone

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = PROJECT_ROOT / "data" / "raw" / "gtfs"
VALIDATION_SUMMARY = PROJECT_ROOT / "data" / "processed" / "validation" / "gtfs_validation_summary.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "merged"

FILES = {
    "stops.txt": "master_stops.csv",
    "routes.txt": "master_routes.csv",
    "trips.txt": "master_trips.csv",
    "stop_times.txt": "master_stop_times.csv",
    "calendar.txt": "master_calendar.csv",
    "calendar_dates.txt": "master_calendar_dates.csv",
    "shapes.txt": "master_shapes.csv",
}

PREFIX_COLUMNS = {
    "stops.txt": ["stop_id", "zone_id"],
    "routes.txt": ["route_id", "agency_id"],
    "trips.txt": ["route_id", "service_id", "trip_id", "shape_id"],
    "stop_times.txt": ["trip_id", "stop_id"],
    "calendar.txt": ["service_id"],
    "calendar_dates.txt": ["service_id"],
    "shapes.txt": ["shape_id"],
}


def feed_id_from_folder(folder_name: str) -> str:
    feed_id = re.sub(r"[^0-9A-Za-z]+", "_", folder_name).strip("_").lower()
    return feed_id or "feed"


def read_gtfs(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def prefix_value(feed_id: str, value: object) -> str:
    text = "" if pd.isna(value) else str(value).strip()
    return "" if text == "" else f"{feed_id}_{text}"


def prefix_ids(df: pd.DataFrame, feed_id: str, columns: list[str]) -> pd.DataFrame:
    df = df.copy()
    for col in columns:
        if col in df.columns:
            df[f"original_{col}"] = df[col]
            df[col] = df[col].map(lambda value: prefix_value(feed_id, value))
    return df


def check_validation_passed() -> None:
    if not VALIDATION_SUMMARY.exists():
        raise FileNotFoundError("Run validate_gtfs.py before merge_gtfs.py")
    with VALIDATION_SUMMARY.open("r", encoding="utf-8") as f:
        summary = json.load(f)
    if summary.get("status") != "passed":
        raise ValueError("Validation did not pass. Fix GTFS issues before merging.")


def main() -> int:
    try:
        check_validation_passed()
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        feed_folders = sorted(path for path in RAW_DIR.iterdir() if path.is_dir())
        output_counts: dict[str, int] = {}

        for file_name, output_name in FILES.items():
            frames = []
            for feed_folder in feed_folders:
                file_path = feed_folder / file_name
                if not file_path.exists():
                    continue

                feed_id = feed_id_from_folder(feed_folder.name)
                print(f"Reading {file_name} from {feed_folder.name}...")
                df = read_gtfs(file_path)
                df.insert(0, "source_feed_folder", feed_folder.name)
                df.insert(0, "source_feed_id", feed_id)
                df = prefix_ids(df, feed_id, PREFIX_COLUMNS[file_name])
                frames.append(df)

            if not frames:
                print(f"Skipping {file_name}: no input found.")
                continue

            merged = pd.concat(frames, ignore_index=True, sort=False)
            output_path = OUTPUT_DIR / output_name
            merged.to_csv(output_path, index=False, encoding="utf-8")
            output_counts[output_name] = len(merged)
            print(f"Saved {output_name}: {len(merged)} rows")

        summary = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "passed",
            "outputs": output_counts,
        }
        with (OUTPUT_DIR / "merge_summary.json").open("w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print("GTFS merge completed.")
        return 0
    except Exception as exc:
        print(f"GTFS merge failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
