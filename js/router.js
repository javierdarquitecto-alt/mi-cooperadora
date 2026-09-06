/**
 * ==========================================================
 * MI COOPERADORA
 * router.js
 * ==========================================================
 *
 * Sistema de navegación de la aplicación.
 *
 * Se encarga de cargar las diferentes páginas dentro del
 * contenedor principal de index.html.
 * ==========================================================
 */

const Router = {

    // ======================================================
    // CONFIGURACIÓN
    // ======================================================

    container: null,

    currentRoute: null,

    routes: {

        login: {
            page: "pages/login.html",
            module: "login"
        },

        dashboard: {
            page: "pages/dashboard.html",
            module: "dashboard"
        },

        familias: {
            page: "pages/familias.html",
            module: "familias"
        },

        "nueva-familia": {
            page: "pages/nueva-familia.html",
            module: "nueva-familia"
        },

        familia: {
            page: "pages/familia.html",
            module: "ficha-familia"
        },

        cuotas: {
            page: "pages/cuotas.html",
            module: "cuotas"
        },

        recibo: {
            page: "pages/recibo.html",
            module: "recibo"
        },

        caja: {
            page: "pages/caja.html",
            module: "caja"
        },

        reportes: {
            page: "pages/reportes.html",
            module: "reportes"
        },

        "nuevo-alumno": {
            page: "pages/nuevo-alumno.html",
            module: "nuevo-alumno"
        },

        configuracion: {
            page: "pages/configuracion.html",
            module: "configuracion"
        },

        ventas: {
            page: "pages/ventas.html",
            module: "ventas"
        },

        sorteos: {
            page: "pages/sorteos.html",
            module: "sorteos"
        }
    },


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    init() {

        this.container =
            document.getElementById("app");

        if (!this.container) {

            console.error(
                "Router: no se encontró #app."
            );

            return false;
        }

        window.addEventListener(
            "popstate",
            () => {

                this.handleLocation();

            }
        );

        document.addEventListener(
            "click",
            (event) => {

                const enlace =
                    event.target.closest(
                        "[data-route]"
                    );

                if (!enlace) {
                    return;
                }

                event.preventDefault();

                const route =
                    enlace.dataset.route;

                const params =
                    this.obtenerParametrosEnlace(
                        enlace
                    );

                this.go(
                    route,
                    params
                );

            }
        );

        return true;
    },


    // ======================================================
    // NAVEGACIÓN
    // ======================================================

    async go(
        route = "dashboard",
        params = {},
        agregarHistorial = true
    ) {

        try {

            // ------------------------------------------------
            // PROTECCIÓN DE RUTAS
            // ------------------------------------------------

            if (route !== "login") {

                const {
                    data: { session }
                } =
                    await SupabaseClient.auth.getSession();

                if (!session) {

                    route = "login";
                    params = {};
                }
            }


            // ------------------------------------------------
            // VERIFICAR RUTA
            // ------------------------------------------------

            const ruta =
                this.routes[route];

            if (!ruta) {

                console.error(
                    `Router: ruta desconocida "${route}".`
                );

                return false;
            }


            // ------------------------------------------------
            // CONSTRUIR URL
            // ------------------------------------------------

            const url =
                this.construirURL(
                    route,
                    params
                );


            // ------------------------------------------------
            // HISTORIAL
            // ------------------------------------------------

            if (agregarHistorial) {

                window.history.pushState(
                    {
                        route,
                        params
                    },
                    "",
                    url
                );
            }


            // ------------------------------------------------
            // CARGAR PÁGINA
            // ------------------------------------------------

            await this.cargarPagina(
                ruta.page
            );


            this.currentRoute =
                route;


            // ------------------------------------------------
            // CARGAR MÓDULO
            // ------------------------------------------------

            await this.cargarModulo(
                ruta.module
            );


            // ------------------------------------------------
            // ACTUALIZAR NAVEGACIÓN
            // ------------------------------------------------

            this.actualizarNavegacion(
                route
            );


            window.scrollTo(
                {
                    top: 0,
                    behavior: "instant"
                }
            );


            return true;


        } catch (error) {

            console.error(
                "Router.go:",
                error
            );

            await this.mostrarError();

            return false;
        }
    },


    async handleLocation() {

        const informacion =
            this.obtenerRutaActual();

        await this.go(
            informacion.route,
            informacion.params,
            false
        );
    },


    // ======================================================
    // CARGA DE PÁGINAS
    // ======================================================

    async cargarPagina(url) {

        const respuesta =
            await fetch(url);

        if (!respuesta.ok) {

            throw new Error(
                `No se pudo cargar ${url}`
            );
        }

        const html =
            await respuesta.text();

        this.container.innerHTML =
            html;
    },


    // ======================================================
    // CARGA DE MÓDULOS
    // ======================================================

    async cargarModulo(nombre) {

        if (!nombre) {
            return;
        }

        const archivo =
            this.obtenerArchivoModulo(
                nombre
            );

        if (!archivo) {
            return;
        }

        const existente =
            document.querySelector(
                `script[data-module="${nombre}"]`
            );

        if (!existente) {

            await this.cargarScript(
                archivo,
                nombre
            );
        }

        const modulo =
            window[
                this.obtenerNombreGlobal(
                    nombre
                )
            ];

        if (
            modulo &&
            typeof modulo.init === "function"
        ) {

            await modulo.init();
        }
    },


    cargarScript(
        archivo,
        nombre
    ) {

        return new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    archivo;

                script.dataset.module =
                    nombre;

                script.onload =
                    () => resolve();

                script.onerror =
                    () => reject(

                        new Error(
                            `No se pudo cargar el módulo ${archivo}`
                        )

                    );

                document.body.appendChild(
                    script
                );
            }
        );
    },


    obtenerArchivoModulo(nombre) {

        const archivos = {

            login:
                "js/modules/login.js",

            dashboard:
                "js/modules/dashboard.js",

            familias:
                "js/modules/familias.js",

            "nueva-familia":
                "js/modules/nueva-familia.js",

            "ficha-familia":
                "js/modules/ficha-familia.js",

            cuotas:
                "js/modules/cuotas.js",

            recibo:
                "js/modules/recibo.js",

            caja:
                "js/modules/caja.js",

            reportes:
                "js/modules/reportes.js",

            "nuevo-alumno":
                "js/modules/nuevo-alumno.js",

            configuracion:
                "js/modules/configuracion.js",

            ventas:
                "js/modules/ventas.js",

            sorteos:
                "js/modules/sorteos.js"
        };

        return archivos[nombre] || null;
    },


    obtenerNombreGlobal(nombre) {

        const nombres = {

            login:
                "Login",

            dashboard:
                "Dashboard",

            familias:
                "Familias",

            "nueva-familia":
                "NuevaFamilia",

            "ficha-familia":
                "FichaFamilia",

            cuotas:
                "Cuotas",

            recibo:
                "Recibo",

            caja:
                "Caja",

            reportes:
                "Reportes",

            "nuevo-alumno":
                "NuevoAlumno",

            configuracion:
                "Configuracion",

            ventas:
                "Ventas",

            sorteos:
                "Sorteos"
        };

        return nombres[nombre] || "";
    },


    // ======================================================
    // URL
    // ======================================================

    construirURL(
        route,
        params = {}
    ) {

        const parametros =
            new URLSearchParams();

        Object.entries(params)
            .forEach(
                ([clave, valor]) => {

                    if (
                        valor !== undefined &&
                        valor !== null &&
                        valor !== ""
                    ) {

                        parametros.set(
                            clave,
                            valor
                        );
                    }
                }
            );

        const query =
            parametros.toString();

        return query
            ? `?route=${encodeURIComponent(route)}&${query}`
            : `?route=${encodeURIComponent(route)}`;
    },


    obtenerRutaActual() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );

        const route =
            parametros.get("route") ||
            "dashboard";

        const params = {};

        parametros.forEach(
            (valor, clave) => {

                if (clave !== "route") {

                    params[clave] =
                        valor;
                }
            }
        );

        return {
            route,
            params
        };
    },


    obtenerParametrosEnlace(enlace) {

        const parametros = {};

        Object.entries(
            enlace.dataset
        ).forEach(
            ([clave, valor]) => {

                if (
                    clave !== "route" &&
                    valor !== ""
                ) {

                    parametros[clave] =
                        valor;
                }
            }
        );

        return parametros;
    },


    // ======================================================
    // NAVEGACIÓN VISUAL
    // ======================================================

    actualizarNavegacion(route) {

        document
            .querySelectorAll(
                "[data-route]"
            )
            .forEach(
                elemento => {

                    const activo =
                        elemento.dataset.route ===
                        route;

                    elemento.classList.toggle(
                        "active",
                        activo
                    );

                }
            );
    },


    // ======================================================
    // ERROR
    // ======================================================

    async mostrarError() {

        if (!this.container) {
            return;
        }

        this.container.innerHTML = `

            <section class="error-page">

                <div class="error-page__content">

                    <h1>
                        Ocurrió un error
                    </h1>

                    <p>
                        No se pudo cargar la página solicitada.
                    </p>

                    <button
                        type="button"
                        data-route="dashboard"
                    >
                        Volver al inicio
                    </button>

                </div>

            </section>

        `;
    }

};