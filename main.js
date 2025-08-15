/**
 * KYM-Tan Modular Website - Main JavaScript
 * Anime-Inspired Interactive Features
 */

// ========================================
// Global Configuration
// ========================================

const CONFIG = {
    particles: {
        count: 50,
        types: ['circle', 'heart', 'star'],
        colors: ['#FFD700', '#00BFFF', '#ff6b9d'],
        minSize: 2,
        maxSize: 6,
        speed: {
            min: 1,
            max: 3
        }
    },
    animations: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 500
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    gallery: {
        images: [
            {
                src: './assets/new-kym-tan-website/qFr4Bnek.jpg',
                title: 'Heart of the Community',
                description: 'Holding a heart close to her chest, KYM-Tan represents the love and passion that drives the meme research community. Her caring expression reflects her nurturing role.'
            },
            {
                src: './assets/new-kym-tan-website/5b5fX2Sz.jpg',
                title: 'Watercolor Serenity',
                description: 'KYM-Tan in her iconic researcher attire, complete with lab coat, red tie, and her beloved white cat companion. The soft watercolor style captures her gentle nature.'
            },
            {
                src: './assets/new-kym-tan-website/_Rsrpsai.jpg',
                title: 'Energetic Spirit',
                description: 'Full of life and enthusiasm, KYM-Tan waves with joy. Her blue KYM badge proudly displayed, embodying the excitement of meme discovery.'
            },
            {
                src: './assets/new-kym-tan-website/Adobe Express - file (11).png',
                title: 'Digital Harmony',
                description: 'A modern artistic interpretation showcasing KYM-Tan\'s evolution into the digital age, bridging traditional meme culture with contemporary design.'
            }
        ]
    },
    quotes: [
        {
            text: "Lore runs deep on #KYM-Tan – this is more than a memecoin, it's cultural preservation",
            author: "@CryptoMemeologist"
        },
        {
            text: "Undervalued gem. Whales accumulating quietly while normies sleep",
            author: "@DegenTrader_Alpha"
        },
        {
            text: "15+ years of consistent community love. That's generational staying power",
            author: "@MemeCultureExpert"
        },
        {
            text: "She's not just a mascot; she's the heartbeat of meme culture",
            author: "@InternetHistorian"
        }
    ]
};

// ========================================
// State Management
// ========================================

const AppState = {
    isLoading: true,
    currentQuote: 0,
    scrollPosition: 0,
    countersAnimated: false,
    modalOpen: false,
    particles: [],
    observers: {}
};

// ========================================
// Utility Functions
// ========================================

