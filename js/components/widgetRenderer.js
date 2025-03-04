/**
 * widgetRenderer.js
 * Handles rendering of widgets
 */

import { UI } from '../modules/ui.js';

/**
 * WidgetRenderer class for handling widget rendering
 */
class WidgetRenderer {
  /**
   * Create a WidgetRenderer instance
   * @param {Object} widgetManager - Widget data manager
   */
  constructor(widgetManager) {
    this.widgetManager = widgetManager;
    this.callbacks = {
      onDeleteWidget: null,
      onUpdateWidgetContent: null
    };
  }

  /**
   * Set widget callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Render all widgets
   */
  renderAllWidgets() {
    // Clear existing widgets
    this.widgetManager.widgetContainerLeft.innerHTML = '';

    // Get all widgets (we'll treat them all as left widgets)
    const widgets = this.widgetManager.getAllWidgets();

    // Render all widgets on the left side
    widgets.forEach(widget => {
      const widgetElement = this.renderWidget(widget);
      this.widgetManager.widgetContainerLeft.appendChild(widgetElement);
    });
  }

  /**
   * Render a specific widget
   * @param {Object} widget - Widget data
   * @returns {HTMLElement} Widget element
   */
  renderWidget(widget) {
    // Create base widget element
    const widgetElement = UI.createElement('div', {
      attributes: {
        class: `widget widget-${widget.type}`,
        'data-widget-id': widget.id,
        'data-widget-type': widget.type
      }
    });

    // Create widget header
    const header = this.createWidgetHeader(widget);
    widgetElement.appendChild(header);

    // Create widget content based on type
    const content = this.createWidgetContent(widget);
    widgetElement.appendChild(content);

    return widgetElement;
  }

  /**
   * Create widget header
   * @param {Object} widget - Widget data
   * @returns {HTMLElement} Widget header element
   */
  createWidgetHeader(widget) {
    const header = UI.createElement('div', {
      attributes: {
        class: 'widget-header'
      }
    });

    // Widget title
    const title = UI.createElement('div', {
      attributes: {
        class: 'widget-title'
      },
      text: widget.title
    });

    // Widget actions
    const actions = UI.createElement('div', {
      attributes: {
        class: 'widget-actions'
      }
    });

    // Delete button
    const deleteBtn = UI.createElement('button', {
      attributes: {
        class: 'widget-action-btn',
        title: 'Delete widget'
      },
      html: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `,
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (this.callbacks.onDeleteWidget) {
            UI.confirm(`Are you sure you want to delete this widget?`).then(confirmed => {
              if (confirmed) {
                this.callbacks.onDeleteWidget(widget.id);
              }
            });
          }
        }
      }
    });

    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);

    return header;
  }

  /**
   * Create widget content based on type
   * @param {Object} widget - Widget data
   * @returns {HTMLElement} Widget content element
   */
  createWidgetContent(widget) {
    const content = UI.createElement('div', {
      attributes: {
        class: 'widget-content'
      }
    });

    switch (widget.type) {
      case 'note':
        this.createNoteContent(content, widget);
        break;
      case 'todo':
        this.createTodoContent(content, widget);
        break;
      default:
        content.textContent = 'Unknown widget type';
    }

    return content;
  }

  /**
   * Create note widget content
   * @param {HTMLElement} contentElement - Content container
   * @param {Object} widget - Widget data
   */
  createNoteContent(contentElement, widget) {
    const textarea = UI.createElement('textarea', {
      attributes: {
        placeholder: 'Write your notes here...',
        'data-widget-id': widget.id
      },
      properties: {
        value: widget.data.content || ''
      },
      events: {
        input: (e) => {
          if (this.callbacks.onUpdateWidgetContent) {
            this.callbacks.onUpdateWidgetContent(widget.id, { content: e.target.value });
          }
        }
      }
    });

    contentElement.appendChild(textarea);
  }

  /**
   * Create todo list widget content
   * @param {HTMLElement} contentElement - Content container
   * @param {Object} widget - Widget data
   */
  createTodoContent(contentElement, widget) {
    // Todo items container
    const todosContainer = UI.createElement('div', {
      attributes: {
        class: 'todos-container'
      }
    });

    // Render existing todo items
    if (widget.data.items && widget.data.items.length > 0) {
      widget.data.items.forEach(item => {
        const todoItem = this.createTodoItem(item, widget.id);
        todosContainer.appendChild(todoItem);
      });
    }

    // Create input for new todos
    const inputContainer = UI.createElement('div', {
      attributes: {
        class: 'todo-input-container'
      }
    });

    const input = UI.createElement('input', {
      attributes: {
        type: 'text',
        class: 'todo-input',
        placeholder: 'Add a new task...'
      },
      events: {
        keydown: (e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            this.addTodoItem(widget.id, e.target.value.trim());
            e.target.value = '';
          }
        }
      }
    });

    const addButton = UI.createElement('button', {
      attributes: {
        class: 'todo-add-btn',
        title: 'Add task'
      },
      html: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `,
      events: {
        click: (e) => {
          e.preventDefault();
          
          const todoInput = inputContainer.querySelector('.todo-input');
          if (todoInput.value.trim()) {
            this.addTodoItem(widget.id, todoInput.value.trim());
            todoInput.value = '';
            todoInput.focus();
          }
        }
      }
    });

    inputContainer.appendChild(input);
    inputContainer.appendChild(addButton);

    contentElement.appendChild(todosContainer);
    contentElement.appendChild(inputContainer);
  }

