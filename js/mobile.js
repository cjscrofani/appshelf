/**
 * mobile.js
 * Mobile-specific JavaScript enhancements for App Shelf
 */

class MobileEnhancements {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.widgetsToggle = null;
        this.widgetsContainer = null;
        this.isWidgetsVisible = false;
        
        this.init();
    }
    
    init() {
        if (!this.isMobile) return;
        
        // Skip widget functionality on mobile since widgets are hidden
        // this.setupWidgetsToggle();
        // this.setupTouchGestures();
        this.setupMobileOptimizations();
        this.setupResponsiveListeners();
        
        console.log('Mobile enhancements initialized (widgets disabled for mobile)');
    }
    
    setupWidgetsToggle() {
        this.widgetsToggle = document.getElementById('mobileWidgetsToggle');
        this.widgetsContainer = document.getElementById('widgetsContainerLeft');
        
        if (this.widgetsToggle && this.widgetsContainer) {
            this.widgetsToggle.addEventListener('click', () => {
                this.toggleWidgets();
            });
            
            // Close widgets when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isWidgetsVisible && 
                    !this.widgetsContainer.contains(e.target) && 
                    !this.widgetsToggle.contains(e.target)) {
                    this.hideWidgets();
                }
            });
        }
    }
    
    toggleWidgets() {
        if (this.isWidgetsVisible) {
            this.hideWidgets();
        } else {
            this.showWidgets();
        }
    }
    
    showWidgets() {
        if (this.widgetsContainer) {
            this.widgetsContainer.classList.add('show-mobile');
            this.isWidgetsVisible = true;
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'mobile-widgets-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.3);
                z-index: 99;
                backdrop-filter: blur(2px);
                -webkit-backdrop-filter: blur(2px);
            `;
            document.body.appendChild(backdrop);
            
            backdrop.addEventListener('click', () => {
                this.hideWidgets();
            });
        }
    }
    
    hideWidgets() {
        if (this.widgetsContainer) {
            this.widgetsContainer.classList.remove('show-mobile');
            this.isWidgetsVisible = false;
            
            // Remove backdrop
            const backdrop = document.querySelector('.mobile-widgets-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }
    
    setupTouchGestures() {
        let startX, startY, distX, distY;
        let threshold = 50;
        let restraint = 100;
        
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.pageX;
            startY = touch.pageY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            // Prevent default only if we're handling the gesture
            if (startX !== undefined) {
                const touch = e.touches[0];
                distX = touch.pageX - startX;
                distY = touch.pageY - startY;
                
                // If it's a horizontal swipe from left edge, show widgets
                if (startX < 30 && distX > threshold && Math.abs(distY) < restraint) {
                    e.preventDefault();
                    this.showWidgets();
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            startX = startY = distX = distY = undefined;
        }, { passive: true });
    }
    
    setupMobileOptimizations() {
        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.style.fontSize !== '16px') {
                input.style.fontSize = '16px';
            }
        });
        
        // Add touch-action to interactive elements
        const interactiveElements = document.querySelectorAll('.bookmark-card, .btn, .add-button, .folder-header');
        interactiveElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
        
        // Optimize scroll behavior
        const scrollableElements = document.querySelectorAll('.content-area, .modal-body');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.scrollBehavior = 'smooth';
        });
        
        // Show edit buttons on mobile (since hover doesn't work)
        if (this.isTouch) {
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    .bookmark-actions,
                    .folder-actions {
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupResponsiveListeners() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Handle resize events
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    handleOrientationChange() {
        // Hide widgets on orientation change
        this.hideWidgets();
        
        // Adjust viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Force a repaint
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }
    
    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            
            if (!this.isMobile) {
                // Switched to desktop
                this.hideWidgets();
            }
        }
        
        // Update viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Utility method to check if device has notch/safe areas
    static hasNotch() {
        return CSS.supports('padding: max(0px)') && 
               (parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) > 0);
    }
    
    // Method to add haptic feedback (if supported)
    static hapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(50);
                    break;
            }
        }
    }
    
    // Method to show toast notifications optimized for mobile
    static showMobileToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type} show mobile-toast`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 15px;
            right: 15px;
            padding: 16px 20px;
            border-radius: 12px;
            font-size: 16px;
            text-align: center;
            z-index: 2000;
            transform: translateY(100px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// Initialize mobile enhancements when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileEnhancements();
    });
} else {
    new MobileEnhancements();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEnhancements;
}