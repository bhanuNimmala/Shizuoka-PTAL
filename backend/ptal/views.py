from django.http import JsonResponse

from .services.geojson_service import (
    load_ptal,
    load_routes,
    load_stops,
)


def ptal_geojson(request):
    return JsonResponse(load_ptal(), safe=False)


def stops_geojson(request):
    return JsonResponse(load_stops(), safe=False)


def routes_geojson(request):
    return JsonResponse(load_routes(), safe=False)