/**
 * storage.js
 * Handles all localStorage operations for the App Shelf extension
 */

const StorageKeys = {
  BOOKMARKS: 'bookmarksData',
  SETTINGS: 'appSettings',
  DARK_MODE: 'darkMode'
};

/**
 * Storage module for managing localStorage operations
 */
const Storage = {
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to save (will be JSON stringified)
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Clear all App Shelf data from localStorage
   */
  clearAll() {
    try {
      Object.values(StorageKeys).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export { Storage, StorageKeys };
