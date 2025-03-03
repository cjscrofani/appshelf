/**
 * folderView.js
 * Handles rendering of folders and their bookmarks
 */

import { UI } from '../modules/ui.js';

/**
 * FolderRenderer class for rendering folders and their contents
 */
class FolderRenderer {
  /**
   * Create a FolderRenderer instance
   * @param {Object} folderManager - Folder manager
   * @param {Object} bookmarkRenderer - Bookmark renderer
   * @param {Object} settingsManager - Settings manager
   */
  constructor(folderManager, bookmarkRenderer, settingsManager) {
    this.folderManager = folderManager;
    this.bookmarkRenderer = bookmarkRenderer;
    this.settingsManager = settingsManager;
    this.onEditFolder = null;
  }

  /**
   * Set edit folder callback
   * @param {Function} callback - Edit folder callback function
   */
  setEditFolderCallback(callback) {
    this.onEditFolder = callback;
  }

  /**
   * Render a folder with its bookmarks
   * @param {Object} folder - Folder data
   * @returns {HTMLElement} Folder element
   */
  renderFolder(folder) {
    // Create folder container
    const folderElement = UI.createElement('div', {
      attributes: {
        class: 'folder',
        'data-folder-id': folder.id
      }
    });
    
    // Create folder header
    const folderHeader = this.createFolderHeader(folder);
    
    // Create bookmarks grid
    const bookmarksGrid = this.createBookmarksGrid(folder);
    
    // Add folder header and bookmarks grid to folder element
    folderElement.appendChild(folderHeader);
    folderElement.appendChild(bookmarksGrid);
    
    // Set initial state (expanded or collapsed)
    this.setFolderState(folderHeader, bookmarksGrid);
    
    return folderElement;
  }

  /**
   * Create folder header element
   * @param {Object} folder - Folder data
   * @returns {HTMLElement} Folder header element
   */
  createFolderHeader(folder) {
    // Create folder header
    const folderHeader = UI.createElement('div', {
      attributes: {
        class: 'folder-header'
      }
    });
    
    // Add folder icon
    const folderIcon = UI.createElement('div', {
      attributes: {
        class: 'folder-icon'
      },
      html: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      `
    });
    
    // Add folder name
    const folderName = UI.createElement('div', {
      attributes: {
        class: 'folder-name'
      },
      text: folder.name
    });
    
    // Add folder toggle
    const folderToggle = UI.createElement('div', {
      attributes: {
        class: 'folder-toggle'
      },
      html: `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `
    });
    
    // Add elements to header
    folderHeader.appendChild(folderIcon);
    folderHeader.appendChild(folderName);
    
    // Add edit button if it's not the unorganized folder
    if (folder.id !== 'unorganized') {
      const actionsContainer = this.createFolderActions(folder);
      folderHeader.appendChild(actionsContainer);
    }
    
    folderHeader.appendChild(folderToggle);
    
    // Add toggle functionality
    this.addFolderToggleHandler(folderHeader);
    
    return folderHeader;
  }

  /**
   * Create folder actions container
   * @param {Object} folder - Folder data
   * @returns {HTMLElement} Actions container
   */
  createFolderActions(folder) {
    // Create actions container
    const actionsContainer = UI.createElement('div', {
      attributes: {
        class: 'folder-actions'
      }
    });
    
    // Create edit button
    const editBtn = UI.createElement('button', {
      attributes: {
        class: 'folder-edit-btn',
        title: 'Edit folder'
      },
      html: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      `,
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (this.onEditFolder) {
            this.onEditFolder(folder.id);
          }
        }
      }
    });
    
    // Add button to container
    actionsContainer.appendChild(editBtn);
    
    return actionsContainer;
  }

  /**
   * Create bookmarks grid
   * @param {Object} folder - Folder data
   * @returns {HTMLElement} Bookmarks grid
   */
  createBookmarksGrid(folder) {
    // Create bookmarks grid
    const bookmarksGrid = UI.createElement('div', {
      attributes: {
        class: 'bookmarks-grid'
      }
    });
    
    // Add bookmarks to the grid
    folder.bookmarks.forEach(bookmark => {
      const bookmarkElement = this.bookmarkRenderer.createBookmarkElement(bookmark, folder.id);
      bookmarksGrid.appendChild(bookmarkElement);
    });
    
    return bookmarksGrid;
  }

  /**
   * Add toggle handler to folder header
   * @param {HTMLElement} folderHeader - Folder header element
   */
  addFolderToggleHandler(folderHeader) {
    folderHeader.addEventListener('click', () => {
      const folder = folderHeader.closest('.folder');
      const folderId = folder.getAttribute('data-folder-id');
      const bookmarksGrid = folder.querySelector('.bookmarks-grid');
      const toggle = folderHeader.querySelector('.folder-toggle');
      
      // Toggle the folder state
      if (bookmarksGrid.style.display === 'none') {
        bookmarksGrid.style.display = 'grid';
        toggle.style.transform = 'rotate(180deg)';
        toggle.classList.add('open');
        this.settingsManager.expandFolder(folderId);
      } else {
        bookmarksGrid.style.display = 'none';
        toggle.style.transform = 'rotate(0deg)';
        toggle.classList.remove('open');
        this.settingsManager.collapseFolder(folderId);
      }
    });
  }

  /**
   * Set initial folder state based on settings
   * @param {HTMLElement} folderHeader - Folder header element
   * @param {HTMLElement} bookmarksGrid - Bookmarks grid element
   */
  setFolderState(folderHeader, bookmarksGrid) {
    const folder = folderHeader.closest('.folder');
    const folderId = folder.getAttribute('data-folder-id');
    const toggle = folderHeader.querySelector('.folder-toggle');
    
    // Check if folder should be expanded
    if (this.settingsManager.isFolderExpanded(folderId)) {
      bookmarksGrid.style.display = 'grid';
      toggle.style.transform = 'rotate(180deg)';
      toggle.classList.add('open');
    } else {
      bookmarksGrid.style.display = 'none';
      toggle.style.transform = 'rotate(0deg)';
      toggle.classList.remove('open');
    }
  }

  /**
   * Render the unorganized bookmarks folder
   * @returns {HTMLElement} Unorganized folder element
   */
  renderUnorganizedFolder() {
    // Only render if there are unorganized bookmarks
    if (!this.folderManager.bookmarkManager.data.unorganized || 
        this.folderManager.bookmarkManager.data.unorganized.length === 0) {
      return document.createDocumentFragment();
    }
    
    // Create unorganized folder object
    const unorganizedFolder = {
      name: 'Unorganized',
      id: 'unorganized',
      bookmarks: this.folderManager.bookmarkManager.data.unorganized
    };
    
    // Render using the standard folder renderer
    return this.renderFolder(unorganizedFolder);
  }
}

export { FolderRenderer };
