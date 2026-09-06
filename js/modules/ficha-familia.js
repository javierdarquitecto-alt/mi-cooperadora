/**
 * ==========================================================
 * MI COOPERADORA
 * ficha-familia.js
 * ==========================================================
 *
 * Ficha completa de una familia.
 * Datos obtenidos desde Supabase.
 * ==========================================================
 */

window.FichaFamilia = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        const ruta =
            Router.obtenerRutaActual();

        const familiaId =
            ruta.params.id;


        if (!familiaId) {

            this.mostrarError(
                "No se indicó la familia."
            );

            return;
        }


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


        this.render(
            familia
        );


        try {

            const alumnos =
                await FamiliasService
                    .obtenerAlumnosNube(
                        familia.id
                    );


            const pagos =
                await CuotasService
                    .obtenerPorFamiliaNube(
                        familia.id
                    );


            this.mostrarAlumnos(
                familia.id,
                alumnos
            );


            this.mostrarPagos(
                pagos
            );


            this.mostrarEstadoCuotas(
                pagos
            );


            this.mostrarResumen(
                alumnos,
                pagos
            );


        } catch (error) {

            console.error(
                "Error al cargar la ficha:",
                error
            );


            this.mostrarError(
                "No se pudo cargar la información de la familia."
            );

            return;
        }


        this.configurarEventos(
            familia
        );


        this.configurarEventosAlumnos(
            familia.id
        );
    },


    // ======================================================
    // RENDER PRINCIPAL
    // ======================================================

    render(
        familia
    ) {

        const contenedor =
            document.getElementById(
                "familia"
            );


        if (!contenedor) {
            return;
        }


        const anioActual =
            new Date().getFullYear();


        const familiaActiva =
            familia.activa !== false;


        contenedor.innerHTML = `

            <section class="familia">

                <header class="familia__header">

                    <div>

                        <button
                            type="button"
                            data-route="familias"
                        >
                            ← Volver
                        </button>


                        <h1>
                            ${Utils.escaparHTML(
                                Utils.nombreCompleto(
                                    familia.apellido,
                                    familia.nombre
                                )
                            )}
                        </h1>

                    </div>


                    <div class="familia__header-acciones">

                        <button
                            type="button"
                            id="editar-familia"
                        >
                            Editar familia
                        </button>


                        <button
                            type="button"
                            id="estado-familia"
                            data-estado="${
                                familiaActiva
                                    ? "activo"
                                    : "inactivo"
                            }"
                        >
                            ${
                                familiaActiva
                                    ? "Desactivar familia"
                                    : "Reactivar familia"
                            }
                        </button>

                    </div>

                </header>


                <section class="familia__datos">

                    <h2>
                        Datos de la familia
                    </h2>


                    <div class="familia__datos-grid">

                        <div>
                            <span>Apellido</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.apellido ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>Nombre</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.nombre ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>DNI</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.dni ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>Teléfono</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.telefono ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>Email</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.email ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>Dirección</span>
                            <strong>
                                ${Utils.escaparHTML(
                                    familia.direccion ||
                                    ""
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>Estado</span>
                            <strong>
                                ${
                                    familiaActiva
                                        ? "Activa"
                                        : "Inactiva"
                                }
                            </strong>
                        </div>

                    </div>

                </section>


                <section class="familia__alumnos">

                    <div class="familia__section-header">

                        <h2>
                            Alumnos
                        </h2>


                        <button
                            type="button"
                            id="nuevo-alumno"
                        >
                            Agregar alumno
                        </button>

                    </div>


                    <div id="familia-alumnos">
                    </div>

                </section>


                <section class="familia__pagos">

                    <div class="familia__section-header">

                        <h2>
                            Pagos
                        </h2>


                        <button
                            type="button"
                            id="nuevo-pago"
                        >
                            Registrar pago
                        </button>

                    </div>


                    <div id="familia-pagos">
                    </div>

                </section>


                <section class="familia__cuotas">

                    <div class="familia__cuotas-header">

                        <div>

                            <span class="familia__cuotas-eyebrow">
                                Seguimiento
                            </span>

                            <h2>
                                Estado de cuotas ${anioActual}
                            </h2>

                        </div>


                        <div
                            id="familia-cuotas-resumen"
                            class="familia__cuotas-resumen"
                        >
                        </div>

                    </div>


                    <div
                        id="familia-estado-cuotas"
                        class="familia__cuotas-grid"
                    >
                    </div>

                </section>


                <section class="familia__resumen">

                    <h2>
                        Resumen
                    </h2>


                    <div id="familia-resumen">
                    </div>

                </section>

            </section>

        `;
    },


    // ======================================================
    // ALUMNOS
    // ======================================================

    mostrarAlumnos(
        familiaId,
        alumnos
    ) {

        const contenedor =
            document.getElementById(
                "familia-alumnos"
            );


        if (!contenedor) {
            return;
        }


        if (
            !alumnos ||
            alumnos.length === 0
        ) {

            contenedor.innerHTML = `

                <p>
                    Esta familia todavía no tiene
                    alumnos registrados.
                </p>

            `;

            return;
        }


        const tabla =
            document.createElement(
                "table"
            );


        tabla.innerHTML = `

            <thead>

                <tr>

                    <th>Apellido</th>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Curso</th>
                    <th>División</th>
                    <th>Estado</th>
                    <th>Acciones</th>

                </tr>

            </thead>


            <tbody>

                ${alumnos.map(
                    alumno => `

                        <tr>

                            <td>
                                ${Utils.escaparHTML(
                                    alumno.apellido ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    alumno.nombre ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    alumno.dni ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    alumno.curso ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    alumno.division ||
                                    ""
                                )}
                            </td>

                            <td>

                                <span
                                    class="estado-badge ${
                                        alumno.activo !== false
                                            ? "estado-badge--activo"
                                            : "estado-badge--inactivo"
                                    }"
                                >
                                    ${
                                        alumno.activo !== false
                                            ? "Activo"
                                            : "Inactivo"
                                    }
                                </span>

                            </td>

                            <td>

                                <div class="tabla-acciones">

                                    <button
                                        type="button"
                                        class="btn-editar-alumno"
                                        data-alumno-id="${alumno.id}"
                                        data-familia-id="${familiaId}"
                                    >
                                        Editar
                                    </button>


                                    <button
                                        type="button"
                                        class="btn-estado-alumno"
                                        data-alumno-id="${alumno.id}"
                                        data-estado="${
                                            alumno.activo !== false
                                                ? "activo"
                                                : "inactivo"
                                        }"
                                    >
                                        ${
                                            alumno.activo !== false
                                                ? "Dar de baja"
                                                : "Reactivar"
                                        }
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `
                ).join("")}

            </tbody>

        `;


        contenedor.innerHTML =
            "";


        contenedor.appendChild(
            tabla
        );
    },


    // ======================================================
    // PAGOS
    // ======================================================

    mostrarPagos(
        pagos
    ) {

        const contenedor =
            document.getElementById(
                "familia-pagos"
            );


        if (!contenedor) {
            return;
        }


        if (
            !pagos ||
            pagos.length === 0
        ) {

            contenedor.innerHTML = `

                <p>
                    Esta familia todavía no tiene
                    pagos registrados.
                </p>

            `;

            return;
        }


        const tabla =
            document.createElement(
                "table"
            );


        tabla.innerHTML = `

            <thead>

                <tr>

                    <th>Fecha</th>
                    <th>Período</th>
                    <th>Concepto</th>
                    <th>Medio de pago</th>
                    <th>Importe</th>
                    <th>Estado</th>

                </tr>

            </thead>


            <tbody>

                ${pagos.map(
                    pago => `

                        <tr>

                            <td>
                                ${Utils.formatearFecha(
                                    pago.fecha
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    pago.periodo ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    pago.concepto ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.escaparHTML(
                                    pago.medioPago ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${Utils.formatearImporte(
                                    pago.importe
                                )}
                            </td>

                            <td>

                                <span
                                    class="estado-badge ${
                                        pago.anulado
                                            ? "estado-badge--inactivo"
                                            : "estado-badge--activo"
                                    }"
                                >
                                    ${
                                        pago.anulado
                                            ? "Anulado"
                                            : "Pagado"
                                    }
                                </span>

                            </td>

                        </tr>

                    `
                ).join("")}

            </tbody>

        `;


        contenedor.innerHTML =
            "";


        contenedor.appendChild(
            tabla
        );
    },


    // ======================================================
    // ESTADO DE CUOTAS
    // ======================================================

    mostrarEstadoCuotas(
        pagos
    ) {

        const contenedor =
            document.getElementById(
                "familia-estado-cuotas"
            );


        const resumenContenedor =
            document.getElementById(
                "familia-cuotas-resumen"
            );


        if (
            !contenedor ||
            !resumenContenedor
        ) {
            return;
        }


        const anioActual =
            new Date().getFullYear();


        const pagosValidos =
            (pagos || [])
                .filter(
                    pago =>
                        pago.anulado !== true
                );


        const estados = [];


        const nombresMeses = [

            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre"

        ];


        for (
            let mes = 1;
            mes <= 12;
            mes++
        ) {

            const periodo =
                `${anioActual}-${String(
                    mes
                ).padStart(
                    2,
                    "0"
                )}`;


            const pagosMes =
                pagosValidos.filter(
                    pago =>
                        pago.periodo ===
                        periodo
                );


            const totalPagado =
                pagosMes.reduce(
                    (
                        total,
                        pago
                    ) =>
                        total +
                        Number(
                            pago.importe ||
                            0
                        ),
                    0
                );


            estados.push({

                periodo,

                nombreMes:
                    nombresMeses[
                        mes - 1
                    ],

                pagada:
                    pagosMes.length > 0,

                cantidadPagos:
                    pagosMes.length,

                totalPagado

            });
        }


        const pagadas =
            estados.filter(
                cuota =>
                    cuota.pagada
            ).length;


        const pendientes =
            estados.length -
            pagadas;


        resumenContenedor.innerHTML = `

            <span class="cuotas-resumen__pagadas">

                <strong>
                    ${pagadas}
                </strong>

                pagadas

            </span>


            <span class="cuotas-resumen__pendientes">

                <strong>
                    ${pendientes}
                </strong>

                pendientes

            </span>

        `;


        contenedor.innerHTML =
            estados
                .map(
                    cuota => `

                        <article
                            class="cuota-mes ${
                                cuota.pagada
                                    ? "cuota-mes--pagada"
                                    : "cuota-mes--pendiente"
                            }"
                        >

                            <div class="cuota-mes__cabecera">

                                <strong>
                                    ${Utils.escaparHTML(
                                        cuota.nombreMes
                                    )}
                                </strong>

                                <span class="cuota-mes__estado">
                                    ${
                                        cuota.pagada
                                            ? "Pagada"
                                            : "Pendiente"
                                    }
                                </span>

                            </div>


                            ${
                                cuota.pagada
                                    ? `

                                        <div class="cuota-mes__detalle">

                                            <span>
                                                ${cuota.cantidadPagos}
                                                ${
                                                    cuota.cantidadPagos === 1
                                                        ? "pago"
                                                        : "pagos"
                                                }
                                            </span>

                                            <strong>
                                                ${Utils.formatearImporte(
                                                    cuota.totalPagado
                                                )}
                                            </strong>

                                        </div>

                                      `
                                    : `

                                        <div class="cuota-mes__detalle">

                                            <span>
                                                Sin pago registrado
                                            </span>

                                        </div>

                                      `
                            }

                        </article>

                    `
                )
                .join("");
    },


    // ======================================================
    // RESUMEN GENERAL
    // ======================================================

    mostrarResumen(
        alumnos,
        pagos
    ) {

        const contenedor =
            document.getElementById(
                "familia-resumen"
            );


        if (!contenedor) {
            return;
        }


        const alumnosActivos =
            (alumnos || [])
                .filter(
                    alumno =>
                        alumno.activo !== false
                );


        const pagosValidos =
            (pagos || [])
                .filter(
                    pago =>
                        pago.anulado !== true
                );


        const totalPagado =
            pagosValidos.reduce(
                (
                    total,
                    pago
                ) =>
                    total +
                    Number(
                        pago.importe ||
                        0
                    ),
                0
            );


        contenedor.innerHTML = `

            <div>

                <span>
                    Cantidad de alumnos
                </span>

                <strong>
                    ${alumnosActivos.length}
                </strong>

            </div>


            <div>

                <span>
                    Cantidad de pagos
                </span>

                <strong>
                    ${pagosValidos.length}
                </strong>

            </div>


            <div>

                <span>
                    Total pagado
                </span>

                <strong>
                    ${Utils.formatearImporte(
                        totalPagado
                    )}
                </strong>

            </div>

        `;
    },


    // ======================================================
    // EVENTOS GENERALES
    // ======================================================

    configurarEventos(
        familia
    ) {

        const familiaId =
            familia.id;


        const editar =
            document.getElementById(
                "editar-familia"
            );


        if (editar) {

            editar.addEventListener(
                "click",
                () => {

                    Router.go(
                        "nueva-familia",
                        {
                            id: familiaId
                        }
                    );
                }
            );
        }


        const estadoFamilia =
            document.getElementById(
                "estado-familia"
            );


        if (estadoFamilia) {

            estadoFamilia.addEventListener(
                "click",
                async () => {

                    const activa =
                        familia.activa !== false;


                    const mensaje =
                        activa
                            ? "¿Querés desactivar esta familia?"
                            : "¿Querés reactivar esta familia?";


                    if (!confirm(mensaje)) {
                        return;
                    }


                    try {

                        if (activa) {

                            await FamiliasService
                                .desactivar(
                                    familiaId
                                );

                        } else {

                            await FamiliasService
                                .activar(
                                    familiaId
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
                            "Error al cambiar estado de la familia:",
                            error
                        );


                        alert(
                            "No se pudo cambiar el estado de la familia."
                        );
                    }
                }
            );
        }


        const nuevoAlumno =
            document.getElementById(
                "nuevo-alumno"
            );


        if (nuevoAlumno) {

            nuevoAlumno.addEventListener(
                "click",
                () => {

                    Router.go(
                        "nuevo-alumno",
                        {
                            familiaId
                        }
                    );
                }
            );
        }


        const nuevoPago =
            document.getElementById(
                "nuevo-pago"
            );


        if (nuevoPago) {

            nuevoPago.addEventListener(
                "click",
                () => {

                    Router.go(
                        "cuotas",
                        {
                            familiaId
                        }
                    );
                }
            );
        }
    },


    // ======================================================
    // EVENTOS DE ALUMNOS
    // ======================================================

    configurarEventosAlumnos(
        familiaId
    ) {

        document
            .querySelectorAll(
                ".btn-editar-alumno"
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            Router.go(
                                "nuevo-alumno",
                                {
                                    familiaId:
                                        boton.dataset.familiaId,

                                    alumnoId:
                                        boton.dataset.alumnoId
                                }
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                ".btn-estado-alumno"
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        async () => {

                            const alumnoId =
                                boton.dataset.alumnoId;


                            const estado =
                                boton.dataset.estado;


                            const mensaje =
                                estado === "activo"
                                    ? "¿Querés dar de baja a este alumno?"
                                    : "¿Querés reactivar a este alumno?";


                            if (!confirm(mensaje)) {
                                return;
                            }


                            try {

                                if (
                                    estado ===
                                    "activo"
                                ) {

                                    await FamiliasService
                                        .desactivarAlumno(
                                            alumnoId
                                        );

                                } else {

                                    await FamiliasService
                                        .activarAlumno(
                                            alumnoId
                                        );
                                }


                                await Router.go(
                                    "familia",
                                    {
                                        id:
                                            familiaId
                                    }
                                );


                            } catch (error) {

                                console.error(
                                    "Error al cambiar estado del alumno:",
                                    error
                                );


                                alert(
                                    "No se pudo cambiar el estado del alumno."
                                );
                            }
                        }
                    );
                }
            );
    },


    // ======================================================
    // ERROR
    // ======================================================

    mostrarError(
        mensaje
    ) {

        const contenedor =
            document.getElementById(
                "familia"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `

            <section class="familia__error">

                <h1>
                    No se pudo cargar la familia
                </h1>


                <p>
                    ${Utils.escaparHTML(
                        mensaje
                    )}
                </p>


                <button
                    type="button"
                    data-route="familias"
                >
                    Volver a familias
                </button>

            </section>

        `;
    }

};