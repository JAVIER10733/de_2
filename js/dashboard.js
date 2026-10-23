/* ======================================================================
   DASHBOARD JS - ULTRA PROFESIONAL (Versión Final Optimizada)
   ====================================================================== */

let activityChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    initNavigation();
    initSidebar();
    initColorPickers();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateGreeting();
    
    loadOverview();
    loadMessages();
    loadPhotos();
    loadAnalytics();
    loadHerAnswers();
    initSearch();
    loadShortHistory();
    loadQRHistory();
}

/* ----------------------------------------
   NAVEGACIÓN Y SIDEBAR
   ---------------------------------------- */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (!section) return;
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => {
                s.classList.remove('active');
                s.style.display = 'none'; // Asegurar que se oculte
            });
            
            const target = document.getElementById(`section-${section}`);
            if (target) {
                target.style.display = 'block';
                // Pequeño timeout para permitir que la animación CSS se ejecute
                setTimeout(() => target.classList.add('active'), 10);
            }
            
            // Cerrar menú móvil si está abierto
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('mobile-open');
        });
    });
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    
    if (toggle) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }
}

function updateDateTime() {
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-ES', { 
            weekday: 'short', day: 'numeric', month: 'short' 
        }).replace('.', '');
    }
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', minute: '2-digit' 
        });
    }
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Buenas noches';
    let emoji = '🌙';
    
    if (hour >= 6 && hour < 12) { 
        greeting = 'Buenos días'; 
        emoji = '☀️'; 
    } else if (hour >= 12 && hour < 19) { 
        greeting = 'Buenas tardes'; 
        emoji = '🌤️'; 
    }
    
    // CORRECCIÓN: Usar 'overview-title' que es el ID real en el HTML actualizado
    const el = document.getElementById('overview-title');
    if (el) {
        el.innerHTML = `${greeting}, Admin ${emoji}`;
    }
}

function initColorPickers() {
    const qrColor = document.getElementById('qrColor');
    const qrBgColor = document.getElementById('qrBgColor');
    const qrColorValue = document.getElementById('qrColorValue');
    const qrBgColorValue = document.getElementById('qrBgColorValue');
    
    if (qrColor && qrColorValue) {
        qrColor.addEventListener('input', (e) => {
            qrColorValue.textContent = e.target.value.toUpperCase();
        });
    }
    if (qrBgColor && qrBgColorValue) {
        qrBgColor.addEventListener('input', (e) => {
            qrBgColorValue.textContent = e.target.value.toUpperCase();
        });
    }
}

/* ----------------------------------------
   CARGAR DATOS PRINCIPALES
   ---------------------------------------- */
function loadOverview() {
    const messages = getMessages();
    const photos = getPhotos();
    
    const msgBadge = document.getElementById('messagesBadge');
    const photoBadge = document.getElementById('photosBadge');
    const statMsg = document.getElementById('statMessages');
    const statPhoto = document.getElementById('statPhotos');
    
    if (msgBadge) msgBadge.textContent = messages.length;
    if (photoBadge) photoBadge.textContent = photos.length;
    if (statMsg) statMsg.textContent = messages.length;
    if (statPhoto) statPhoto.textContent = photos.length;
    
    // Calcular días desde el 14 de Febrero de 2026
    const startDate = new Date('2026-02-14T00:00:00');
    const now = new Date();
    const diffTime = Math.max(0, now - startDate);
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const statDays = document.getElementById('statDays');
    if (statDays) statDays.textContent = days;
    
    // Actividad reciente
    const activityList = document.getElementById('recentActivity');
    if (activityList) {
        const recentItems = [];
        messages.slice(0, 3).forEach(msg => {
            recentItems.push({ 
                icon: 'bx-message-heart', 
                title: `Mensaje de ${msg.name || 'Anónimo'}`, 
                time: msg.date 
            });
        });
        photos.slice(0, 2).forEach(photo => {
            recentItems.push({ 
                icon: 'bx-image-add', 
                title: `Foto: ${(photo.description || 'Sin descripción').substring(0, 25)}...`, 
                time: photo.date 
            });
        });
        
        if (recentItems.length > 0) {
            activityList.innerHTML = recentItems.map(item => `
                <div class="activity-item">
                    <div class="activity-icon"><i class='bx ${item.icon}'></i></div>
                    <div class="activity-content">
                        <div class="activity-title">${item.title}</div>
                        <div class="activity-time">${item.time}</div>
                    </div>
                </div>
            `).join('');
        } else {
            activityList.innerHTML = `
                <div class="empty-state" style="padding: 2rem; text-align: center; color: var(--text-muted);">
                    <i class="bx bx-time-five" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                    <p>Sin actividad reciente</p>
                </div>`;
        }
    }
    
    initChart(messages.length, photos.length);
}

