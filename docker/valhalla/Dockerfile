FROM ghcr.io/valhalla/valhalla:latest

WORKDIR /app
# RUN wget http://download.geofabrik.de/asia/japan-latest.osm.pbf
RUN wget http://download.geofabrik.de/asia/japan/kanto-latest.osm.pbf
RUN mkdir -p valhalla_tiles
RUN valhalla_build_config --mjolnir-tile-dir ${PWD}/valhalla_tiles --mjolnir-tile-extract ${PWD}/valhalla_tiles.tar --mjolnir-timezone ${PWD}/valhalla_tiles/timezones.sqlite --mjolnir-admin ${PWD}/valhalla_tiles/admins.sqlite > valhalla.json
RUN valhalla_build_tiles -c valhalla.json kanto-latest.osm.pbf
RUN valhalla_build_extract -c valhalla.json -v

EXPOSE 8002

CMD ["valhalla_service", "valhalla.json", "1"]
