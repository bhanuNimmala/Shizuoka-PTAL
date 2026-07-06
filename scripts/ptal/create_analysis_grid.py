"""
Create PTAL analysis grid inside Shizuoka City boundary.

This replaces the earlier rectangle-based grid script.

Input:
    data/processed/boundary/shizuoka_city_boundary.geojson

Output:
    data/processed/ptal/analysis_grid.geojson

Notes:
    - Grid points are generated only inside the Shizuoka City polygon.
    - Uses GeoPandas, Shapely, and PyProj.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import geopandas as gpd
from shapely.geometry import Point


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_BOUNDARY = (
    PROJECT_ROOT / "data" / "processed" / "boundary" / "shizuoka_city_boundary.geojson"
)
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "processed" / "ptal" / "analysis_grid.geojson"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create PTAL analysis grid inside Shizuoka City boundary."
    )
    parser.add_argument(
        "--boundary",
        type=Path,
        default=DEFAULT_BOUNDARY,
        help="Path to Shizuoka City boundary GeoJSON.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output path for analysis_grid.geojson.",
    )
    parser.add_argument(
        "--grid-size",
        type=float,
        default=500,
        help="Grid spacing in meters. Default is 500m.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.boundary.exists():
        print(f"Boundary file not found: {args.boundary}")
        return 1

    try:
        print("Loading Shizuoka City boundary...")
        boundary = gpd.read_file(args.boundary)

        if boundary.empty:
            print("Boundary file contains no features.")
            return 1

        # Ensure CRS is WGS84 first.
        if boundary.crs is None:
            boundary = boundary.set_crs("EPSG:4326")

        # Project to Web Mercator so grid size is in meters.
        # This is good enough for a prototype grid.
        boundary_m = boundary.to_crs("EPSG:3857")
        city_polygon = boundary_m.geometry.union_all()

        minx, miny, maxx, maxy = city_polygon.bounds

        print(f"Creating grid with {args.grid_size}m spacing...")
        features = []
        grid_id = 1

        y = miny
        while y <= maxy:
            x = minx
            while x <= maxx:
                point = Point(x, y)

                if city_polygon.contains(point):
                    point_wgs84 = gpd.GeoSeries([point], crs="EPSG:3857").to_crs("EPSG:4326").iloc[0]

                    features.append(
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    round(point_wgs84.x, 7),
                                    round(point_wgs84.y, 7),
                                ],
                            },
                            "properties": {
                                "grid_id": grid_id,
                                "grid_size_m": args.grid_size,
                            },
                        }
                    )
                    grid_id += 1

                x += args.grid_size
            y += args.grid_size

        output_geojson = {
            "type": "FeatureCollection",
            "features": features,
        }

        args.output.parent.mkdir(parents=True, exist_ok=True)

        with args.output.open("w", encoding="utf-8") as f:
            json.dump(output_geojson, f, ensure_ascii=False, indent=2)

        print(f"Saved analysis grid: {args.output}")
        print(f"Grid point count: {len(features)}")
        print("Analysis grid creation completed successfully.")
        return 0

    except Exception as exc:
        print(f"Analysis grid creation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