function initChart(msgCount, photoCount) {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    if (activityChart) {
        activityChart.destroy();
    }
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Interacciones',
                data: [2, 4, 3, 5, msgCount, photoCount, msgCount + photoCount],
                borderColor: '#C41E3A', 
                backgroundColor: 'rgba(196, 30, 58, 0.1)',
                borderWidth: 2, 
                tension: 0.4, 
                fill: true,
                pointBackgroundColor: '#FFD700', 
                pointBorderColor: '#C41E3A', 
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(18, 18, 26, 0.9)',
                    titleColor: '#F5F1E8',
                    bodyColor: '#A0A0A0',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: '#9E9E9E' } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#9E9E9E' } 
                }
            }
        }
    });
}

function loadMessages() {
    const messages = getMessages();
    const tbody = document.getElementById('messagesTableBody');
    const emptyState = document.getElementById('messagesEmpty');
    const table = document.getElementById('messagesTable');
    
    if (!tbody) return;
    
    if (messages.length === 0) { 
        if (table) table.style.display = 'none'; 
        if (emptyState) emptyState.style.display = 'block'; 
        return; 
    }
    
    if (table) table.style.display = 'table'; 
    if (emptyState) emptyState.style.display = 'none';
    
    tbody.innerHTML = messages.map((msg, index) => `
        <tr>
            <td>
                <div class="msg-author">
                    <div class="msg-avatar">${(msg.name || 'A').charAt(0).toUpperCase()}</div>
                    <span>${escapeHtml(msg.name || 'Anónimo')}</span>
                </div>
            </td>
            <td><div class="msg-text" title="${escapeHtml(msg.message)}">${escapeHtml(msg.message)}</div></td>
            <td>${msg.date || 'Fecha desconocida'}</td>
            <td>
                <button class="btn-icon-sm" onclick="deleteMessage(${index})" aria-label="Eliminar mensaje">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadPhotos() {
    const photos = getPhotos();
    const container = document.getElementById('photosMasonry');
    const emptyState = document.getElementById('photosEmpty');
    
    if (!container) return;
    
    if (photos.length === 0) { 
        container.style.display = 'none'; 
        if (emptyState) emptyState.style.display = 'block'; 
        return; 
    }
    
    container.style.display = 'grid'; 
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = photos.map((photo, index) => `
        <div class="photo-card-dash">
            <img src="${photo.src}" alt="${escapeHtml(photo.description || 'Foto')}" class="photo-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>📷</text></svg>'">
            <div class="photo-info">
                <div class="photo-desc">${escapeHtml(photo.description || 'Sin descripción')}</div>
                <div class="photo-date">${photo.date || 'Fecha desconocida'}</div>
                <button class="btn-icon-sm" onclick="deletePhoto(${index})" style="width: 100%; margin-top: 8px;">
                    <i class='bx bx-trash'></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function loadAnalytics() {
    let totalSize = 0;
    for (let key in localStorage) { 
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length * 2; 
        }
    }
    
    const sizeKB = (totalSize / 1024).toFixed(2);
    const maxSize = 5 * 1024 * 1024; // 5 MB
    const percentage = Math.min((totalSize / maxSize) * 100, 100);
    
    const circle = document.getElementById('storageCircle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }
    
    const percentageEl = document.getElementById('storagePercentage');
    if (percentageEl) percentageEl.textContent = `${percentage.toFixed(1)}%`;
    
    const usedEl = document.getElementById('storageUsed');
    if (usedEl) usedEl.textContent = `${sizeKB} KB`;
    
    const freeEl = document.getElementById('storageFree');
    if (freeEl) freeEl.textContent = `${((maxSize - totalSize) / (1024 * 1024)).toFixed(2)} MB`;
}

function initSearch() {
    const searchInput = document.getElementById('searchMessages');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const messages = getMessages();
        const filtered = messages.filter(msg => 
            (msg.name && msg.name.toLowerCase().includes(query)) || 
            (msg.message && msg.message.toLowerCase().includes(query))
        );
        renderFilteredMessages(filtered);
    });
}

function renderFilteredMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;
    
    if (messages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No se encontraron resultados</td></tr>`;
        return;
    }
    
    tbody.innerHTML = messages.map((msg, index) => `
        <tr>
            <td>
                <div class="msg-author">
                    <div class="msg-avatar">${(msg.name || 'A').charAt(0).toUpperCase()}</div>
                    <span>${escapeHtml(msg.name || 'Anónimo')}</span>
                </div>
            </td>
            <td><div class="msg-text">${escapeHtml(msg.message)}</div></td>
            <td>${msg.date || 'Fecha desconocida'}</td>
            <td>
                <button class="btn-icon-sm" onclick="deleteMessage(${index})" aria-label="Eliminar mensaje">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/* ========================================
   CARGAR SUS RESPUESTAS (Interacciones)
   ======================================== */
function loadHerAnswers() {
    // 1. Decisión Final
    const final = JSON.parse(localStorage.getItem('finalAnswer') || 'null');
    const finalDisplay = document.getElementById('finalAnswerDisplay');
    
    if (final && final.decision) {
        finalDisplay.innerHTML = `
            <div class="info-item">
                <span>Decisión:</span>
                <span class="badge-secondary" style="background:var(--snoopy-red); color:white;">${escapeHtml(final.decision)}</span>
            </div>
            <div class="info-item">
                <span>Mensaje WhatsApp:</span>
                <span>${final.mensajePersonal && final.mensajePersonal !== "Sin mensaje adicional" ? escapeHtml(final.mensajePersonal) : '<i style="color:var(--text-muted)">No escribió nada</i>'}</span>
            </div>
            <div class="info-item">
                <span>Fecha:</span>
                <span>${final.fecha || 'Desconocida'}</span>
            </div>
        `;
    } else if (finalDisplay) {
        finalDisplay.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem;">Aún no ha respondido la pregunta final.</p>';
    }

    // 2. Mini Test
    const quiz = JSON.parse(localStorage.getItem('quizAnswers') || '[]');
    const quizDisplay = document.getElementById('quizAnswerDisplay');
    
    if (quiz && quiz.length > 0 && quizDisplay) {
        quizDisplay.innerHTML = quiz.map(q => `
            <div class="info-item">
                <span>Pregunta ${q.step}:</span>
                <span class="badge-secondary">Opción '${escapeHtml(q.respuesta)}'</span>
            </div>
        `).join('');
    } else if (quizDisplay) {
        quizDisplay.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem;">Sin respuestas aún.</p>';
    }

    // 3. ¿Qué Prefieres?
    const wyr = JSON.parse(localStorage.getItem('wyrAnswers') || '{}');
    const wyrDisplay = document.getElementById('wyrAnswerDisplay');
    
    if (wyr && Object.keys(wyr).length > 0 && wyrDisplay) {
        wyrDisplay.innerHTML = Object.entries(wyr).map(([key, value]) => `
            <div class="info-item">
                <span>${escapeHtml(key)}:</span>
                <span>${escapeHtml(value)}</span>
            </div>
        `).join('');
    } else if (wyrDisplay) {
        wyrDisplay.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem;">Sin respuestas aún.</p>';
    }
}

/* ========================================
   HERRAMIENTAS: ACORTADOR DE LINKS
   ======================================== */
window.shortenUrl = async function() {
    const longUrlInput = document.getElementById('longUrl');
    const customAliasInput = document.getElementById('customAlias');
    const resultDiv = document.getElementById('shortResult');
    const btn = event.target.closest('button');
    
    const longUrl = longUrlInput ? longUrlInput.value.trim() : '';
    const customAlias = customAliasInput ? customAliasInput.value.trim() : '';
    
    if (!longUrl) { 
        showToast('Por favor, ingresa una URL válida', 'error'); 
        return; 
    }
    
    try { 
        new URL(longUrl); 
    } catch { 
        showToast('La URL no tiene un formato válido', 'error'); 
        return; 
    }
    
    if (btn) {
        btn.disabled = true; 
        btn.innerHTML = '<span class="loading"></span> Acortando...';
    }
    if (resultDiv) resultDiv.style.display = 'none';
    
    try {
        let apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`;
        if (customAlias) {
            apiUrl += `&shorturl=${encodeURIComponent(customAlias)}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.shorturl) {
            const output = document.getElementById('shortUrlOutput');
            if (output) output.value = data.shorturl;
            if (resultDiv) resultDiv.style.display = 'block';
            
            saveToShortHistory(longUrl, data.shorturl);
            showToast('Link acortado exitosamente', 'success');
        } else { 
            throw new Error(data.errormessage || 'Error desconocido al acortar'); 
        }
    } catch (error) { 
        showToast(error.message || 'Error al conectar con el servicio', 'error'); 
    } finally { 
        if (btn) {
            btn.disabled = false; 
            btn.innerHTML = "<i class='bx bx-scissors'></i> Acortar URL"; 
        }
    }
};

