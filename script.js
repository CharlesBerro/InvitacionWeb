let currentStep = 0;
let nombreFamilia = 'Invitado Especial';
let musicaIniciada = false; // Flag para controlar la música
let isAnimating = false; // Evita toques/clics múltiples durante la transición

// --- ELEMENTOS DEL DOM ---
const steps = document.querySelectorAll('.invitation-step');
const prevArrow = document.getElementById('prev-arrow');
const nextArrow = document.getElementById('next-arrow');
const musicToggle = document.getElementById('music-toggle');
const backgroundMusic = document.getElementById('background-music');

// --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Personalizar nombre
    const params = new URLSearchParams(window.location.search);
    const nombreParam = params.get('familia');
    if (nombreParam) {
        nombreFamilia = decodeURIComponent(nombreParam);
    }
    document.getElementById('nombre-familia').textContent = nombreFamilia;

    // 2. Iniciar contador
    const fechaBoda = new Date('October 25, 2025 17:00:00').getTime();
    setInterval(() => actualizarContador(fechaBoda), 1000);

    // 3. Mostrar flechas desde el inicio
    updateArrowVisibility();

    // 4. Gestos táctiles para móvil
    initSwipe();

    // 5. Soporte de teclado (izquierda/derecha)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextStep();
        if (e.key === 'ArrowLeft') prevStep();
    });
});

// --- NAVEGACIÓN POR PASOS ---
function nextStep() {
    if (currentStep >= steps.length - 1 || isAnimating) return;
    isAnimating = true;

    // Inicia la música con la primera interacción del usuario
    iniciarMusica(); 

    steps[currentStep].classList.remove('active');
    steps[currentStep].classList.add('previous');
    currentStep++;
    steps[currentStep].classList.add('active');
    updateArrowVisibility();
    onTransitionEnd(steps[currentStep]);
}

function prevStep() {
    if (currentStep <= 0 || isAnimating) return;
    isAnimating = true;
    
    iniciarMusica();

    steps[currentStep].classList.remove('active');
    currentStep--;
    steps[currentStep].classList.remove('previous');
    steps[currentStep].classList.add('active');
    updateArrowVisibility();
    onTransitionEnd(steps[currentStep]);
}

// CORRECCIÓN 5: Función para manejar la visibilidad de las flechas
function updateArrowVisibility() {
    // Flecha "Anterior" solo es visible si no estamos en el primer paso
    if (currentStep > 0) {
        prevArrow.classList.add('visible');
    } else {
        prevArrow.classList.remove('visible');
    }

    // Flecha "Siguiente" solo es visible si no estamos en el último paso
    if (currentStep < steps.length - 1) {
        nextArrow.classList.add('visible');
    } else {
        nextArrow.classList.remove('visible');
    }
}

// Espera el fin de la transición CSS para liberar el bloqueo
function onTransitionEnd(activeEl) {
    const handler = () => {
        isAnimating = false;
        activeEl.removeEventListener('transitionend', handler);
    };
    activeEl.addEventListener('transitionend', handler, { once: true });
    // Fallback por si el evento no dispara
    setTimeout(() => { isAnimating = false; }, 800);
}

// --- GESTOS TÁCTILES ---
function initSwipe() {
    let startX = 0;
    let startY = 0;
    let isTouching = false;

    const threshold = 40; // px mínimos para considerar swipe

    window.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        // noop: solo registramos para que los navegadores no cancelen el gesto
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isTouching) return;
        isTouching = false;

        const touch = e.changedTouches && e.changedTouches[0];
        if (!touch) return;

        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        // Evita considerar scroll vertical como swipe horizontal
        if (Math.abs(dx) < Math.abs(dy)) return;

        if (dx <= -threshold) {
            // swipe izquierda => siguiente
            nextStep();
        } else if (dx >= threshold) {
            // swipe derecha => anterior
            prevStep();
        }
    }, { passive: true });
}

// --- CONTADOR REGRESIVO (sin cambios) ---
function actualizarContador(fechaBoda) {
    const ahora = new Date().getTime();
    const diferencia = fechaBoda - ahora;
    if (diferencia < 0) {
        document.getElementById('countdown').innerHTML = "<h4 class='col-12'>¡El gran día ha llegado!</h4>";
        return;
    }
    document.getElementById('dias').innerText = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    document.getElementById('horas').innerText = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('minutos').innerText = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('segundos').innerText = Math.floor((diferencia % (1000 * 60)) / 1000);
}

// --- CONTROL DE MÚSICA ---
function iniciarMusica() {
    if (!musicaIniciada && backgroundMusic.paused) {
        backgroundMusic.play().catch(e => console.log("El navegador bloqueó el autoplay."));
        musicToggle.textContent = '🔇';
        musicaIniciada = true;
    }
}

musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicToggle.textContent = '🔇';
    } else {
        backgroundMusic.pause();
        musicToggle.textContent = '▶️';
    }
    musicaIniciada = true;
});

// --- CONFIRMACIÓN POR WHATSAPP (sin cambios) ---
function confirmarAsistencia() {
    const numeroNovios = 'TU_NUMERO_DE_WHATSAPP'; 
    const mensaje = `¡Hola! Confirmamos con alegría nuestra asistencia a vuestra boda. Atentamente, ${nombreFamilia}.`;
    const urlWhatsApp = `https://wa.me/${numeroNovios}?text=${encodeURIComponent(mensaje )}`;
    window.open(urlWhatsApp, '_blank');
}
