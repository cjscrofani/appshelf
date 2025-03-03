/**
 * app.js
 * Main application entry point
 */

import { BookmarkManager } from './modules/bookmarks.js';
import { FolderManager } from './modules/folders.js';
import { SettingsManager } from './modules/settings.js';
import { UI } from './modules/ui.js';
import { SearchManager } from './modules/search.js';
import { ModalManager } from './components/modal.js';
import { BookmarkRenderer } from './components/bookmarkCard.js';
import { FolderRenderer } from './components/folderView.js';
import { ContextMenuManager } from './components/contextMenu.js';

/**
 * Main App class that initializes and coordinates all components
 */
class App {
  constructor() {
    // Initialize managers
    this.bookmarkManager = new BookmarkManager();
    this.folderManager = new FolderManager(this.bookmarkManager);
    this.settingsManager = new SettingsManager();
    this.searchManager = new SearchManager();
    this.modalManager = new ModalManager();
    this.contextMenuManager = new ContextMenuManager();
    
    // Initialize renderers
    this.bookmarkRenderer = new BookmarkRenderer(this.bookmarkManager, this.settingsManager);
    this.folderRenderer = new FolderRenderer(this.folderManager, this.bookmarkRenderer, this.settingsManager);
    
    // Set up callbacks for edit actions
    this.bookmarkRenderer.setEditBookmarkCallback((url, folderId) => {
      this.modalManager.showEditBookmarkModal(url, folderId);
    });
    
    this.folderRenderer.setEditFolderCallback((folderId) => {
      this.modalManager.showEditFolderModal(folderId);
    });
    
    // Setup context menu callbacks
    this.contextMenuManager.setCallbacks({
      onEditBookmark: (url, folderId) => {
        this.modalManager.showEditBookmarkModal(url, folderId);
      },
      onDeleteBookmark: (url, folderId, name) => {
        return this.bookmarkManager.deleteBookmark(url, folderId);
      },
      onEditFolder: (folderId) => {
        this.modalManager.showEditFolderModal(folderId);
      },
      onDeleteFolder: (folderId, name) => {
        return this.folderManager.deleteFolder(folderId);
      }
    });
    
    // Setup app state
    this.appInitialized = false;
  }

  /**
   * Initialize the application
   */
  init() {
    if (this.appInitialized) return;
    
    // Apply dark mode if enabled
    UI.applyDarkMode(this.settingsManager.isDarkModeEnabled());
    
    // Setup UI components
    this.setupSearch();
    this.setupNightMode();
    this.setupAddMenu();
    this.setupModals();
    this.setupKeyboardShortcuts();
    
    // Initialize context menus
    this.contextMenuManager.init();
    
    // Render bookmarks and folders
    this.renderContent();
    
    // Set initialized flag
    this.appInitialized = true;
    console.log('App Shelf initialized');
  }

  /**
   * Render all content (bookmarks and folders)
   */
  renderContent() {
    const contentArea = UI.getElement('contentArea');
    if (!contentArea) return;
    
    // Clear content area
    contentArea.innerHTML = '';
    
    // Render folders
    this.folderManager.getAllFolders().forEach(folder => {
      const folderElement = this.folderRenderer.renderFolder(folder);
      contentArea.appendChild(folderElement);
    });
    
    // Render unorganized bookmarks
    const unorganizedElement = this.folderRenderer.renderUnorganizedFolder();
    contentArea.appendChild(unorganizedElement);
  }

  /**
   * Set up the search functionality
   */
  setupSearch() {
    const searchBox = UI.getElement('searchBox');
    if (!searchBox) return;
    
    this.searchManager.init(searchBox, (searchTerm) => {
      if (this.searchManager.getCurrentEngine() === 'bookmarks') {
        this.filterBookmarks(searchTerm);
      } else {
        const url = this.searchManager.getSearchUrl(searchTerm);
        const target = this.settingsManager.getSetting('bookmarkTarget') === 'current' ? '_self' : '_blank';
        window.open(url, target);
      }
    });
  }

