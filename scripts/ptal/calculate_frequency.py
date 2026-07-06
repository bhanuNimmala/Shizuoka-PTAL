"""Calculate stop service frequency from cleaned GTFS files.

This script supports a configurable analysis window, for example:

    python scripts/ptal/calculate_frequency.py --day monday --start-time 07:00 --end-time 10:00

Optional date handling:

    python scripts/ptal/calculate_frequency.py --day monday --date 20260406 --start-time 07:00 --end-time 10:00

Input:
    data/processed/cleaned/cleaned_stop_times.csv
    data/processed/cleaned/cleaned_trips.csv
    data/processed/cleaned/cleaned_calendar.csv
    data/processed/cleaned/cleaned_calendar_dates.csv
    data/processed/cleaned/cleaned_stops.csv

Output:
    data/processed/ptal/stop_frequency.csv
    data/processed/ptal/frequency_summary.json
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CLEANED_DIR = PROJECT_ROOT / "data" / "processed" / "cleaned"
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "ptal"

VALID_DAYS = {
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Calculate stop frequency from cleaned GTFS data."
    )
    parser.add_argument(
        "--cleaned-dir",
        type=Path,
        default=DEFAULT_CLEANED_DIR,
        help="Directory containing cleaned GTFS CSV files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory where stop_frequency.csv will be written.",
    )
    parser.add_argument(
        "--day",
        required=True,
        choices=sorted(VALID_DAYS),
        help="Analysis day of week, e.g. monday or saturday.",
    )
    parser.add_argument(
        "--start-time",
        required=True,
        help="Start time in HH:MM or HH:MM:SS format, e.g. 07:00.",
    )
    parser.add_argument(
        "--end-time",
        required=True,
        help="End time in HH:MM or HH:MM:SS format, e.g. 10:00.",
    )
    parser.add_argument(
        "--date",
        default=None,
        help="Optional analysis date in YYYYMMDD format for calendar_dates exceptions.",
    )
    parser.add_argument(
        "--include-zero",
        action="store_true",
        help="Include stops with zero trips in the output.",
    )
    return parser.parse_args()


def resolve_project_path(path: Path) -> Path:
    if path.is_absolute():
        return path
    return PROJECT_ROOT / path


def read_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing input file: {path}")
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def time_to_seconds(value: str) -> int:
    """Convert GTFS time to seconds after midnight.

    GTFS allows hours above 23, such as 24:10:00, for after-midnight service.
    """
    text = str(value).strip()
    parts = text.split(":")
    if len(parts) == 2:
        hours, minutes = parts
        seconds = "0"
    elif len(parts) == 3:
        hours, minutes, seconds = parts
    else:
        raise ValueError(f"Invalid time format: {value}")

    return int(hours) * 3600 + int(minutes) * 60 + int(seconds)


def window_duration_hours(start_time: str, end_time: str) -> float:
    start_seconds = time_to_seconds(start_time)
    end_seconds = time_to_seconds(end_time)

    if end_seconds <= start_seconds:
        raise ValueError("End time must be later than start time for this prototype.")

    return (end_seconds - start_seconds) / 3600


def get_active_service_ids(
    calendar: pd.DataFrame,
    calendar_dates: pd.DataFrame,
    day: str,
    analysis_date: str | None,
) -> set[str]:
    """Return service IDs active on the selected day/date."""
    active_services: set[str] = set()

    if not calendar.empty and day in calendar.columns:
        active = calendar[calendar[day].astype(str).str.strip() == "1"]

        if analysis_date and {"start_date", "end_date"}.issubset(active.columns):
            active = active[
                (active["start_date"].astype(str) <= analysis_date)
                & (active["end_date"].astype(str) >= analysis_date)
            ]

        active_services.update(active["service_id"].astype(str))

    if analysis_date and not calendar_dates.empty:
        exceptions = calendar_dates[calendar_dates["date"].astype(str) == analysis_date]

        # exception_type 1 = service added
        added = exceptions[exceptions["exception_type"].astype(str) == "1"]
        active_services.update(added["service_id"].astype(str))

        # exception_type 2 = service removed
        removed = exceptions[exceptions["exception_type"].astype(str) == "2"]
        active_services.difference_update(set(removed["service_id"].astype(str)))

    return active_services


def calculate_frequency(
    cleaned_dir: Path,
    day: str,
    start_time: str,
    end_time: str,
    analysis_date: str | None,
    include_zero: bool,
) -> tuple[pd.DataFrame, dict]:
    stop_times = read_csv(cleaned_dir / "cleaned_stop_times.csv")
    trips = read_csv(cleaned_dir / "cleaned_trips.csv")
    calendar = read_csv(cleaned_dir / "cleaned_calendar.csv")
    calendar_dates = read_csv(cleaned_dir / "cleaned_calendar_dates.csv")
    stops = read_csv(cleaned_dir / "cleaned_stops.csv")

    duration_hours = window_duration_hours(start_time, end_time)
    start_seconds = time_to_seconds(start_time)
    end_seconds = time_to_seconds(end_time)

    active_services = get_active_service_ids(calendar, calendar_dates, day, analysis_date)
    if not active_services:
        print("Warning: no active service IDs found for the selected day/date.")

    active_trips = trips[trips["service_id"].isin(active_services)].copy()

    # Use departure_time when available, otherwise arrival_time.
    time_column = "departure_time" if "departure_time" in stop_times.columns else "arrival_time"
    stop_times = stop_times.copy()
    stop_times["time_seconds"] = stop_times[time_column].map(time_to_seconds)

    window_stop_times = stop_times[
        (stop_times["time_seconds"] >= start_seconds)
        & (stop_times["time_seconds"] < end_seconds)
    ].copy()

    active_window_stop_times = window_stop_times[
        window_stop_times["trip_id"].isin(set(active_trips["trip_id"]))
    ].copy()

    # Count each trip stopping at each stop during the time window.
    grouped = (
        active_window_stop_times.groupby("stop_id")["trip_id"]
        .nunique()
        .reset_index(name="trip_count")
    )

    if include_zero:
        output = stops[["stop_id", "stop_name"]].drop_duplicates("stop_id").merge(
            grouped, on="stop_id", how="left"
        )
        output["trip_count"] = output["trip_count"].fillna(0).astype(int)
    else:
        output = grouped.merge(
            stops[["stop_id", "stop_name"]].drop_duplicates("stop_id"),
            on="stop_id",
            how="left",
        )

    output["analysis_day"] = day
    output["analysis_date"] = analysis_date or ""
    output["start_time"] = start_time
    output["end_time"] = end_time
    output["window_hours"] = duration_hours
    output["trips_per_hour"] = output["trip_count"] / duration_hours

    # If frequency is zero, headway and waiting time are blank.
    output["headway_min"] = output["trips_per_hour"].map(
        lambda value: round(60 / value, 2) if value > 0 else ""
    )
    output["avg_wait_min"] = output["trips_per_hour"].map(
        lambda value: round((60 / value) / 2, 2) if value > 0 else ""
    )

    output = output[
        [
            "stop_id",
            "stop_name",
            "analysis_day",
            "analysis_date",
            "start_time",
            "end_time",
            "window_hours",
            "trip_count",
            "trips_per_hour",
            "headway_min",
            "avg_wait_min",
        ]
    ].sort_values(["trips_per_hour", "stop_id"], ascending=[False, True])

    output["trips_per_hour"] = output["trips_per_hour"].round(3)

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "passed",
        "day": day,
        "date": analysis_date,
        "start_time": start_time,
        "end_time": end_time,
        "window_hours": duration_hours,
        "active_service_count": len(active_services),
        "active_trip_count": int(len(active_trips)),
        "stop_time_records_in_window": int(len(window_stop_times)),
        "active_stop_time_records_in_window": int(len(active_window_stop_times)),
        "output_stop_count": int(len(output)),
        "total_stops_available": int(stops["stop_id"].nunique()),
    }

    return output, summary


def main() -> int:
    args = parse_args()
    cleaned_dir = resolve_project_path(args.cleaned_dir)
    output_dir = resolve_project_path(args.output_dir)

    try:
        output, summary = calculate_frequency(
            cleaned_dir=cleaned_dir,
            day=args.day,
            start_time=args.start_time,
            end_time=args.end_time,
            analysis_date=args.date,
            include_zero=args.include_zero,
        )

        output_dir.mkdir(parents=True, exist_ok=True)

        output_path = output_dir / "stop_frequency.csv"
        summary_path = output_dir / "frequency_summary.json"

        output.to_csv(output_path, index=False, encoding="utf-8")
        with summary_path.open("w", encoding="utf-8") as file_obj:
            json.dump(summary, file_obj, ensure_ascii=False, indent=2)
            file_obj.write("\n")

        print(f"Saved stop frequency: {output_path}")
        print(f"Saved summary: {summary_path}")
        print("Frequency calculation completed successfully.")
        return 0

    except Exception as exc:
        print(f"Frequency calculation failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
