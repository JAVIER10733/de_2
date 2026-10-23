/* ========================================
   GALAXIA DE AMOR 3D - VERSIÓN TIERNA
   ======================================== */

// 1. CONFIGURACIÓN DE AUDIO
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const timeDisplay = document.getElementById("time");
let isPlaying = false;

function formatTime(e) {
    if (!isFinite(e)) return "0:00";
    return Math.floor(e / 60) + ":" + Math.floor(e % 60).toString().padStart(2, "0");
}

playBtn.addEventListener("click", async () => {
    if (isPlaying) {
        audio.pause();
        playBtn.textContent = "▶️";
    } else {
        await audio.play();
        playBtn.textContent = "⏸️";
    }
    isPlaying = !isPlaying;
});

audio.addEventListener("timeupdate", () => {
    const e = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = (isFinite(e) ? e : 0) + "%";
    timeDisplay.textContent = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

progress.addEventListener("click", (e) => {
    const t = progress.getBoundingClientRect();
    const n = (e.clientX - t.left) / t.width;
    if (isFinite(audio.duration)) {
        audio.currentTime = n * audio.duration;
    }
});

// 2. CONFIGURACIÓN DE THREE.JS
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);

let targetDist = 300, currentDist = 300, rotX = 0.2, rotY = 0;
const loader = new THREE.TextureLoader();
const nebulaTex = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/space/px.jpg");
scene.background = nebulaTex;

// 3. GENERAR ESTRELLAS DE FONDO
(function (count = 2000, radius = 3000) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3 * count);
    for (let i = 0; i < count; i++) {
        const r = radius * (0.3 + 0.7 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[3 * i + 0] = r * Math.sin(phi) * Math.cos(theta);
        positions[3 * i + 1] = r * Math.cos(phi);
        positions[3 * i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 1.5, color: 0xffffff, depthWrite: false
    })));
})();

// 4. NÚCLEO CENTRAL "TE AMO"
const coreMat = new THREE.MeshPhongMaterial({ color: 0x111841, transparent: true, opacity: 0.6, shininess: 200 });
const core = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), coreMat);

function makeCenterTextTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 80px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff3366";
    ctx.shadowColor = "#ff99bb";
    ctx.shadowBlur = 50;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

scene.add(core);
const centerTex = makeCenterTextTexture("TE AMO ❤️");
const centerMat = new THREE.SpriteMaterial({ map: centerTex, transparent: true });
const centerSprite = new THREE.Sprite(centerMat);
centerSprite.scale.set(60, 60, 1);
centerSprite.position.set(0, 0, 0);
centerSprite.renderOrder = 999;
scene.add(centerSprite);

// Resplandor del núcleo
const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: (function makeGlow(size = 768, color1 = "255,160,180", color2 = "255,100,130") {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createRadialGradient(size/2, size/2, 0.05*size, size/2, size/2, 0.5*size);
        gradient.addColorStop(0, "rgba(" + color1 + ",0.9)");
        gradient.addColorStop(0.5, "rgba(" + color2 + ",0.5)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
    })(),
    transparent: true, depthWrite: false
}));
glow.scale.set(500, 500, 1);
scene.add(glow);

// Anillos decorativos
function ringTexture(size = 768) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.translate(size / 2, size / 2);
    const innerR = 0.34 * size, outerR = 0.49 * size;
    const gradient = ctx.createRadialGradient(0, 0, 0.3 * innerR, 0, 0, outerR);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,180,200,0.9)");
    gradient.addColorStop(0.65, "rgba(255,100,150,0.6)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, 2 * Math.PI);
    ctx.arc(0, 0, innerR, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
}

const ring1 = new THREE.Mesh(new THREE.RingGeometry(60, 80, 128), new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide }));
const ring2 = new THREE.Mesh(new THREE.RingGeometry(85, 100, 128), new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide, opacity: 0.6 }));
ring1.rotation.x = ring2.rotation.x = Math.PI / 2;
scene.add(ring1);
scene.add(ring2);

// 5. PALABRAS TIERNAS FLOTANTES (¡ACTUALIZADO!)
const WORDS = [];
const baseWords = [
    "🫶 Eres mi hogar",
    "🌸 Mi lugar favorito",
    "🥰 Contigo todo es mejor",
    "💌 Te elijo hoy y siempre",
    "🧸 Mi persona favorita",
    "🕊️ Gracias por existir",
    "🌙 Eres mi paz",
    "🫂 Mi refugio seguro",
    "✨ Amor bonito",
    "🌷 Juntos es mi sitio",
    "🥺 Eres mi sueño real",
    "💖 Mi corazón es tuyo",
    "🦋 Eres magia pura",
    "🌻 Mi razón de sonreír",
    "🫶 Te quiero con el alma",
    "🌟 Mi mejor casualidad",
    "🌊 Mi calma en el caos",
    "💫 Eres mi todo",
    "⏳ Contigo el tiempo vuela",
    "🌹 Eres mi felicidad",
    "🎀 Mi dulzura",
    "🪐 Mi universo entero",
    "🌈 Eres mi luz",
    "🤍 Amor sincero",
    "🧸 Ternura infinita",
    "💌 Cada día te quiero más",
    "🌸 Eres mi primavera",
    "🫶 Gracias por amarme",
    "✨ Eres un regalo",
    "🥰 Mi vida eres tú"
];