window.copyShortUrl = function() {
    const output = document.getElementById('shortUrlOutput');
    if (output && output.value) {
        navigator.clipboard.writeText(output.value);
        showToast('Link copiado al portapapeles', 'success');
    }
};

function saveToShortHistory(original, shortened) {
    let history = JSON.parse(localStorage.getItem('shortUrlHistory') || '[]');
    history.unshift({ 
        original, 
        shortened, 
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
    });
    history = history.slice(0, 10); // Mantener solo los últimos 10
    localStorage.setItem('shortUrlHistory', JSON.stringify(history));
    loadShortHistory();
}

function loadShortHistory() {
    const history = JSON.parse(localStorage.getItem('shortUrlHistory') || '[]');
    const container = document.getElementById('shortHistory');
    if (!container) return;
    
    if (history.length === 0) { 
        container.innerHTML = '<div class="empty-history"><i class="bx bx-link-alt"></i><p>Sin links acortados aún</p></div>'; 
        return; 
    }
    
    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-icon"><i class='bx bx-link'></i></div>
            <div class="history-content">
                <div class="history-title">${escapeHtml(item.shortened)}</div>
                <div class="history-subtitle">${escapeHtml(item.original)}</div>
            </div>
            <div class="history-actions">
                <button class="btn-icon-sm" onclick="copyHistoryItem('${escapeHtml(item.shortened)}')" aria-label="Copiar">
                    <i class='bx bx-copy'></i>
                </button>
                <button class="btn-icon-sm" onclick="deleteHistoryItem('short', ${index})" aria-label="Eliminar">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        </div>
    `).join('');
}

/* ========================================
   HERRAMIENTAS: GENERADOR DE QR
   ======================================== */
window.generateQR = function() {
    const contentInput = document.getElementById('qrContent');
    const sizeInput = document.getElementById('qrSize');
    const colorInput = document.getElementById('qrColor');
    const bgColorInput = document.getElementById('qrBgColor');
    const formatInput = document.getElementById('qrFormat');
    const resultDiv = document.getElementById('qrResult');
    
    const content = contentInput ? contentInput.value.trim() : '';
    const size = sizeInput ? sizeInput.value : '250';
    const color = colorInput ? colorInput.value.replace('#', '') : 'C41E3A';
    const bgColor = bgColorInput ? bgColorInput.value.replace('#', '') : '0A0A0A';
    const format = formatInput ? formatInput.value : 'png';
    
    if (!content) { 
        showToast('Por favor, ingresa el contenido del QR', 'error'); 
        return; 
    }
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}&color=${color}&bgcolor=${bgColor}&format=${format}&margin=10`;
    const qrImage = document.getElementById('qrImage');
    
    if (qrImage) {
        qrImage.src = qrUrl;
        qrImage.onload = () => { 
            if (resultDiv) resultDiv.style.display = 'block'; 
            saveToQRHistory(content, qrUrl, size); 
            showToast('QR generado correctamente', 'success'); 
        };
        qrImage.onerror = () => {
            showToast('Error al generar el QR. Intenta con otro contenido.', 'error');
        };
    }
};

