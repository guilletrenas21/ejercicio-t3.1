function mostrarAviso(titulo, texto, enlace, textoEnlace) {
    let modal = document.getElementById("modal-aviso");
    if (!modal) {
        modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "modal-aviso";
        modal.tabIndex = -1;
        modal.setAttribute("aria-labelledby", "modal-aviso-titulo");
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML =
            '<div class="modal-dialog modal-dialog-centered">' +
                '<div class="modal-content">' +
                    '<div class="modal-header bg-primary text-white">' +
                        '<h5 class="modal-title" id="modal-aviso-titulo"></h5>' +
                        '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
                    '</div>' +
                    '<div class="modal-body"><p id="modal-aviso-texto"></p></div>' +
                    '<div class="modal-footer">' +
                        '<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>' +
                        '<a id="modal-aviso-enlace" class="btn btn-primary" href="#"></a>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    }
    modal.querySelector("#modal-aviso-titulo").textContent = titulo;
    modal.querySelector("#modal-aviso-texto").textContent = texto;
    const boton = modal.querySelector("#modal-aviso-enlace");
    if (enlace) {
        boton.href = enlace;
        boton.textContent = textoEnlace;
        boton.classList.remove("d-none");
    } else {
        boton.classList.add("d-none");
    }
    bootstrap.Modal.getOrCreateInstance(modal).show();
}

function prepararFormulario(id, alEnviar, antes) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", e => {
        e.preventDefault();
        if (antes) antes(form);
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        alEnviar(form);
        form.reset();
        form.classList.remove("was-validated");
    });
}

function filtrarNovedades(categoria, boton) {
    document.querySelectorAll(".filtros-novedades .nav-link").forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    document.querySelectorAll("[data-categoria]").forEach(c => {
        c.classList.toggle("d-none", categoria !== "todos" && c.dataset.categoria !== categoria);
    });
}

let descuentoPago = 0;

function totalCarrito() {
    return leerCarrito().reduce((suma, p) => suma + p.precio * p.cantidad, 0);
}

function crearLinea(titulo, detalle, importe, clase) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between lh-sm " + (clase || "");
    const caja = document.createElement("div");
    const h6 = document.createElement("h6");
    h6.className = "my-0";
    h6.textContent = titulo;
    caja.appendChild(h6);
    if (detalle) {
        const small = document.createElement("small");
        small.className = "text-body-secondary";
        small.textContent = detalle;
        caja.appendChild(small);
    }
    const span = document.createElement("span");
    span.textContent = importe;
    li.appendChild(caja);
    li.appendChild(span);
    return li;
}

function pintarResumenPago() {
    const lista = document.getElementById("resumen-pago");
    if (!lista) return;
    const carrito = leerCarrito();
    lista.innerHTML = "";
    if (carrito.length === 0) {
        lista.appendChild(crearLinea("Tu carrito esta vacio", "Anade productos desde el catalogo", "0.00 EUR"));
    }
    carrito.forEach(p => {
        lista.appendChild(crearLinea(p.nombre, p.cantidad + " x " + p.precio.toFixed(2) + " EUR", (p.precio * p.cantidad).toFixed(2) + " EUR"));
    });
    const total = totalCarrito();
    const rebaja = total * descuentoPago;
    if (rebaja > 0) {
        lista.appendChild(crearLinea("Codigo NOVEDAD10", "10% de descuento", "-" + rebaja.toFixed(2) + " EUR", "text-success bg-success-subtle"));
    }
    const final = crearLinea("Total", "", (total - rebaja).toFixed(2) + " EUR", "fw-bold");
    lista.appendChild(final);
    const numero = document.getElementById("numero-productos");
    if (numero) numero.textContent = carrito.reduce((suma, p) => suma + p.cantidad, 0);
}

document.addEventListener("DOMContentLoaded", () => {
    prepararFormulario("form-registro", form => {
        const nombre = form.querySelector("#registro-nombre").value.trim();
        const email = form.querySelector("#registro-email").value.trim().toLowerCase();
        localStorage.setItem("usuario", JSON.stringify({ nombre: nombre, email: email }));
        mostrarAviso("Registro completado", "Tu cuenta se ha creado, " + nombre + ". Ya puedes iniciar sesion.", "login.html", "Iniciar sesion");
    }, form => {
        const clave = form.querySelector("#registro-clave").value;
        const repetir = form.querySelector("#registro-repetir");
        repetir.setCustomValidity(repetir.value === clave ? "" : "Las claves no coinciden");
    });

    prepararFormulario("form-login", form => {
        const email = form.querySelector("#login-email").value.trim().toLowerCase();
        const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
        if (usuario && usuario.email === email) {
            mostrarAviso("Sesion iniciada", "Bienvenido de nuevo, " + usuario.nombre + ".", "tienda.html", "Ir a la tienda");
        } else {
            mostrarAviso("No encontramos tu cuenta", "No hay ninguna cuenta con ese correo. Registrate primero.", "registro.html", "Crear cuenta");
        }
    });

    prepararFormulario("form-contacto", () => {
        mostrarAviso("Mensaje enviado", "Gracias por escribirnos. Te responderemos pronto.");
    });

    prepararFormulario("form-boletin", () => {
        mostrarAviso("Suscripcion completada", "Te avisaremos de las novedades y ofertas de la tienda.");
    });

    prepararFormulario("form-codigo", form => {
        const codigo = form.querySelector("#codigo-promo").value.trim().toUpperCase();
        if (codigo === "NOVEDAD10") {
            descuentoPago = 0.1;
            mostrarAviso("Codigo aplicado", "Tienes un 10% de descuento en tu pedido.");
        } else {
            descuentoPago = 0;
            mostrarAviso("Codigo no valido", "Ese codigo no existe. Prueba con NOVEDAD10.");
        }
        pintarResumenPago();
    });

    prepararFormulario("form-pago", form => {
        if (leerCarrito().length === 0) {
            mostrarAviso("Tu carrito esta vacio", "Anade algun producto antes de pagar.", "catalogo.html", "Ir al catalogo");
            return;
        }
        const nombre = form.querySelector("#pago-nombre").value.trim();
        const total = (totalCarrito() * (1 - descuentoPago)).toFixed(2);
        vaciarCarrito();
        descuentoPago = 0;
        pintarResumenPago();
        mostrarAviso("Compra realizada", "Gracias, " + nombre + ". Has pagado " + total + " EUR. Tu pedido llegara en 1-3 dias.", "tienda.html", "Volver a la tienda");
    });

    document.querySelectorAll('input[name="metodo"]').forEach(radio => {
        radio.addEventListener("change", () => {
            const tarjeta = document.getElementById("pago-tarjeta").checked;
            const caja = document.getElementById("datos-tarjeta");
            caja.classList.toggle("d-none", !tarjeta);
            caja.querySelectorAll("input").forEach(i => { i.disabled = !tarjeta; });
        });
    });

    const formPago = document.getElementById("form-pago");
    if (formPago) {
        formPago.addEventListener("reset", () => {
            const caja = document.getElementById("datos-tarjeta");
            caja.classList.remove("d-none");
            caja.querySelectorAll("input").forEach(i => { i.disabled = false; });
        });
    }

    pintarResumenPago();
});
