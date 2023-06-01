export const pointLayer = {
  id: "point",
  type: "circle",
  source: "collisions",
  minzoom: 14,
  paint: {
    "circle-radius": 5,
    "circle-color": "#FF5722",
    "circle-opacity": 0.8,
  },
};

export const heatMapLayer = {
  id: "collision-heatmap",
  type: "heatmap",
  source: "earthquakes",
  maxzoom: 15,
  paint: {
    // Increase the heatmap weight based on frequency and property magnitude
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "collisionWeight"],
      0,
      0,
      6,
      1,
    ],
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 18, 3],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      1,
      "rgb(178,24,43)",
    ],
    // Adjust the heatmap radius by zoom level
    /**
     * 0, 2, 14, 6 - the zoom levels at which the property values 2 and 6 are used
     *  This specifies the zoom levels at which the values 2 and 6 are used.
     *  For example, when the zoom is 0 the value 2 is used. When the zoom is 14 the value 6 is used.
     *  At any other zoom, a value between 2 and 6 is used.
     */
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 14, 6],
    // Transition from heatmap to circle layer by zoom level
    /**
     * 1. it is telling mapbox to add the attribute of opacity to the heatmap layer
     * 2. it is telling mapbox to interpolate the opacity based on the zoom level
     * 3. it is telling mapbox to change the opacity from 1 to 0.5 as you zoom in from zoom level 7 to 14
     */
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 14, 0.5],
  },
};

export const WEIGHTS = {
  number_of_persons_injured: 1,
  number_of_persons_killed: 2,
  // Add weights for other columns if needed
};

export const calculateCollisionWeight = (properties, weights) => {
  let collisionWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    collisionWeight += properties[key] * weight;
  }

  return collisionWeight;
};
