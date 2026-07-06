from __future__ import annotations

import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

START_TIME = "00:00"
END_TIME = "24:00"

PTAL_DIR = PROJECT_ROOT / "data" / "processed" / "ptal"


def run_command(command: list[str]) -> None:
    print("\nRunning:")
    print(" ".join(command))

    result = subprocess.run(command, cwd=PROJECT_ROOT)

    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(command)}")


def main() -> int:
    try:
        PTAL_DIR.mkdir(parents=True, exist_ok=True)

        for day in DAYS:
            print("=" * 70)
            print(f"Generating full-day PTAL for: {day}")
            print("=" * 70)

            run_command(
                [
                    sys.executable,
                    "scripts/ptal/calculate_frequency.py",
                    "--day",
                    day,
                    "--start-time",
                    START_TIME,
                    "--end-time",
                    END_TIME,
                ]
            )

            run_command(
                [
                    sys.executable,
                    "scripts/ptal/calculate_walking_accessibility.py",
                ]
            )

            run_command(
                [
                    sys.executable,
                    "scripts/ptal/calculate_ptal.py",
                    "--output-csv",
                    str(PTAL_DIR / f"ptal_{day}_full_day.csv"),
                    "--output-geojson",
                    str(PTAL_DIR / f"ptal_{day}_full_day.geojson"),
                ]
            )

            print(f"Saved PTAL outputs for {day}")

        print("\nAll full-day PTAL layers generated successfully.")
        return 0

    except Exception as exc:
        print(f"\nFull-day PTAL generation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())