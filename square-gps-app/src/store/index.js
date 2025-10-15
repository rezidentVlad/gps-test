import { createStore } from 'vuex'
import Backend from '../services/Backend'
import { BACKEND_CONFIG } from '../constants'
import * as types from './constants'

const backend = new Backend(BACKEND_CONFIG.STORAGE_KEY, BACKEND_CONFIG.DEFAULT_DELAY)

export default createStore({
  state: {
    markers: [],
    selectedMarkerId: null,
    isAddingMarker: false,
    loading: false,
    error: null
  },

  getters: {
    allMarkers: (state) => state.markers,
    selectedMarker: (state) => {
      return state.markers.find(m => m.id === state.selectedMarkerId) || null
    },
    isAddingMarker: (state) => state.isAddingMarker,
    loading: (state) => state.loading,
    error: (state) => state.error
  },

  mutations: {
    [types.SET_MARKERS](state, markers) {
      state.markers = markers
    },

    [types.ADD_MARKER](state, marker) {
      state.markers.push(marker)
    },

    [types.REMOVE_MARKER](state, markerId) {
      state.markers = state.markers.filter(m => m.id !== markerId)
    },

    [types.SET_SELECTED_MARKER](state, markerId) {
      state.selectedMarkerId = markerId
    },

    [types.SET_ADDING_MODE](state, isAdding) {
      state.isAddingMarker = isAdding
    },

    [types.SET_LOADING](state, loading) {
      state.loading = loading
    },

    [types.SET_ERROR](state, error) {
      state.error = error
    }
  },

  actions: {
    async [types.LOAD_MARKERS]({ commit }) {
      commit(types.SET_LOADING, true)
      commit(types.SET_ERROR, null)
      try {
        const data = await backend.getItem(types.STORAGE_KEY_MARKERS)
        commit(types.SET_MARKERS, data || [])
      } catch (error) {
        commit(types.SET_ERROR, error.message)
        console.error('Failed to load markers:', error)
      } finally {
        commit(types.SET_LOADING, false)
      }
    },

    async [types.SAVE_MARKERS]({ state, commit }) {
      commit(types.SET_LOADING, true)
      commit(types.SET_ERROR, null)
      try {
        await backend.updateItem(types.STORAGE_KEY_MARKERS, state.markers)
      } catch (error) {
        commit(types.SET_ERROR, error.message)
        console.error('Failed to save markers:', error)
      } finally {
        commit(types.SET_LOADING, false)
      }
    },

    async [types.ADD_MARKER_ACTION]({ commit, dispatch }, marker) {
      const newMarker = {
        id: Date.now().toString(),
        ...marker,
        createdAt: new Date().toISOString()
      }

      commit(types.ADD_MARKER, newMarker)
      await dispatch(types.SAVE_MARKERS)
      commit(types.SET_ADDING_MODE, false)

      return newMarker
    },

    async [types.REMOVE_MARKER_ACTION]({ commit, dispatch, state }, markerId) {
      commit(types.REMOVE_MARKER, markerId)
      await dispatch(types.SAVE_MARKERS)

      if (state.selectedMarkerId === markerId) {
        commit(types.SET_SELECTED_MARKER, null)
      }
    },

    [types.SELECT_MARKER]({ commit }, markerId) {
      commit(types.SET_SELECTED_MARKER, markerId)
    },

    [types.TOGGLE_ADDING_MODE]({ commit, state }) {
      commit(types.SET_ADDING_MODE, !state.isAddingMarker)
    },

    [types.SET_ADDING_MODE_ACTION]({ commit }, isAdding) {
      commit(types.SET_ADDING_MODE, isAdding)
    }
  }
})
