"""
Extract Shizuoka City boundary from MLIT N03 administrative boundary data.

Input:
    data/raw/boundary/N03-20260101_22.geojson

Output:
    data/processed/boundary/shizuoka_city_boundary.geojson
"""

from __future__ import annotations

import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_PATH = PROJECT_ROOT / "data" / "raw" / "boundary" / "N03-20260101_22.geojson"
OUTPUT_PATH = PROJECT_ROOT / "data" / "processed" / "boundary" / "shizuoka_city_boundary.geojson"


def is_shizuoka_city(properties: dict) -> bool:
    values = [str(value) for value in properties.values() if value is not None]

    return (
        "静岡県" in values
        and "静岡市" in values
    )


def main() -> int:
    if not INPUT_PATH.exists():
        print(f"Input file not found: {INPUT_PATH}")
        return 1

    with INPUT_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    matched_features = []

    for feature in data.get("features", []):
        properties = feature.get("properties", {})
        if is_shizuoka_city(properties):
            matched_features.append(feature)

    if not matched_features:
        print("No features found for 静岡市.")
        print("Please open the GeoJSON and check the property names/values.")
        return 1

    output_geojson = {
        "type": "FeatureCollection",
        "features": matched_features,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(output_geojson, f, ensure_ascii=False, indent=2)

    print(f"Saved Shizuoka City boundary: {OUTPUT_PATH}")
    print(f"Feature count: {len(matched_features)}")
    print("Boundary extraction completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
