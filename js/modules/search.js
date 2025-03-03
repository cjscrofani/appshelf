/**
 * search.js
 * Manages search functionality for the App Shelf
 */

import { UI } from './ui.js';

/**
 * Default search engines
 */
const DEFAULT_SEARCH_ENGINES = [
  {
    name: 'google',
    displayName: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'https://www.google.com/favicon.ico'
  },
  {
    name: 'bing',
    displayName: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'https://www.bing.com/favicon.ico'
  },
  {
    name: 'duckduckgo',
    displayName: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: 'https://duckduckgo.com/favicon.ico'
  }
];

/**
 * Search Manager for handling search functionality
 */
class SearchManager {
  constructor() {
    this.searchBox = null;
    this.searchEngineIcon = null;
    this.searchDropdown = null;
    this.currentEngine = {
      name: 'google',
      icon: 'url(\'https://www.google.com/favicon.ico\')',
      url: 'https://www.google.com/search?q='
    };
    this.searchCallback = null;
  }

  /**
   * Initialize search functionality
   * @param {HTMLElement} searchBox - Search input element
   * @param {Function} searchCallback - Callback function for search
   */
  init(searchBox, searchCallback) {
    this.searchBox = searchBox;
    this.searchCallback = searchCallback;
    this.searchEngineIcon = UI.getElement('searchEngineIcon');
    this.searchDropdown = UI.getElement('searchDropdown');
    
    if (!this.searchBox || !this.searchEngineIcon || !this.searchDropdown) {
      console.error('Search elements not found');
      return;
    }
    
    this.setupSearchEngine();
    this.setupEventListeners();
  }

  /**
   * Set up search engine dropdown
   */
  setupSearchEngine() {
    // Toggle dropdown
    this.searchEngineIcon.addEventListener('click', () => {
      UI.toggleClass(this.searchDropdown, 'show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.searchEngineIcon.contains(e.target) && 
          !this.searchDropdown.contains(e.target)) {
        UI.removeClass(this.searchDropdown, 'show');
      }
    });
    
    // Handle search option selection
    const searchOptions = document.querySelectorAll('.search-option');
    searchOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Update active class
        searchOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update current engine
        const engine = option.getAttribute('data-engine');
        const url = option.getAttribute('data-url');
        const icon = option.querySelector('.search-option-icon').style.backgroundImage || '';
        
        this.currentEngine = {
          name: engine,
          icon: icon,
          url: url
        };
        
        // Update icon
        if (icon) {
          this.searchEngineIcon.style.backgroundImage = icon;
        } else if (engine === 'bookmarks') {
          // Set SVG as background for bookmarks option
          const svgIcon = option.querySelector('.search-option-icon svg');
          if (svgIcon) {
            // Create a data URL from the SVG
            const svgContent = svgIcon.outerHTML;
            const svgUrl = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}")`;
            this.searchEngineIcon.style.backgroundImage = svgUrl;
          }
        }
        
        // Close dropdown
        UI.removeClass(this.searchDropdown, 'show');
        
        // Focus search box
        this.searchBox.focus();
      });
    });
  }

  /**
   * Set up search event listeners
   */
  setupEventListeners() {
    // Handle search
    this.searchBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = this.searchBox.value.trim();
        
        if (searchTerm && this.searchCallback) {
          this.searchCallback(searchTerm);
        }
      }
    });
  }

  /**
   * Get the current search engine
   * @returns {string} Current engine name
   */
  getCurrentEngine() {
    return this.currentEngine.name;
  }

  /**
   * Get the search URL for a term
   * @param {string} term - Search term
   * @returns {string} Search URL
   */
  getSearchUrl(term) {
    return this.currentEngine.url + encodeURIComponent(term);
  }

  /**
   * Clear the search box
   */
  clearSearch() {
    if (this.searchBox) {
      this.searchBox.value = '';
    }
  }
}

export { SearchManager, DEFAULT_SEARCH_ENGINES };