// Duplicamos las palabras para llenar la galaxia
for (let i = 0; i < 6; i++) {
    WORDS.push(...baseWords);
}

// Paleta de colores PASTEL y TIERNA (Actualizada)
const COLORS = [
    "#ffb6c1", // Rosa claro
    "#ffd1dc", // Rosa pastel
    "#e6e6fa", // Lavanda
    "#fff0f5", // Lavanda rojiza
    "#ffe4e1", // Rosa neblina
    "#f0e68c", // Caqui suave
    "#b0e0e6", // Azul polvo
    "#dda0dd", // Ciruela
    "#98fb98", // Verde menta
    "#ffe4b5"  // Melocotón
];

const textGroup = new THREE.Group();
scene.add(textGroup);

function makeTextTexture(text, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 55px 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

for (let i = 0; i < WORDS.length; i++) {
    const texture = makeTextTexture(WORDS[i], COLORS[i % COLORS.length]);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(50, 16, 1);
    
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const radius = 150 + 120 * Math.random();
    
    sprite.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
    
    sprite.userData = {
        phi: phi,
        theta: theta,
        radius: radius,
        speed: 0.001 + 0.001 * Math.random()
    };
    textGroup.add(sprite);
}

// 6. INTERACCIÓN DEL USUARIO (Mouse y Touch)
let dragging = false, lastX = 0, lastY = 0;

function onDown(e) {
    dragging = true;
    const t = e.touches ? e.touches[0] : e;
    lastX = t.clientX; lastY = t.clientY;
}

function onMove(e) {
    if (!dragging) return;
    const t = e.touches ? e.touches[0] : e;
    const deltaX = (t.clientX - lastX) / window.innerWidth;
    const deltaY = (t.clientY - lastY) / window.innerHeight;
    rotY -= 3 * deltaX;
    rotX = Math.max(-1.2, Math.min(1.2, rotX - 2.2 * deltaY));
    lastX = t.clientX; lastY = t.clientY;
}

function onUp() { dragging = false; }

window.addEventListener("mousedown", onDown);
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onUp);
window.addEventListener("touchstart", onDown, { passive: true });
window.addEventListener("touchmove", onMove, { passive: true });
window.addEventListener("touchend", onUp, { passive: true });

window.addEventListener("wheel", (e) => {
    targetDist += 0.25 * e.deltaY;
    targetDist = Math.max(160, Math.min(600, targetDist));
}, { passive: true });

let pinch = 0;
window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinch) {
            targetDist += 0.5 * (pinch - dist);
            targetDist = Math.max(160, Math.min(600, targetDist));
        }
        pinch = dist;
    }
}, { passive: false });

window.addEventListener("touchend", () => { pinch = 0; }, { passive: true });

// 7. BUCLE DE ANIMACIÓN
let time = 0;
function tick() {
    requestAnimationFrame(tick);
    time += 0.01;
    
    // Rotación de anillos
    ring1.rotation.z += 0.002;
    ring2.rotation.z -= 0.0015;
    
    // Pulsación del resplandor y el núcleo
    glow.scale.set(500 * (1 + 0.03 * Math.sin(0.4 * time)), 500 * (1 + 0.03 * Math.sin(0.4 * time)), 1);
    const scalePulse = 1 + 0.05 * Math.sin(3 * time);
    core.scale.set(scalePulse, scalePulse, scalePulse);
    
    // Movimiento suave de las palabras
    textGroup.children.forEach((sprite) => {
        sprite.material.opacity = 0.8 + 0.2 * Math.sin(2 * time);
        sprite.userData.theta += sprite.userData.speed;
        sprite.position.x = sprite.userData.radius * Math.sin(sprite.userData.phi) * Math.cos(sprite.userData.theta);
        sprite.position.z = sprite.userData.radius * Math.sin(sprite.userData.phi) * Math.sin(sprite.userData.theta);
    });
    
    // Suavizado de la cámara
    currentDist += 0.06 * (targetDist - currentDist);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    
    camera.position.set(
        currentDist * sinY * cosX,
        currentDist * sinX,
        currentDist * cosY * cosX
    );
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// Ajuste de tamaño de ventana
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

tick();