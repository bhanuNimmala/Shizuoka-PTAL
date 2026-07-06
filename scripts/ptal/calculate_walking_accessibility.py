"""
Calculate walking accessibility from PTAL grid points to served stops.

Inputs:
    data/processed/ptal/analysis_grid.geojson
    data/processed/geojson/stops.geojson
    data/processed/ptal/stop_frequency.csv
    data/raw/osm/shizuoka_walk_network.graphml

Output:
    data/processed/ptal/grid_accessibility.csv

This version is more robust than the first attempt:
    - Converts the OSM graph to an undirected walking graph.
    - Snaps all served stops to graph nodes once.
    - For each grid point, runs network distance search with a cutoff.
    - Prints diagnostic counters.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import geopandas as gpd
import networkx as nx
import osmnx as ox
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_GRID = PROJECT_ROOT / "data" / "processed" / "ptal" / "analysis_grid.geojson"
DEFAULT_STOPS = PROJECT_ROOT / "data" / "processed" / "geojson" / "stops.geojson"
DEFAULT_FREQUENCY = PROJECT_ROOT / "data" / "processed" / "ptal" / "stop_frequency.csv"
DEFAULT_GRAPH = PROJECT_ROOT / "data" / "raw" / "osm" / "shizuoka_walk_network.graphml"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "processed" / "ptal" / "grid_accessibility.csv"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Calculate grid-to-stop walking accessibility.")
    parser.add_argument("--grid", type=Path, default=DEFAULT_GRID)
    parser.add_argument("--stops", type=Path, default=DEFAULT_STOPS)
    parser.add_argument("--frequency", type=Path, default=DEFAULT_FREQUENCY)
    parser.add_argument("--graph", type=Path, default=DEFAULT_GRAPH)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--max-walk-distance", type=float, default=960)
    parser.add_argument("--walking-speed-kmph", type=float, default=5.0)
    return parser.parse_args()


def load_points(path: Path, required_id: str) -> gpd.GeoDataFrame:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    gdf = gpd.read_file(path)

    if gdf.empty:
        raise ValueError(f"No features found in {path}")

    if gdf.crs is None:
        gdf = gdf.set_crs("EPSG:4326")

    gdf = gdf.to_crs("EPSG:4326")

    if required_id not in gdf.columns:
        raise ValueError(f"Missing required column '{required_id}' in {path}")

    return gdf


def load_frequency(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Frequency file not found: {path}")

    df = pd.read_csv(path)
    df["stop_id"] = df["stop_id"].astype(str)

    required = {"stop_id", "trips_per_hour", "headway_min", "avg_wait_min"}
    missing = required - set(df.columns)

    if missing:
        raise ValueError(f"Frequency file missing columns: {sorted(missing)}")

    return df


def prepare_served_stops(stops: gpd.GeoDataFrame, frequency: pd.DataFrame) -> gpd.GeoDataFrame:
    stops = stops.copy()
    stops["stop_id"] = stops["stop_id"].astype(str)

    served = stops.merge(frequency, on="stop_id", how="inner")

    if served.empty:
        raise ValueError("No served stops matched between stops.geojson and stop_frequency.csv.")

    return served


def main() -> int:
    args = parse_args()

    try:
        print("Loading analysis grid...")
        grid = load_points(args.grid, "grid_id")

        print("Loading stops...")
        stops = load_points(args.stops, "stop_id")

        print("Loading stop frequency...")
        frequency = load_frequency(args.frequency)

        print("Keeping only stops with service frequency...")
        served_stops = prepare_served_stops(stops, frequency)

        print("Loading OSM walking network...")
        graph = ox.load_graphml(args.graph)

        print("Converting graph to undirected for walking accessibility...")
        graph = graph.to_undirected()

        print(f"Grid points: {len(grid)}")
        print(f"Served stops: {len(served_stops)}")
        print(f"Graph nodes: {len(graph.nodes)}")
        print(f"Graph edges: {len(graph.edges)}")

        print("Snapping served stops to nearest graph nodes...")
        served_stops = served_stops.copy()
        served_stops["stop_node"] = ox.distance.nearest_nodes(
            graph,
            X=served_stops.geometry.x,
            Y=served_stops.geometry.y,
        )

        unique_stop_nodes = set(served_stops["stop_node"].tolist())
        print(f"Unique stop nodes: {len(unique_stop_nodes)}")

        walking_speed_m_per_min = args.walking_speed_kmph * 1000 / 60

        records = []
        no_reachable_stop_count = 0
        grid_snap_fail_count = 0

        print("Calculating walking accessibility...")
        print("This may take some time.")

        for i, grid_row in grid.iterrows():
            grid_id = grid_row["grid_id"]
            point = grid_row.geometry

            try:
                grid_node = ox.distance.nearest_nodes(graph, X=point.x, Y=point.y)
            except Exception:
                grid_snap_fail_count += 1
                continue

            # Find all graph nodes reachable from this grid node within the walking threshold.
            try:
                reachable_lengths = nx.single_source_dijkstra_path_length(
                    graph,
                    grid_node,
                    cutoff=args.max_walk_distance,
                    weight="length",
                )
            except Exception:
                no_reachable_stop_count += 1
                continue

            reachable_stop_nodes = unique_stop_nodes.intersection(reachable_lengths.keys())

            if not reachable_stop_nodes:
                no_reachable_stop_count += 1
                continue

            matched_stops = served_stops[served_stops["stop_node"].isin(reachable_stop_nodes)]

            for _, stop_row in matched_stops.iterrows():
                distance_m = float(reachable_lengths[stop_row["stop_node"]])
                walk_time_min = distance_m / walking_speed_m_per_min

                records.append(
                    {
                        "grid_id": grid_id,
                        "stop_id": stop_row["stop_id"],
                        "stop_name": stop_row.get("stop_name", ""),
                        "walking_distance_m": round(distance_m, 2),
                        "walking_time_min": round(walk_time_min, 2),
                        "trips_per_hour": stop_row["trips_per_hour"],
                        "headway_min": stop_row["headway_min"],
                        "avg_wait_min": stop_row["avg_wait_min"],
                    }
                )

            if (i + 1) % 500 == 0:
                print(f"Processed {i + 1}/{len(grid)} grid points...")

        output_df = pd.DataFrame(records)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        output_df.to_csv(args.output, index=False, encoding="utf-8")

        print(f"Saved walking accessibility: {args.output}")
        print(f"Accessibility records: {len(output_df)}")
        print(f"Grid snap failures: {grid_snap_fail_count}")
        print(f"Grid points with no reachable served stop: {no_reachable_stop_count}")

        if not output_df.empty:
            print(f"Grid points with access: {output_df['grid_id'].nunique()}")
            print(f"Stops reached: {output_df['stop_id'].nunique()}")
            print(f"Average walking distance: {output_df['walking_distance_m'].mean():.2f} m")
            print(f"Maximum walking distance: {output_df['walking_distance_m'].max():.2f} m")

        print("Walking accessibility calculation completed successfully.")
        return 0

    except Exception as exc:
        print(f"Walking accessibility calculation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
