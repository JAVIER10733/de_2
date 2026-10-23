/* ======================================================================
   FUNCIONALIDAD PRINCIPAL ULTRA PROFESIONAL (Optimizado)
   ====================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initWelcomeModal();
    initNavigation();
    initScrollIndicator();
    initBackToTop();
    initParticles();
    initMobileMenu();
    initScrollAnimations();
    initEasterEgg();
    initCounter();
});

/* ----------------------------------------
   1. MODAL DE BIENVENIDA
   ---------------------------------------- */
function initWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (!modal) return;

    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    } else {
        modal.classList.add('hidden');
    }
}

window.closeModal = function() {
    const modal = document.getElementById('welcomeModal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restaurar scroll
    sessionStorage.setItem('hasVisited', 'true');
    
    // Efecto de entrada suave para el contenido principal
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.animation = 'none';
            heroContent.offsetHeight; /* Trigger reflow */
            heroContent.style.animation = 'blur-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
        
        // Intentar reproducir música si existe la función
        if (typeof window.playMusic === 'function') {
            window.playMusic();
        }
    }, 300);
};

/* ----------------------------------------
   2. NAVEGACIÓN INTELIGENTE Y SCROLL SUAVE
   ---------------------------------------- */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!nav) return;

    let lastScroll = 0;
    
    // Mostrar/ocultar navbar al hacer scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 100) {
            nav.classList.add('visible', 'scrolled');
        } else {
            nav.classList.remove('visible', 'scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // Scroll suave a las secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80; // Altura del navbar fijo
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Cerrar menú móvil automáticamente al hacer clic
            closeMobileMenu();
        });
    });
}

/* ----------------------------------------
   3. INDICADOR DE SCROLL (Mouse animado)
   ---------------------------------------- */
function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (!scrollIndicator) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.visibility = 'hidden';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.visibility = 'visible';
        }
    }, { passive: true });
}

/* ----------------------------------------
   4. BOTÓN VOLVER ARRIBA
   ---------------------------------------- */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, { passive: true });
}

window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ----------------------------------------
   5. MENÚ MÓVIL (Con animación de icono)
   ---------------------------------------- */
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isActive);
        
        // Cambiar icono SVG de Menú a X y viceversa
        const iconUse = navToggle.querySelector('use');
        if (iconUse) {
            iconUse.setAttribute('href', isActive ? '#icon-close' : '#icon-menu');
        }
    });
}

window.closeMobileMenu = function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (navToggle) {
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            const iconUse = navToggle.querySelector('use');
            if (iconUse) iconUse.setAttribute('href', '#icon-menu');
        }
    }
};

/* ----------------------------------------
   6. SISTEMA DE PARTÍCULAS CON BRILLO
   ---------------------------------------- */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    // Reducir partículas en móviles para mejor rendimiento
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const particleCount = isMobile ? 15 : 35;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const isSparkle = Math.random() > 0.7;
    particle.className = `particle ${isSparkle ? 'sparkle' : ''}`;
    
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 15 + 15;
    const delay = Math.random() * 10;
    
    Object.assign(particle.style, {
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity: Math.random() * 0.4 + 0.1
    });
    
    container.appendChild(particle);
    
    // Reciclar partícula al terminar la animación
    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, (duration + delay) * 1000);
}

/* ----------------------------------------
   7. ANIMACIONES AL HACER SCROLL (Intersection Observer)
   ---------------------------------------- */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(
        '.poem-container, .photo-card, .timeline-item, .promise-item, .reason-card, .future-card, .wish-card, .quote-card, .star-card, .moment-card, .song-item, .guest-entry, .counter-item'
    );
    
    elementsToAnimate.forEach(el => observer.observe(el));
}

/* ----------------------------------------
   8. EASTER EGG: CÓDIGO KONAMI
   ---------------------------------------- */
function initEasterEgg() {
    let konamiCode = [];
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10); // Mantener solo los últimos 10
        
        if (konamiCode.join(',') === secretCode.join(',')) {
            createHeartRain();
            konamiCode = []; // Resetear
            
            // Mensaje secreto en consola
            console.log('%c🐾 ¡Secreto desbloqueado! Eres increíble. 🐾', 'font-size: 20px; color: #FFD700; font-weight: bold;');
        }
    });
}

function createHeartRain() {
    const hearts = ['❤️', '💕', '💖', '💗', '💓', '🐾'];
    const container = document.body;
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            Object.assign(heart.style, {
                position: 'fixed',
                left: `${Math.random() * 100}vw`,
                top: '-50px',
                fontSize: `${Math.random() * 30 + 20}px`,
                color: '#C41E3A',
                pointerEvents: 'none',
                zIndex: '9999',
                animation: `fallHeart ${Math.random() * 3 + 2}s linear forwards`,
                textShadow: '0 0 10px rgba(196, 30, 58, 0.8)'
            });
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 5000);
        }, i * 50); // Más rápido para mayor impacto
    }
}

// Inyectar estilo del Easter Egg si no existe
if (!document.getElementById('easter-egg-style')) {
    const style = document.createElement('style');
    style.id = 'easter-egg-style';
    style.textContent = `@keyframes fallHeart { to { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`;
    document.head.appendChild(style);
}

// Mensaje para desarrolladores curiosos
console.log('%c🐾 ¡Hola! 🐾', 'font-size: 30px; color: #C41E3A; font-weight: bold; text-shadow: 2px 2px 0px #000;');
console.log('%cEsta web fue hecha con mucho amor. ¿Encontraste el secreto? Prueba: ↑ ↑ ↓ ↓ ← → ← → B A', 'font-size: 14px; color: #9E9E9E; font-style: italic;');

/* ----------------------------------------
   9. CONTADOR DE TIEMPO (Optimizado sin parpadeos)
   ---------------------------------------- */
function initCounter() {
    // Fecha especial: 14 de Febrero de 2026 a las 00:00
    const startDate = new Date('2026-02-14T00:00:00').getTime();
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;

    function updateCounter() {
        const now = new Date().getTime();
        const diff = now - startDate;
        
        // Si la fecha es futura, mostrar countdown (valores absolutos)
        const absDiff = Math.abs(diff);
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
        
        // Actualizar solo si el valor cambió para evitar animaciones innecesarias
        updateNumberElement(daysElement, days);
        updateNumberElement(hoursElement, hours);
        updateNumberElement(minutesElement, minutes);
        updateNumberElement(secondsElement, seconds);
    }
    
    function updateNumberElement(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue !== newValue) {
            // Animación sutil de cambio
            element.style.transform = 'translateY(-5px)';
            element.style.opacity = '0.7';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            }, 150);
        }
    }
    
    updateCounter();
    setInterval(updateCounter, 1000);
}