/**
 * bookmarkCard.js
 * Handles rendering of bookmark cards
 */

import { UI } from '../modules/ui.js';

/**
 * BookmarkRenderer class for handling bookmark card rendering
 */
class BookmarkRenderer {
  /**
   * Create a BookmarkRenderer instance
   * @param {Object} bookmarkManager - Bookmark data manager
   * @param {Object} settingsManager - Settings manager
   */
  constructor(bookmarkManager, settingsManager) {
    this.bookmarkManager = bookmarkManager;
    this.settingsManager = settingsManager;
    this.onEditBookmark = null;
  }

  /**
   * Set the edit bookmark callback
   * @param {Function} callback - Edit bookmark callback function
   */
  setEditBookmarkCallback(callback) {
    this.onEditBookmark = callback;
  }

  /**
   * Creates a bookmark card element
   * @param {Object} bookmark - Bookmark data object
   * @param {string} folderId - Parent folder ID
   * @returns {HTMLElement} The bookmark card element
   */
  createBookmarkElement(bookmark, folderId) {
    // Create the card container
    const card = UI.createElement('div', {
      attributes: {
        class: 'bookmark-card',
        'data-name': bookmark.name,
        'data-url': bookmark.url,
        'data-folder': folderId,
        title: `${bookmark.name} - ${bookmark.url}`
      }
    });
    
    // Create the link element
    const link = UI.createElement('a', {
      attributes: {
        href: bookmark.url,
        target: this.getTargetAttribute()
      }
    });
    
    // Get favicon or custom image URL
    const imageUrl = bookmark.image || this.bookmarkManager.getFaviconUrl(bookmark.url, 128);
    const isFavicon = !bookmark.image;
    
    // Create the image container
    const imageContainer = UI.createElement('div', {
      attributes: {
        class: `bookmark-image ${isFavicon ? 'favicon-background' : ''}`
      },
      styles: {
        backgroundImage: `url('${imageUrl}')`
      }
    });
    
    // Add image to link
    link.appendChild(imageContainer);
    
    // Add link to card
    card.appendChild(link);
    
    // Add edit button
    this.addEditButton(card, bookmark, folderId);
    
    return card;
  }

  /**
   * Add edit button to bookmark card
   * @param {HTMLElement} card - Bookmark card element
   * @param {Object} bookmark - Bookmark data
   * @param {string} folderId - Folder ID
   */
  addEditButton(card, bookmark, folderId) {
    // Create actions container
    const actionsContainer = UI.createElement('div', {
      attributes: {
        class: 'bookmark-actions'
      }
    });
    
    // Create edit button
    const editBtn = UI.createElement('button', {
      attributes: {
        class: 'bookmark-edit-btn',
        title: 'Edit bookmark'
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
          
          if (this.onEditBookmark) {
            this.onEditBookmark(bookmark.url, folderId);
          }
        }
      }
    });
    
    // Add button to container
    actionsContainer.appendChild(editBtn);
    
    // Add actions container to card
    card.appendChild(actionsContainer);
  }

  /**
   * Get the target attribute for bookmark links based on settings
   * @returns {string} '_self' or '_blank'
   */
  getTargetAttribute() {
    return this.settingsManager.getSetting('bookmarkTarget') === 'current' ? '_self' : '_blank';
  }

  /**
   * Update all bookmark targets based on settings
   */
  updateTargets() {
    const target = this.getTargetAttribute();
    document.querySelectorAll('.bookmark-card a').forEach(link => {
      link.target = target;
    });
  }
}

export { BookmarkRenderer };
