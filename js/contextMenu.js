/**
 * contextMenu.js
 * Manages context menus for bookmarks and folders
 */

import { UI } from '../modules/ui.js';

/**
 * ContextMenuManager class for handling context menus
 */
class ContextMenuManager {
  /**
   * Create a ContextMenuManager instance
   */
  constructor() {
    this.currentBookmark = null;
    this.currentFolder = null;
    this.callbacks = {
      onEditBookmark: null,
      onDeleteBookmark: null,
      onEditFolder: null,
      onDeleteFolder: null
    };
  }

  /**
   * Initialize context menus
   */
  init() {
    this.createContextMenus();
    this.setupEventListeners();
  }

  /**
   * Set context menu callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Create context menu elements
   */
  createContextMenus() {
    // Create bookmark context menu
    this.createBookmarkContextMenu();
    
    // Create folder context menu
    this.createFolderContextMenu();
  }

  /**
   * Create bookmark context menu
   */
  createBookmarkContextMenu() {
    // Check if menu already exists
    if (document.getElementById('bookmarkContextMenu')) {
      return;
    }
    
    // Create context menu element
    const contextMenu = UI.createElement('div', {
      attributes: {
        class: 'context-menu',
        id: 'bookmarkContextMenu'
      },
      html: `
        <div class="context-menu-item" id="editBookmarkItem">
            <div class="context-menu-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </div>
            <div class="context-menu-item-text">Edit</div>
        </div>
        <div class="context-menu-item" id="deleteBookmarkItem">
            <div class="context-menu-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </div>
            <div class="context-menu-item-text">Delete</div>
        </div>
      `
    });
    
    // Add to document
    document.body.appendChild(contextMenu);
    
    // Add event listeners
    this.setupBookmarkContextMenuEvents(contextMenu);
  }

  /**
   * Create folder context menu
   */
  createFolderContextMenu() {
    // Check if menu already exists
    if (document.getElementById('folderContextMenu')) {
      return;
    }
    
    // Create context menu element
    const contextMenu = UI.createElement('div', {
      attributes: {
        class: 'context-menu',
        id: 'folderContextMenu'
      },
      html: `
        <div class="context-menu-item" id="editFolderItem">
            <div class="context-menu-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </div>
            <div class="context-menu-item-text">Edit Folder</div>
        </div>
        <div class="context-menu-item" id="deleteFolderItem">
            <div class="context-menu-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </div>
            <div class="context-menu-item-text">Delete Folder</div>
        </div>
      `
    });
    
    // Add to document
    document.body.appendChild(contextMenu);
    
    // Add event listeners
    this.setupFolderContextMenuEvents(contextMenu);
  }

