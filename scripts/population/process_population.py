from pathlib import Path

import geopandas as gpd
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MESH_BOUNDARY_DIR = PROJECT_ROOT / "data" / "raw" / "population" / "mesh_boundary"
POPULATION_FILE = PROJECT_ROOT / "data" / "raw" / "population" / "statistics" / "population_mesh_2020.txt"
CITY_BOUNDARY = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "boundary"
    / "shizuoka_city_boundary.geojson"
)

OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "population"
OUTPUT_FILE = OUTPUT_DIR / "population.geojson"


def read_population() -> pd.DataFrame:
    print("Loading population statistics...")

    df = pd.read_csv(
        POPULATION_FILE,
        dtype=str,
        encoding="cp932",
        skiprows=[1],
    )

    df = df[["KEY_CODE", "T001101001"]].copy()
    df = df.rename(columns={"T001101001": "population"})

    df["KEY_CODE"] = df["KEY_CODE"].astype(str)
    df["population"] = pd.to_numeric(df["population"], errors="coerce").fillna(0).astype(int)

    return df


def read_mesh_boundaries() -> gpd.GeoDataFrame:
    print("Loading mesh boundary shapefiles...")

    shp_files = list(MESH_BOUNDARY_DIR.rglob("MESH*.shp"))

    if not shp_files:
        raise FileNotFoundError(f"No mesh shapefiles found in {MESH_BOUNDARY_DIR}")

    gdfs = []

    for shp in shp_files:
        print(f"Reading {shp}")
        gdf = gpd.read_file(shp)

        if gdf.crs is None:
            gdf = gdf.set_crs("EPSG:4326")

        gdf = gdf.to_crs("EPSG:4326")
        gdf["KEY_CODE"] = gdf["KEY_CODE"].astype(str)

        gdfs.append(gdf)

    merged = pd.concat(gdfs, ignore_index=True)
    return gpd.GeoDataFrame(merged, geometry="geometry", crs="EPSG:4326")


def main() -> int:
    try:
        population = read_population()
        mesh = read_mesh_boundaries()

        print("Joining population to mesh boundaries...")
        joined = mesh.merge(population, on="KEY_CODE", how="left")
        joined["population"] = joined["population"].fillna(0).astype(int)

        print("Loading Shizuoka City boundary...")
        boundary = gpd.read_file(CITY_BOUNDARY)

        if boundary.crs is None:
            boundary = boundary.set_crs("EPSG:4326")

        boundary = boundary.to_crs("EPSG:4326")

        print("Clipping population mesh to Shizuoka City...")
        clipped = gpd.overlay(joined, boundary, how="intersection")

        clipped["area_km2"] = clipped.to_crs("EPSG:6676").geometry.area / 1_000_000
        clipped["population_density"] = clipped.apply(
            lambda row: round(row["population"] / row["area_km2"], 2)
            if row["area_km2"] > 0
            else 0,
            axis=1,
        )

        keep_columns = [
            "KEY_CODE",
            "population",
            "area_km2",
            "population_density",
            "geometry",
        ]

        clipped = clipped[keep_columns]

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        print(f"Saving population GeoJSON: {OUTPUT_FILE}")
        clipped.to_file(OUTPUT_FILE, driver="GeoJSON", encoding="utf-8")

        print("Population processing completed successfully.")
        print(f"Population mesh cells: {len(clipped)}")
        print(f"Total population: {clipped['population'].sum()}")

        return 0

    except Exception as exc:
        print(f"Population processing failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())