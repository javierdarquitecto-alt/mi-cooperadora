/**
 * ==========================================================
 * MI COOPERADORA
 * caja.js
 * ==========================================================
 *
 * Módulo de caja.
 *
 * Datos sincronizados con Supabase.
 * ==========================================================
 */

window.Caja = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        this.render();

        this.establecerFechaActual();

        await this.mostrarMovimientos();

        this.configurarEventos();
    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "caja"
            );

        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `

            <section class="caja">

                <header class="caja__header">

                    <div>

                        <h1>
                            Caja
                        </h1>

                        <p>
                            Movimientos y saldo
                        </p>

                    </div>


                    <button
                        type="button"
                        id="nuevo-movimiento"
                    >
                        Nuevo movimiento
                    </button>

                </header>


                <section class="caja__resumen">

                    <article class="caja-card">

                        <span>
                            Ingresos
                        </span>

                        <strong id="caja-ingresos">
                            $ 0,00
                        </strong>

                    </article>


                    <article class="caja-card">

                        <span>
                            Egresos
                        </span>

                        <strong id="caja-egresos">
                            $ 0,00
                        </strong>

                    </article>


                    <article class="caja-card">

                        <span>
                            Saldo
                        </span>

                        <strong id="caja-saldo">
                            $ 0,00
                        </strong>

                    </article>

                </section>


                <section class="caja__filtros">

                    <label for="caja-busqueda">
                        Buscar movimiento
                    </label>

                    <input
                        type="search"
                        id="caja-busqueda"
                        placeholder="Concepto, tipo o referencia..."
                    >

                </section>


                <section class="caja__movimientos">

                    <h2>
                        Movimientos
                    </h2>


                    <div class="caja__table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Concepto</th>
                                    <th>Importe</th>
                                    <th>Referencia</th>

                                </tr>

                            </thead>


                            <tbody
                                id="lista-movimientos"
                            ></tbody>

                        </table>

                    </div>


                    <p
                        id="movimientos-vacio"
                        hidden
                    >
                        No hay movimientos registrados.
                    </p>

                </section>


                <section
                    id="form-movimiento-container"
                    class="caja__form"
                    hidden
                >

                    <h2>
                        Nuevo movimiento
                    </h2>


                    <form
                        id="form-movimiento"
                        novalidate
                    >

                        <div class="form-grid">


                            <div class="form-group">

                                <label for="movimiento-tipo">
                                    Tipo *
                                </label>


                                <select
                                    id="movimiento-tipo"
                                    name="tipo"
                                    required
                                >

                                    <option value="Ingreso">
                                        Ingreso
                                    </option>

                                    <option value="Egreso">
                                        Egreso
                                    </option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label for="movimiento-concepto">
                                    Concepto *
                                </label>


                                <input
                                    type="text"
                                    id="movimiento-concepto"
                                    name="concepto"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="movimiento-importe">
                                    Importe *
                                </label>


                                <input
                                    type="number"
                                    id="movimiento-importe"
                                    name="importe"
                                    min="0"
                                    step="0.01"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="movimiento-fecha">
                                    Fecha
                                </label>


                                <input
                                    type="date"
                                    id="movimiento-fecha"
                                    name="fecha"
                                >

                            </div>


                            <div class="form-group">

                                <label for="movimiento-referencia">
                                    Referencia
                                </label>


                                <input
                                    type="text"
                                    id="movimiento-referencia"
                                    name="referencia"
                                >

                            </div>


                            <div class="form-group">

                                <label for="movimiento-observaciones">
                                    Observaciones
                                </label>


                                <textarea
                                    id="movimiento-observaciones"
                                    name="observaciones"
                                    rows="3"
                                ></textarea>

                            </div>

                        </div>


                        <div
                            id="movimiento-error"
                            class="form-error"
                            hidden
                        ></div>


                        <div class="caja__form-actions">

                            <button
                                type="button"
                                id="cancelar-movimiento"
                            >
                                Cancelar
                            </button>


                            <button
                                type="submit"
                                id="guardar-movimiento"
                            >
                                Guardar movimiento
                            </button>

                        </div>

                    </form>

                </section>

            </section>

        `;
    },


    // ======================================================
    // CONVERTIR MOVIMIENTO SUPABASE
    // ======================================================

    convertirMovimiento(
        registro
    ) {

        return {

            id:
                registro.id,

            fecha:
                registro.fecha,

            tipo:
                registro.tipo,

            concepto:
                registro.concepto ||
                "",

            importe:
                Number(
                    registro.importe
                ) || 0,

            referencia:
                registro.referencia ||
                "",

            observaciones:
                registro.observaciones ||
                "",

            medioPago:
                registro.medio_pago ||
                "",

            origen:
                registro.origen ||
                ""

        };
    },


    // ======================================================
    // RESUMEN
    // ======================================================

    mostrarResumen(
        movimientos = []
    ) {

        const ingresos =
            movimientos
                .filter(
                    movimiento =>
                        movimiento.tipo ===
                        "Ingreso"
                )
                .reduce(
                    (total, movimiento) =>
                        total +
                        Number(
                            movimiento.importe ||
                            0
                        ),
                    0
                );


        const egresos =
            movimientos
                .filter(
                    movimiento =>
                        movimiento.tipo ===
                        "Egreso"
                )
                .reduce(
                    (total, movimiento) =>
                        total +
                        Number(
                            movimiento.importe ||
                            0
                        ),
                    0
                );


        const saldo =
            ingresos -
            egresos;


        this.actualizarElemento(
            "caja-ingresos",
            Utils.formatearImporte(
                ingresos
            )
        );


        this.actualizarElemento(
            "caja-egresos",
            Utils.formatearImporte(
                egresos
            )
        );


        this.actualizarElemento(
            "caja-saldo",
            Utils.formatearImporte(
                saldo
            )
        );
    },


    actualizarElemento(
        id,
        valor
    ) {

        const elemento =
            document.getElementById(
                id
            );


        if (!elemento) {
            return;
        }


        elemento.textContent =
            valor;
    },


    // ======================================================
    // OBTENER MOVIMIENTOS DE SUPABASE
    // ======================================================

    async obtenerMovimientosNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "movimientos"
                )
                .select(
                    "*"
                )
                .order(
                    "fecha",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {

            console.error(
                "Error al obtener movimientos:",
                error
            );


            throw error;
        }


        return (data || [])
            .map(
                registro =>
                    this.convertirMovimiento(
                        registro
                    )
            );
    },


    // ======================================================
    // MOSTRAR MOVIMIENTOS
    // ======================================================

    async mostrarMovimientos(
        texto = ""
    ) {

        const lista =
            document.getElementById(
                "lista-movimientos"
            );


        const vacio =
            document.getElementById(
                "movimientos-vacio"
            );


        if (!lista) {
            return;
        }


        lista.innerHTML = "";


        let movimientos = [];


        try {

            movimientos =
                await this
                    .obtenerMovimientosNube();

        } catch (error) {

            console.error(
                "No se pudo cargar Caja:",
                error
            );


            this.mostrarError(
                "No se pudieron cargar los movimientos."
            );


            return;
        }


        /*
         * El resumen siempre se calcula usando
         * todos los movimientos, antes del filtro.
         */

        this.mostrarResumen(
            movimientos
        );


        // --------------------------------------------------
        // BUSCADOR
        // --------------------------------------------------

        if (texto.trim()) {

            const termino =
                Utils.normalizarTexto(
                    texto
                );


            movimientos =
                movimientos.filter(
                    movimiento => {

                        return (

                            Utils.normalizarTexto(
                                movimiento.concepto ||
                                ""
                            ).includes(
                                termino
                            )

                            ||

                            Utils.normalizarTexto(
                                movimiento.tipo ||
                                ""
                            ).includes(
                                termino
                            )

                            ||

                            Utils.normalizarTexto(
                                movimiento.referencia ||
                                ""
                            ).includes(
                                termino
                            )

                        );
                    }
                );
        }


        if (
            movimientos.length === 0
        ) {

            if (vacio) {
                vacio.hidden = false;
            }

            return;
        }


        if (vacio) {
            vacio.hidden = true;
        }


        movimientos.forEach(
            movimiento => {

                lista.appendChild(
                    this.crearFila(
                        movimiento
                    )
                );
            }
        );
    },


    // ======================================================
    // FILA
    // ======================================================

    crearFila(
        movimiento
    ) {

        const fila =
            document.createElement(
                "tr"
            );


        fila.innerHTML = `

            <td>
                ${Utils.formatearFecha(
                    movimiento.fecha
                )}
            </td>


            <td>
                ${Utils.escaparHTML(
                    movimiento.tipo
                )}
            </td>


            <td>
                ${Utils.escaparHTML(
                    movimiento.concepto
                )}
            </td>


            <td>
                ${Utils.formatearImporte(
                    movimiento.importe
                )}
            </td>


            <td>
                ${Utils.escaparHTML(
                    movimiento.referencia ||
                    ""
                )}
            </td>

        `;


        return fila;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const buscador =
            document.getElementById(
                "caja-busqueda"
            );


        if (buscador) {

            buscador.addEventListener(
                "input",
                Utils.debounce(
                    async () => {

                        await this
                            .mostrarMovimientos(
                                buscador.value
                            );
                    },
                    200
                )
            );
        }


        const nuevo =
            document.getElementById(
                "nuevo-movimiento"
            );


        if (nuevo) {

            nuevo.addEventListener(
                "click",
                () => {

                    const formulario =
                        document.getElementById(
                            "form-movimiento-container"
                        );


                    if (formulario) {

                        formulario.hidden =
                            false;
                    }
                }
            );
        }


        const cancelar =
            document.getElementById(
                "cancelar-movimiento"
            );


        if (cancelar) {

            cancelar.addEventListener(
                "click",
                () => {

                    this.ocultarFormulario();
                }
            );
        }


        const formulario =
            document.getElementById(
                "form-movimiento"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    await this
                        .guardarMovimiento(
                            formulario
                        );
                }
            );
        }
    },


    // ======================================================
    // GUARDAR MOVIMIENTO EN SUPABASE
    // ======================================================

    async guardarMovimiento(
        formulario
    ) {

        const datos =
            Object.fromEntries(
                new FormData(
                    formulario
                ).entries()
            );


        const boton =
            document.getElementById(
                "guardar-movimiento"
            );


        try {

            if (!datos.concepto) {

                throw new Error(
                    "Ingresá un concepto."
                );
            }


            const importe =
                Number(
                    datos.importe
                );


            if (
                Number.isNaN(
                    importe
                ) ||
                importe <= 0
            ) {

                throw new Error(
                    "Ingresá un importe válido."
                );
            }


            if (boton) {

                boton.disabled =
                    true;

                boton.textContent =
                    "Guardando...";
            }


            const movimiento = {

                id:
                    "MOV" +
                    Date.now() +
                    Math.floor(
                        Math.random() *
                        1000
                    ),

                fecha:
                    datos.fecha ||
                    Database.fechaActual(),

                tipo:
                    datos.tipo ||
                    "Ingreso",

                concepto:
                    datos.concepto,

                importe,

                referencia:
                    datos.referencia ||
                    "",

                observaciones:
                    datos.observaciones ||
                    "",

                medio_pago:
                    "",

                origen:
                    "Caja"
            };


            const {
                data,
                error
            } =
                await SupabaseClient
                    .from(
                        "movimientos"
                    )
                    .insert(
                        movimiento
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Error al guardar movimiento:",
                    error
                );


                throw new Error(
                    "No se pudo guardar el movimiento."
                );
            }


            /*
             * También mantenemos la copia local
             * durante la migración.
             */

            const movimientoLocal =
                this.convertirMovimiento(
                    data
                );


            const existenteLocal =
                Database.data
                    .movimientos
                    .find(
                        item =>
                            item.id ===
                            movimientoLocal.id
                    );


            if (!existenteLocal) {

                Database
                    .registrarMovimiento(
                        movimientoLocal
                    );
            }


            formulario.reset();


            this.establecerFechaActual();


            this.ocultarFormulario();


            await this
                .mostrarMovimientos();


        } catch (error) {

            console.error(
                error
            );


            this.mostrarError(
                error.message ||
                "No se pudo guardar el movimiento."
            );


        } finally {

            if (boton) {

                boton.disabled =
                    false;

                boton.textContent =
                    "Guardar movimiento";
            }
        }
    },


    // ======================================================
    // OCULTAR FORMULARIO
    // ======================================================

    ocultarFormulario() {

        const contenedor =
            document.getElementById(
                "form-movimiento-container"
            );


        if (contenedor) {

            contenedor.hidden =
                true;
        }
    },


    // ======================================================
    // FECHA
    // ======================================================

    establecerFechaActual() {

        const campo =
            document.getElementById(
                "movimiento-fecha"
            );


        if (!campo) {
            return;
        }


        const hoy =
            new Date();


        campo.value =
            hoy.toISOString()
                .split("T")[0];
    },


    // ======================================================
    // ERROR
    // ======================================================

    mostrarError(
        mensaje
    ) {

        const elemento =
            document.getElementById(
                "movimiento-error"
            );


        if (!elemento) {

            alert(
                mensaje
            );

            return;
        }


        elemento.textContent =
            mensaje;


        elemento.hidden =
            false;
    }

};