  /**
   * Set up bookmark context menu events
   * @param {HTMLElement} contextMenu - Context menu element
   */
  setupBookmarkContextMenuEvents(contextMenu) {
    // Handle edit bookmark action
    const editBookmarkItem = contextMenu.querySelector('#editBookmarkItem');
    if (editBookmarkItem) {
      editBookmarkItem.addEventListener('click', () => {
        if (this.currentBookmark && this.callbacks.onEditBookmark) {
          this.callbacks.onEditBookmark(this.currentBookmark.url, this.currentBookmark.folder);
        }
        this.hideContextMenus();
      });
    }
    
    // Handle delete bookmark action
    const deleteBookmarkItem = contextMenu.querySelector('#deleteBookmarkItem');
    if (deleteBookmarkItem) {
      deleteBookmarkItem.addEventListener('click', () => {
        if (this.currentBookmark && this.callbacks.onDeleteBookmark) {
          UI.confirm(`Are you sure you want to delete "${this.currentBookmark.name}"?`).then(confirmed => {
            if (confirmed) {
              this.callbacks.onDeleteBookmark(
                this.currentBookmark.url, 
                this.currentBookmark.folder,
                this.currentBookmark.name
              );
            }
          });
        }
        this.hideContextMenus();
      });
    }
    
    // Prevent menu closing when clicking inside
    contextMenu.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  /**
   * Set up folder context menu events
   * @param {HTMLElement} contextMenu - Context menu element
   */
  setupFolderContextMenuEvents(contextMenu) {
    // Handle edit folder action
    const editFolderItem = contextMenu.querySelector('#editFolderItem');
    if (editFolderItem) {
      editFolderItem.addEventListener('click', () => {
        if (this.currentFolder && this.callbacks.onEditFolder) {
          this.callbacks.onEditFolder(this.currentFolder);
        }
        this.hideContextMenus();
      });
    }
    
    // Handle delete folder action
    const deleteFolderItem = contextMenu.querySelector('#deleteFolderItem');
    if (deleteFolderItem) {
      deleteFolderItem.addEventListener('click', () => {
        if (this.currentFolder && this.callbacks.onDeleteFolder) {
          // Get folder name (this would require a lookup in a real implementation)
          const folderElement = document.querySelector(`.folder[data-folder-id="${this.currentFolder}"]`);
          const folderName = folderElement ? 
            folderElement.querySelector('.folder-name').textContent : 
            this.currentFolder;
          
          UI.confirm(`Are you sure you want to delete the "${folderName}" folder?`).then(confirmed => {
            if (confirmed) {
              this.callbacks.onDeleteFolder(this.currentFolder, folderName);
            }
          });
        }
        this.hideContextMenus();
      });
    }
    
    // Prevent menu closing when clicking inside
    contextMenu.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Close context menus when clicking elsewhere
    document.addEventListener('click', () => {
      this.hideContextMenus();
    });
    
    // Handle context menu events
    document.addEventListener('contextmenu', e => {
      // Reset current states
      this.hideContextMenus();
      
      // Check if it's a bookmark card
      const bookmarkCard = e.target.closest('.bookmark-card');
      if (bookmarkCard) {
        e.preventDefault();
        this.handleBookmarkContextMenu(bookmarkCard, e.pageX, e.pageY);
        return;
      }
      
      // Check if it's a folder header
      const folderHeader = e.target.closest('.folder-header');
      if (folderHeader) {
        const folder = folderHeader.closest('.folder');
        if (folder) {
          const folderId = folder.getAttribute('data-folder-id');
          
          // Don't allow context menu on unorganized folder
          if (folderId === 'unorganized') {
            return;
          }
          
          e.preventDefault();
          this.handleFolderContextMenu(folderId, e.pageX, e.pageY);
        }
      }
    });
  }

  /**
   * Handle bookmark context menu
   * @param {HTMLElement} bookmarkCard - Bookmark card element
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  handleBookmarkContextMenu(bookmarkCard, x, y) {
    // Store bookmark data
    this.currentBookmark = {
      name: bookmarkCard.getAttribute('data-name'),
      url: bookmarkCard.getAttribute('data-url'),
      folder: bookmarkCard.getAttribute('data-folder')
    };
    
    // Show context menu
    this.showBookmarkContextMenu(x, y);
  }

  /**
   * Handle folder context menu
   * @param {string} folderId - Folder ID
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  handleFolderContextMenu(folderId, x, y) {
    // Store folder ID
    this.currentFolder = folderId;
    
    // Show context menu
    this.showFolderContextMenu(x, y);
  }

  /**
   * Show bookmark context menu
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showBookmarkContextMenu(x, y) {
    const contextMenu = document.getElementById('bookmarkContextMenu');
    if (!contextMenu) return;
    
    // Position menu
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    
    // Show menu
    contextMenu.style.display = 'block';
  }

  /**
   * Show folder context menu
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showFolderContextMenu(x, y) {
    const contextMenu = document.getElementById('folderContextMenu');
    if (!contextMenu) return;
    
    // Position menu
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    
    // Show menu
    contextMenu.style.display = 'block';
  }

  /**
   * Hide all context menus
   */
  hideContextMenus() {
    const bookmarkContextMenu = document.getElementById('bookmarkContextMenu');
    const folderContextMenu = document.getElementById('folderContextMenu');
    
    if (bookmarkContextMenu) {
      bookmarkContextMenu.style.display = 'none';
    }
    
    if (folderContextMenu) {
      folderContextMenu.style.display = 'none';
    }
  }
}

export { ContextMenuManager };
