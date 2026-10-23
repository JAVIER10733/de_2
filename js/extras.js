/* ======================================================================
   CONFIGURACIÓN DE NOTIFICACIONES Y RESPUESTAS
   ====================================================================== */

// ⚠️ IMPORTANTE: Tu TOKEN está bien, pero el CHAT_ID debe ser TU número de usuario de Telegram, 
// NO el número del bot. Para obtenerlo, busca "@userinfobot" o "@getidsbot" en Telegram, 
// inicia el chat y te dará tu "Id" (ej: 123456789). Reemplaza el valor de abajo.
const TELEGRAM_TOKEN = '8707262872:AAHX1xs1JkI1UgPPYmw5NWjNoJjU2JrlMK8'; 
const TELEGRAM_CHAT_ID = '8707262872'; // <--- ¡CAMBIA ESTO POR TU ID REAL!

// Tu número de WhatsApp (Ecuador: 593 + número sin el 0 inicial ni espacios)
const MI_WHATSAPP = '573005605697'; // <--- ¡CAMBIA ESTO POR TU NÚMERO REAL!

/* ========================================
   FUNCIÓN CENTRAL: ENVIAR A TELEGRAM
   ======================================== */
async function sendToTelegram(message) {
    if (TELEGRAM_CHAT_ID === '8707262872') {
        console.warn('⚠️ Configura tu TELEGRAM_CHAT_ID en extras.js para recibir notificaciones.');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
    } catch (error) {
        console.error('❌ Error enviando a Telegram:', error);
    }
}

/* ========================================
   LÓGICA DE LAS RESPUESTAS INTERACTIVAS
   ======================================== */

// 1. ¿Qué prefieres? (WYR)
function answerWYR(btn, message) {
    const card = btn.closest('.wyr-card');
    const parent = btn.closest('.wyr-options');
    const buttons = parent.querySelectorAll('.wyr-btn');
    
    // Deshabilitar botones para evitar doble clic
    buttons.forEach(b => { 
        b.style.pointerEvents = 'none'; 
        b.style.opacity = '0.5'; 
    });
    
    btn.style.opacity = '1';
    btn.style.borderColor = 'var(--woodstock-yellow, #FFD700)';
    btn.style.background = 'rgba(255, 215, 0, 0.1)';
    
    const feedback = card.querySelector('.wyr-feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.classList.add('show');
    }
    
    // Guardar en LocalStorage para el Dashboard
    const questionText = card.querySelector('.wyr-question').textContent;
    const answerText = btn.querySelector('span:last-child')?.textContent || btn.textContent;
    
    let wyrAnswers = JSON.parse(localStorage.getItem('wyrAnswers') || '{}');
    wyrAnswers[questionText] = answerText;
    localStorage.setItem('wyrAnswers', JSON.stringify(wyrAnswers));
    
    // Enviar a Telegram
    sendToTelegram(`
<b>💞 NUEVA RESPUESTA - ¿Qué Prefieres?</b>

📝 <b>Pregunta:</b> ${questionText}
✅ <b>Ella eligió:</b> ${answerText}

⏰ ${new Date().toLocaleString('es-EC')}
    `);
    
    // Mostrar botón de siguiente o lanzar confeti si es la última
    const nextBtn = card.querySelector('.wyr-next');
    if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.style.display = 'inline-flex';
    } else {
        setTimeout(() => launchConfetti(), 500);
    }
}

// Función para avanzar en ¿Qué prefieres?
window.nextWYR = function() {
    const currentCard = document.querySelector('.wyr-card:not(.hidden)');
    if (currentCard) {
        currentCard.classList.add('hidden');
        currentCard.style.display = 'none';
        
        const nextCard = currentCard.nextElementSibling;
        if (nextCard && nextCard.classList.contains('wyr-card')) {
            nextCard.classList.remove('hidden');
            nextCard.style.display = 'block';
            nextCard.style.animation = 'fadeInUp 0.6s ease-out';
        }
    }
};

