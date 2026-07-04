let rentasActivas = JSON.parse(localStorage.getItem('rentasActivas')) || [];
let rentasDiarias = JSON.parse(localStorage.getItem('rentasDiarias')) || [];
let vehiculoSeleccionadoActual = null;

// Duración de la renta en minutos (puedes cambiar este número si en el futuro cambias la tarifa)
const DURACION_RENTA_MINUTOS = 20; 
const DURACION_RENTA_MS = DURACION_RENTA_MINUTOS * 60 * 1000; // Convertido a milisegundos

document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfazActiva();
    actualizarInterfazDiaria();
    setInterval(actualizarTemporizadores, 1000);
});

function seleccionarVehiculo(btnElement, nombreVehiculo) {
    vehiculoSeleccionadoActual = nombreVehiculo;
    const todosLosBotones = document.querySelectorAll('.btn-opcion');
    todosLosBotones.forEach(btn => btn.classList.remove('seleccionado'));
    btnElement.classList.add('seleccionado');
}

function iniciarRenta() {
    if (!vehiculoSeleccionadoActual) return alert("Primero selecciona un vehículo");

    const ahora = new Date().getTime();
    const nuevaRenta = {
        id: Date.now(),
        nombre: vehiculoSeleccionadoActual,
        inicio: ahora,
        finProgramado: ahora + DURACION_RENTA_MS, // Guarda el momento exacto en que debe terminar
        alertaMostrada: false // Evita que la alerta se repita infinitamente
    };

    rentasActivas.push(nuevaRenta);
    localStorage.setItem('rentasActivas', JSON.stringify(rentasActivas));
    actualizarInterfazActiva();

    vehiculoSeleccionadoActual = null;
    document.querySelectorAll('.btn-opcion').forEach(btn => btn.classList.remove('seleccionado'));
}

function actualizarTemporizadores() {
    let huboCambios = false;
    const ahora = new Date().getTime();

    rentasActivas.forEach(renta => {
        const h3Reloj = document.getElementById(`h3Reloj-${renta.id}`);
        const cardElemento = document.getElementById(`card-${renta.id}`);
        
        // Calcular cuánto tiempo queda en lugar de cuánto tiempo ha pasado
        const tiempoRestante = renta.finProgramado - ahora;

        if (tiempoRestante <= 0) {
            // ¡EL TIEMPO SE AGOTÓ!
            if (h3Reloj) {
                h3Reloj.innerText = "00:00:00";
                h3Reloj.style.background = "#dc2626"; // Se pone rojo intenso
                h3Reloj.style.color = "#ffffff";
            }
            if (cardElemento) {
                cardElemento.classList.add('tiempo-agotado');
            }

            // Enviar la alerta en pantalla una sola vez por vehículo
            if (!renta.alertaMostrada) {
                renta.alertaMostrada = true;
                huboCambios = true;
                
                // Alerta nativa del navegador
                alert(`⚠️ ¡TIEMPO AGOTADO! El tiempo de renta para: "${renta.nombre}" ha finalizado.`);
            }
        } else {
            // El tiempo sigue corriendo, calcular horas, minutos y segundos restantes
            if (h3Reloj) {
                const h = Math.floor(tiempoRestante / 3600000).toString().padStart(2, '0');
                const m = Math.floor((tiempoRestante % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((tiempoRestante % 60000) / 1000).toString().padStart(2, '0');
                h3Reloj.innerText = `${h}:${m}:${s}`;
            }
        }
    });

    if (huboCambios) {
        localStorage.setItem('rentasActivas', JSON.stringify(rentasActivas));
    }
}

function actualizarInterfazActiva() {
    const contenedor = document.getElementById('listaRentasActivas');
    contenedor.innerHTML = '';

    rentasActivas.forEach(renta => {
        const ahora = new Date().getTime();
        const estaAgotado = ahora >= renta.finProgramado;

        const card = document.createElement('div');
        card.className = `renta-card ${estaAgotado ? 'tiempo-agotado' : ''}`;
        card.id = `card-${renta.id}`;
        
        card.innerHTML = `
            <div class="renta-encabezado">
                <strong>${renta.nombre}</strong>
                <span class="renta-tiempo-inicio">Inició: ${new Date(renta.inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="renta-cuerpo">
                <h3 class="timer-digital" id="h3Reloj-${renta.id}" style="${estaAgotado ? 'background:#dc2626; color:white;' : ''}">00:20:00</h3>
                <div class="renta-controles">
                    <button class="btn-opcion btn-extender" onclick="extenderTiempo(${renta.id})">Extender +20m</button>
                    <button class="btn-opcion btn-finalizar" onclick="finalizarRenta(${renta.id})">Finalizar</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function extenderTiempo(id) {
    const renta = rentasActivas.find(r => r.id === id);
    if (!renta) return;

    // Sumar 20 minutos más al tiempo de finalización programado
    renta.finProgramado += DURACION_RENTA_MS;
    renta.alertaMostrada = false; // Resetear la alerta por si ya se había agotado

    localStorage.setItem('rentasActivas', JSON.stringify(rentasActivas));
    actualizarInterfazActiva();
}

function finalizarRenta(id) {
    if (!confirm("¿Deseas finalizar esta renta?")) return;

    const rentaAFinalizar = rentasActivas.find(r => r.id === id);
    if (!rentaAFinalizar) return;

    const fin = new Date();
    // Calcular cuánto tiempo total real estuvo rentado
    const diferencia = fin.getTime() - rentaAFinalizar.inicio;
    const m = Math.floor(diferencia / 60000);

    const registroDiario = {
        nombre: rentaAFinalizar.nombre,
        inicioFormato: new Date(rentaAFinalizar.inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        finFormato: fin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        tiempoTotal: `${m} min`
    };

    rentasDiarias.unshift(registroDiario);
    rentasActivas = rentasActivas.filter(r => r.id !== id);

    localStorage.setItem('rentasActivas', JSON.stringify(rentasActivas));
    localStorage.setItem('rentasDiarias', JSON.stringify(rentasDiarias));

    actualizarInterfazActiva();
    actualizarInterfazDiaria();
}

function actualizarInterfazDiaria() {
    const contenedor = document.getElementById('tablaRentasDiarias');
    contenedor.innerHTML = '';
    rentasDiarias.forEach(renta => {
        contenedor.innerHTML += `
            <div class="resumen-card">
                <strong>${renta.nombre}</strong>: ${renta.inicioFormato} - ${renta.finFormato} | Duración real: ${renta.tiempoTotal}
            </div>`;
    });
}

function borrarRegistroDiario() {
    if (confirm("¿Borrar el historial de rentas del día? (No se puede deshacer)")) {
        rentasDiarias = [];
        localStorage.removeItem('rentasDiarias');
        actualizarInterfazDiaria();
    }
}
