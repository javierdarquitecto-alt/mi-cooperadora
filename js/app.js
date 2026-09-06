/**
 * ==========================================================
 * MI COOPERADORA
 * app.js
 * ==========================================================
 *
 * Punto de entrada principal de la aplicación.
 *
 * Orden de inicio:
 *
 * 1. Verificar almacenamiento.
 * 2. Inicializar la base de datos.
 * 3. Inicializar el Router.
 * 4. Verificar sesión de Supabase.
 * 5. Cargar Login o Dashboard.
 * 6. Preparar cierre de sesión.
 * 7. Ocultar el loader.
 * 8. Mostrar la aplicación.
 * ==========================================================
 */

const App = {

    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        try {

            console.log(
                `${CONFIG.APP_NAME} ${CONFIG.APP_VERSION}`
            );


            // ------------------------------------------------
            // 1. Verificar almacenamiento
            // ------------------------------------------------

            if (!Storage.isAvailable()) {

                throw new Error(
                    "El almacenamiento local no está disponible."
                );
            }


            // ------------------------------------------------
            // 2. Inicializar base de datos
            // ------------------------------------------------

            Database.init();


            // ------------------------------------------------
            // 3. Inicializar Router
            // ------------------------------------------------

            Router.init();


            // ------------------------------------------------
            // 4. Botón cerrar sesión
            // ------------------------------------------------

            const btnCerrarSesion =
                document.getElementById(
                    "btnCerrarSesion"
                );

            if (btnCerrarSesion) {

                btnCerrarSesion.addEventListener(
                    "click",
                    async () => {

                        const { error } =
                            await SupabaseClient.auth.signOut();

                        if (error) {

                            console.error(
                                "Error al cerrar sesión:",
                                error
                            );

                            return;
                        }

                        await Router.go(
                            "login"
                        );
                    }
                );
            }


            // ------------------------------------------------
            // 5. Verificar sesión de Supabase
            // ------------------------------------------------

            const {
                data: { session }
            } =
                await SupabaseClient.auth.getSession();


            // ------------------------------------------------
            // 6. Determinar página inicial
            // ------------------------------------------------

            const ruta =
                Router.obtenerRutaActual();


            if (!session) {

                await Router.go(
                    "login",
                    {},
                    false
                );

            } else {

                await Router.go(
                    ruta.route === "login"
                        ? "dashboard"
                        : ruta.route,
                    ruta.params,
                    false
                );
            }


            // ------------------------------------------------
            // 7. Ocultar loader
            // ------------------------------------------------

            this.ocultarLoader();


            // ------------------------------------------------
            // 8. Mostrar aplicación
            // ------------------------------------------------

            this.mostrarAplicacion();


            console.log(
                "Mi Cooperadora iniciada correctamente."
            );


        } catch (error) {

            console.error(
                "Error al iniciar Mi Cooperadora:",
                error
            );

            this.mostrarErrorInicial(
                error
            );
        }
    },


    // ======================================================
    // INTERFAZ
    // ======================================================

    ocultarLoader() {

        const loader =
            document.getElementById(
                "loader"
            );

        if (!loader) {
            return;
        }

        loader.style.display =
            "none";
    },


    mostrarAplicacion() {

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        app.style.display =
            "block";
    },


    mostrarErrorInicial(error) {

        const loader =
            document.getElementById(
                "loader"
            );

        if (loader) {

            loader.style.display =
                "none";
        }


        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }


        app.style.display =
            "block";


        app.innerHTML = `

            <section class="error-page">

                <div class="error-page__content">

                    <h1>
                        No se pudo iniciar la aplicación
                    </h1>

                    <p>
                        Ocurrió un problema al iniciar
                        Mi Cooperadora.
                    </p>

                    ${
                        CONFIG.APP.debug
                            ? `
                                <pre>
${Utils.escaparHTML(
    error?.message ||
    String(error)
)}
                                </pre>
                              `
                            : ""
                    }

                    <button
                        type="button"
                        onclick="window.location.reload()"
                    >
                        Intentar nuevamente
                    </button>

                </div>

            </section>

        `;
    }

};


// ==========================================================
// INICIO DE LA APLICACIÓN
// ==========================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);