  /**
   * Filter bookmarks based on search term
   * @param {string} searchTerm - Search term
   */
  filterBookmarks(searchTerm) {
    const folders = document.querySelectorAll('.folder');
    const term = searchTerm.toLowerCase();
    let foundAny = false;
    
    folders.forEach(folder => {
      const bookmarks = folder.querySelectorAll('.bookmark-card');
      let foundInFolder = false;
      
      bookmarks.forEach(bookmark => {
        const name = bookmark.getAttribute('data-name').toLowerCase();
        const url = bookmark.getAttribute('data-url').toLowerCase();
        
        if (name.includes(term) || url.includes(term)) {
          UI.removeClass(bookmark, 'hidden');
          foundInFolder = true;
          foundAny = true;
        } else {
          UI.addClass(bookmark, 'hidden');
        }
      });
      
      if (foundInFolder) {
        UI.removeClass(folder, 'hidden');
        UI.showElement(folder.querySelector('.bookmarks-grid'), 'grid');
        UI.addClass(folder.querySelector('.folder-toggle'), 'open');
      } else {
        UI.addClass(folder, 'hidden');
      }
    });
    
    // Show/hide no results message
    let noResultsMessage = UI.getElement('noResultsMessage');
    
    if (!foundAny) {
      if (!noResultsMessage) {
        noResultsMessage = UI.createElement('div', {
          attributes: {
            id: 'noResultsMessage',
            class: 'no-results'
          },
          text: 'No bookmarks found matching your search.'
        });
        UI.getElement('contentArea').appendChild(noResultsMessage);
      }
    } else if (noResultsMessage) {
      noResultsMessage.remove();
    }
  }

  /**
   * Set up night mode toggle
   */
  setupNightMode() {
    const nightModeToggle = UI.getElement('nightModeToggle');
    const nightModeCheckbox = UI.getElement('nightModeCheckbox');
    if (!nightModeToggle || !nightModeCheckbox) return;
    
    // Set initial state
    nightModeCheckbox.checked = this.settingsManager.isDarkModeEnabled();
    
    // Toggle when the switch is clicked
    nightModeToggle.addEventListener('click', () => {
      nightModeCheckbox.checked = !nightModeCheckbox.checked;
      this.toggleDarkMode();
    });
    
    // Also toggle when the checkbox itself changes
    nightModeCheckbox.addEventListener('change', () => {
      this.toggleDarkMode();
    });
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    const isDarkMode = this.settingsManager.toggleDarkMode();
    UI.applyDarkMode(isDarkMode);
  }

  /**
   * Set up the add menu and button
   */
  setupAddMenu() {
    const addButton = UI.getElement('addButton');
    const addMenu = UI.getElement('addMenu');
    if (!addButton || !addMenu) return;
    
    // Toggle menu on button click
    addButton.addEventListener('click', () => {
      UI.toggleClass(addMenu, 'show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!addButton.contains(e.target) && !addMenu.contains(e.target)) {
        UI.removeClass(addMenu, 'show');
      }
    });
    
    // Set up menu items
    this.setupAddMenuItems();
  }

