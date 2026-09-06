/**
 * ==========================================================
 * MI COOPERADORA
 * cuotas.js
 * ==========================================================
 *
 * Módulo para consultar y registrar cuotas.
 * Datos sincronizados con Supabase.
 * ==========================================================
 */

window.Cuotas = {

    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        this.render();

        this.establecerFechaActual();

        await this.cargarFamilias();

        await this.mostrarPagos();

        this.configurarEventos();
    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById("cuotas");

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = `

            <section class="cuotas">

                <header class="cuotas__header">

                    <div>

                        <h1>
                            Cuotas
                        </h1>

                        <p>
                            Registro y consulta de pagos
                        </p>

                    </div>

                </header>


                <section class="cuotas__form">

                    <h2>
                        Registrar pago
                    </h2>


                    <form
                        id="form-pago"
                        novalidate
                    >

                        <div class="form-grid">


                            <div class="form-group">

                                <label for="pago-familia">
                                    Familia *
                                </label>

                                <select
                                    id="pago-familia"
                                    name="familiaId"
                                    required
                                >

                                    <option value="">
                                        Seleccionar familia
                                    </option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label for="pago-periodo">
                                    Período *
                                </label>

                                <input
                                    type="month"
                                    id="pago-periodo"
                                    name="periodo"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="pago-concepto">
                                    Concepto
                                </label>

                                <input
                                    type="text"
                                    id="pago-concepto"
                                    name="concepto"
                                    value="Cuota"
                                >

                            </div>


                            <div class="form-group">

                                <label for="pago-importe">
                                    Importe *
                                </label>

                                <input
                                    type="number"
                                    id="pago-importe"
                                    name="importe"
                                    min="0"
                                    step="0.01"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="pago-medio">
                                    Medio de pago
                                </label>

                                <select
                                    id="pago-medio"
                                    name="medioPago"
                                >

                                    <option value="Efectivo">
                                        Efectivo
                                    </option>

                                    <option value="Transferencia">
                                        Transferencia
                                    </option>

                                    <option value="Tarjeta">
                                        Tarjeta
                                    </option>

                                    <option value="Otro">
                                        Otro
                                    </option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label for="pago-fecha">
                                    Fecha
                                </label>

                                <input
                                    type="date"
                                    id="pago-fecha"
                                    name="fecha"
                                >

                            </div>

                        </div>


                        <div
                            id="pago-form-error"
                            class="form-error"
                            hidden
                        ></div>


                        <div class="cuotas__actions">

                            <button
                                type="submit"
                                id="btn-registrar-pago"
                            >
                                Registrar pago
                            </button>

                        </div>

                    </form>

                </section>


                <section class="cuotas__listado">

                    <div
                        class="cuotas__section-header"
                    >

                        <h2>
                            Pagos registrados
                        </h2>

                        <input
                            type="search"
                            id="buscar-pago"
                            placeholder="Buscar..."
                        >

                    </div>


                    <div
                        class="cuotas__table-container"
                    >

                        <table>

                            <thead>

                                <tr>

                                    <th>Fecha</th>
                                    <th>Familia</th>
                                    <th>Período</th>
                                    <th>Concepto</th>
                                    <th>Medio</th>
                                    <th>Importe</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>

                                </tr>

                            </thead>


                            <tbody
                                id="lista-pagos"
                            ></tbody>

                        </table>

                    </div>


                    <p
                        id="pagos-vacio"
                        hidden
                    >
                        No hay pagos registrados.
                    </p>

                </section>

            </section>

        `;
    },


    // ======================================================
    // FAMILIAS
    // ======================================================

    async cargarFamilias() {

        const select =
            document.getElementById(
                "pago-familia"
            );

        if (!select) {
            return;
        }


        let familias = [];


        try {

            familias =
                await FamiliasService
                    .obtenerTodas();

        } catch (error) {

            console.error(
                "Error al cargar familias:",
                error
            );

            this.mostrarError(
                "No se pudieron cargar las familias."
            );

            return;
        }


        familias
            .filter(
                familia =>
                    familia.activa !== false
            )
            .forEach(
                familia => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        familia.id;

                    option.textContent =
                        Utils.nombreCompleto(
                            familia.apellido,
                            familia.nombre
                        );

                    select.appendChild(
                        option
                    );
                }
            );


        const ruta =
            Router.obtenerRutaActual();


        if (ruta.params.familiaId) {

            select.value =
                ruta.params.familiaId;
        }
    },


    // ======================================================
    // MOSTRAR PAGOS
    // ======================================================

    async mostrarPagos(
        texto = ""
    ) {

        const lista =
            document.getElementById(
                "lista-pagos"
            );

        const vacio =
            document.getElementById(
                "pagos-vacio"
            );


        if (!lista) {
            return;
        }


        lista.innerHTML = "";


        let pagos = [];


        try {

            pagos =
                await CuotasService
                    .obtenerTodosNube();

        } catch (error) {

            console.error(
                "Error al cargar pagos:",
                error
            );

            this.mostrarError(
                "No se pudieron cargar los pagos."
            );

            return;
        }


        let familias = [];


        try {

            familias =
                await FamiliasService
                    .obtenerTodas();

        } catch (error) {

            console.error(
                "Error al cargar familias para los pagos:",
                error
            );
        }


        const familiasPorId =
            new Map(
                familias.map(
                    familia => [
                        familia.id,
                        familia
                    ]
                )
            );


        if (texto.trim()) {

            const termino =
                Utils.normalizarTexto(
                    texto
                );


            pagos =
                pagos.filter(
                    pago => {

                        const familia =
                            familiasPorId.get(
                                pago.familiaId
                            );


                        const nombreFamilia =
                            familia
                                ? Utils.nombreCompleto(
                                    familia.apellido,
                                    familia.nombre
                                )
                                : "";


                        return (

                            Utils.normalizarTexto(
                                nombreFamilia
                            ).includes(
                                termino
                            )

                            ||

                            Utils.normalizarTexto(
                                pago.periodo
                            ).includes(
                                termino
                            )

                            ||

                            Utils.normalizarTexto(
                                pago.concepto
                            ).includes(
                                termino
                            )

                        );
                    }
                );
        }


        if (pagos.length === 0) {

            if (vacio) {
                vacio.hidden = false;
            }

            return;
        }


        if (vacio) {
            vacio.hidden = true;
        }


        pagos.forEach(
            pago => {

                const familia =
                    familiasPorId.get(
                        pago.familiaId
                    );


                lista.appendChild(
                    this.crearFilaPago(
                        pago,
                        familia
                    )
                );
            }
        );
    },


    // ======================================================
    // FILA DE PAGO
    // ======================================================

    crearFilaPago(
        pago,
        familia = null
    ) {

        const fila =
            document.createElement(
                "tr"
            );


        const nombreFamilia =
            familia
                ? Utils.nombreCompleto(
                    familia.apellido,
                    familia.nombre
                )
                : "Familia desconocida";


        const estado =
            pago.anulado
                ? "Anulado"
                : "Pagado";


        fila.innerHTML = `

            <td>
                ${Utils.formatearFecha(
                    pago.fecha
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    nombreFamilia
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    pago.periodo
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    pago.concepto
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    pago.medioPago
                )}
            </td>

            <td>
                ${Utils.formatearImporte(
                    pago.importe
                )}
            </td>

            <td>
                ${estado}
            </td>

            <td>

                ${
                    pago.anulado
                        ? ""
                        : `
                            <button
                                type="button"
                                data-accion="recibo"
                                data-id="${pago.id}"
                            >
                                Recibo
                            </button>

                            <button
                                type="button"
                                data-accion="anular"
                                data-id="${pago.id}"
                            >
                                Anular
                            </button>
                          `
                }

            </td>

        `;


        return fila;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const formulario =
            document.getElementById(
                "form-pago"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await this.registrarPago(
                        formulario
                    );
                }
            );
        }


        const buscador =
            document.getElementById(
                "buscar-pago"
            );


        if (buscador) {

            buscador.addEventListener(
                "input",
                Utils.debounce(
                    async () => {

                        await this.mostrarPagos(
                            buscador.value
                        );
                    },
                    200
                )
            );
        }


        const lista =
            document.getElementById(
                "lista-pagos"
            );


        if (lista) {

            lista.addEventListener(
                "click",
                async event => {

                    const boton =
                        event.target.closest(
                            "[data-accion]"
                        );


                    if (!boton) {
                        return;
                    }


                    const accion =
                        boton.dataset.accion;

                    const id =
                        boton.dataset.id;


                    if (
                        accion === "recibo"
                    ) {

                        Router.go(
                            "recibo",
                            {
                                pagoId: id
                            }
                        );

                        return;
                    }


                    if (
                        accion === "anular"
                    ) {

                        await this.anularPago(
                            id
                        );
                    }
                }
            );
        }
    },


    // ======================================================
    // REGISTRAR PAGO
    // ======================================================

    async registrarPago(
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
                "btn-registrar-pago"
            );


        try {

            if (!datos.familiaId) {

                throw new Error(
                    "Seleccioná una familia."
                );
            }


            if (!datos.periodo) {

                throw new Error(
                    "Seleccioná el período."
                );
            }


            if (
                !datos.importe ||
                Number(
                    datos.importe
                ) <= 0
            ) {

                throw new Error(
                    "Ingresá un importe válido."
                );
            }


            if (boton) {

                boton.disabled = true;

                boton.textContent =
                    "Registrando...";
            }


            const resultado =
                await CobranzasService
                    .cobrarNube(
                        datos
                    );


            console.log(
                "Cobro registrado en Supabase:",
                resultado
            );


            alert(
                "Pago registrado correctamente."
            );


            formulario.reset();


            this.establecerFechaActual();


            await this.mostrarPagos();


        } catch (error) {

            console.error(
                error
            );


            this.mostrarError(
                error.message ||
                "No se pudo registrar el pago."
            );


        } finally {

            if (boton) {

                boton.disabled = false;

                boton.textContent =
                    "Registrar pago";
            }
        }
    },


    // ======================================================
    // ANULAR
    // ======================================================

    async anularPago(
        id
    ) {

        const confirmar =
            confirm(
                "¿Querés anular este pago?"
            );


        if (!confirmar) {
            return;
        }


        try {

            await CobranzasService
                .anularCobroNube(
                    id
                );


            await this.mostrarPagos();


            alert(
                "El pago fue anulado."
            );


        } catch (error) {

            console.error(
                error
            );


            this.mostrarError(
                error.message ||
                "No se pudo anular el pago."
            );
        }
    },


    // ======================================================
    // FECHA ACTUAL
    // ======================================================

    establecerFechaActual() {

        const campo =
            document.getElementById(
                "pago-fecha"
            );


        if (!campo) {
            return;
        }


        const hoy =
            new Date();


        const fecha =
            hoy.toISOString()
                .split("T")[0];


        campo.value =
            fecha;
    },


    // ======================================================
    // ERROR
    // ======================================================

    mostrarError(
        mensaje
    ) {

        const elemento =
            document.getElementById(
                "pago-form-error"
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