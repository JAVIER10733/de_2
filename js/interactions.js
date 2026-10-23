/* ======================================================================
   INTERACCIONES AVANZADAS Y FUNCIONALIDADES (Ultra Premium)
   ====================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initEnvelope();
    initPhotoCards();
    initSmoothReveal();
    initParallaxEffect();
    initPhotoUpload();
    loadMoments();
    loadGuestbook();
    initHeartPop(); // <--- NUEVO: Efecto mágico al hacer clic
});

/* ----------------------------------------
   1. SOBRE / CARTA INTERACTIVA
   ---------------------------------------- */
function initEnvelope() {
    const envelopeContainer = document.querySelector('.envelope-container');
    const envelope = document.getElementById('envelope');
    
    if (envelopeContainer && envelope) {
        // Permitir apertura con clic o tecla Enter/Espacio (Accesibilidad)
        const toggleAction = (e) => {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            envelope.classList.toggle('open');
            
            // Lanzar confeti suave al abrir la carta
            if (envelope.classList.contains('open')) {
                setTimeout(() => launchConfetti(), 300);
            }
        };

        envelopeContainer.addEventListener('click', toggleAction);
        envelopeContainer.addEventListener('keydown', toggleAction);
    }
}

/* ----------------------------------------
   2. TARJETAS DE FOTOS (FLIP + TILT 3D)
   ---------------------------------------- */
function initPhotoCards() {
    const photoCards = document.querySelectorAll('.photo-card');
    
    photoCards.forEach(card => {
        // Click para voltear (móvil y desktop)
        card.addEventListener('click', function(e) {
            // Evitar que el clic en el botón de eliminar (si lo hubiera) voltee la carta
            if (e.target.closest('.moment-delete-btn')) return;
            this.classList.toggle('flipped');
        });
        
        // Efecto Tilt 3D solo en desktop (mejor rendimiento)
        if (window.matchMedia('(min-width: 1024px)').matches) {
            card.addEventListener('mousemove', function(e) {
                if (this.classList.contains('flipped')) return; // No inclinar si ya está volteada
                
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Limitar la rotación a un máximo de 15 grados para que sea sutil
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                this.querySelector('.photo-card-inner').style.transform = 
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('flipped')) {
                    this.querySelector('.photo-card-inner').style.transform = 
                        'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                }
            });
        }
    });
}

/* ----------------------------------------
   3. REVEAL SUAVE DE TEXTO AL SCROLL
   ---------------------------------------- */
function initSmoothReveal() {
    // Solo aplicamos a elementos que no tengan ya una animación de entrada CSS
    const revealElements = document.querySelectorAll('.final-line, .timeline-content, .promise-item');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => {
        // Solo aplicar si no está ya animado por CSS
        if (!el.style.animation) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            revealObserver.observe(el);
        }
    });
}

/* ----------------------------------------
   4. EFECTO PARALLAX SUTIL EN HERO
   ---------------------------------------- */