  /**
   * Set up add menu items
   */
  setupAddMenuItems() {
    // Add bookmark menu item
    const addBookmarkMenuItem = UI.getElement('addBookmarkMenuItem');
    if (addBookmarkMenuItem) {
      addBookmarkMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        this.modalManager.showAddBookmarkModal();
      });
    }
    
    // Add folder menu item
    const addFolderMenuItem = UI.getElement('addFolderMenuItem');
    if (addFolderMenuItem) {
      addFolderMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        this.modalManager.showAddFolderModal();
      });
    }
    
    // Export bookmarks menu item
    const saveBookmarksMenuItem = UI.getElement('saveBookmarksMenuItem');
    if (saveBookmarksMenuItem) {
      saveBookmarksMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        this.bookmarkManager.exportBookmarks();
        UI.showToast('Bookmarks exported successfully', 'success');
      });
    }
    
    // Import bookmarks menu item
    const loadBookmarksMenuItem = UI.getElement('loadBookmarksMenuItem');
    const bookmarksFileInput = UI.getElement('bookmarksFileInput');
    if (loadBookmarksMenuItem && bookmarksFileInput) {
      loadBookmarksMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        bookmarksFileInput.click();
      });
      
      bookmarksFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileImport(e.target.files[0]);
        }
      });
    }
    
    // Settings menu item
    const settingsMenuItem = UI.getElement('settingsMenuItem');
    if (settingsMenuItem) {
      settingsMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        this.modalManager.showSettingsModal();
      });
    }
    
    // Keyboard shortcuts menu item
    const keyboardShortcutsMenuItem = UI.getElement('keyboardShortcutsMenuItem');
    if (keyboardShortcutsMenuItem) {
      keyboardShortcutsMenuItem.addEventListener('click', () => {
        UI.removeClass('addMenu', 'show');
        UI.addClass('keyboardShortcutsPopup', 'show');
      });
    }
  }

  /**
   * Handle file import
   * @param {File} file - File to import
   */
  handleFileImport(file) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (this.bookmarkManager.importBookmarks(importedData)) {
          this.renderContent();
          UI.showToast('Bookmarks imported successfully', 'success');
        } else {
          UI.showToast('Invalid bookmark file structure', 'error');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        UI.showToast('Error loading bookmarks file', 'error');
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      UI.showToast('Error reading file', 'error');
    };
    
    reader.readAsText(file);
  }

  /**
   * Set up modals
   */
  setupModals() {
    this.modalManager.init({
      onAddBookmark: (name, url, folderId, image) => {
        const success = this.bookmarkManager.addBookmark(name, url, folderId, image);
        if (success) {
          this.renderContent();
          UI.showToast(`Bookmark "${name}" added`, 'success');
        }
        return success;
      },
      onEditBookmark: (originalUrl, originalFolderId, bookmark, newFolderId) => {
        const success = this.bookmarkManager.updateBookmark(
          originalUrl, originalFolderId, bookmark, newFolderId
        );
        if (success) {
          this.renderContent();
          UI.showToast(`Bookmark "${bookmark.name}" updated`, 'success');
        }
        return success;
      },
      onDeleteBookmark: (url, folderId, name) => {
        const success = this.bookmarkManager.deleteBookmark(url, folderId);
        if (success) {
          this.renderContent();
          UI.showToast(`Bookmark "${name}" deleted`, 'success');
        }
        return success;
      },
      onAddFolder: (name, id) => {
        const success = this.folderManager.addFolder(name, id);
        if (success) {
          this.renderContent();
          UI.showToast(`Folder "${name}" added`, 'success');
        } else {
          UI.showToast('A folder with this ID already exists', 'error');
        }
        return success;
      },
      onEditFolder: (originalId, folder) => {
        const success = this.folderManager.updateFolder(originalId, folder);
        if (success) {
          this.renderContent();
          UI.showToast(`Folder "${folder.name}" updated`, 'success');
        }
        return success;
      },
      onDeleteFolder: (folderId, name) => {
        const success = this.folderManager.deleteFolder(folderId);
        if (success) {
          this.renderContent();
          UI.showToast(`Folder "${name}" deleted`, 'success');
        }
        return success;
      },
      onSaveSettings: (settings) => {
        Object.entries(settings).forEach(([key, value]) => {
          this.settingsManager.updateSetting(key, value);
        });
        this.bookmarkRenderer.updateTargets();
        UI.showToast('Settings saved', 'success');
      }
    });
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Close keyboard shortcuts popup
    const keyboardShortcutsPopup = UI.getElement('keyboardShortcutsPopup');
    const closeKeyboardShortcutsBtn = keyboardShortcutsPopup?.querySelector('.close-btn');
    
    if (closeKeyboardShortcutsBtn) {
      closeKeyboardShortcutsBtn.addEventListener('click', () => {
        UI.removeClass(keyboardShortcutsPopup, 'show');
      });
    }
    
    // Close when clicking outside
    if (keyboardShortcutsPopup) {
      document.addEventListener('click', (e) => {
        const keyboardShortcutsMenuItem = UI.getElement('keyboardShortcutsMenuItem');
        if (!keyboardShortcutsPopup.contains(e.target) && 
            !(keyboardShortcutsMenuItem && keyboardShortcutsMenuItem.contains(e.target))) {
          UI.removeClass(keyboardShortcutsPopup, 'show');
        }
      });
    }
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + D to add a new bookmark
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.modalManager.showAddBookmarkModal();
      }
      
      // Ctrl/Cmd + F to add a new folder
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.modalManager.showAddFolderModal();
      }
      
      // Ctrl/Cmd + S to save/export bookmarks
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.bookmarkManager.exportBookmarks();
        UI.showToast('Bookmarks exported successfully', 'success');
      }
      
      // Escape key to close modals and popups
      if (e.key === 'Escape') {
        this.modalManager.closeAllModals();
        UI.removeClass('addMenu', 'show');
        UI.removeClass('keyboardShortcutsPopup', 'show');
      }
    });
  }
}

// Export the App class
export { App };
