import axios from 'axios'
import { GEOCODING_API } from '../constants'

/**
 * Service for geocoding using geocode.maps.co API
 */
class GeocodingService {
  constructor() {
    this.reverseUrl = `${GEOCODING_API.BASE_URL}${GEOCODING_API.REVERSE_ENDPOINT}`
    this.searchUrl = `${GEOCODING_API.BASE_URL}${GEOCODING_API.SEARCH_ENDPOINT}`
  }

  /**
   * Create a translatable error
   * @param {string} key - Translation key
   * @returns {Error} Error with translation key flag
   */
  createTranslatedError(key) {
    const error = new Error(key)
    error.isTranslationKey = true
    return error
  }

  /**
   * Get address from coordinates (reverse geocoding)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} Address string
   */
  async getAddress(lat, lng) {
    try {
      const response = await axios.get(this.reverseUrl, {
        params: { lat, lon: lng, format: 'json' }
      })

      if (response.data?.display_name) {
        return response.data.display_name
      }
      throw this.createTranslatedError('errors.addressNotFound')
    } catch (error) {
      console.error('Geocoding error:', error)
      if (error.isTranslationKey) throw error
      throw this.createTranslatedError('errors.failedToGetAddress')
    }
  }

  /**
   * Search for location by address (forward geocoding)
   * @param {string} query - Search query (address)
   * @returns {Promise<Array>} Array of location results with lat, lng, and display_name
   */
  async searchLocation(query) {
    try {
      const response = await axios.get(this.searchUrl, {
        params: { q: query, format: 'json', limit: 5 }
      })

      if (response.data?.length > 0) {
        return response.data.map(item => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name
        }))
      }
      throw this.createTranslatedError('errors.locationNotFound')
    } catch (error) {
      console.error('Search error:', error)
      if (error.isTranslationKey) throw error
      throw this.createTranslatedError('errors.failedToFindLocation')
    }
  }
}

export default new GeocodingService()
