import { computed, ref, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import geocodingService from '../../services/GeocodingService'
import { formatCoordinates } from '../../utils/formatCoordinates'
import {
  TOGGLE_ADDING_MODE,
  SELECT_MARKER,
  REMOVE_MARKER_ACTION,
  ADD_MARKER_ACTION,
  SET_LOADING
} from '../../store/constants'

export default {
  name: 'MarkersList',
  emits: ['select-marker'],
  setup(props, { emit }) {
    const store = useStore()
    const { t } = useI18n()

    const markers = computed(() => store.getters.allMarkers)
    const selectedMarkerId = computed(() => store.state.selectedMarkerId)
    const isAddingMarker = computed(() => store.getters.isAddingMarker)

    // Search state
    const searchQuery = ref('')
    const searchResults = ref([])
    const searching = ref(false)
    const searchError = ref('')

    // Helper function to reset search state
    const resetSearch = () => {
      searchQuery.value = ''
      searchResults.value = []
      searchError.value = ''
    }

    // Helper function to handle errors with translation
    const handleError = (error) => {
      searchError.value = error.isTranslationKey ? t(error.message) : error.message
    }

    // Watch for adding mode changes to reset search
    watch(isAddingMarker, (newValue) => {
      if (!newValue) {
        resetSearch()
      }
    })

    // Watch for selected marker changes to scroll into view
    watch(selectedMarkerId, (newId) => {
      if (newId) {
        nextTick(() => {
          const element = document.querySelector('.selected-marker')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        })
      }
    })

    const toggleAddingMode = () => {
      store.dispatch(TOGGLE_ADDING_MODE)
    }

    const performSearch = async () => {
      if (!searchQuery.value?.trim()) {
        return
      }

      searching.value = true
      searchError.value = ''
      searchResults.value = []

      try {
        const results = await geocodingService.searchLocation(searchQuery.value)
        searchResults.value = results
      } catch (error) {
        handleError(error)
      } finally {
        searching.value = false
      }
    }

    const selectSearchResult = async (result) => {
      try {
        store.commit(SET_LOADING, true)

        // Add marker to store
        const newMarker = await store.dispatch(ADD_MARKER_ACTION, {
          lat: result.lat,
          lng: result.lng,
          address: result.address
        })

        // Select the new marker
        store.dispatch(SELECT_MARKER, newMarker.id)

        // Emit event to center map on new marker
        emit('select-marker', newMarker)

        // Reset search state
        resetSearch()
      } catch (error) {
        handleError(error)
      } finally {
        store.commit(SET_LOADING, false)
      }
    }

    const selectMarker = (marker) => {
      store.dispatch(SELECT_MARKER, marker.id)
      emit('select-marker', marker)
    }

    const removeMarker = (markerId) => {
      store.dispatch(REMOVE_MARKER_ACTION, markerId)
    }

    return {
      markers,
      selectedMarkerId,
      isAddingMarker,
      searchQuery,
      searchResults,
      searching,
      searchError,
      toggleAddingMode,
      performSearch,
      selectSearchResult,
      selectMarker,
      removeMarker,
      formatCoordinates
    }
  }
}