function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection || !window.matchMedia('(min-width: 1024px)').matches) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const heroContent = heroSection.querySelector('.hero-content');
                const heroSnoopy = heroSection.querySelector('.hero-snoopy');
                
                if (scrolled < window.innerHeight) {
                    if (heroContent) {
                        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                        heroContent.style.opacity = 1 - (scrolled / 700);
                    }
                    if (heroSnoopy) {
                        heroSnoopy.style.transform = `translateY(${scrolled * 0.15}px)`;
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ========================================
   5. SISTEMA DE SUBIDA DE FOTOS (LOCALSTORAGE)
   ======================================== */
let currentPhotoData = null;

function initPhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    if (!photoUpload) return;

    photoUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecciona una imagen válida 📷', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La imagen es muy grande. Máximo 5MB ⚠️', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                currentPhotoData = { src: event.target.result, name: file.name };
                
                const uploadModal = document.getElementById('uploadModal');
                const uploadPreview = document.getElementById('uploadPreview');
                const photoDescription = document.getElementById('photoDescription');
                
                if (uploadPreview) uploadPreview.src = event.target.result;
                if (uploadModal) uploadModal.classList.add('visible');
                if (photoDescription) {
                    photoDescription.value = '';
                    setTimeout(() => photoDescription.focus(), 100);
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

window.closeUploadModal = function() {
    const uploadModal = document.getElementById('uploadModal');
    const photoUpload = document.getElementById('photoUpload');
    const photoDescription = document.getElementById('photoDescription');
    
    if (uploadModal) uploadModal.classList.remove('visible');
    currentPhotoData = null;
    if (photoUpload) photoUpload.value = '';
    if (photoDescription) photoDescription.value = '';
};

window.confirmUpload = function() {
    if (!currentPhotoData) return;
    
    const photoDescription = document.getElementById('photoDescription');
    const description = photoDescription ? photoDescription.value.trim() : 'Un momento especial';
    const finalDesc = description || 'Un momento especial';
    
    const momentsGrid = document.getElementById('momentsGrid');
    const emptyMoments = document.getElementById('emptyMoments');
    
    if (emptyMoments) emptyMoments.style.display = 'none';
    
    const momentCard = document.createElement('div');
    momentCard.className = 'moment-card';
    momentCard.style.animation = 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    
    momentCard.innerHTML = `
        <div class="moment-image-container">
            <img src="${currentPhotoData.src}" alt="${finalDesc}" class="moment-image" loading="lazy">
            <button class="moment-delete-btn" onclick="deleteMoment(this)" title="Eliminar" aria-label="Eliminar momento">
                <span>✕</span>
            </button>
        </div>
        <div class="moment-content">
            <p class="moment-description">${finalDesc}</p>
            <span class="moment-date">${getCurrentDate()}</span>
        </div>
    `;
    
    if (momentsGrid) {
        momentsGrid.insertBefore(momentCard, momentsGrid.firstChild);
    }
    
    window.closeUploadModal();
    saveMoments();
    showNotification('¡Foto agregada con éxito! ❤', 'success');
};

window.deleteMoment = function(button) {
    if (confirm('¿Seguro que quieres eliminar este recuerdo?')) {
        const momentCard = button.closest('.moment-card');
        momentCard.style.animation = 'fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        
        setTimeout(() => {
            momentCard.remove();
            const momentsGrid = document.getElementById('momentsGrid');
            const emptyMoments = document.getElementById('emptyMoments');
            
            if (momentsGrid && momentsGrid.children.length === 0 && emptyMoments) {
                emptyMoments.style.display = 'block';
            }
            saveMoments();
            showNotification('Recuerdo eliminado', 'success');
        }, 400);
    }
};

function getCurrentDate() {
    return new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
}

function saveMoments() {
    const momentsGrid = document.getElementById('momentsGrid');
    if (!momentsGrid) return;
    
    const moments = [];
    momentsGrid.querySelectorAll('.moment-card').forEach(card => {
        const img = card.querySelector('.moment-image');
        const desc = card.querySelector('.moment-description');
        const date = card.querySelector('.moment-date');
        
        if (img && desc && date) {
            moments.push({ src: img.src, description: desc.textContent, date: date.textContent });
        }
    });
    
    try {
        localStorage.setItem('savedMoments', JSON.stringify(moments));
    } catch (e) {
        console.warn('LocalStorage lleno. No se pudieron guardar más fotos.');
        showNotification('⚠️ Memoria del navegador llena. Elimina algunas fotos antiguas.', 'error');
    }
}

function loadMoments() {
    const savedMoments = localStorage.getItem('savedMoments');
    if (!savedMoments) return;
    
    try {
        const moments = JSON.parse(savedMoments);
        const momentsGrid = document.getElementById('momentsGrid');
        const emptyMoments = document.getElementById('emptyMoments');
        
        if (!momentsGrid) return;

        if (moments.length > 0) {
            if (emptyMoments) emptyMoments.style.display = 'none';
            
            moments.forEach(moment => {
                const momentCard = document.createElement('div');
                momentCard.className = 'moment-card';
                momentCard.innerHTML = `
                    <div class="moment-image-container">
                        <img src="${moment.src}" alt="${moment.description}" class="moment-image" loading="lazy" onerror="this.style.display='none'">
                        <button class="moment-delete-btn" onclick="deleteMoment(this)" title="Eliminar" aria-label="Eliminar momento">
                            <span>✕</span>
                        </button>
                    </div>
                    <div class="moment-content">
                        <p class="moment-description">${moment.description}</p>
                        <span class="moment-date">${moment.date}</span>
                    </div>
                `;
                momentsGrid.appendChild(momentCard);
            });
        } else if (emptyMoments) {
            emptyMoments.style.display = 'block';
        }
    } catch (e) {
        console.error('Error al cargar momentos:', e);
    }
}

/* ========================================
   6. LIBRO DE VISITAS (SEGURO Y OPTIMIZADO)
   ======================================== */
window.addGuestEntry = function() {
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    const entriesContainer = document.getElementById('guestbookEntries');
    
    if (!nameInput || !messageInput || !entriesContainer) return;
    
    const name = nameInput.value.trim() || 'Anónimo';
    const message = messageInput.value.trim();
    
    if (!message) {
        showNotification('Por favor, escribe un mensaje antes de enviar ✍️', 'error');
        return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const entryDiv = document.createElement('div');
    entryDiv.className = 'guest-entry';
    entryDiv.style.animation = 'fadeInUp 0.5s ease-out forwards';
    
    // Usamos textContent para prevenir XSS de forma nativa y segura
    entryDiv.innerHTML = `
        <div class="guest-entry-header">
            <span class="guest-entry-name">🐾 <span class="safe-name"></span></span>
            <span class="guest-entry-date"></span>
        </div>
        <div class="guest-entry-message safe-message"></div>
    `;
    
    entryDiv.querySelector('.safe-name').textContent = name;
    entryDiv.querySelector('.safe-message').textContent = message;
    entryDiv.querySelector('.guest-entry-date').textContent = dateStr;
    
    entriesContainer.insertBefore(entryDiv, entriesContainer.firstChild);
    
    nameInput.value = '';
    messageInput.value = '';
    
    saveGuestbook();
    showNotification('¡Mensaje dejado con éxito! ❤', 'success');
};

function saveGuestbook() {
    const entriesContainer = document.getElementById('guestbookEntries');
    if (!entriesContainer) return;
    
    const entries = [];
    entriesContainer.querySelectorAll('.guest-entry').forEach(entry => {
        entries.push({
            name: entry.querySelector('.safe-name').textContent,
            message: entry.querySelector('.safe-message').textContent,
            date: entry.querySelector('.guest-entry-date').textContent
        });
    });
    
    localStorage.setItem('guestbookEntries', JSON.stringify(entries));
}

function loadGuestbook() {
    const saved = localStorage.getItem('guestbookEntries');
    if (!saved) return;
    
    try {
        const entries = JSON.parse(saved);
        const entriesContainer = document.getElementById('guestbookEntries');
        if (!entriesContainer) return;
        
        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'guest-entry';
            entryDiv.innerHTML = `
                <div class="guest-entry-header">
                    <span class="guest-entry-name">🐾 <span class="safe-name"></span></span>
                    <span class="guest-entry-date"></span>
                </div>
                <div class="guest-entry-message safe-message"></div>
            `;
            entryDiv.querySelector('.safe-name').textContent = entry.name;
            entryDiv.querySelector('.safe-message').textContent = entry.message;
            entryDiv.querySelector('.guest-entry-date').textContent = entry.date;
            
            entriesContainer.appendChild(entryDiv);
        });
    } catch (e) {
        console.error('Error al cargar el libro de visitas:', e);
    }
}

/* ========================================
   7. UTILIDADES Y EFECTOS MÁGICOS
   ======================================== */

// Notificaciones Toast (Elegantes y no intrusivas)
function showNotification(message, type = 'success') {
    // Crear contenedor si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';
    const icon = type === 'success' ? '✅' : '⚠️';
    
    toast.style.cssText = `
        background: ${bgColor}; color: white; padding: 12px 24px; border-radius: 50px;
        font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3); backdrop-filter: blur(10px);
        display: flex; align-items: center; gap: 8px; pointer-events: auto;
        animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Efecto Mágico: Corazones al hacer clic en cualquier parte
function initHeartPop() {
    document.addEventListener('click', (e) => {
        // Ignorar clics en botones o inputs para no interferir
        if (e.target.closest('button, input, textarea, a')) return;

        const heart = document.createElement('div');
        heart.innerHTML = ['❤️', '💖', '💕', '✨'][Math.floor(Math.random() * 4)];
        heart.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            font-size: ${Math.random() * 15 + 15}px;
            pointer-events: none;
            z-index: 9999;
            animation: heartFloat 1.5s ease-out forwards;
        `;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
    });

    // Inyectar animación si no existe
    if (!document.getElementById('heart-pop-style')) {
        const style = document.createElement('style');
        style.id = 'heart-pop-style';
        style.textContent = `
            @keyframes heartFloat {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                50% { transform: translate(-50%, -100px) scale(1.2); opacity: 0.8; }
                100% { transform: translate(-50%, -150px) scale(1); opacity: 0; }
            }
            @keyframes slideUpFade {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideDownFade {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(20px); opacity: 0; }
            }
            @keyframes fadeOut { 
                from { opacity: 1; transform: scale(1); } 
                to { opacity: 0; transform: scale(0.9); } 
            }
        `;
        document.head.appendChild(style);
    }
}