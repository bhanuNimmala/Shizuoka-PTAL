"""
Download OpenStreetMap walking network for Shizuoka City.

Input:
    data/processed/boundary/shizuoka_city_boundary.geojson

Output:
    data/raw/osm/shizuoka_walk_network.graphml

Notes:
    - Requires internet access when running.
    - Requires osmnx.
    - Run only once unless you want to refresh OSM data.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import geopandas as gpd
import osmnx as ox


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_BOUNDARY = (
    PROJECT_ROOT / "data" / "processed" / "boundary" / "shizuoka_city_boundary.geojson"
)
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "raw" / "osm" / "shizuoka_walk_network.graphml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download Shizuoka City walking network from OpenStreetMap."
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
        help="Output GraphML path.",
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

        if boundary.crs is None:
            boundary = boundary.set_crs("EPSG:4326")

        boundary = boundary.to_crs("EPSG:4326")
        polygon = boundary.geometry.union_all()

        print("Downloading walking network from OpenStreetMap...")
        print("This may take several minutes for the whole city.")

        graph = ox.graph_from_polygon(
            polygon,
            network_type="walk",
            simplify=True,
            retain_all=False,
            truncate_by_edge=True,
        )

        args.output.parent.mkdir(parents=True, exist_ok=True)

        print(f"Saving walking network to: {args.output}")
        ox.save_graphml(graph, filepath=args.output)

        print("OSM walking network download completed successfully.")
        print(f"Nodes: {len(graph.nodes)}")
        print(f"Edges: {len(graph.edges)}")
        return 0

    except Exception as exc:
        print(f"OSM walking network download failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
