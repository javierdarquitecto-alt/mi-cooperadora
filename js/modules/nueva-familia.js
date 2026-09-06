/**
 * ==========================================================
 * MI COOPERADORA
 * nueva-familia.js
 * ==========================================================
 *
 * Módulo para crear y editar familias.
 * ==========================================================
 */

window.NuevaFamilia = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        const ruta =
            Router.obtenerRutaActual();

        const familiaId =
            ruta.params.id || null;


        let familia = null;


        if (familiaId) {

            try {

                familia =
                    await FamiliasService
                        .obtenerPorIdNube(
                            familiaId
                        );

            } catch (error) {

                console.error(
                    "Error al cargar familia desde Supabase:",
                    error
                );

                this.render();

                this.mostrarError(
                    "No se pudo cargar la familia desde la nube."
                );

                return;
            }


            if (!familia) {

                this.render();

                this.mostrarError(
                    "La familia no existe."
                );

                return;
            }
        }


        this.render(
            familia
        );


        this.configurarEventos(
            familiaId
        );
    },


    // ======================================================
    // RENDER
    // ======================================================

    render(familia = null) {

        const contenedor =
            document.getElementById(
                "nueva-familia"
            );

        if (!contenedor) {
            return;
        }


        const editando =
            Boolean(familia);


        contenedor.innerHTML = `

            <section class="nueva-familia">

                <header class="nueva-familia__header">

                    <div>

                        <button
                            type="button"
                            class="btn-volver"
                            data-route="familias"
                        >
                            ← Volver a familias
                        </button>

                        <span class="nueva-familia__eyebrow">
                            Familias
                        </span>

                        <h1>
                            ${
                                editando
                                    ? "Editar familia"
                                    : "Nueva familia"
                            }
                        </h1>

                        <p>
                            ${
                                editando
                                    ? "Modificá los datos registrados de la familia."
                                    : "Ingresá los datos para registrar una nueva familia."
                            }
                        </p>

                    </div>

                </header>


                <form
                    id="form-familia"
                    class="nueva-familia__form"
                    novalidate
                >

                    <!-- DATOS PERSONALES -->

                    <section class="form-card">

                        <div class="form-card__header">

                            <div class="form-card__icon">
                                👤
                            </div>

                            <div>

                                <h2>
                                    Datos principales
                                </h2>

                                <p>
                                    Información del responsable o referente familiar.
                                </p>

                            </div>

                        </div>


                        <div class="form-grid">

                            <div class="form-group">

                                <label for="familia-apellido">
                                    Apellido *
                                </label>

                                <input
                                    type="text"
                                    id="familia-apellido"
                                    name="apellido"
                                    placeholder="Ej. González"
                                    value="${Utils.escaparHTML(
                                        familia?.apellido || ""
                                    )}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="familia-nombre">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    id="familia-nombre"
                                    name="nombre"
                                    placeholder="Ej. María"
                                    value="${Utils.escaparHTML(
                                        familia?.nombre || ""
                                    )}"
                                >

                            </div>


                            <div class="form-group">

                                <label for="familia-dni">
                                    DNI
                                </label>

                                <input
                                    type="text"
                                    id="familia-dni"
                                    name="dni"
                                    inputmode="numeric"
                                    placeholder="Sin puntos"
                                    value="${Utils.escaparHTML(
                                        familia?.dni || ""
                                    )}"
                                >

                            </div>

                        </div>

                    </section>


                    <!-- CONTACTO -->

                    <section class="form-card">

                        <div class="form-card__header">

                            <div class="form-card__icon">
                                ☎
                            </div>

                            <div>

                                <h2>
                                    Contacto
                                </h2>

                                <p>
                                    Datos para comunicarse con la familia.
                                </p>

                            </div>

                        </div>


                        <div class="form-grid">

                            <div class="form-group">

                                <label for="familia-telefono">
                                    Teléfono
                                </label>

                                <input
                                    type="tel"
                                    id="familia-telefono"
                                    name="telefono"
                                    placeholder="Ej. 341 555 0000"
                                    value="${Utils.escaparHTML(
                                        familia?.telefono || ""
                                    )}"
                                >

                            </div>


                            <div class="form-group">

                                <label for="familia-email">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    id="familia-email"
                                    name="email"
                                    placeholder="nombre@email.com"
                                    value="${Utils.escaparHTML(
                                        familia?.email || ""
                                    )}"
                                >

                            </div>

                        </div>

                    </section>


                    <!-- DOMICILIO -->

                    <section class="form-card">

                        <div class="form-card__header">

                            <div class="form-card__icon">
                                ⌂
                            </div>

                            <div>

                                <h2>
                                    Domicilio
                                </h2>

                                <p>
                                    Dirección registrada de la familia.
                                </p>

                            </div>

                        </div>


                        <div class="form-group">

                            <label for="familia-direccion">
                                Dirección
                            </label>

                            <input
                                type="text"
                                id="familia-direccion"
                                name="direccion"
                                placeholder="Calle, número, localidad"
                                value="${Utils.escaparHTML(
                                    familia?.direccion || ""
                                )}"
                            >

                        </div>

                    </section>


                    <!-- OBSERVACIONES -->

                    <section class="form-card">

                        <div class="form-card__header">

                            <div class="form-card__icon">
                                ✎
                            </div>

                            <div>

                                <h2>
                                    Observaciones
                                </h2>

                                <p>
                                    Información adicional que resulte útil.
                                </p>

                            </div>

                        </div>


                        <div class="form-group">

                            <textarea
                                id="familia-observaciones"
                                name="observaciones"
                                rows="4"
                                placeholder="Escribí aquí cualquier observación..."
                            >${Utils.escaparHTML(
                                familia?.observaciones || ""
                            )}</textarea>

                        </div>

                    </section>


                    <div
                        id="familia-form-error"
                        class="form-error"
                        hidden
                    >
                    </div>


                    <div class="nueva-familia__actions">

                        <button
                            type="button"
                            class="btn-secundario"
                            data-route="familias"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            class="btn-guardar"
                        >
                            ${
                                editando
                                    ? "Guardar cambios"
                                    : "Guardar familia"
                            }
                        </button>

                    </div>

                </form>

            </section>

        `;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos(
        familiaId
    ) {

        const formulario =
            document.getElementById(
                "form-familia"
            );

        if (!formulario) {
            return;
        }


        formulario.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await this.guardar(
                    formulario,
                    familiaId
                );
            }
        );


        const email =
            document.getElementById(
                "familia-email"
            );


        if (email) {

            email.addEventListener(
                "blur",
                () => {

                    if (
                        email.value &&
                        !Utils.esEmailValido(
                            email.value
                        )
                    ) {

                        email.setCustomValidity(
                            "Ingresá un email válido."
                        );

                    } else {

                        email.setCustomValidity(
                            ""
                        );
                    }
                }
            );
        }
    },


    // ======================================================
    // GUARDAR
    // ======================================================

    async guardar(
        formulario,
        familiaId
    ) {

        const datos =
            Object.fromEntries(
                new FormData(
                    formulario
                ).entries()
            );


        if (
            !datos.apellido &&
            !datos.nombre
        ) {

            this.mostrarError(
                "Ingresá al menos el apellido o el nombre."
            );

            return;
        }


        if (
            datos.email &&
            !Utils.esEmailValido(
                datos.email
            )
        ) {

            this.mostrarError(
                "El email ingresado no es válido."
            );

            return;
        }


        try {

            let familia;


            if (familiaId) {

                familia =
                    await FamiliasService.actualizar(
                        familiaId,
                        datos
                    );

            } else {

                familia =
                    await FamiliasService.crear(
                        datos
                    );
            }


            if (!familia) {

                throw new Error(
                    "No se pudo guardar la familia."
                );
            }


            await Router.go(
                "familia",
                {
                    id: familia.id
                }
            );


        } catch (e) {

            console.error(
                "Error al guardar familia:",
                e
            );


            this.mostrarError(
                e.message ||
                "Ocurrió un error al guardar la familia."
            );
        }
    },


    // ======================================================
    // ERROR
    // ======================================================

    mostrarError(
        mensaje
    ) {

        const elemento =
            document.getElementById(
                "familia-form-error"
            );


        if (!elemento) {
            return;
        }


        elemento.textContent =
            mensaje;

        elemento.hidden =
            false;
    }

};