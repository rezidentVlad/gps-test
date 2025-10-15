// API endpoints
export const GEOCODING_API = {
  BASE_URL: 'https://geocode.maps.co',
  REVERSE_ENDPOINT: '/reverse',
  SEARCH_ENDPOINT: '/search'
}

// Map settings
export const MAP_CONFIG = {
  DEFAULT_CENTER: [55.7558, 37.6173], // Moscow
  DEFAULT_ZOOM: 10,
  DETAIL_ZOOM: 15,
  MAX_ZOOM: 19,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_LAYER_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}

// Marker settings
export const MARKER_CONFIG = {
  SELECTED_OPACITY: 1,
  UNSELECTED_OPACITY: 0.6,
  SELECTED_Z_INDEX: 1000,
  UNSELECTED_Z_INDEX: 0
}

// Backend settings
export const BACKEND_CONFIG = {
  STORAGE_KEY: 'markers_data',
  DEFAULT_DELAY: 200 // milliseconds
}

// Route names
export const ROUTES = {
  ABOUT: 'About',
  MAP: 'Map'
}
