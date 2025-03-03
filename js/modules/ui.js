/**
 * ui.js
 * UI utility functions and DOM helpers
 */

/**
 * UI utility functions
 */
const UI = {
  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID '${id}' not found`);
    }
    return element;
  },

  /**
   * Create an element with attributes and properties
   * @param {string} tag - HTML tag
   * @param {Object} options - Element options
   * @returns {HTMLElement} Created element
   */
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Set attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    // Set properties
    if (options.properties) {
      Object.entries(options.properties).forEach(([key, value]) => {
        element[key] = value;
      });
    }
    
    // Set styles
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }
    
    // Set text content
    if (options.text) {
      element.textContent = options.text;
    }
    
    // Set HTML content
    if (options.html) {
      element.innerHTML = options.html;
    }
    
    // Add event listeners
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    
    // Append children
    if (options.children) {
      options.children.forEach(child => {
        if (child) {
          element.appendChild(child);
        }
      });
    }
    
    return element;
  },

  /**
   * Show an element
   * @param {HTMLElement|string} element - Element or element ID
   * @param {string} display - Display style (default: 'block')
   */
  showElement(element, display = 'block') {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (el) el.style.display = display;
  },

  /**
   * Hide an element
   * @param {HTMLElement|string} element - Element or element ID
   */
  hideElement(element) {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (el) el.style.display = 'none';
  },

  /**
   * Toggle element visibility
   * @param {HTMLElement|string} element - Element or element ID
   * @param {string} display - Display style when showing (default: 'block')
   * @returns {boolean} New visibility state (true = visible)
   */
  toggleElement(element, display = 'block') {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (!el) return false;
    
    const newState = el.style.display === 'none';
    el.style.display = newState ? display : 'none';
    return newState;
  },

  /**
   * Add a class to an element
   * @param {HTMLElement|string} element - Element or element ID
   * @param {string} className - Class to add
   */
  addClass(element, className) {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (el) el.classList.add(className);
  },

  /**
   * Remove a class from an element
   * @param {HTMLElement|string} element - Element or element ID
   * @param {string} className - Class to remove
   */
  removeClass(element, className) {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (el) el.classList.remove(className);
  },

  /**
   * Toggle a class on an element
   * @param {HTMLElement|string} element - Element or element ID
   * @param {string} className - Class to toggle
   * @returns {boolean} New class state (true = has class)
   */
  toggleClass(element, className) {
    const el = typeof element === 'string' ? this.getElement(element) : element;
    if (!el) return false;
    
    return el.classList.toggle(className);
  },

  /**
   * Show a modal
   * @param {string} modalId - Modal element ID
   */
  showModal(modalId) {
    const modal = this.getElement(modalId);
    if (modal) {
      this.addClass(modal, 'show');
      
      // Focus the first input if present
      setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  },

  /**
   * Hide a modal
   * @param {string} modalId - Modal element ID
   */
  hideModal(modalId) {
    const modal = this.getElement(modalId);
    if (modal) {
      this.removeClass(modal, 'show');
    }
  },

  /**
   * Create SVG icon element
   * @param {string} iconName - Icon name
   * @param {Object} options - Options for the icon
   * @returns {HTMLElement} SVG element
   */
  createIcon(iconName, options = {}) {
    const size = options.size || 18;
    const stroke = options.stroke || 'currentColor';
    const fill = options.fill || 'none';
    const strokeWidth = options.strokeWidth || 2;
    
    // SVG path definitions
    const iconPaths = {
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
      bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>',
      edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
      delete: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      sun: '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
      moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
      plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
      save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>',
      import: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
      keyboard: '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="10" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="14" y2="8"></line><line x1="18" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="10" y2="12"></line><line x1="14" y1="12" x2="14" y2="12"></line><line x1="18" y1="12" x2="18" y2="12"></line><line x1="6" y1="16" x2="18" y2="16"></line>'
    };
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', fill);
    svg.setAttribute('stroke', stroke);
    svg.setAttribute('stroke-width', strokeWidth);
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    
    // Set the path
    if (iconPaths[iconName]) {
      svg.innerHTML = iconPaths[iconName];
    } else {
      console.warn(`Icon '${iconName}' not found`);
    }
    
    return svg;
  },

  /**
   * Display a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type ('success', 'error', 'info')
   * @param {number} duration - Duration in ms
   */
  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = this.createElement('div', {
      attributes: {
        class: `toast-notification toast-${type}`
      },
      text: message
    });
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Hide and remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300); // Wait for fade out animation
    }, duration);
  },

  /**
   * Ask for confirmation
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>} User's choice
   */
  async confirm(message) {
    return new Promise(resolve => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  },

  /**
   * Apply dark mode to the page
   * @param {boolean} enabled - Whether dark mode is enabled
   */
  applyDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
};

export { UI };
