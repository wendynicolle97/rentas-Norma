let rentasActivas = JSON.parse(localStorage.getItem('rentasActivas')) || [];
let rentasDiarias = JSON.parse(localStorage.getItem('rentasDiarias')) || [];
let vehiculoSeleccionadoActual = null;

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

    const nuevaRenta = {
        id: Date.now(),
        nombre: vehiculoSeleccionadoActual,
        inicio: new Date().getTime()
    };

    rentasActivas.push(nuevaRenta);
    localStorage.setItem('rentasActivas', JSON.stringify(rentasActivas));
    actualizarInterfazActiva();

    vehiculoSeleccionadoActual = null;
    document.querySelectorAll('.btn-opcion').forEach(btn => btn.classList.remove('seleccionado'));
}

function actualizarTemporizadores() {
    rentasActivas.forEach(renta => {
        const h3Reloj = document.getElementById(`h3Reloj-${renta.id}`);
        if (h3Reloj) {
            const ahora = new Date().getTime();
            const diferencia = ahora - renta.inicio;
            const h = Math.floor(diferencia / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diferencia % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diferencia % 60000) / 1000).toString().padStart(2, '0');
            h3Reloj.innerText = `${h}:${m}:${s}`;
        }
    });
}

function actualizarInterfazActiva() {
    const contenedor = document.getElementById('listaRentasActivas');
    contenedor.innerHTML = '';

    rentasActivas.forEach(renta => {
        const card = document.createElement('div');
        card.className = 'renta-card';
        card.innerHTML = `
            <div class="renta-encabezado">
                <strong>${renta.nombre}</strong>
                <span class="renta-tiempo-inicio">${new Date(renta.inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="renta-cuerpo">
                <h3 class="timer-digital" id="h3Reloj-${renta.id}">00:00:00</h3>
                <div class="renta-controles">
                    <button class="btn-opcion btn-extender" onclick="alert('Funcionalidad para añadir tiempo')">Extender</button>
                    <button class="btn-opcion btn-finalizar" onclick="finalizarRenta(${renta.id})">Finalizar</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function finalizarRenta(id) {
    if (!confirm("¿Deseas finalizar esta renta?")) return;

    const rentaAFinalizar = rentasActivas.find(r => r.id === id);
    if (!rentaAFinalizar) return;

    const fin = new Date();
    const diferencia = fin.getTime() - rentaAFinalizar.inicio;
    const m = Math.floor((diferencia % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diferencia % 60000) / 1000).toString().padStart(2, '0');

    const registroDiario = {
        nombre: rentaAFinalizar.nombre,
        inicioFormato: new Date(rentaAFinalizar.inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        finFormato: fin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        tiempoTotal: `${m}:${s} min`
    };

    rentasDiarias.unshift(registroDiario); // Lo más nuevo arriba
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
                <strong>${renta.nombre}</strong>: ${renta.inicioFormato} - ${renta.finFormato} | Total: ${renta.tiempoTotal}
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
