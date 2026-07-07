import json
from pathlib import Path

from django.conf import settings
from django.http import JsonResponse


PROJECT_ROOT = Path(settings.BASE_DIR).parent

PTAL_DIR = PROJECT_ROOT / "data" / "processed" / "ptal"
GEOJSON_DIR = PROJECT_ROOT / "data" / "processed" / "geojson"

PTAL_FILES = {
    "monday_full_day": "ptal_monday_full_day.geojson",
    "tuesday_full_day": "ptal_tuesday_full_day.geojson",
    "wednesday_full_day": "ptal_wednesday_full_day.geojson",
    "thursday_full_day": "ptal_thursday_full_day.geojson",
    "friday_full_day": "ptal_friday_full_day.geojson",
    "saturday_full_day": "ptal_saturday_full_day.geojson",
    "sunday_full_day": "ptal_sunday_full_day.geojson",
}


def load_geojson(file_path):
    if not file_path.exists():
        return None

    with file_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def ptal_geojson(request):
    period = request.GET.get("period", "monday_full_day")

    if period not in PTAL_FILES:
        period = "monday_full_day"

    file_path = PTAL_DIR / PTAL_FILES[period]
    data = load_geojson(file_path)

    if data is None:
        return JsonResponse(
            {
                "error": "PTAL file not found",
                "period": period,
                "path": str(file_path),
            },
            status=404,
        )

    return JsonResponse(data, safe=False)


def stops_geojson(request):
    file_path = GEOJSON_DIR / "stops.geojson"
    data = load_geojson(file_path)

    if data is None:
        return JsonResponse(
            {
                "error": "Stops GeoJSON file not found",
                "path": str(file_path),
            },
            status=404,
        )

    return JsonResponse(data, safe=False)


def routes_geojson(request):
    file_path = GEOJSON_DIR / "routes.geojson"
    data = load_geojson(file_path)

    if data is None:
        return JsonResponse(
            {
                "error": "Routes GeoJSON file not found",
                "path": str(file_path),
            },
            status=404,
        )

    return JsonResponse(data, safe=False)

BASE_DIR = Path(__file__).resolve().parent.parent

def population_geojson(request):
    file_path = (
        BASE_DIR
        / ".."
        / "data"
        / "processed"
        / "population"
        / "population.geojson"
    ).resolve()

    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    return JsonResponse(data, safe=False)