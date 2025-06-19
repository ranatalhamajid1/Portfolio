// Enhanced Portfolio Script with Google Form Integration
// Author: Rana Muhammad Talha Majid
// Updated: June 2025

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.currentTheme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        this.updateNavbarBackground();
    }

    updateThemeIcon(theme) {
        this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    updateNavbarBackground() {
        const navbar = document.getElementById('navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.style.background = this.currentTheme === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.background = this.currentTheme === 'dark' 
                ? 'rgba(15, 23, 42, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)';
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Active link highlighting
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    handleSmoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateActiveLink() {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
}

// Typing Effect
class TypingEffect {
    constructor() {
        this.typingText = document.getElementById('typing-text');
        this.texts = [
    'Cybersecurity Expert',
    'Full Stack Developer', 
    'Shopify Developer',
    'Frontend Specialist',
    'Security Researcher',
    'Analytics Expert',
    'Digital Innovator'
];
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        this.typeWriter();
    }

    typeWriter() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.typingText.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.typingText.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            setTimeout(() => this.isDeleting = true, 1500);
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
        }
        
        const typingSpeed = this.isDeleting ? 50 : 100;
        setTimeout(() => this.typeWriter(), typingSpeed);
    }
}

// Scroll Effects Manager
class ScrollEffectsManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.lastScrollTop = 0;
        this.themeManager = null;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
            this.handleScrollToTop();
            this.handleParallax();
        });

        this.scrollToTopBtn.addEventListener('click', () => this.scrollToTop());
    }

    setThemeManager(themeManager) {
        this.themeManager = themeManager;
    }

    handleNavbarScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navbar on scroll
        if (scrollTop > this.lastScrollTop && scrollTop > 100) {
            this.navbar.style.transform = 'translateY(-100%)';
        } else {
            this.navbar.style.transform = 'translateY(0)';
        }
        
        this.lastScrollTop = scrollTop;
        
        // Update navbar background
        if (this.themeManager) {
            this.themeManager.updateNavbarBackground();
        }
    }

    handleScrollToTop() {
        if (window.pageYOffset > 300) {
            this.scrollToTopBtn.classList.add('visible');
        } else {
            this.scrollToTopBtn.classList.remove('visible');
        }
    }

    handleParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-icon');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupCardAnimations();
        this.setupCounterAnimation();
        this.setupSkillProgressAnimation();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('about')) {
                        this.animateCounters();
                    }
                    
                    if (entry.target.classList.contains('skills')) {
                        this.animateSkillProgress();
                    }
                }
            });
        }, this.observerOptions);

        // Observe sections and elements
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('scroll-animation');
            observer.observe(section);
        });
        // Add these lines to observe the new elements:
        document.querySelectorAll('.timeline-item, .cert-card').forEach(card => {
        card.classList.add('scroll-animation');
        observer.observe(card);
});
        document.querySelectorAll('.about-card, .skill-category, .project-card, .stat-card, .achievement-card').forEach(card => {
            card.classList.add('scroll-animation');
            observer.observe(card);
        });
    }

    setupCardAnimations() {
        // 3D Tilt Effect for Cards
        document.querySelectorAll('.project-card, .skill-category, .about-card, .achievement-card').forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleCardTilt(e, card));
            card.addEventListener('mouseleave', () => this.resetCardTilt(card));
        });
    }

    handleCardTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    }

    resetCardTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }

    setupCounterAnimation() {
        this.countersAnimated = false;
    }

    animateCounters() {
        if (this.countersAnimated) return;
        
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                counter.textContent = Math.floor(current);
                
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                }
            }, 20);
        });
        
        this.countersAnimated = true;
    }

    setupSkillProgressAnimation() {
        this.skillsAnimated = false;
    }

    animateSkillProgress() {
        if (this.skillsAnimated) return;
        
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.setProperty('--progress-width', `${level}%`);
            bar.style.width = `${level}%`;
            bar.classList.add('animate');
        });
        
        this.skillsAnimated = true;
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 3;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.addNotification(notification);
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: ${20 + (this.notifications.length * 80)}px;
            right: 20px;
            background: ${this.getColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInFromRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }

    addNotification(notification) {
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }
        
        this.notifications.push(notification);
        document.body.appendChild(notification);
        this.updateNotificationPositions();
    }

    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
            notification.style.animation = 'slideOutToRight 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.updateNotificationPositions();
            }, 300);
        }
    }

    updateNotificationPositions() {
        this.notifications.forEach((notification, index) => {
            notification.style.top = `${20 + (index * 80)}px`;
        });
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    getColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
}