  /**
 * Create a todo item element
 * @param {Object} item - Todo item data
 * @param {string} widgetId - Widget ID
 * @returns {HTMLElement} Todo item element
 */
createTodoItem(item, widgetId) {
  const todoItem = UI.createElement('div', {
    attributes: {
      class: `todo-item ${item.completed ? 'completed' : ''}`,
      'data-todo-id': item.id
    }
  });

  const checkboxAttributes = {
    type: 'checkbox',
    class: 'todo-checkbox'
  };
  
  // Only add the checked attribute if the item is completed
  if (item.completed) {
    checkboxAttributes.checked = 'checked';
  }

  const checkbox = UI.createElement('input', {
    attributes: checkboxAttributes,
    events: {
      change: (e) => {
        this.toggleTodoItem(widgetId, item.id, e.target.checked);
      }
    }
  });

  const text = UI.createElement('div', {
    attributes: {
      class: 'todo-text'
    },
    text: item.text
  });

  const deleteBtn = UI.createElement('button', {
    attributes: {
      class: 'todo-delete',
      title: 'Delete task'
    },
    html: `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `,
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        this.deleteTodoItem(widgetId, item.id);
      }
    }
  });

  todoItem.appendChild(checkbox);
  todoItem.appendChild(text);
  todoItem.appendChild(deleteBtn);

  return todoItem;
}

  /**
   * Add a new todo item
   * @param {string} widgetId - Widget ID
   * @param {string} text - Todo text
   */
  addTodoItem(widgetId, text) {
    const widget = this.widgetManager.getWidget(widgetId);
    if (!widget) return;

    const todoId = 'todo_' + Date.now();
    const newItem = {
      id: todoId,
      text: text,
      completed: false
    };

    // Add to widget data
    const items = widget.data.items || [];
    items.push(newItem);

    // Update widget
    if (this.callbacks.onUpdateWidgetContent) {
      this.callbacks.onUpdateWidgetContent(widgetId, { items });
    }

    // Add to the DOM
    const widgetElement = document.querySelector(`.widget[data-widget-id="${widgetId}"]`);
    if (widgetElement) {
      const todosContainer = widgetElement.querySelector('.todos-container');
      const todoItem = this.createTodoItem(newItem, widgetId);
      todosContainer.appendChild(todoItem);
    }
  }

  /**
   * Toggle todo item completed state
   * @param {string} widgetId - Widget ID
   * @param {string} todoId - Todo item ID
   * @param {boolean} completed - New completed state
   */
  toggleTodoItem(widgetId, todoId, completed) {
    const widget = this.widgetManager.getWidget(widgetId);
    if (!widget || !widget.data.items) return;

    // Update the item in data
    const items = widget.data.items.map(item => {
      if (item.id === todoId) {
        return { ...item, completed };
      }
      return item;
    });

    // Update widget
    if (this.callbacks.onUpdateWidgetContent) {
      this.callbacks.onUpdateWidgetContent(widgetId, { items });
    }

    // Update the DOM
    const todoElement = document.querySelector(`.todo-item[data-todo-id="${todoId}"]`);
    if (todoElement) {
      if (completed) {
        todoElement.classList.add('completed');
      } else {
        todoElement.classList.remove('completed');
      }
    }
  }

  /**
   * Delete a todo item
   * @param {string} widgetId - Widget ID
   * @param {string} todoId - Todo item ID
   */
  deleteTodoItem(widgetId, todoId) {
    const widget = this.widgetManager.getWidget(widgetId);
    if (!widget || !widget.data.items) return;

    // Filter out the deleted item
    const items = widget.data.items.filter(item => item.id !== todoId);

    // Update widget
    if (this.callbacks.onUpdateWidgetContent) {
      this.callbacks.onUpdateWidgetContent(widgetId, { items });
    }

    // Remove from the DOM
    const todoElement = document.querySelector(`.todo-item[data-todo-id="${todoId}"]`);
    if (todoElement) {
      todoElement.remove();
    }
  }
}

export { WidgetRenderer };
