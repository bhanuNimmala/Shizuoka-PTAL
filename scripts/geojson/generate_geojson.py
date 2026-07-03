"""Generate GeoJSON map layers from cleaned GTFS files.

Inputs:
    data/processed/cleaned/cleaned_stops.csv
    data/processed/cleaned/cleaned_routes.csv
    data/processed/cleaned/cleaned_trips.csv
    data/processed/cleaned/cleaned_shapes.csv

Outputs:
    data/processed/geojson/stops.geojson
    data/processed/geojson/routes.geojson

This script is intentionally simple for the Shizuoka PTAL prototype.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CLEANED_DIR = PROJECT_ROOT / "data" / "processed" / "cleaned"
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "geojson"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate GeoJSON from cleaned GTFS files.")
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
        help="Directory where GeoJSON files will be saved.",
    )
    return parser.parse_args()


def resolve_project_path(path: Path) -> Path:
    if path.is_absolute():
        return path
    return PROJECT_ROOT / path


def read_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def save_geojson(feature_collection: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as file_obj:
        json.dump(feature_collection, file_obj, ensure_ascii=False, indent=2)
        file_obj.write("\n")


def generate_stops_geojson(stops: pd.DataFrame) -> dict:
    required_columns = {"stop_id", "stop_name", "stop_lat", "stop_lon"}
    missing = required_columns - set(stops.columns)
    if missing:
        raise ValueError(f"cleaned_stops.csv is missing columns: {sorted(missing)}")

    features = []

    for _, row in stops.iterrows():
        try:
            lat = float(row["stop_lat"])
            lon = float(row["stop_lon"])
        except ValueError:
            continue

        properties = {
            "stop_id": row.get("stop_id", ""),
            "stop_name": row.get("stop_name", ""),
            "source_feed_id": row.get("source_feed_id", ""),
            "source_feed_folder": row.get("source_feed_folder", ""),
        }

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
            "properties": properties,
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }


def get_route_name(row: pd.Series) -> str:
    short_name = row.get("route_short_name", "")
    long_name = row.get("route_long_name", "")

    if short_name and long_name:
        return f"{short_name} - {long_name}"
    if long_name:
        return long_name
    if short_name:
        return short_name
    return row.get("route_id", "")


def generate_routes_geojson(
    shapes: pd.DataFrame,
    trips: pd.DataFrame,
    routes: pd.DataFrame,
) -> dict:
    required_shape_columns = {"shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"}
    missing_shapes = required_shape_columns - set(shapes.columns)
    if missing_shapes:
        raise ValueError(f"cleaned_shapes.csv is missing columns: {sorted(missing_shapes)}")

    if "shape_id" not in trips.columns or "route_id" not in trips.columns:
        raise ValueError("cleaned_trips.csv must contain shape_id and route_id")

    if "route_id" not in routes.columns:
        raise ValueError("cleaned_routes.csv must contain route_id")

    shapes = shapes.copy()
    shapes["shape_pt_sequence_num"] = pd.to_numeric(
        shapes["shape_pt_sequence"],
        errors="coerce",
    )
    shapes = shapes.dropna(subset=["shape_pt_sequence_num"])

    # One shape can appear in many trips. We only need one route mapping per shape for map display.
    shape_to_route = (
        trips.loc[trips["shape_id"].astype(str).str.strip() != "", ["shape_id", "route_id"]]
        .drop_duplicates(subset=["shape_id"])
    )

    route_lookup = routes.drop_duplicates(subset=["route_id"]).set_index("route_id")

    features = []

    for shape_id, shape_points in shapes.groupby("shape_id"):
        shape_points = shape_points.sort_values("shape_pt_sequence_num")

        coordinates = []
        for _, point in shape_points.iterrows():
            try:
                lat = float(point["shape_pt_lat"])
                lon = float(point["shape_pt_lon"])
            except ValueError:
                continue
            coordinates.append([lon, lat])

        if len(coordinates) < 2:
            continue

        route_id = ""
        route_name = ""
        route_type = ""
        source_feed_id = shape_points.iloc[0].get("source_feed_id", "")
        source_feed_folder = shape_points.iloc[0].get("source_feed_folder", "")

        matched_route = shape_to_route.loc[shape_to_route["shape_id"] == shape_id]
        if not matched_route.empty:
            route_id = matched_route.iloc[0]["route_id"]
            if route_id in route_lookup.index:
                route_row = route_lookup.loc[route_id]
                route_name = get_route_name(route_row)
                route_type = route_row.get("route_type", "")

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates,
            },
            "properties": {
                "shape_id": shape_id,
                "route_id": route_id,
                "route_name": route_name,
                "route_type": route_type,
                "source_feed_id": source_feed_id,
                "source_feed_folder": source_feed_folder,
            },
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }


def main() -> int:
    args = parse_args()
    cleaned_dir = resolve_project_path(args.cleaned_dir)
    output_dir = resolve_project_path(args.output_dir)

    try:
        print("Reading cleaned GTFS files...")
        stops = read_csv(cleaned_dir / "cleaned_stops.csv")
        routes = read_csv(cleaned_dir / "cleaned_routes.csv")
        trips = read_csv(cleaned_dir / "cleaned_trips.csv")
        shapes = read_csv(cleaned_dir / "cleaned_shapes.csv")

        print("Generating stops.geojson...")
        stops_geojson = generate_stops_geojson(stops)
        stops_path = output_dir / "stops.geojson"
        save_geojson(stops_geojson, stops_path)
        print(f"Saved {stops_path} with {len(stops_geojson['features'])} stop features.")

        print("Generating routes.geojson...")
        routes_geojson = generate_routes_geojson(shapes, trips, routes)
        routes_path = output_dir / "routes.geojson"
        save_geojson(routes_geojson, routes_path)
        print(f"Saved {routes_path} with {len(routes_geojson['features'])} route features.")

        print("GeoJSON generation completed successfully.")
        return 0
    except Exception as exc:
        print(f"GeoJSON generation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