window.downloadQR = function() {
    const qrImage = document.getElementById('qrImage');
    const contentInput = document.getElementById('qrContent');
    const formatInput = document.getElementById('qrFormat');
    
    if (!qrImage || !qrImage.src) return;
    
    const content = contentInput ? contentInput.value.trim() : 'qr-code';
    const format = formatInput ? formatInput.value : 'png';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
        canvas.width = img.width; 
        canvas.height = img.height; 
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        const safeName = content.substring(0, 20).replace(/[^a-z0-9]/gi, '-') || 'qr';
        link.download = `qr-${safeName}.${format}`;
        link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`);
        link.click(); 
        showToast('QR descargado', 'success');
    };
    
    img.src = qrImage.src;
};

window.copyQR = async function() {
    try {
        const qrImage = document.getElementById('qrImage');
        if (!qrImage || !qrImage.src) return;
        
        const response = await fetch(qrImage.src); 
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        showToast('Imagen QR copiada al portapapeles', 'success');
    } catch (error) { 
        showToast('No se pudo copiar la imagen. Intenta descargarla.', 'error'); 
    }
};

function saveToQRHistory(content, url, size) {
    let history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    history.unshift({ 
        content, 
        url, 
        size, 
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
    });
    history = history.slice(0, 10); 
    localStorage.setItem('qrHistory', JSON.stringify(history)); 
    loadQRHistory();
}

function loadQRHistory() {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    const container = document.getElementById('qrHistory');
    if (!container) return;
    
    if (history.length === 0) { 
        container.innerHTML = '<div class="empty-history"><i class="bx bx-qr"></i><p>Sin QRs generados aún</p></div>'; 
        return; 
    }
    
    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-icon"><i class='bx bx-qr'></i></div>
            <div class="history-content">
                <div class="history-title">${escapeHtml(item.content.substring(0, 30))}${item.content.length > 30 ? '...' : ''}</div>
                <div class="history-subtitle">${item.size}x${item.size}px • ${item.date}</div>
            </div>
            <div class="history-actions">
                <button class="btn-icon-sm" onclick="viewQRFromHistory('${escapeHtml(item.url)}')" aria-label="Ver">
                    <i class='bx bx-show'></i>
                </button>
                <button class="btn-icon-sm" onclick="deleteHistoryItem('qr', ${index})" aria-label="Eliminar">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.viewQRFromHistory = function(url) { 
    const qrImage = document.getElementById('qrImage');
    const resultDiv = document.getElementById('qrResult');
    if (qrImage) qrImage.src = url; 
    if (resultDiv) resultDiv.style.display = 'block'; 
};

window.copyHistoryItem = function(text) { 
    navigator.clipboard.writeText(text); 
    showToast('Copiado al portapapeles', 'success'); 
};

window.deleteHistoryItem = function(type, index) {
    const key = type === 'short' ? 'shortUrlHistory' : 'qrHistory';
    let history = JSON.parse(localStorage.getItem(key) || '[]'); 
    history.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(history));
    
    if (type === 'short') loadShortHistory(); 
    else loadQRHistory();
    
    showToast('Elemento eliminado', 'success');
};

/* ----------------------------------------
   FUNCIONES GLOBALES Y UTILIDADES
   ---------------------------------------- */
function getMessages() { 
    try { 
        return JSON.parse(localStorage.getItem('guestbookEntries') || '[]'); 
    } catch { 
        return []; 
    } 
}

function getPhotos() { 
    try { 
        return JSON.parse(localStorage.getItem('savedMoments') || '[]'); 
    } catch { 
        return []; 
    } 
}

function escapeHtml(text) { 
    if (!text) return '';
    const div = document.createElement('div'); 
    div.textContent = text; 
    return div.innerHTML; 
}

window.deleteMessage = function(index) { 
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return; 
    const m = getMessages(); 
    m.splice(index, 1); 
    localStorage.setItem('guestbookEntries', JSON.stringify(m)); 
    loadMessages(); 
    loadOverview(); 
    showToast('Mensaje eliminado', 'success'); 
};

window.deletePhoto = function(index) { 
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return; 
    const p = getPhotos(); 
    p.splice(index, 1); 
    localStorage.setItem('savedMoments', JSON.stringify(p)); 
    loadPhotos(); 
    loadOverview(); 
    showToast('Foto eliminada', 'success'); 
};

window.exportData = function() { 
    const data = { 
        messages: getMessages(), 
        photos: getPhotos(), 
        exportDate: new Date().toISOString() 
    }; 
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `backup-amor-${Date.now()}.json`; 
    a.click(); 
    showToast('Backup completo exportado', 'success'); 
};

window.exportMessages = function() { 
    const blob = new Blob([JSON.stringify(getMessages(), null, 2)], { type: 'application/json' }); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `mensajes-${Date.now()}.json`; 
    a.click(); 
    showToast('Mensajes exportados', 'success'); 
};

window.exportPhotos = function() { 
    const blob = new Blob([JSON.stringify(getPhotos(), null, 2)], { type: 'application/json' }); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `fotos-${Date.now()}.json`; 
    a.click(); 
    showToast('Fotos exportadas', 'success'); 
};

window.clearMessages = function() { 
    if (confirm('⚠️ ¿Borrar TODOS los mensajes? Esta acción no se puede deshacer.')) { 
        localStorage.removeItem('guestbookEntries'); 
        loadMessages(); 
        loadOverview(); 
        showToast('Todos los mensajes han sido borrados', 'success'); 
    } 
};

window.clearPhotos = function() { 
    if (confirm('⚠️ ¿Borrar TODAS las fotos? Esta acción no se puede deshacer.')) { 
        localStorage.removeItem('savedMoments'); 
        loadPhotos(); 
        loadOverview(); 
        showToast('Todas las fotos han sido borradas', 'success'); 
    } 
};

window.clearAllData = function() { 
    if (confirm('🚨 ¿Borrar TODOS los datos del dashboard? Esta acción es irreversible y eliminará mensajes, fotos y respuestas.')) { 
        localStorage.clear(); 
        location.reload(); 
    } 
};

window.refreshData = function() { 
    loadOverview(); 
    loadMessages(); 
    loadPhotos(); 
    loadAnalytics(); 
    loadHerAnswers(); 
    showToast('Datos actualizados correctamente', 'success'); 
};

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer'); 
    if (!container) return;
    
    const toast = document.createElement('div'); 
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Animación de entrada y salida suave
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300); 
    }, 3500);
}