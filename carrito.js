// --- Carrito simple con localStorage ---

function leerCarrito() {
    const datos = localStorage.getItem("carrito");
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

function anadirAlCarrito(nombre, precio) {
    const carrito = leerCarrito();
    const existe = carrito.find(p => p.nombre === nombre);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
    }
    guardarCarrito(carrito);
    alert(nombre + " anadido al carrito");
}

function quitarDelCarrito(nombre) {
    let carrito = leerCarrito();
    carrito = carrito.filter(p => p.nombre !== nombre);
    guardarCarrito(carrito);
    pintarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContador();
    pintarCarrito();
}

function actualizarContador() {
    const span = document.getElementById("contador-carrito");
    if (!span) return;
    const carrito = leerCarrito();
    const total = carrito.reduce((suma, p) => suma + p.cantidad, 0);
    span.textContent = total;
}

// --- Pintar la pagina del carrito ---

function pintarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalEl = document.getElementById("total-carrito");
    if (!lista) return;

    const carrito = leerCarrito();
    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = "<p>Tu carrito esta vacio.</p>";
        if (totalEl) totalEl.textContent = "0.00 EUR";
        return;
    }

    let total = 0;
    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        const fila = document.createElement("div");
        fila.className = "fila-carrito";
        fila.innerHTML =
            "<span>" + p.nombre + "</span>" +
            "<span>" + p.cantidad + " x " + p.precio.toFixed(2) + " EUR</span>" +
            "<span>" + subtotal.toFixed(2) + " EUR</span>" +
            '<button class="boton-azul btn-quitar">Quitar</button>';
        fila.querySelector(".btn-quitar").addEventListener("click", () => quitarDelCarrito(p.nombre));
        lista.appendChild(fila);
    });

    if (totalEl) totalEl.textContent = total.toFixed(2) + " EUR";
}

// --- Buscador del catalogo ---

function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const tarjetas = document.querySelectorAll(".productos-catalogo .tarjeta-producto");
    tarjetas.forEach(t => {
        const nombre = t.querySelector("h3").textContent.toLowerCase();
        t.style.display = nombre.includes(texto) ? "" : "none";
    });
}

// Al cargar cualquier pagina
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    pintarCarrito();
});