// Update your ContactFormManager class in script.js
class ContactFormManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScsq6U_lIhOB22Ts1UfFHQRpHDv1iGvdTrJL7TlXwSj5rvXxA/viewform';
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.trackFormInteractions();
        this.setupAlternativeContact();
        this.monitorFormLoad();
    }

    setupFormValidation() {
        const iframe = document.querySelector('.google-form-embed iframe');
        if (iframe) {
            iframe.addEventListener('load', () => {
                this.notificationManager.show('Contact form loaded successfully! 📝', 'success');
                this.updateFormStatus('loaded');
            });

            iframe.addEventListener('error', () => {
                this.notificationManager.show('Form loading failed. Please use the direct link.', 'error');
                this.updateFormStatus('error');
            });
        }
    }

    trackFormInteractions() {
        // Track form alternative link clicks
        const formLink = document.querySelector('.form-link');
        if (formLink) {
            formLink.addEventListener('click', () => {
                this.notificationManager.show('Opening contact form in new tab...', 'info');
                this.trackContactAttempt('external_form');
            });
        }

        // Track quick contact button clicks
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = this.getContactType(btn);
                this.trackContactAttempt(type);
                
                if (type === 'email') {
                    this.notificationManager.show('Opening email client...', 'info');
                } else if (type === 'linkedin') {
                    this.notificationManager.show('Opening LinkedIn profile...', 'info');
                } else if (type === 'github') {
                    this.notificationManager.show('Opening GitHub profile...', 'info');
                } else if (type === 'portfolio') {
                    this.notificationManager.show('Opening portfolio drive...', 'info');
                }
            });
        });
    }

    setupAlternativeContact() {
        // Add a fallback contact method
        const formContainer = document.querySelector('.contact-form-container');
        if (formContainer) {
            // Add form loading timeout
            setTimeout(() => {
                const iframe = document.querySelector('.google-form-embed iframe');
                if (iframe && !iframe.contentDocument) {
                    this.showFallbackMessage();
                }
            }, 5000);
        }
    }

    monitorFormLoad() {
        const iframe = document.querySelector('.google-form-embed iframe');
        let loadStartTime = Date.now();
        
        if (iframe) {
            iframe.onload = () => {
                const loadTime = Date.now() - loadStartTime;
                console.log(`Contact form loaded in ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    this.notificationManager.show('Form loaded (slow connection detected)', 'warning');
                } else {
                    this.notificationManager.show('Contact form ready! 🚀', 'success');
                }
            };
        }
    }

    updateFormStatus(status) {
        const statusElement = document.getElementById('form-status');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            
            if (status === 'loaded') {
                indicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Form loaded and ready for messages</span>';
                indicator.style.color = '#10b981';
            } else if (status === 'error') {
                indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Please use direct link if form doesn\'t load</span>';
                indicator.style.color = '#f59e0b';
            }
        }
    }

    showFallbackMessage() {
        const formContainer = document.querySelector('.contact-form-container');
        if (formContainer) {
            const fallbackHTML = `
                <div class="form-fallback">
                    <div class="fallback-content">
                        <i class="fas fa-envelope-open-text"></i>
                        <h4>Having trouble with the form?</h4>
                        <p>No worries! You can contact me directly:</p>
                        <div class="fallback-options">
                            <a href="mailto:talhamajid404@gmail.com?subject=Portfolio Contact&body=Hi Talha,%0D%0A%0D%0AI'm interested in discussing..." class="fallback-btn primary">
                                <i class="fas fa-envelope"></i> Send Email
                            </a>
                            <a href="${this.googleFormUrl}" target="_blank" class="fallback-btn secondary">
                                <i class="fas fa-external-link-alt"></i> Open Form
                            </a>
                        </div>
                    </div>
                </div>
            `;
            formContainer.insertAdjacentHTML('beforeend', fallbackHTML);
        }
    }

    getContactType(button) {
        if (button.href.includes('mailto:')) return 'email';
        if (button.href.includes('linkedin.com')) return 'linkedin';
        if (button.href.includes('github.com')) return 'github';
        if (button.href.includes('drive.google.com')) return 'portfolio';
        return 'unknown';
    }

    trackContactAttempt(type) {
        console.log(`Contact attempt: ${type} at ${new Date().toISOString()}`);
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_attempt', {
                contact_method: type,
                timestamp: new Date().toISOString()
            });
        }
    }
}
// Resume Download Manager
class ResumeManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.resumeBtn = document.getElementById('resume-btn');
        this.init();
    }

    init() {
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', (e) => this.handleResumeDownload(e));
        }
    }

    async handleResumeDownload(e) {
        e.preventDefault();
        
        try {
            // Track download attempt
            this.trackDownload();
            
            // Create download link
            const link = document.createElement('a');
            link.href = 'resume.pdf'; // Make sure this file exists in your repository
            link.download = 'Rana_Muhammad_Talha_Majid_Resume.pdf';
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.notificationManager.show('Resume download started!', 'success');
            
        } catch (error) {
            console.error('Resume download error:', error);
            this.notificationManager.show('Resume download failed. Please try again.', 'error');
        }
    }

    trackDownload() {
        console.log(`Resume downloaded at ${new Date().toISOString()}`);
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'file_download', {
                file_name: 'Rana_Muhammad_Talha_Majid_Resume.pdf',
                timestamp: new Date().toISOString()
            });
        }
    }
}

// Loading Manager
class LoadingManager {
    constructor() {
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.init();
    }

    init() {
        // Hide loading spinner when page is fully loaded
        window.addEventListener('load', () => {
            this.hideLoading();
        });

        // Fallback: hide loading spinner after 3 seconds
        setTimeout(() => {
            this.hideLoading();
        }, 3000);
    }

    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
            setTimeout(() => {
                this.loadingSpinner.style.display = 'none';
            }, 500);
        }
        
        // Add loading animation to body
        document.body.classList.add('loading');
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.logPerformanceMetrics();
        });
    }

    logPerformanceMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paintEntries = performance.getEntriesByType('paint');
            
            console.log('Performance Metrics:', {
                pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
                firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime
            });
        }
    }
}

// Main Portfolio App
class PortfolioApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Initialize loading manager first
        this.components.loading = new LoadingManager();
        
        // Initialize notification system
        this.components.notifications = new NotificationManager();
        
        // Initialize core components
        this.components.theme = new ThemeManager();
        this.components.navigation = new NavigationManager();
        this.components.typing = new TypingEffect();
        this.components.scrollEffects = new ScrollEffectsManager();
        this.components.animations = new AnimationManager();
        this.components.contactForm = new ContactFormManager(this.components.notifications);
        this.components.resume = new ResumeManager(this.components.notifications);
        this.components.performance = new PerformanceMonitor();
        
        // Link theme manager to scroll effects
        this.components.scrollEffects.setThemeManager(this.components.theme);
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Show welcome notification
        setTimeout(() => {
            this.components.notifications.show('Welcome to my portfolio! 👋', 'success');
        }, 2000);
        
        console.log('Portfolio App initialized successfully!');
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Portfolio App Error:', e.error);
            this.components.notifications.show('Something went wrong. Please refresh the page.', 'error');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.components.notifications.show('An error occurred. Please try again.', 'error');
        });
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Add additional utility functions
const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Format date for display
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, Utils };
}