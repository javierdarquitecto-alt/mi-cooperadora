/**
 * ==========================================================
 * MI COOPERADORA
 * reportes.js
 * ==========================================================
 *
 * Reporte general de la cooperadora.
 *
 * Todos los datos principales se obtienen desde Supabase:
 * familias, alumnos, cuotas, caja, ventas y sorteos.
 * ==========================================================
 */

window.Reportes = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        this.render();

        this.establecerPeriodoActual();

        await this.mostrarResumen();

        this.configurarEventos();
    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "reportes"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `

            <section class="reportes">

                <header class="reportes__header">

                    <div>

                        <h1>
                            Reportes
                        </h1>

                        <p>
                            Resumen general de la gestión
                            de la cooperadora
                        </p>

                    </div>

                </header>


                <section class="reportes__filtros">

                    <div class="form-group">

                        <label for="reporte-periodo">
                            Período
                        </label>

                        <input
                            type="month"
                            id="reporte-periodo"
                        >

                    </div>


                    <button
                        type="button"
                        id="actualizar-reporte"
                    >
                        Actualizar
                    </button>

                </section>


                <section class="reportes__cards">

                    <article class="reporte-card">

                        <span>
                            Familias activas
                        </span>

                        <strong id="reporte-familias">
                            0
                        </strong>

                    </article>


                    <article class="reporte-card">

                        <span>
                            Alumnos activos
                        </span>

                        <strong id="reporte-alumnos">
                            0
                        </strong>

                    </article>


                    <article class="reporte-card">

                        <span>
                            Total ingresos
                        </span>

                        <strong id="reporte-ingresos">
                            $ 0,00
                        </strong>

                    </article>


                    <article class="reporte-card">

                        <span>
                            Saldo de caja
                        </span>

                        <strong id="reporte-saldo">
                            $ 0,00
                        </strong>

                    </article>

                </section>


                <section class="reportes__periodo">

                    <h2>
                        Resumen del período
                    </h2>


                    <div class="reportes__periodo-grid">

                        <div>

                            <span>
                                Cuotas cobradas
                            </span>

                            <strong id="reporte-cuotas-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Ventas cobradas
                            </span>

                            <strong id="reporte-ventas-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Rifas / Sorteos cobrados
                            </span>

                            <strong id="reporte-sorteos-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Otros ingresos
                            </span>

                            <strong id="reporte-otros-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total ingresos
                            </span>

                            <strong id="reporte-ingresos-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Egresos
                            </span>

                            <strong id="reporte-egresos-periodo">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Saldo del período
                            </span>

                            <strong id="reporte-saldo-periodo">
                                $ 0,00
                            </strong>

                        </div>

                    </div>

                </section>


                <section class="reportes__periodo">

                    <h2>
                        Pendientes de cobro
                    </h2>


                    <div class="reportes__periodo-grid">

                        <div>

                            <span>
                                Ventas pendientes
                            </span>

                            <strong id="reporte-ventas-pendientes">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Rifas pendientes
                            </span>

                            <strong id="reporte-sorteos-pendientes">
                                $ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total pendiente
                            </span>

                            <strong id="reporte-total-pendiente">
                                $ 0,00
                            </strong>

                        </div>

                    </div>

                </section>


                <section class="reportes__medios">

                    <h2>
                        Medios de pago - Cuotas
                    </h2>

                    <div id="reporte-medios">
                    </div>

                </section>


                <section class="reportes__informacion">

                    <h2>
                        Información general
                    </h2>

                    <div id="reporte-informacion">
                    </div>

                </section>


                <div class="reportes__acciones">

                    <button
                        type="button"
                        id="imprimir-reporte"
                    >
                        Imprimir reporte
                    </button>

                </div>

            </section>

        `;
    },


    // ======================================================
    // PERÍODO ACTUAL
    // ======================================================

    establecerPeriodoActual() {

        const campo =
            document.getElementById(
                "reporte-periodo"
            );


        if (!campo) {
            return;
        }


        if (campo.value) {
            return;
        }


        const fecha =
            new Date();


        const anio =
            fecha.getFullYear();


        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        campo.value =
            `${anio}-${mes}`;
    },


    // ======================================================
    // RESUMEN GENERAL
    // ======================================================

    async mostrarResumen() {

        try {

            const familias =
                await FamiliasService
                    .obtenerTodas();


            const familiasActivas =
                familias.filter(
                    familia =>
                        familia.activa !== false
                );


            const {
                data: alumnos,
                error: errorAlumnos
            } =
                await SupabaseClient
                    .from("alumnos")
                    .select("id, activo");


            if (errorAlumnos) {
                throw errorAlumnos;
            }


            const alumnosActivos =
                (alumnos || [])
                    .filter(
                        alumno =>
                            alumno.activo !== false
                    );


            const movimientos =
                await this
                    .obtenerMovimientosCajaNube();


            let ingresos = 0;
            let egresos = 0;


            movimientos.forEach(
                movimiento => {

                    const importe =
                        Number(
                            movimiento.importe
                        ) || 0;


                    if (
                        this.esIngreso(
                            movimiento
                        )
                    ) {

                        ingresos += importe;
                    }


                    if (
                        this.esEgreso(
                            movimiento
                        )
                    ) {

                        egresos += importe;
                    }
                }
            );


            const saldo =
                ingresos -
                egresos;


            this.actualizarElemento(
                "reporte-familias",
                familiasActivas.length
            );


            this.actualizarElemento(
                "reporte-alumnos",
                alumnosActivos.length
            );


            this.actualizarElemento(
                "reporte-ingresos",
                Utils.formatearImporte(
                    ingresos
                )
            );


            this.actualizarElemento(
                "reporte-saldo",
                Utils.formatearImporte(
                    saldo
                )
            );


            await this.mostrarPeriodo();

            await this.mostrarMediosPago();

            await this.mostrarInformacion();


        } catch (error) {

            console.error(
                "Error al cargar reportes desde Supabase:",
                error
            );
        }
    },


    // ======================================================
    // RESUMEN DEL PERÍODO
    // ======================================================

    async mostrarPeriodo() {

        const campo =
            document.getElementById(
                "reporte-periodo"
            );


        if (!campo) {
            return;
        }


        const periodo =
            campo.value;


        if (!periodo) {
            return;
        }


        // ==================================================
        // CUOTAS - SUPABASE
        // ==================================================

        let totalCuotas = 0;


        const pagos =
            await CuotasService
                .obtenerTodosNube();


        pagos.forEach(
            pago => {

                if (pago.anulado) {
                    return;
                }


                if (
                    this.obtenerPeriodoFecha(
                        pago.fecha
                    ) !== periodo
                ) {
                    return;
                }


                totalCuotas +=
                    Number(
                        pago.importe ||
                        0
                    );
            }
        );


        // ==================================================
        // VENTAS - SUPABASE
        // ==================================================

        let ventasCobradas = 0;
        let ventasPendientes = 0;


        const ventas =
            await this
                .obtenerVentasNube();


        ventas.forEach(
            venta => {

                if (
                    this.obtenerPeriodoFecha(
                        venta.fecha
                    ) !== periodo
                ) {
                    return;
                }


                const total =
                    (
                        Number(
                            venta.cantidad
                        ) || 0
                    )
                    *
                    (
                        Number(
                            venta.precio_unitario
                        ) || 0
                    );


                if (
                    venta.estado_pago ===
                    "Pagado"
                ) {

                    ventasCobradas +=
                        total;

                } else {

                    ventasPendientes +=
                        total;
                }
            }
        );


        // ==================================================
        // SORTEOS / RIFAS - SUPABASE
        // ==================================================

        let sorteosCobrados = 0;
        let sorteosPendientes = 0;


        const ventasSorteos =
            await this
                .obtenerVentasSorteosNube();


        ventasSorteos.forEach(
            venta => {

                if (
                    this.obtenerPeriodoFecha(
                        venta.fecha
                    ) !== periodo
                ) {
                    return;
                }


                const importe =
                    Number(
                        venta.importe
                    ) || 0;


                if (
                    venta.estado_pago ===
                    "Pagado"
                ) {

                    sorteosCobrados +=
                        importe;

                } else {

                    sorteosPendientes +=
                        importe;
                }
            }
        );


        // ==================================================
        // CAJA - SUPABASE
        // ==================================================

        const movimientos =
            await this
                .obtenerMovimientosCajaNube();


        let totalIngresosCaja = 0;
        let totalEgresos = 0;


        movimientos.forEach(
            movimiento => {

                if (
                    this.obtenerPeriodoFecha(
                        movimiento.fecha
                    ) !== periodo
                ) {
                    return;
                }


                const importe =
                    Number(
                        movimiento.importe
                    ) || 0;


                if (
                    this.esIngreso(
                        movimiento
                    )
                ) {

                    totalIngresosCaja +=
                        importe;
                }


                if (
                    this.esEgreso(
                        movimiento
                    )
                ) {

                    totalEgresos +=
                        importe;
                }
            }
        );


        const ingresosIdentificados =
            totalCuotas
            +
            ventasCobradas
            +
            sorteosCobrados;


        const otrosIngresos =
            Math.max(
                0,
                totalIngresosCaja -
                ingresosIdentificados
            );


        const saldoPeriodo =
            totalIngresosCaja -
            totalEgresos;


        const totalPendiente =
            ventasPendientes +
            sorteosPendientes;


        this.actualizarElemento(
            "reporte-cuotas-periodo",
            Utils.formatearImporte(
                totalCuotas
            )
        );


        this.actualizarElemento(
            "reporte-ventas-periodo",
            Utils.formatearImporte(
                ventasCobradas
            )
        );


        this.actualizarElemento(
            "reporte-sorteos-periodo",
            Utils.formatearImporte(
                sorteosCobrados
            )
        );


        this.actualizarElemento(
            "reporte-otros-periodo",
            Utils.formatearImporte(
                otrosIngresos
            )
        );


        this.actualizarElemento(
            "reporte-ingresos-periodo",
            Utils.formatearImporte(
                totalIngresosCaja
            )
        );


        this.actualizarElemento(
            "reporte-egresos-periodo",
            Utils.formatearImporte(
                totalEgresos
            )
        );


        this.actualizarElemento(
            "reporte-saldo-periodo",
            Utils.formatearImporte(
                saldoPeriodo
            )
        );


        this.actualizarElemento(
            "reporte-ventas-pendientes",
            Utils.formatearImporte(
                ventasPendientes
            )
        );


        this.actualizarElemento(
            "reporte-sorteos-pendientes",
            Utils.formatearImporte(
                sorteosPendientes
            )
        );


        this.actualizarElemento(
            "reporte-total-pendiente",
            Utils.formatearImporte(
                totalPendiente
            )
        );
    },


    // ======================================================
    // MOVIMIENTOS DE CAJA - SUPABASE
    // ======================================================

    async obtenerMovimientosCajaNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from("movimientos")
                .select("*")
                .order(
                    "fecha",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error al obtener movimientos:",
                error
            );

            throw error;
        }


        return data || [];
    },


    // ======================================================
    // VENTAS - SUPABASE
    // ======================================================

    async obtenerVentasNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from("ventas")
                .select(
                    "id, fecha, cantidad, precio_unitario, estado_pago"
                )
                .order(
                    "fecha",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error al obtener ventas:",
                error
            );

            throw error;
        }


        return data || [];
    },


    // ======================================================
    // SORTEOS / RIFAS - SUPABASE
    // ======================================================

    async obtenerVentasSorteosNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from("sorteo_ventas")
                .select(
                    "id, sorteo_id, fecha, importe, estado_pago"
                )
                .order(
                    "fecha",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error al obtener ventas de sorteos:",
                error
            );

            throw error;
        }


        return data || [];
    },


    // ======================================================
    // IDENTIFICAR MOVIMIENTOS
    // ======================================================

    esIngreso(
        movimiento
    ) {

        const tipo =
            String(
                movimiento.tipo ||
                ""
            ).toLowerCase();


        return (
            tipo === "ingreso" ||
            tipo === "entrada"
        );
    },


    esEgreso(
        movimiento
    ) {

        const tipo =
            String(
                movimiento.tipo ||
                ""
            ).toLowerCase();


        return (
            tipo === "egreso" ||
            tipo === "salida"
        );
    },


    // ======================================================
    // MEDIOS DE PAGO
    // ======================================================

    async mostrarMediosPago() {

        const contenedor =
            document.getElementById(
                "reporte-medios"
            );


        if (!contenedor) {
            return;
        }


        const campo =
            document.getElementById(
                "reporte-periodo"
            );


        const periodo =
            campo
                ? campo.value
                : "";


        const pagos =
            await CuotasService
                .obtenerTodosNube();


        const medios = {};


        pagos.forEach(
            pago => {

                if (pago.anulado) {
                    return;
                }


                if (
                    periodo &&
                    this.obtenerPeriodoFecha(
                        pago.fecha
                    ) !== periodo
                ) {
                    return;
                }


                const medio =
                    pago.medioPago ||
                    "Sin especificar";


                if (!medios[medio]) {

                    medios[medio] = {

                        cantidad: 0,
                        total: 0
                    };
                }


                medios[medio].cantidad++;


                medios[medio].total +=
                    Number(
                        pago.importe ||
                        0
                    );
            }
        );


        const claves =
            Object.keys(
                medios
            );


        if (
            claves.length === 0
        ) {

            contenedor.innerHTML = `

                <p>
                    No hay pagos de cuotas
                    registrados en este período.
                </p>

            `;

            return;
        }


        contenedor.innerHTML = `

            <table>

                <thead>

                    <tr>

                        <th>
                            Medio de pago
                        </th>

                        <th>
                            Cantidad
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${claves.map(
                        medio => `

                            <tr>

                                <td>
                                    ${this.escapeHtml(
                                        medio
                                    )}
                                </td>

                                <td>
                                    ${medios[medio].cantidad}
                                </td>

                                <td>
                                    ${Utils.formatearImporte(
                                        medios[medio].total
                                    )}
                                </td>

                            </tr>

                        `
                    ).join("")}

                </tbody>

            </table>

        `;
    },


    // ======================================================
    // INFORMACIÓN GENERAL
    // ======================================================

    async mostrarInformacion() {

        const contenedor =
            document.getElementById(
                "reporte-informacion"
            );


        if (!contenedor) {
            return;
        }


        const familias =
            await FamiliasService
                .obtenerTodas();


        const activas =
            familias.filter(
                familia =>
                    familia.activa !== false
            );


        const inactivas =
            familias.filter(
                familia =>
                    familia.activa === false
            );


        const pagos =
            await CuotasService
                .obtenerTodosNube();


        const pagosValidos =
            pagos.filter(
                pago =>
                    !pago.anulado
            );


        const totalCuotas =
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


        // ==================================================
        // VENTAS HISTÓRICAS - SUPABASE
        // ==================================================

        const ventas =
            await this
                .obtenerVentasNube();


        let totalVentas = 0;
        let ventasPendientes = 0;


        ventas.forEach(
            venta => {

                const total =
                    (
                        Number(
                            venta.cantidad
                        ) || 0
                    )
                    *
                    (
                        Number(
                            venta.precio_unitario
                        ) || 0
                    );


                if (
                    venta.estado_pago ===
                    "Pagado"
                ) {

                    totalVentas += total;

                } else {

                    ventasPendientes += total;
                }
            }
        );


        // ==================================================
        // SORTEOS HISTÓRICOS - SUPABASE
        // ==================================================

        const ventasSorteos =
            await this
                .obtenerVentasSorteosNube();


        let totalSorteos = 0;
        let sorteosPendientes = 0;


        ventasSorteos.forEach(
            venta => {

                const importe =
                    Number(
                        venta.importe
                    ) || 0;


                if (
                    venta.estado_pago ===
                    "Pagado"
                ) {

                    totalSorteos += importe;

                } else {

                    sorteosPendientes += importe;
                }
            }
        );


        // ==================================================
        // CAJA HISTÓRICA - SUPABASE
        // ==================================================

        const movimientos =
            await this
                .obtenerMovimientosCajaNube();


        let ingresos = 0;
        let egresos = 0;


        movimientos.forEach(
            movimiento => {

                const importe =
                    Number(
                        movimiento.importe
                    ) || 0;


                if (
                    this.esIngreso(
                        movimiento
                    )
                ) {

                    ingresos += importe;
                }


                if (
                    this.esEgreso(
                        movimiento
                    )
                ) {

                    egresos += importe;
                }
            }
        );


        const saldo =
            ingresos -
            egresos;


        contenedor.innerHTML = `

            <div class="reporte-info">

                <p>
                    <strong>
                        Familias totales:
                    </strong>

                    ${familias.length}
                </p>


                <p>
                    <strong>
                        Familias activas:
                    </strong>

                    ${activas.length}
                </p>


                <p>
                    <strong>
                        Familias inactivas:
                    </strong>

                    ${inactivas.length}
                </p>


                <p>
                    <strong>
                        Pagos de cuotas:
                    </strong>

                    ${pagosValidos.length}
                </p>


                <p>
                    <strong>
                        Cuotas cobradas:
                    </strong>

                    ${Utils.formatearImporte(
                        totalCuotas
                    )}
                </p>


                <p>
                    <strong>
                        Ventas cobradas:
                    </strong>

                    ${Utils.formatearImporte(
                        totalVentas
                    )}
                </p>


                <p>
                    <strong>
                        Sorteos / Rifas cobrados:
                    </strong>

                    ${Utils.formatearImporte(
                        totalSorteos
                    )}
                </p>


                <p>
                    <strong>
                        Pendiente de ventas:
                    </strong>

                    ${Utils.formatearImporte(
                        ventasPendientes
                    )}
                </p>


                <p>
                    <strong>
                        Pendiente de rifas:
                    </strong>

                    ${Utils.formatearImporte(
                        sorteosPendientes
                    )}
                </p>


                <p>
                    <strong>
                        Total ingresos en Caja:
                    </strong>

                    ${Utils.formatearImporte(
                        ingresos
                    )}
                </p>


                <p>
                    <strong>
                        Saldo actual:
                    </strong>

                    ${Utils.formatearImporte(
                        saldo
                    )}
                </p>

            </div>

        `;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const actualizar =
            document.getElementById(
                "actualizar-reporte"
            );


        if (actualizar) {

            actualizar.addEventListener(
                "click",
                async () => {

                    await this
                        .mostrarResumen();
                }
            );
        }


        const periodo =
            document.getElementById(
                "reporte-periodo"
            );


        if (periodo) {

            periodo.addEventListener(
                "change",
                async () => {

                    await this
                        .mostrarResumen();
                }
            );
        }


        const imprimir =
            document.getElementById(
                "imprimir-reporte"
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
    // OBTENER PERÍODO DE UNA FECHA
    // ======================================================

    obtenerPeriodoFecha(
        fecha
    ) {

        if (!fecha) {
            return "";
        }


        const texto =
            String(
                fecha
            );


        if (
            /^\d{4}-\d{2}/.test(
                texto
            )
        ) {

            return texto.substring(
                0,
                7
            );
        }


        const fechaObjeto =
            new Date(
                texto
            );


        if (
            Number.isNaN(
                fechaObjeto.getTime()
            )
        ) {

            return "";
        }


        return (
            fechaObjeto.getFullYear()
            +
            "-"
            +
            String(
                fechaObjeto.getMonth() + 1
            ).padStart(
                2,
                "0"
            )
        );
    },


    // ======================================================
    // ACTUALIZAR ELEMENTO
    // ======================================================

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
    // ESCAPAR HTML
    // ======================================================

    escapeHtml(
        texto
    ) {

        return String(
            texto ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    },


    // ======================================================
    // IMPRIMIR
    // ======================================================

    imprimir() {

        const contenido =
            document.querySelector(
                ".reportes"
            );


        if (!contenido) {
            return;
        }


        const ventana =
            window.open(
                "",
                "_blank",
                "width=1000,height=900"
            );


        if (!ventana) {

            alert(
                "El navegador bloqueó la ventana de impresión. Permití las ventanas emergentes."
            );

            return;
        }


        ventana.document.write(`

            <!DOCTYPE html>

            <html lang="es">

            <head>

                <meta charset="UTF-8">

                <title>
                    Reporte - Mi Cooperadora
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


                    h1,
                    h2 {
                        margin-top: 0;
                    }


                    table {

                        width: 100%;

                        border-collapse:
                            collapse;

                        margin-top: 15px;
                    }


                    th,
                    td {

                        border:
                            1px solid #ccc;

                        padding: 8px;

                        text-align: left;
                    }


                    th {
                        background: #f3f3f3;
                    }


                    .reportes__header {
                        margin-bottom: 30px;
                    }


                    .reportes__filtros,
                    .reportes__acciones {
                        display: none;
                    }


                    .reportes__cards,
                    .reportes__periodo-grid,
                    .reporte-info {

                        display: grid;

                        grid-template-columns:
                            repeat(4, 1fr);

                        gap: 15px;

                        margin-bottom: 30px;
                    }


                    .reporte-card,
                    .reportes__periodo-grid > div,
                    .reporte-info > p {

                        border:
                            1px solid #ccc;

                        padding: 15px;

                        margin: 0;
                    }


                    .reporte-card span,
                    .reportes__periodo-grid span {

                        display: block;

                        margin-bottom: 8px;
                    }


                    .reporte-card strong,
                    .reportes__periodo-grid strong {

                        font-size: 18px;
                    }


                    section {
                        margin-bottom: 30px;
                    }


                    @media print {

                        body {
                            padding: 0;
                        }
                    }

                </style>

            </head>


            <body>

                ${contenido.outerHTML}

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
    }

};