// 2. Mini Quiz
window.answerQuiz = function(step, answer) {
    const currentQ = document.querySelector(`.quiz-question[data-step="${step}"]`);
    if (currentQ) {
        currentQ.classList.add('hidden');
        currentQ.style.display = 'none';
    }
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('quizProgressBar');
    if (progressBar) {
        progressBar.style.width = `${(step / 5) * 100}%`; // Asumiendo 5 preguntas totales
        progressBar.className = `quiz-progress-bar progress-${(step / 5) * 100}`;
    }
    
    const questions = {
        1: '¿Cuál crees que es mi parte favorita de verte?',
        2: 'Si pudiéramos teletransportarnos ahora mismo, ¿a dónde iríamos?',
        3: '¿Qué crees que siento en este preciso momento?',
        4: '¿Cuál crees que es mi mayor defecto?',
        5: '¿Qué esperas de nosotros en el futuro?'
    };
    
    // Guardar en LocalStorage para el Dashboard
    let quizAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '[]');
    quizAnswers.push({ 
        step: step, 
        respuesta: answer, 
        date: new Date().toLocaleString('es-EC') 
    });
    localStorage.setItem('quizAnswers', JSON.stringify(quizAnswers));
    
    // Enviar a Telegram
    sendToTelegram(`
🎲 <b>NUEVA RESPUESTA - Mini Test</b>

📝 <b>Pregunta ${step}:</b> ${questions[step] || 'Pregunta personalizada'}
✅ <b>Opción elegida:</b> ${answer.toUpperCase()}

⏰ ${new Date().toLocaleString('es-EC')}
    `);
    
    if (step < 5) {
        const nextQ = document.querySelector(`.quiz-question[data-step="${step + 1}"]`);
        if (nextQ) {
            nextQ.classList.remove('hidden');
            nextQ.style.display = 'block';
            nextQ.style.animation = 'fadeInUp 0.5s ease-out';
        }
    } else {
        const quizResult = document.getElementById('quizResult');
        if (quizResult) {
            quizResult.classList.remove('hidden');
            quizResult.style.display = 'block';
            quizResult.style.animation = 'fadeInUp 0.6s ease-out';
            launchConfetti();
        }
        
        sendToTelegram(`
🎉 <b>¡Ella completó el Mini Test!</b>
Todas sus respuestas ya están guardadas y te llegaron. Revisa los mensajes anteriores o el Dashboard.
⏰ ${new Date().toLocaleString('es-EC')}
        `);
    }
};

window.resetQuiz = function() {
    localStorage.removeItem('quizAnswers');
    location.reload();
};

// 3. Respuesta Final (LA MÁS IMPORTANTE)
window.handleAnswer = function(choice) {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
    });
    
    const feedback = document.getElementById('answerFeedback');
    const text = document.getElementById('feedbackText');
    const waBox = document.getElementById('waBox');
    
    if (feedback) feedback.classList.remove('hidden');
    if (waBox) waBox.classList.add('hidden');
    
    let decisionText = "";
    let emoji = "";
    let mensajePersonal = "Sin mensaje adicional";
    
    if (choice === 0) {
        decisionText = "💖 Siente algo especial";
        emoji = "💖💖";
        if (text) text.innerHTML = "¡Esto me llena de una felicidad que no puedo explicar! 💖<br>Prometo cuidarte y hacerte sonreír cada día.";
        if (waBox) waBox.classList.remove('hidden');
        launchConfetti();
    } else if (choice === 1) {
        decisionText = "🤔 Necesita tiempo";
        emoji = "🤔";
        if (text) text.innerHTML = "Lo entiendo perfectamente. Tómate todo el tiempo que necesites. 🤔<br>No hay prisa, yo estaré aquí cuando estés lista.";
    } else {
        decisionText = "🫂 Prefiere amistad";
        emoji = "🫂";
        if (text) text.innerHTML = "Lo respeto y lo entiendo. Tu amistad es lo más valioso que tengo y no la voy a poner en riesgo. 🫂<br>Gracias por ser sincera.";
    }

    // Guardar en LocalStorage para el Dashboard
    const finalAnswerData = {
        decision: decisionText,
        mensajePersonal: mensajePersonal,
        fecha: new Date().toLocaleString('es-EC')
    };
    localStorage.setItem('finalAnswer', JSON.stringify(finalAnswerData));

    // ENVIAR A TELEGRAM AL INSTANTE
    sendToTelegram(`
${emoji} <b>🚨 RESPUESTA FINAL RECIBIDA 🚨</b> ${emoji}

<b>Decisión:</b> ${decisionText}

⏰ ${new Date().toLocaleString('es-EC')}

━━━━━━━━━━━━━━━━━━━━
    `);
};

