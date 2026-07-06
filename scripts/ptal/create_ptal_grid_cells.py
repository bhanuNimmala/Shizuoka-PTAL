"""
Create polygon grid cells from PTAL point results.

Input:
    data/processed/ptal/ptal_grid.geojson

Output:
    data/processed/ptal/ptal_grid_cells.geojson

Purpose:
    The PTAL calculation uses grid points internally, but the final map should
    display square grid cells colored by PTAL band. This script converts each
    PTAL point into a square polygon using the grid_size_m property.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import geopandas as gpd
from shapely.geometry import box


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_INPUT = PROJECT_ROOT / "data" / "processed" / "ptal" / "ptal_grid.geojson"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "processed" / "ptal" / "ptal_grid_cells.geojson"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert PTAL point grid into square polygon grid cells."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Input PTAL point GeoJSON.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output PTAL polygon GeoJSON.",
    )
    parser.add_argument(
        "--grid-size",
        type=float,
        default=None,
        help="Grid cell size in meters. If omitted, uses grid_size_m column.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        if not args.input.exists():
            print(f"Input file not found: {args.input}")
            return 1

        print("Loading PTAL point grid...")
        points = gpd.read_file(args.input)

        if points.empty:
            print("Input file contains no features.")
            return 1

        if points.crs is None:
            points = points.set_crs("EPSG:4326")

        if "grid_size_m" not in points.columns and args.grid_size is None:
            print("Missing grid_size_m column. Use --grid-size to provide cell size.")
            return 1

        print("Projecting points to metric CRS...")
        points_m = points.to_crs("EPSG:3857")

        polygons = []

        print("Creating square grid cells...")
        for _, row in points_m.iterrows():
            cell_size = args.grid_size if args.grid_size is not None else float(row["grid_size_m"])
            half = cell_size / 2

            x = row.geometry.x
            y = row.geometry.y

            polygons.append(box(x - half, y - half, x + half, y + half))

        cells_m = points_m.copy()
        cells_m["geometry"] = polygons

        print("Projecting grid cells back to WGS84...")
        cells = cells_m.to_crs("EPSG:4326")

        args.output.parent.mkdir(parents=True, exist_ok=True)
        cells.to_file(args.output, driver="GeoJSON")

        print(f"Saved PTAL grid cells: {args.output}")
        print(f"Grid cell count: {len(cells)}")

        if "ptal_band" in cells.columns:
            print("PTAL band summary:")
            print(cells["ptal_band"].value_counts().sort_index().to_string())

        print("PTAL grid cell creation completed successfully.")
        return 0

    except Exception as exc:
        print(f"PTAL grid cell creation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
