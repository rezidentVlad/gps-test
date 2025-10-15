import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import MarkersList from '../../components/MarkersList/index.vue'
import geocodingService from '../../services/GeocodingService'
import { MAP_CONFIG, MARKER_CONFIG } from '../../constants'
import {
  SET_LOADING,
  ADD_MARKER_ACTION,
  SELECT_MARKER,
  SET_ADDING_MODE_ACTION
} from '../../store/constants'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export default {
  name: 'MapView',
  components: {
    MarkersList
  },
  props: {
    id: String
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n()

    const mapContainer = ref(null)
    const map = ref(null)
    const markersLayer = ref(null)
    const leafletMarkers = ref({})

    const loading = computed(() => store.getters.loading)
    const isAddingMarker = computed(() => store.getters.isAddingMarker)
    const markers = computed(() => store.getters.allMarkers)
    const selectedMarkerId = computed(() => store.state.selectedMarkerId)

    const errorSnackbar = ref(false)
    const errorMessage = ref('')

    // Helper function to handle errors with translation
    const handleError = (error) => {
      errorMessage.value = error.isTranslationKey ? t(error.message) : error.message
      errorSnackbar.value = true
    }

    // Helper function to sync map markers with store
    const syncMapMarkers = (newMarkers) => {
      if (!markersLayer.value) return

      // Add new markers
      newMarkers.forEach(marker => {
        if (!leafletMarkers.value[marker.id]) {
          addLeafletMarker(marker)
        }
      })

      // Remove deleted markers
      const currentIds = new Set(newMarkers.map(m => m.id))
      Object.keys(leafletMarkers.value).forEach(id => {
        if (!currentIds.has(id)) {
          markersLayer.value.removeLayer(leafletMarkers.value[id])
          delete leafletMarkers.value[id]
        }
      })
    }

    // Helper function to handle route-based marker selection
    const selectMarkerFromRoute = (newMarkers) => {
      if (!props.id || !newMarkers.length || selectedMarkerId.value) return

      const marker = newMarkers.find(m => m.id === props.id)
      if (marker) {
        store.dispatch(SELECT_MARKER, props.id)
        nextTick(() => {
          centerOnMarker(marker, MAP_CONFIG.DETAIL_ZOOM)
        })
      }
    }

    onMounted(() => {
      initMap()
    })

    onUnmounted(() => {
      // Clean up Leaflet map
      if (map.value) {
        map.value.remove()
        map.value = null
      }
      leafletMarkers.value = {}
      markersLayer.value = null
    })

    // Watch for markers to load and add them to map
    watch(markers, (newMarkers) => {
      syncMapMarkers(newMarkers)
      selectMarkerFromRoute(newMarkers)
    }, { deep: true, immediate: true })

    const initMap = () => {
      // Prevent reinitializing if map already exists
      if (map.value) return

      map.value = L.map('map').setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM)

      L.tileLayer(MAP_CONFIG.TILE_LAYER_URL, {
        attribution: MAP_CONFIG.TILE_LAYER_ATTRIBUTION,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
      }).addTo(map.value)

      markersLayer.value = L.layerGroup().addTo(map.value)

      // Add click handler for adding markers
      map.value.on('click', onMapClick)
    }

    const onMapClick = async (e) => {
      if (!isAddingMarker.value) return

      const { lat, lng } = e.latlng

      try {
        store.commit(SET_LOADING, true)

        const address = await geocodingService.getAddress(lat, lng)
        const newMarker = await store.dispatch(ADD_MARKER_ACTION, { lat, lng, address })

        // Select the new marker and navigate
        selectAndNavigateToMarker(newMarker.id)
      } catch (error) {
        handleError(error)
      } finally {
        store.commit(SET_LOADING, false)
      }
    }

    const selectAndNavigateToMarker = (markerId) => {
      store.dispatch(SELECT_MARKER, markerId)
      router.push(`/map/${markerId}`)
    }

    const addLeafletMarker = (marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng])
        .addTo(markersLayer.value)
        .on('click', () => selectAndNavigateToMarker(marker.id))

      leafletMarkers.value[marker.id] = leafletMarker
    }

    const centerOnMarker = (marker, zoom = MAP_CONFIG.DETAIL_ZOOM) => {
      if (map.value) {
        map.value.setView([marker.lat, marker.lng], zoom)
        router.push(`/map/${marker.id}`)
      }
    }

    const setAddingMode = (value) => {
      store.dispatch(SET_ADDING_MODE_ACTION, value)
    }

    // Helper function to update marker highlighting
    const updateMarkerHighlight = (newId) => {
      Object.entries(leafletMarkers.value).forEach(([id, leafletMarker]) => {
        const isSelected = id === newId
        leafletMarker.setOpacity(
          isSelected ? MARKER_CONFIG.SELECTED_OPACITY : MARKER_CONFIG.UNSELECTED_OPACITY
        )
        leafletMarker.setZIndexOffset(
          isSelected ? MARKER_CONFIG.SELECTED_Z_INDEX : MARKER_CONFIG.UNSELECTED_Z_INDEX
        )
      })
    }

    // Watch for marker selection changes
    watch(selectedMarkerId, updateMarkerHighlight)

    return {
      mapContainer,
      loading,
      isAddingMarker,
      errorSnackbar,
      errorMessage,
      centerOnMarker,
      setAddingMode
    }
  }
}