// 4. Cuando ella escribe el mensaje de WhatsApp
window.sendWA = function() {
    const waText = document.getElementById('waText');
    const message = waText ? waText.value.trim() : '';
    
    if (!message) {
        alert('Por favor, escribe algo antes de enviar 😊');
        return;
    }
    
    // Actualizar el mensaje en LocalStorage para que el dashboard lo muestre
    let finalAnswer = JSON.parse(localStorage.getItem('finalAnswer') || '{}');
    finalAnswer.mensajePersonal = message;
    localStorage.setItem('finalAnswer', JSON.stringify(finalAnswer));
    
    // Te llega el mensaje a Telegram ANTES de que ella lo mande por WA
    sendToTelegram(`
💌 <b>MENSAJE ESCRITO POR ELLA:</b>

"${message}"

⏰ ${new Date().toLocaleString('es-EC')}

(Ella está a punto de abrir WhatsApp para enviarlo)
    `);
    
    const url = `https://wa.me/${MI_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// 5. Efecto Confeti Optimizado
function launchConfetti() {
    // Evitar múltiples canvas
    if (document.getElementById('confetti-active')) return;
    document.body.setAttribute('id', 'confetti-active');
    
    const colors = ['#C41E3A', '#FFD700', '#F5F1E8', '#E8384F', '#FF69B4'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999; overflow:hidden;';
    document.body.appendChild(container);
    
    for (let i = 0; i < 80; i++) {
        const conf = document.createElement('div');
        const size = Math.random() * 8 + 4;
        conf.style.cssText = `
            position: absolute; 
            width: ${size}px; 
            height: ${size}px; 
            background: ${colors[Math.floor(Math.random() * colors.length)]}; 
            left: ${Math.random() * 100}vw; 
            top: -20px; 
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}; 
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
            opacity: 0.9;
        `;
        container.appendChild(conf);
    }
    
    setTimeout(() => {
        container.remove();
        document.body.removeAttribute('id');
    }, 5000);
}

// Inyectar estilo de animación del confeti si no existe
if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
        @keyframes fall { 
            to { 
                transform: translateY(110vh) rotate(${Math.random() * 720}deg); 
                opacity: 0; 
            } 
        }
    `;
    document.head.appendChild(style);
}

// 6. BONUS: Notificación cuando ella abre la web
window.addEventListener('load', () => {
    // Usamos sessionStorage para no spamearte si ella recarga la página
    if (!sessionStorage.getItem('webOpenedNotified')) {
        sendToTelegram(`
👀 <b>¡ALGUIEN ABRIÓ TU WEB!</b>

📱 <b>Dispositivo:</b> ${navigator.userAgent.includes('Mobile') ? 'Móvil 📱' : 'Escritorio 💻'}
🌐 <b>Navegador:</b> ${navigator.userAgent.substring(0, 50)}...
📏 <b>Pantalla:</b> ${window.innerWidth}x${window.innerHeight}
⏰ <b>Hora:</b> ${new Date().toLocaleString('es-EC')}
        `);
        sessionStorage.setItem('webOpenedNotified', 'true');
    }
});