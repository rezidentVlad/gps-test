/**
 * Backend service class that emulates async backend operations with localStorage
 */
class Backend {
  constructor(storageKey = 'app_data', delay = 300) {
    this.storageKey = storageKey
    this.delay = delay // Simulate network delay in ms
  }

  /**
   * Simulates async delay
   * @private
   */
  _simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay))
  }

  /**
   * Get all data from localStorage (private helper)
   * @private
   * @returns {Promise<any>}
   */
  async _getAll() {
    await this._simulateDelay()
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      throw new Error('Failed to read data')
    }
  }

  /**
   * Save data to localStorage (private helper)
   * @private
   * @param {any} data - Data to save
   * @returns {Promise<boolean>}
   */
  async _save(data) {
    await this._simulateDelay()
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      throw new Error('Failed to save data')
    }
  }

  /**
   * Get specific item by key from stored data
   * @param {string} key - Key to retrieve
   * @returns {Promise<any>}
   */
  async getItem(key) {
    await this._simulateDelay()
    try {
      const allData = await this._getAll()
      return allData && key in allData ? allData[key] : null
    } catch (error) {
      console.error('Error getting item:', error)
      throw new Error('Failed to get item')
    }
  }

  /**
   * Update specific item in stored data
   * @param {string} key - Key to update
   * @param {any} value - Value to set
   * @returns {Promise<boolean>}
   */
  async updateItem(key, value) {
    await this._simulateDelay()
    try {
      const allData = (await this._getAll()) || {}
      allData[key] = value
      return await this._save(allData)
    } catch (error) {
      console.error('Error updating item:', error)
      throw new Error('Failed to update item')
    }
  }
}

export default Backend
