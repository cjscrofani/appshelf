/**
 * widgets.js
 * Manages widget data and operations
 */

import { Storage, StorageKeys } from './storage.js';
import { UI } from './ui.js';

// Define a new storage key for widgets
StorageKeys.WIDGETS = 'widgetsData';

/**
 * Default widget data
 */
const DEFAULT_WIDGETS = [];

/**
 * WidgetManager class to handle widget operations
 */
class WidgetManager {
  constructor() {
    this.data = this.loadWidgets();
    this.widgetContainerLeft = null;
    this.widgetContainerRight = null;
    this.initContainers();
  }

  /**
   * Initialize widget containers
   */
  initContainers() {
    // Create left container if it doesn't exist
    this.widgetContainerLeft = document.querySelector('.widgets-container-left');
    if (!this.widgetContainerLeft) {
      this.widgetContainerLeft = UI.createElement('div', {
        attributes: {
          class: 'widgets-container widgets-container-left'
        }
      });
      document.body.appendChild(this.widgetContainerLeft);
    }

    // Create right container if it doesn't exist (though we won't use it)
    this.widgetContainerRight = document.querySelector('.widgets-container-right');
    if (!this.widgetContainerRight) {
      this.widgetContainerRight = UI.createElement('div', {
        attributes: {
          class: 'widgets-container widgets-container-right'
        }
      });
      document.body.appendChild(this.widgetContainerRight);
    }
  }

  /**
   * Load widgets from storage
   * @returns {Array} Widget data
   */
  loadWidgets() {
    return Storage.load(StorageKeys.WIDGETS, DEFAULT_WIDGETS);
  }

  /**
   * Save widgets to storage
   * @returns {boolean} Success status
   */
  saveWidgets() {
    return Storage.save(StorageKeys.WIDGETS, this.data);
  }

  /**
   * Add a new widget
   * @param {Object} widget - Widget data
   * @returns {string} Widget ID
   */
  addWidget(widget) {
    const widgetId = 'widget_' + Date.now();
    const newWidget = {
      id: widgetId,
      type: widget.type,
      position: 'left', // Always set position to left
      title: widget.title || this.getDefaultTitle(widget.type),
      data: this.getDefaultData(widget.type)
    };

    this.data.push(newWidget);
    this.saveWidgets();
    return widgetId;
  }

  /**
   * Get default title for widget type
   * @param {string} type - Widget type
   * @returns {string} Default title
   */
  getDefaultTitle(type) {
    switch (type) {
      case 'note':
        return 'Sticky Note';
      case 'todo':
        return 'Todo List';
      default:
        return 'Widget';
    }
  }

  /**
   * Get default data for widget type
   * @param {string} type - Widget type
   * @returns {Object} Default data
   */
  getDefaultData(type) {
    switch (type) {
      case 'note':
        return { content: '' };
      case 'todo':
        return { items: [] };
      default:
        return {};
    }
  }

  /**
   * Update a widget
   * @param {string} widgetId - Widget ID
   * @param {Object} updatedData - Updated widget data
   * @returns {boolean} Success status
   */
  updateWidget(widgetId, updatedData) {
    const index = this.data.findIndex(widget => widget.id === widgetId);
    if (index === -1) return false;

    this.data[index] = { ...this.data[index], ...updatedData };
    return this.saveWidgets();
  }

  /**
   * Update widget content
   * @param {string} widgetId - Widget ID
   * @param {Object} contentData - Content data to update
   * @returns {boolean} Success status
   */
  updateWidgetContent(widgetId, contentData) {
    const index = this.data.findIndex(widget => widget.id === widgetId);
    if (index === -1) return false;

    this.data[index].data = { ...this.data[index].data, ...contentData };
    return this.saveWidgets();
  }

  /**
   * Delete a widget
   * @param {string} widgetId - Widget ID
   * @returns {boolean} Success status
   */
  deleteWidget(widgetId) {
    const index = this.data.findIndex(widget => widget.id === widgetId);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return this.saveWidgets();
  }

  /**
   * Get widget by ID
   * @param {string} widgetId - Widget ID
   * @returns {Object|null} Widget data
   */
  getWidget(widgetId) {
    return this.data.find(widget => widget.id === widgetId) || null;
  }

  /**
   * Get all widgets
   * @returns {Array} All widgets
   */
  getAllWidgets() {
    return this.data;
  }

  /**
   * Get widgets by position
   * @param {string} position - Widget position ('left' or 'right')
   * @returns {Array} Widgets in the specified position
   */
  getWidgetsByPosition(position) {
    return this.data.filter(widget => widget.position === position);
  }
}

export { WidgetManager };
