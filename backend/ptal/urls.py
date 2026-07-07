from django.urls import path

from . import views

urlpatterns = [
    path("ptal/", views.ptal_geojson),
    path("stops/", views.stops_geojson),
    path("routes/", views.routes_geojson),
    path("population/", views.population_geojson),
]