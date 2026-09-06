/**
 * ==========================================================
 * MI COOPERADORA
 * utils.js
 * ==========================================================
 *
 * Funciones auxiliares reutilizables por toda la aplicación.
 * ==========================================================
 */

const Utils = {

    // ======================================================
    // FECHAS
    // ======================================================

    fechaActual() {

        const fecha = new Date();

        const year = fecha.getFullYear();

        const month = String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            fecha.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    },


    formatearFecha(fecha) {

        if (!fecha) {
            return "";
        }

        const valor = String(fecha);

        const partes = valor.split("-");

        if (partes.length !== 3) {
            return valor;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    },


    formatearFechaLarga(fecha) {

        if (!fecha) {
            return "";
        }

        const partes = String(fecha).split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        const fechaObjeto = new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

        return new Intl.DateTimeFormat(
            "es-AR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(fechaObjeto);
    },


    // ======================================================
    // IMPORTES
    // ======================================================

    formatearImporte(valor) {

        const numero = Number(valor) || 0;

        return new Intl.NumberFormat(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2
            }
        ).format(numero);
    },


    numero(valor) {

        const numero = Number(valor);

        if (Number.isNaN(numero)) {
            return 0;
        }

        return numero;
    },


    // ======================================================
    // TEXTO
    // ======================================================

    normalizarTexto(texto) {

        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    },


    capitalizar(texto) {

        if (!texto) {
            return "";
        }

        const valor =
            String(texto)
                .trim()
                .toLowerCase();

        return valor.charAt(0).toUpperCase() +
            valor.slice(1);
    },


    nombreCompleto(apellido, nombre) {

        return [

            apellido,

            nombre

        ]
            .filter(Boolean)
            .join(", ");
    },


    // ======================================================
    // VALIDACIONES
    // ======================================================

    esEmailValido(email) {

        if (!email) {
            return false;
        }

        const patron =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return patron.test(
            String(email).trim()
        );
    },


    esDniValido(dni) {

        if (!dni) {
            return false;
        }

        const valor =
            String(dni)
                .replace(/\D/g, "");

        return (
            valor.length >= 7 &&
            valor.length <= 8
        );
    },


    esTelefonoValido(telefono) {

        if (!telefono) {
            return false;
        }

        const valor =
            String(telefono)
                .replace(/\D/g, "");

        return valor.length >= 8;
    },


    // ======================================================
    // DOM
    // ======================================================

    obtenerElemento(selector) {

        return document.querySelector(
            selector
        );
    },


    obtenerElementos(selector) {

        return [
            ...document.querySelectorAll(
                selector
            )
        ];
    },


    mostrarElemento(elemento) {

        if (!elemento) {
            return;
        }

        elemento.style.display = "";
    },


    ocultarElemento(elemento) {

        if (!elemento) {
            return;
        }

        elemento.style.display = "none";
    },


    // ======================================================
    // MENSAJES
    // ======================================================

    confirmar(mensaje) {

        return window.confirm(
            mensaje
        );
    },


    alertar(mensaje) {

        window.alert(
            mensaje
        );
    },


    // ======================================================
    // HTML
    // ======================================================

    escaparHTML(texto) {

        const div =
            document.createElement("div");

        div.textContent =
            String(texto ?? "");

        return div.innerHTML;
    },


    // ======================================================
    // IDs
    // ======================================================

    generarIdTemporal(prefijo = "ID") {

        const tiempo =
            Date.now();

        const aleatorio =
            Math.floor(
                Math.random() * 1000
            );

        return `${prefijo}-${tiempo}-${aleatorio}`;
    },


    // ======================================================
    // DESCARGAS
    // ======================================================

    descargarArchivo(
        contenido,
        nombre,
        tipo = "text/plain"
    ) {

        const blob =
            new Blob(
                [contenido],
                { type: tipo }
            );

        const url =
            URL.createObjectURL(blob);

        const enlace =
            document.createElement("a");

        enlace.href = url;

        enlace.download = nombre;

        document.body.appendChild(
            enlace
        );

        enlace.click();

        enlace.remove();

        URL.revokeObjectURL(url);
    },


    // ======================================================
    // DEBOUNCE
    // ======================================================

    debounce(funcion, espera = 300) {

        let temporizador;

        return (...argumentos) => {

            clearTimeout(
                temporizador
            );

            temporizador = setTimeout(

                () => {

                    funcion(
                        ...argumentos
                    );

                },

                espera

            );
        };
    }

};