const Utils = {
    // Random number generator
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Random integer generator
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Element selector with error handling
    $(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    },
    
    // Multiple element selector
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Throttle function for performance
    throttle: (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },
    
    // Debounce function
    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Animate number counter
    animateCounter: (element, start, end, duration = 2000) => {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current.toLocaleString();
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    },
    
    // Check if element is in viewport
    isInViewport: (element, threshold = 0.1) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const verticallyVisible = rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
        const horizontallyVisible = rect.left <= windowWidth && rect.right >= 0;
        
        return verticallyVisible && horizontallyVisible;
    },
    
    // Smooth scroll to element
    scrollToElement: (element, offset = 0) => {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// ========================================
// Particle System
// ========================================

class Particle {
    constructor(container) {
        this.container = container;
        this.element = this.createElement();
        this.reset();
        this.container.appendChild(this.element);
    }
    
    createElement() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomly assign particle type
        const types = CONFIG.particles.types;
        const type = types[Utils.randomInt(0, types.length - 1)];
        
        if (type !== 'circle') {
            particle.classList.add(type);
        }
        
        return particle;
    }
    
    reset() {
        const size = Utils.random(CONFIG.particles.minSize, CONFIG.particles.maxSize);
        const color = CONFIG.particles.colors[Utils.randomInt(0, CONFIG.particles.colors.length - 1)];
        
        this.x = Utils.random(-10, window.innerWidth + 10);
        this.y = Utils.random(-10, window.innerHeight + 10);
        this.vx = Utils.random(-CONFIG.particles.speed.max, CONFIG.particles.speed.max);
        this.vy = Utils.random(-CONFIG.particles.speed.max, CONFIG.particles.speed.max);
        this.life = Utils.random(3, 8);
        this.age = 0;
        
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.backgroundColor = color;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.animationDuration = `${this.life}s`;
        this.element.style.animationDelay = `${Utils.random(0, 2)}s`;
    }
    
    update() {
        this.age += 0.016; // ~60fps
        
        if (this.age >= this.life) {
            this.reset();
            return;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around screen edges
        if (this.x < -20) this.x = window.innerWidth + 20;
        if (this.x > window.innerWidth + 20) this.x = -20;
        if (this.y < -20) this.y = window.innerHeight + 20;
        if (this.y > window.innerHeight + 20) this.y = -20;
        
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class ParticleSystem {
    constructor() {
        this.container = Utils.$('#particles');
        this.particles = [];
        this.isActive = false;
    }
    
    init() {
        if (!this.container) return;
        
        this.createParticles();
        this.isActive = true;
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < CONFIG.particles.count; i++) {
            this.particles.push(new Particle(this.container));
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.particles.forEach(particle => particle.update());
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.isActive = false;
        this.particles.forEach(particle => particle.destroy());
        this.particles = [];
    }
    
    resize() {
        // Recreate particles on resize for optimal distribution
        this.destroy();
        this.init();
    }
}

// ========================================
// Animation Controller
// ========================================

class AnimationController {
    constructor() {
        this.observers = new Map();
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Special handling for counters
                    if (entry.target.hasAttribute('data-target')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, options);
    }
    
    observeElements() {
        const elements = Utils.$$('.fade-in-up');
        elements.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    animateCounter(element) {
        if (element.dataset.animated) return;
        
        const target = parseInt(element.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
        
        element.dataset.animated = 'true';
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// ========================================
// Gallery Manager
// ========================================

class GalleryManager {
    constructor() {
        this.container = Utils.$('#gallery');
        this.currentIndex = 0;
    }
    
    init() {
        if (!this.container) return;
        this.renderGallery();
    }
    
    renderGallery() {
        const galleryHTML = CONFIG.gallery.images.map((image, index) => `
            <div class="gallery-item fade-in-up" data-index="${index}">
                <img src="${image.src}" alt="${image.title}" class="gallery-image" loading="lazy">
                <div class="gallery-overlay">
                    <h3 class="gallery-title">${image.title}</h3>
                    <p class="gallery-description">${image.description}</p>
                </div>
            </div>
        `).join('');
        
        this.container.innerHTML = galleryHTML;
        
        // Add click handlers for gallery items
        this.container.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                this.openLightbox(parseInt(galleryItem.dataset.index));
            }
        });
    }
    
    openLightbox(index) {
        const image = CONFIG.gallery.images[index];
        if (!image) return;
        
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img src="${image.src}" alt="${image.title}" class="lightbox-image">
                <div class="lightbox-info">
                    <h3 class="lightbox-title">${image.title}</h3>
                    <p class="lightbox-description">${image.description}</p>
                </div>
                <div class="lightbox-nav">
                    <button class="lightbox-prev">❮</button>
                    <span class="lightbox-counter">${index + 1} / ${CONFIG.gallery.images.length}</span>
                    <button class="lightbox-next">❯</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        this.setupLightboxEvents(lightbox, index);
        
        // Animate in
        requestAnimationFrame(() => {
            lightbox.style.opacity = '1';
        });
    }
    
    setupLightboxEvents(lightbox, startIndex) {
        let currentIndex = startIndex;
        
        const close = () => {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        };
        
        const navigate = (direction) => {
            const newIndex = direction === 'next' 
                ? (currentIndex + 1) % CONFIG.gallery.images.length
                : (currentIndex - 1 + CONFIG.gallery.images.length) % CONFIG.gallery.images.length;
            
            currentIndex = newIndex;
            const image = CONFIG.gallery.images[newIndex];
            
            const img = lightbox.querySelector('.lightbox-image');
            const title = lightbox.querySelector('.lightbox-title');
            const description = lightbox.querySelector('.lightbox-description');
            const counter = lightbox.querySelector('.lightbox-counter');
            
            img.src = image.src;
            img.alt = image.title;
            title.textContent = image.title;
            description.textContent = image.description;
            counter.textContent = `${newIndex + 1} / ${CONFIG.gallery.images.length}`;
        };
        
        // Event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', close);
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigate('prev'));
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigate('next'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });
        
        // Keyboard navigation
        const keyHandler = (e) => {
            switch (e.key) {
                case 'Escape':
                    close();
                    break;
                case 'ArrowLeft':
                    navigate('prev');
                    break;
                case 'ArrowRight':
                    navigate('next');
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // Cleanup on close
        const originalClose = close;
        close = () => {
            document.removeEventListener('keydown', keyHandler);
            originalClose();
        };
    }
}

// ========================================
// Quote Carousel
// ========================================

class QuoteCarousel {
    constructor() {
        this.container = Utils.$('.quote-carousel');
        this.currentIndex = 0;
        this.intervalId = null;
    }
    
    init() {
        if (!this.container) return;
        
        this.renderQuotes();
        this.startAutoplay();
    }
    
    renderQuotes() {
        const quotesHTML = CONFIG.quotes.map((quote, index) => `
            <div class="quote ${index === 0 ? 'active' : ''}" data-index="${index}">
                <p>"${quote.text}"</p>
                <cite>– ${quote.author}</cite>
            </div>
        `).join('');
        
        this.container.innerHTML = quotesHTML;
    }
    
    nextQuote() {
        const quotes = this.container.querySelectorAll('.quote');
        
        quotes[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % quotes.length;
        quotes[this.currentIndex].classList.add('active');
    }
    
    startAutoplay() {
        this.intervalId = setInterval(() => {
            this.nextQuote();
        }, 4000);
    }
    
    stopAutoplay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    destroy() {
        this.stopAutoplay();
    }
}

// ========================================
// Modal Manager
// ========================================

class ModalManager {
    constructor() {
        this.modal = Utils.$('#walletModal');
        this.isOpen = false;
    }
    
    init() {
        if (!this.modal) return;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close modal events
        const closeButton = this.modal.querySelector('.close-modal');
        const backdrop = this.modal.querySelector('.modal-backdrop');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open() {
        if (!this.modal || this.isOpen) return;
        
        this.modal.style.display = 'block';
        this.isOpen = true;
        AppState.modalOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = this.modal.querySelector('button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    close() {
        if (!this.modal || !this.isOpen) return;
        
        this.modal.style.display = 'none';
        this.isOpen = false;
        AppState.modalOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// ========================================
// Form Handler
// ========================================

class FormHandler {
    constructor() {
        this.form = Utils.$('#memeSubmissionForm');
    }
    
    init() {
        if (!this.form) return;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    handleSubmit() {
        const formData = new FormData(this.form);
        const data = {
            creatorName: Utils.$('#creatorName').value,
            memeUrl: Utils.$('#memeUrl').value,
            memeDescription: Utils.$('#memeDescription').value
        };
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }
        
        // Show success message
        this.showSuccessMessage();
        
        // Reset form
        this.form.reset();
        
        // In a real application, you would send this data to a server
        console.log('Form submitted:', data);
    }
    
    validateForm(data) {
        const errors = [];
        
        if (!data.creatorName.trim()) {
            errors.push('Creator name is required');
        }
        
        if (!data.memeUrl.trim()) {
            errors.push('Meme URL is required');
        }
        
        if (!data.memeDescription.trim()) {
            errors.push('Description is required');
        }
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }
        
        return true;
    }
    
    showErrors(errors) {
        // Create or update error display
        let errorContainer = Utils.$('.form-errors');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-errors';
            this.form.insertBefore(errorContainer, this.form.firstChild);
        }
        
        errorContainer.innerHTML = `
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        
        // Remove errors after 5 seconds
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.parentNode.removeChild(errorContainer);
            }
        }, 5000);
    }
    
    showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.innerHTML = `
            <p>✨ Thank you for your submission! Your creation has been sent to the KYM-Tan community.</p>
        `;
        
        this.form.insertBefore(successMessage, this.form.firstChild);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 5000);
    }
}

// ========================================
// Scroll Effects
// ========================================

class ScrollEffects {
    constructor() {
        this.progress = Utils.$('.scroll-progress') || this.createProgressBar();
        this.lastScrollY = 0;
        this.ticking = false;
    }
    
    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        return progressBar;
    }
    
    init() {
        this.setupScrollListener();
    }
    
    setupScrollListener() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateScrollProgress();
            this.updateParallaxEffects();
        }, 16)); // ~60fps
    }
    
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        this.progress.style.width = `${scrollPercent}%`;
    }
    
    updateParallaxEffects() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        // Apply parallax to hero background
        const heroBackground = Utils.$('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${parallax}px)`;
        }
    }
}

// ========================================
// Loading Manager
// ========================================

class LoadingManager {
    constructor() {
        this.loadingScreen = Utils.$('#loading');
        this.loadStartTime = Date.now();
    }
    
    init() {
        // Ensure minimum loading time for smooth experience
        const minLoadTime = 1500;
        const loadTime = Date.now() - this.loadStartTime;
        const remainingTime = Math.max(0, minLoadTime - loadTime);
        
        setTimeout(() => {
            this.hide();
        }, remainingTime);
    }
    
    hide() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            AppState.isLoading = false;
            
            // Trigger initialization of other components that need the page to be loaded
            this.onLoadComplete();
        }, 500);
    }
    
    onLoadComplete() {
        // Initialize components that depend on the page being fully loaded
        document.dispatchEvent(new CustomEvent('pageLoaded'));
    }
}

// ========================================
// Wallet Integration
// ========================================

class WalletManager {
    constructor() {
        this.connectedWallet = null;
        this.modalManager = null;
    }
    
    init(modalManager) {
        this.modalManager = modalManager;
    }
    
    async connectPhantom() {
        try {
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect();
                this.connectedWallet = {
                    type: 'phantom',
                    publicKey: response.publicKey.toString()
                };
                this.onWalletConnected();
            } else {
                this.showWalletNotFound('Phantom');
            }
        } catch (error) {
            this.showConnectionError(error);
        }
    }
    
    async connectSolflare() {
        try {
            if (window.solflare && window.solflare.isSolflare) {
                const response = await window.solflare.connect();
                this.connectedWallet = {
                    type: 'solflare',
                    publicKey: response.publicKey.toString()
                };
                this.onWalletConnected();
            } else {
                this.showWalletNotFound('Solflare');
            }
        } catch (error) {
            this.showConnectionError(error);
        }
    }
    
    connectOther() {
        this.showComingSoon();
    }
    
    onWalletConnected() {
        this.modalManager.close();
        this.showSuccessNotification();
        
        // Update UI to show connected state
        this.updateConnectedUI();
    }
    
    showWalletNotFound(walletName) {
        alert(`${walletName} wallet not found. Please install the ${walletName} browser extension.`);
    }
    
    showConnectionError(error) {
        console.error('Wallet connection error:', error);
        alert('Failed to connect wallet. Please try again.');
    }
    
    showComingSoon() {
        alert('Additional wallet integrations coming soon!');
    }
    
    showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'wallet-notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">Wallet connected successfully!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    updateConnectedUI() {
        // Update CTA buttons to show connected state
        const ctaButtons = Utils.$$('.cta-button.primary');
        ctaButtons.forEach(button => {
            if (button.textContent.includes('Join')) {
                button.textContent = 'Connected ✓';
                button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
        });
    }
    
    disconnect() {
        this.connectedWallet = null;
        // Reset UI
        const ctaButtons = Utils.$$('.cta-button.primary');
        ctaButtons.forEach(button => {
            if (button.textContent.includes('Connected')) {
                button.textContent = 'Join the Meme Revolution';
                button.style.background = 'var(--gradient-primary)';
            }
        });
    }
}

// ========================================
// Main Application Class
// ========================================

class KYMTanApp {
    constructor() {
        this.components = {
            loadingManager: new LoadingManager(),
            particleSystem: new ParticleSystem(),
            animationController: new AnimationController(),
            galleryManager: new GalleryManager(),
            quoteCarousel: new QuoteCarousel(),
            modalManager: new ModalManager(),
            formHandler: new FormHandler(),
            scrollEffects: new ScrollEffects(),
            walletManager: new WalletManager()
        };
        
        this.isInitialized = false;
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Initialize loading manager first
        this.components.loadingManager.init();
        
        // Initialize other components when page is loaded
        document.addEventListener('pageLoaded', () => {
            this.initializeComponents();
        });
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        this.isInitialized = true;
    }
    
    initializeComponents() {
        // Initialize all components
        Object.entries(this.components).forEach(([name, component]) => {
            if (name !== 'loadingManager' && typeof component.init === 'function') {
                try {
                    component.init();
                } catch (error) {
                    console.error(`Failed to initialize ${name}:`, error);
                }
            }
        });
        
        // Setup component connections
        this.components.walletManager.init(this.components.modalManager);
        
        // Start animations and effects
        this.components.animationController.observeElements();
    }
    
    setupGlobalEventListeners() {
        // Window resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    Utils.scrollToElement(target, 80);
                }
            }
        });
    }
    
    handleResize() {
        if (this.components.particleSystem.isActive) {
            this.components.particleSystem.resize();
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            this.components.quoteCarousel.stopAutoplay();
        } else {
            // Resume animations when tab becomes visible
            this.components.quoteCarousel.startAutoplay();
        }
    }
    
    destroy() {
        // Cleanup all components
        Object.values(this.components).forEach(component => {
            if (typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.isInitialized = false;
    }
}

// ========================================
// Global Functions (for HTML onclick handlers)
// ========================================

function openModal() {
    if (window.kymTanApp && window.kymTanApp.components.modalManager) {
        window.kymTanApp.components.modalManager.open();
    }
}

function closeModal() {
    if (window.kymTanApp && window.kymTanApp.components.modalManager) {
        window.kymTanApp.components.modalManager.close();
    }
}

function connectPhantom() {
    if (window.kymTanApp && window.kymTanApp.components.walletManager) {
        window.kymTanApp.components.walletManager.connectPhantom();
    }
}

function connectSolflare() {
    if (window.kymTanApp && window.kymTanApp.components.walletManager) {
        window.kymTanApp.components.walletManager.connectSolflare();
    }
}

function connectOther() {
    if (window.kymTanApp && window.kymTanApp.components.walletManager) {
        window.kymTanApp.components.walletManager.connectOther();
    }
}

// ========================================
// Application Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.kymTanApp = new KYMTanApp();
    
    // Initialize the application
    window.kymTanApp.init();
    
    // Development helpers
    if (process?.env?.NODE_ENV === 'development') {
        window.KYMTanDebug = {
            app: window.kymTanApp,
            utils: Utils,
            config: CONFIG,
            state: AppState
        };
        console.log('KYM-Tan Debug Tools available at window.KYMTanDebug');
    }
});

// ========================================
// Error Handling
// ========================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // In production, you might want to send errors to a logging service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Prevent the default browser behavior
    e.preventDefault();
});

// ========================================
// Performance Monitoring
// ========================================

if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load performance:', {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        }, 0);
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KYMTanApp, Utils, CONFIG };
}