/**
 * ==========================================================
 * MI COOPERADORA
 * nuevo-alumno.js
 * ==========================================================
 *
 * Permite crear y editar alumnos.
 * ==========================================================
 */

window.NuevoAlumno = {

    async init() {

        const ruta =
            Router.obtenerRutaActual();

        const familiaId =
            ruta.params.familiaId;

        const alumnoId =
            ruta.params.alumnoId || null;


        if (!familiaId) {

            this.mostrarError(
                "No se indicó la familia."
            );

            return;
        }


        // ==================================================
        // FAMILIA DESDE SUPABASE
        // ==================================================

        let familia = null;


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


            this.mostrarError(
                "No se pudo cargar la familia desde la nube."
            );

            return;
        }


        if (!familia) {

            this.mostrarError(
                "La familia no existe."
            );

            return;
        }


        // ==================================================
        // ALUMNO
        // ==================================================

        let alumno = null;


        if (alumnoId) {

            try {

                alumno =
                    await FamiliasService
                        .obtenerAlumnoNube(
                            alumnoId
                        );

            } catch (error) {

                console.error(
                    "Error al cargar alumno desde Supabase:",
                    error
                );


                this.mostrarError(
                    "No se pudo cargar el alumno desde la nube."
                );

                return;
            }
        }


        if (
            alumnoId &&
            !alumno
        ) {

            this.mostrarError(
                "El alumno no existe."
            );

            return;
        }


        this.render(
            familia,
            alumno
        );


        this.configurarEventos(
            familiaId,
            alumnoId
        );
    },


    render(
        familia,
        alumno = null
    ) {

        const contenedor =
            document.getElementById(
                "nuevo-alumno"
            );


        if (!contenedor) {
            return;
        }


        const editando =
            Boolean(alumno);


        contenedor.innerHTML = `

            <section class="nuevo-alumno">

                <header class="nuevo-alumno__header">

                    <button
                        type="button"
                        class="btn-volver"
                        data-route="familia"
                        data-id="${familia.id}"
                    >
                        ← Volver a la familia
                    </button>


                    <span class="nuevo-alumno__eyebrow">
                        Alumnos
                    </span>


                    <h1>
                        ${
                            editando
                                ? "Editar alumno"
                                : "Agregar alumno"
                        }
                    </h1>


                    <p>
                        Familia:
                        <strong>
                            ${Utils.escaparHTML(
                                Utils.nombreCompleto(
                                    familia.apellido,
                                    familia.nombre
                                )
                            )}
                        </strong>
                    </p>

                </header>


                <form
                    id="form-alumno"
                    class="nuevo-alumno__form"
                    novalidate
                >

                    <section class="form-card">

                        <div class="form-card__header">

                            <div class="form-card__icon">
                                🎓
                            </div>


                            <div>

                                <h2>
                                    Datos del alumno
                                </h2>

                                <p>
                                    Información principal del estudiante.
                                </p>

                            </div>

                        </div>


                        <div class="form-grid">

                            <div class="form-group">

                                <label for="alumno-apellido">
                                    Apellido *
                                </label>

                                <input
                                    type="text"
                                    id="alumno-apellido"
                                    name="apellido"
                                    value="${Utils.escaparHTML(
                                        alumno?.apellido || ""
                                    )}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="alumno-nombre">
                                    Nombre *
                                </label>

                                <input
                                    type="text"
                                    id="alumno-nombre"
                                    name="nombre"
                                    value="${Utils.escaparHTML(
                                        alumno?.nombre || ""
                                    )}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="alumno-dni">
                                    DNI
                                </label>

                                <input
                                    type="text"
                                    id="alumno-dni"
                                    name="dni"
                                    inputmode="numeric"
                                    value="${Utils.escaparHTML(
                                        alumno?.dni || ""
                                    )}"
                                >

                            </div>


                            <div class="form-group">

                                <label for="alumno-curso">
                                    Curso / grado
                                </label>

                                <input
                                    type="text"
                                    id="alumno-curso"
                                    name="curso"
                                    placeholder="Ej. 4°"
                                    value="${Utils.escaparHTML(
                                        alumno?.curso || ""
                                    )}"
                                >

                            </div>


                            <div class="form-group">

                                <label for="alumno-division">
                                    División
                                </label>

                                <input
                                    type="text"
                                    id="alumno-division"
                                    name="division"
                                    placeholder="Ej. A"
                                    value="${Utils.escaparHTML(
                                        alumno?.division || ""
                                    )}"
                                >

                            </div>

                        </div>

                    </section>


                    <div
                        id="alumno-form-error"
                        class="form-error"
                        hidden
                    >
                    </div>


                    <div class="nuevo-alumno__actions">

                        <button
                            type="button"
                            class="btn-secundario"
                            data-route="familia"
                            data-id="${familia.id}"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                        >
                            ${
                                editando
                                    ? "Guardar cambios"
                                    : "Guardar alumno"
                            }
                        </button>

                    </div>

                </form>

            </section>

        `;
    },


    configurarEventos(
        familiaId,
        alumnoId
    ) {

        const formulario =
            document.getElementById(
                "form-alumno"
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
                    familiaId,
                    alumnoId
                );

            }
        );
    },


    async guardar(
        formulario,
        familiaId,
        alumnoId
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
                "Ingresá al menos apellido o nombre."
            );

            return;
        }


        try {

            let alumno;


            if (alumnoId) {

                alumno =
                    await FamiliasService
                        .actualizarAlumno(
                            alumnoId,
                            datos
                        );

            } else {

                alumno =
                    await FamiliasService
                        .agregarAlumno({

                            ...datos,

                            familiaId

                        });

            }


            if (!alumno) {

                throw new Error(
                    "No se pudo guardar el alumno."
                );
            }


            await Router.go(
                "familia",
                {
                    id: familiaId
                }
            );


        } catch (error) {

            console.error(
                "Error al guardar alumno:",
                error
            );


            this.mostrarError(
                error.message ||
                "No se pudo guardar el alumno."
            );
        }
    },


    mostrarError(
        mensaje
    ) {

        const elemento =
            document.getElementById(
                "alumno-form-error"
            );


        if (!elemento) {

            const contenedor =
                document.getElementById(
                    "nuevo-alumno"
                );


            if (contenedor) {

                contenedor.innerHTML = `

                    <section class="error-page">

                        <h1>
                            No se pudo cargar el alumno
                        </h1>

                        <p>
                            ${Utils.escaparHTML(
                                mensaje
                            )}
                        </p>

                    </section>

                `;

            }

            return;
        }


        elemento.textContent =
            mensaje;


        elemento.hidden =
            false;
    }

};