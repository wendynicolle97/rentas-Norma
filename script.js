let rentas = JSON.parse(localStorage.getItem('rentas_activas')) || [];

// Al cargar la página, dibujar lo que estaba guardado
document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfaz();
    setInterval(actualizarCronometros, 1000);
});

function iniciarRenta() {
    const nombre = document.getElementById('nombreCliente').value;
    if (!nombre) return alert("Por favor, ingresa un nombre o ID del vehículo");

    const nuevaRenta = {
        id: Date.now(),
        nombre: nombre,
        inicio: new Date().getTime()
    };

    rentas.push(nuevaRenta);
    guardarYRefrescar();
    document.getElementById('nombreCliente').value = '';
}

function actualizarInterfaz() {
    const contenedor = document.getElementById('listaRentas');
    contenedor.innerHTML = '';

    rentas.forEach(renta => {
        const card = document.createElement('div');
        card.className = 'renta-card';
        card.innerHTML = `
            <div class="info-cliente">
                <strong>${renta.nombre}</strong><br>
                <small>Inició: ${new Date(renta.inicio).toLocaleTimeString()}</small>
            </div>
            <div class="timer" id="reloj-${renta.id}">00:00:00</div>
            <button class="btn-finalizar" onclick="finalizarRenta(${renta.id})">Cobrar</button>
        `;
        contenedor.appendChild(card);
    });
}

function actualizarCronometros() {
    rentas.forEach(renta => {
        const elementoReloj = document.getElementById(`reloj-${renta.id}`);
        if (elementoReloj) {
            const ahora = new Date().getTime();
            const diferencia = ahora - renta.inicio;

            const h = Math.floor(diferencia / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diferencia % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diferencia % 60000) / 1000).toString().padStart(2, '0');

            elementoReloj.innerText = `${h}:${m}:${s}`;
        }
    });
}

function finalizarRenta(id) {
    if (confirm("¿Finalizar renta y calcular tiempo?")) {
        rentas = rentas.filter(r => r.id !== id);
        guardarYRefrescar();
    }
}

function guardarYRefrescar() {
    localStorage.setItem('rentas_activas', JSON.stringify(rentas));
    actualizarInterfaz();
}
