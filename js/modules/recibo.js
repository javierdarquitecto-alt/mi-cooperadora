/**
 * ==========================================================
 * MI COOPERADORA
 * recibo.js
 * ==========================================================
 *
 * Módulo para visualizar e imprimir recibos de pago.
 * Datos obtenidos desde Supabase.
 * ==========================================================
 */

window.Recibo = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        const ruta =
            Router.obtenerRutaActual();

        const pagoId =
            ruta.params.pagoId;


        if (!pagoId) {

            this.mostrarError(
                "No se indicó el pago."
            );

            return;
        }


        try {

            const pago =
                await CuotasService
                    .obtenerPorIdNube(
                        pagoId
                    );


            if (!pago) {

                this.mostrarError(
                    "El pago no existe."
                );

                return;
            }


            const familia =
                await FamiliasService
                    .obtenerPorIdNube(
                        pago.familiaId
                    );


            if (!familia) {

                this.mostrarError(
                    "No se encontró la familia asociada al pago."
                );

                return;
            }


            const recibo =
                await CuotasService
                    .obtenerReciboNube(
                        pagoId
                    );


            this.render(
                pago,
                familia,
                recibo
            );


            this.configurarEventos();


        } catch (error) {

            console.error(
                "Error al cargar recibo:",
                error
            );


            this.mostrarError(
                "No se pudo cargar la información del recibo."
            );
        }
    },


    // ======================================================
    // RENDER
    // ======================================================

    render(
        pago,
        familia,
        recibo
    ) {

        const contenedor =
            document.getElementById(
                "recibo"
            );


        if (!contenedor) {
            return;
        }


        const numeroRecibo =
            recibo?.numero ||
            pago.id;


        contenedor.innerHTML = `

            <section class="recibo">

                <header
                    class="recibo__acciones"
                >

                    <button
                        type="button"
                        data-route="cuotas"
                    >
                        ← Volver
                    </button>


                    <button
                        type="button"
                        id="imprimir-recibo"
                    >
                        Imprimir
                    </button>

                </header>


                <article
                    id="recibo-documento"
                    class="recibo__documento"
                >

                    <header
                        class="recibo__header"
                    >

                        <div>

                            <h1>
                                Mi Cooperadora
                            </h1>

                            <p>
                                Comprobante de pago
                            </p>

                        </div>


                        <div
                            class="recibo__numero"
                        >

                            <span>
                                Recibo N.º
                            </span>

                            <strong>
                                ${Utils.escaparHTML(
                                    numeroRecibo
                                )}
                            </strong>

                        </div>

                    </header>


                    <hr>


                    <section
                        class="recibo__familia"
                    >

                        <h2>
                            Datos de la familia
                        </h2>


                        <div>

                            <p>

                                <strong>
                                    Familia:
                                </strong>

                                ${Utils.escaparHTML(
                                    Utils.nombreCompleto(
                                        familia.apellido,
                                        familia.nombre
                                    )
                                )}

                            </p>


                            ${
                                familia.dni
                                    ? `
                                        <p>

                                            <strong>
                                                DNI:
                                            </strong>

                                            ${Utils.escaparHTML(
                                                familia.dni
                                            )}

                                        </p>
                                      `
                                    : ""
                            }


                            ${
                                familia.telefono
                                    ? `
                                        <p>

                                            <strong>
                                                Teléfono:
                                            </strong>

                                            ${Utils.escaparHTML(
                                                familia.telefono
                                            )}

                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                    </section>


                    <section
                        class="recibo__detalle"
                    >

                        <h2>
                            Detalle del pago
                        </h2>


                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Concepto
                                    </th>

                                    <th>
                                        Período
                                    </th>

                                    <th>
                                        Fecha
                                    </th>

                                    <th>
                                        Medio de pago
                                    </th>

                                    <th>
                                        Importe
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                <tr>

                                    <td>
                                        ${Utils.escaparHTML(
                                            pago.concepto ||
                                            "Cuota"
                                        )}
                                    </td>

                                    <td>
                                        ${Utils.escaparHTML(
                                            pago.periodo ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        ${Utils.formatearFecha(
                                            pago.fecha
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

                                </tr>

                            </tbody>

                        </table>

                    </section>


                    <section
                        class="recibo__total"
                    >

                        <span>
                            Total abonado
                        </span>

                        <strong>
                            ${Utils.formatearImporte(
                                pago.importe
                            )}
                        </strong>

                    </section>


                    ${
                        pago.observaciones
                            ? `
                                <section
                                    class="recibo__observaciones"
                                >

                                    <h2>
                                        Observaciones
                                    </h2>

                                    <p>
                                        ${Utils.escaparHTML(
                                            pago.observaciones
                                        )}
                                    </p>

                                </section>
                              `
                            : ""
                    }


                    <footer
                        class="recibo__footer"
                    >

                        <p>
                            Este comprobante acredita
                            el pago registrado por la
                            cooperadora.
                        </p>


                        <div
                            class="recibo__firma"
                        >

                            <span>
                                __________________________
                            </span>

                            <small>
                                Firma
                            </small>

                        </div>

                    </footer>

                </article>

            </section>

        `;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const imprimir =
            document.getElementById(
                "imprimir-recibo"
            );


        if (imprimir) {

            imprimir.addEventListener(
                "click",
                () => {

                    this.imprimir();
                }
            );
        }
    },


    // ======================================================
    // IMPRIMIR
    // ======================================================

    imprimir() {

        const documento =
            document.getElementById(
                "recibo-documento"
            );


        if (!documento) {
            return;
        }


        const ventana =
            window.open(
                "",
                "_blank",
                "width=800,height=900"
            );


        if (!ventana) {

            alert(
                "El navegador bloqueó la ventana de impresión. Permití las ventanas emergentes para este sitio."
            );

            return;
        }


        ventana.document.write(`

            <!DOCTYPE html>

            <html lang="es">

            <head>

                <meta charset="UTF-8">

                <title>
                    Recibo - Mi Cooperadora
                </title>


                <style>

                    * {
                        box-sizing: border-box;
                    }


                    body {

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        margin: 0;

                        padding: 30px;

                        color: #222;
                    }


                    .recibo__documento {

                        max-width: 800px;

                        margin: 0 auto;

                        border: 1px solid #ccc;

                        padding: 35px;
                    }


                    .recibo__header {

                        display: flex;

                        justify-content:
                            space-between;

                        align-items:
                            flex-start;
                    }


                    h1 {

                        margin:
                            0 0 5px;
                    }


                    h2 {

                        font-size: 18px;

                        margin:
                            25px 0 12px;
                    }


                    p {

                        margin:
                            6px 0;
                    }


                    hr {

                        border: 0;

                        border-top:
                            1px solid #ccc;

                        margin:
                            25px 0;
                    }


                    table {

                        width: 100%;

                        border-collapse:
                            collapse;
                    }


                    th,
                    td {

                        border:
                            1px solid #ccc;

                        padding: 10px;

                        text-align:
                            left;
                    }


                    th {

                        background:
                            #f3f3f3;
                    }


                    .recibo__total {

                        display: flex;

                        justify-content:
                            flex-end;

                        gap: 30px;

                        margin-top: 25px;

                        font-size: 20px;
                    }


                    .recibo__footer {

                        margin-top: 60px;

                        text-align: center;
                    }


                    .recibo__firma {

                        margin-top: 50px;

                        display: flex;

                        flex-direction:
                            column;

                        align-items: center;
                    }


                    @media print {

                        body {

                            padding: 0;
                        }


                        .recibo__documento {

                            border: 0;
                        }
                    }

                </style>

            </head>


            <body>

                ${documento.outerHTML}

            </body>

            </html>

        `);


        ventana.document.close();


        ventana.focus();


        setTimeout(
            () => {

                ventana.print();

            },
            300
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
                "recibo"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `

            <section
                class="recibo__error"
            >

                <h1>
                    No se pudo generar el recibo
                </h1>

                <p>
                    ${Utils.escaparHTML(
                        mensaje
                    )}
                </p>


                <button
                    type="button"
                    data-route="cuotas"
                >
                    Volver a cuotas
                </button>

            </section>

        `;
    }

};