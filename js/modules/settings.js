/**
 * settings.js
 * Manages application settings
 */

import { Storage, StorageKeys } from './storage.js';

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  bookmarkTarget: 'new', // 'new' or 'current'
  searchEngine: 'google', // default search engine
  expandedFolders: [] // IDs of expanded folders - empty by default for backward compatibility
};

/**
 * Settings manager for the application
 */
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.initializeExpandedFolders();
  }

  /**
   * Load settings from storage
   * @returns {Object} Application settings
   */
  loadSettings() {
    return Storage.load(StorageKeys.SETTINGS, DEFAULT_SETTINGS);
  }

  /**
   * Initialize expanded folders list
   * This ensures all folders are expanded by default on first run
   */
  initializeExpandedFolders() {
    // If the expandedFolders array doesn't exist or we're running for the first time
    if (!this.settings.expandedFolders || this.isFirstRun()) {
      // We'll set it to null which our folderView will interpret as "expand all"
      this.settings.expandedFolders = null;
      this.saveSettings();
    }
  }

  /**
   * Check if this is the first run of the app
   * @returns {boolean} True if first run
   */
  isFirstRun() {
    const firstRunKey = 'appShelf_firstRun';
    if (!localStorage.getItem(firstRunKey)) {
      localStorage.setItem(firstRunKey, 'false');
      return true;
    }
    return false;
  }

  /**
   * Save settings to storage
   * @returns {boolean} Success status
   */
  saveSettings() {
    return Storage.save(StorageKeys.SETTINGS, this.settings);
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {boolean} Success status
   */
  updateSetting(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value;
      return this.saveSettings();
    }
    return false;
  }

  /**
   * Get a specific setting value
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if setting doesn't exist
   * @returns {any} Setting value
   */
  getSetting(key, defaultValue = null) {
    return this.settings.hasOwnProperty(key) 
      ? this.settings[key] 
      : defaultValue;
  }

  /**
   * Check if dark mode is enabled
   * @returns {boolean} Dark mode status
   */
  isDarkModeEnabled() {
    return Storage.load(StorageKeys.DARK_MODE, false) === true;
  }

  /**
   * Toggle dark mode
   * @returns {boolean} New dark mode status
   */
  toggleDarkMode() {
    const current = this.isDarkModeEnabled();
    const newValue = !current;
    Storage.save(StorageKeys.DARK_MODE, newValue);
    return newValue;
  }

  /**
   * Set dark mode status
   * @param {boolean} enabled - Dark mode status
   * @returns {boolean} Success status
   */
  setDarkMode(enabled) {
    return Storage.save(StorageKeys.DARK_MODE, enabled);
  }

  /**
   * Add a folder to the expanded folders list
   * @param {string} folderId - Folder ID
   */
  expandFolder(folderId) {
    // Initialize the array if it's null (indicating all folders are expanded)
    if (this.settings.expandedFolders === null) {
      this.settings.expandedFolders = [];
    }

    if (!this.settings.expandedFolders.includes(folderId)) {
      this.settings.expandedFolders.push(folderId);
      this.saveSettings();
    }
  }

  /**
   * Remove a folder from the expanded folders list
   * @param {string} folderId - Folder ID
   */
  collapseFolder(folderId) {
    // Initialize the array if it's null (indicating all folders are expanded)
    if (this.settings.expandedFolders === null) {
      // Get all folder IDs from somewhere (you'll need to provide a list or callback)
      this.settings.expandedFolders = []; // All folders except the one being collapsed
    }

    const index = this.settings.expandedFolders.indexOf(folderId);
    if (index !== -1) {
      this.settings.expandedFolders.splice(index, 1);
      this.saveSettings();
    }
  }

  /**
   * Check if a folder is expanded
   * @param {string} folderId - Folder ID
   * @returns {boolean} Expansion status
   */
  isFolderExpanded(folderId) {
    // If expandedFolders is null, all folders are expanded
    if (this.settings.expandedFolders === null) {
      return true;
    }
    return this.settings.expandedFolders.includes(folderId);
  }
}

export { SettingsManager, DEFAULT_SETTINGS };
