import React from "react";
import Map, { Source, Layer } from "react-map-gl";
import {
  pointLayer,
  heatMapLayer,
  WEIGHTS,
  calculateCollisionWeight,
} from "../utils";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import Loading from "./Loading";
import moment from "moment/moment";
import mapboxgl from "mapbox-gl";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass =
  // eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

export default function WebMap() {
  const [viewport, setViewport] = React.useState({
    latitude: 40.73061,
    longitude: -73.935242,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  });
  const [collisionData, setCollisionData] = React.useState(null);
  const [date, setDate] = React.useState(new Date());
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    pedestrians: true,
    cyclists: true,
    motorists: true,
  });

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: checked }));
  };

  React.useEffect(() => {
    setLoading(true);
    // Replace this URL with the actual API endpoint for fetching collision data
    const dataUrl = "https://data.cityofnewyork.us/resource/h9gi-nx95.json";
    const limit = 1000000;
    const year = moment(date).format("YYYY");
    const URL = `${dataUrl}?$limit=${limit}&$where=crash_date between '${year}-01-01T00:00:00.000' and '${year}-12-31T23:59:59.999'`;
    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const processedData = {
            type: "FeatureCollection",
            features: data
              .filter((collision) => {
                if (
                  (filters.pedestrians &&
                    (collision["number_of_pedestrians_injured "] > 0 ||
                      collision["number_of_pedestrians_killed"] > 0)) ||
                  (filters.cyclists &&
                    (collision["number_of_cyclist_injured"] > 0 ||
                      collision["number_of_cyclist_killed"] > 0)) ||
                  (filters.motorists &&
                    (collision["number_of_motorist_injured"] > 0 ||
                      collision["number_of_motorist_killed"] > 0))
                ) {
                  return true;
                }

                return false;
              })
              
              .map((row) => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [row.longitude, row.latitude],
                },
                properties: {
                  // ...row,
                  collisionWeight: calculateCollisionWeight(row, WEIGHTS),
                },
              })),
          };
          // console.log(processedData);
          setCollisionData(processedData);
        } else {
          setCollisionData([]);
        }
        setLoading(false);
      });
  }, [filters, date]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="GlobalRelativeContainer">
          <div className="ToolBoxContainer">
            <h3>Tool Box:</h3>
            <div className="ControlPanel">
              <div>
                <b>Year: </b>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value)}
                  view="year"
                  dateFormat="yy"
                  name="year"
                />
              </div>
              {Object.keys(filters).map((key) => (
                <div key={key}>
                  <Checkbox
                    inputId={key}
                    name={key}
                    value={key}
                    onChange={handleFilterChange}
                    checked={filters[key]}
                  />
                  <label htmlFor={key} style={{ marginLeft: "0.5rem" }}>
                    {key[0].toUpperCase() + key.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Map
            initialViewState={{ ...viewport }}
            style={{ width: "100%", height: "100%" }}
            // mapStyle="mapbox://styles/surewin/clgworvji00c301pffsnhdy4w"
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.REACT_APP_KEY}
            onViewportChange={(newViewport) => setViewport(newViewport)}
          >
            {collisionData.features.length > 0 && (
              <Source type="geojson" data={collisionData} id="collision">
                <Layer {...heatMapLayer} />
                <Layer {...pointLayer} />
              </Source>
            )}
          </Map>
        </div>
      )}
    </div>
  );
}
