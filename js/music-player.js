/* ======================================================================
   REPRODUCTOR DE MÚSICA DE ALTO RENDIMIENTO (Optimizado y Completo)
   ====================================================================== */

let audioPlayer, playBtn, pauseBtn, vinylRecord, visualizerBars;

document.addEventListener('DOMContentLoaded', () => {
    initMusicPlayer();
});

function initMusicPlayer() {
    audioPlayer = document.getElementById('audio-player');
    playBtn = document.getElementById('play-btn');
    pauseBtn = document.getElementById('pause-btn');
    vinylRecord = document.getElementById('vinylRecord');
    visualizerBars = document.querySelectorAll('.bar');
    
    if (!audioPlayer) {
        console.warn('⚠️ Elemento de audio no encontrado. El reproductor está desactivado.');
        return;
    }

    // Configuración inicial de volumen (60% para no ser invasivo)
    audioPlayer.volume = 0.6;

    // Manejo elegante de errores de carga
    audioPlayer.addEventListener('error', () => {
        console.error('❌ Error al cargar el audio. Verifica la ruta (ej: audio/cancion.mp3)');
        if (playBtn) {
            playBtn.innerHTML = '<span class="btn-icon">⚠️</span><span class="btn-text">Audio no encontrado</span>';
            playBtn.style.opacity = '0.5';
            playBtn.style.pointerEvents = 'none';
            playBtn.style.borderColor = 'var(--color-light-gray, #6B6B6B)';
        }
        notifyUser('No se pudo cargar la canción. Revisa la carpeta "audio/".', 'error');
    });

    // Event Listeners
    if (playBtn) playBtn.addEventListener('click', window.playMusic);
    if (pauseBtn) pauseBtn.addEventListener('click', window.pauseMusic);
    
    // Cuando la canción termina, volver al estado de pausa
    audioPlayer.addEventListener('ended', () => {
        window.pauseMusic();
        audioPlayer.currentTime = 0; // Reiniciar al principio
    });
    
    // Pausar animaciones del visualizador inicialmente
    if (visualizerBars) {
        visualizerBars.forEach(bar => bar.style.animationPlayState = 'paused');
    }
}

/* ========================================
   CONTROLES DE REPRODUCCIÓN GLOBALES
   ======================================== */

window.playMusic = function() {
    if (!audioPlayer) return;
    
    audioPlayer.play().then(() => {
        // Transición suave del botón Play (desaparece)
        if (playBtn) {
            playBtn.style.opacity = '0';
            playBtn.style.transform = 'scale(0.9)';
            setTimeout(() => { playBtn.style.display = 'none'; }, 200);
        }
        
        // Transición suave del botón Pause (aparece)
        if (pauseBtn) {
            pauseBtn.style.display = 'flex';
            // Pequeño delay para permitir que el display:flex se renderice antes de la opacidad
            setTimeout(() => {
                pauseBtn.style.opacity = '1';
                pauseBtn.style.transform = 'scale(1)';
            }, 10);
        }
        
        // Activar animaciones
        if (vinylRecord) vinylRecord.classList.add('playing');
        if (visualizerBars) {
            visualizerBars.forEach(bar => bar.style.animationPlayState = 'running');
        }
    }).catch(error => {
        console.log('Reproducción automática bloqueada por el navegador:', error);
        notifyUser('Haz clic en "Reproducir" para escuchar la música 🎵', 'info');
    });
};

window.pauseMusic = function() {
    if (!audioPlayer) return;
    
    audioPlayer.pause();
    
    // Transición suave del botón Pause (desaparece)
    if (pauseBtn) {
        pauseBtn.style.opacity = '0';
        pauseBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { pauseBtn.style.display = 'none'; }, 200);
    }
    
    // Transición suave del botón Play (aparece)
    if (playBtn) {
        playBtn.style.display = 'flex';
        setTimeout(() => {
            playBtn.style.opacity = '1';
            playBtn.style.transform = 'scale(1)';
        }, 10);
    }
    
    // Desactivar animaciones
    if (vinylRecord) vinylRecord.classList.remove('playing');
    if (visualizerBars) {
        visualizerBars.forEach(bar => bar.style.animationPlayState = 'paused');
    }
};

/* ========================================
   UTILIDAD DE NOTIFICACIÓN (Fallback)
   ======================================== */
function notifyUser(message, type = 'info') {
    // Si la función global showNotification existe (de interactions.js), usarla
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type === 'error' ? 'error' : 'success');
        return;
    }

    // Fallback local si no existe la global
    if (document.querySelector('.custom-notification')) return;

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#EF4444' : '#C41E3A';
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '30px',
        background: bgColor,
        color: '#F5F1E8',
        padding: '15px 25px',
        borderRadius: '12px',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '0.9rem',
        fontWeight: '500',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        zIndex: '10000',
        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// Inyectar estilos de animación de notificación si no existen
if (!document.getElementById('notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
        @keyframes slideInRight { 
            from { transform: translateX(100px); opacity: 0; } 
            to { transform: translateX(0); opacity: 1; } 
        }
        @keyframes slideOutRight { 
            from { transform: translateX(0); opacity: 1; } 
            to { transform: translateX(100px); opacity: 0; } 
        }
    `;
    document.head.appendChild(style);
}