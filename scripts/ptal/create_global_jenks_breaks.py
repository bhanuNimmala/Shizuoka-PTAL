from __future__ import annotations

import json
from pathlib import Path

import jenkspy
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PTAL_DIR = PROJECT_ROOT / "data" / "processed" / "ptal"
OUTPUT = PTAL_DIR / "global_jenks_breaks.json"

DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

FILES = [PTAL_DIR / f"ptal_{day}_full_day.csv" for day in DAYS]


def main() -> int:
    positive_ai = []

    for file in FILES:
        if not file.exists():
            print(f"Missing file: {file}")
            continue

        df = pd.read_csv(file)

        if "accessibility_index" not in df.columns:
            print(f"Missing accessibility_index in: {file}")
            continue

        values = df.loc[df["accessibility_index"] > 0, "accessibility_index"]
        positive_ai.extend(values.dropna().astype(float).tolist())

    if not positive_ai:
        print("No positive Accessibility Index values found.")
        return 1

    unique_count = len(set(positive_ai))
    class_count = min(8, unique_count)

    breaks = jenkspy.jenks_breaks(positive_ai, n_classes=class_count)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({"breaks": breaks}, f, indent=2)

    print("Saved global Jenks breaks:")
    print(OUTPUT)
    print(breaks)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())