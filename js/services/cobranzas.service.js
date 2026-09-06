/**
 * ==========================================================
 * MI COOPERADORA
 * cobranzas.service.js
 * ==========================================================
 *
 * Servicio encargado de las operaciones de cobranza.
 *
 * Centraliza:
 * - Registro de cobros.
 * - Generación de recibos.
 * - Consulta de cobranzas.
 * - Totales.
 * - Información para caja.
 *
 * MIGRACIÓN SUPABASE
 *
 * Las funciones originales se mantienen temporalmente
 * para no romper los módulos que todavía trabajan
 * de forma sincrónica.
 *
 * Las funciones terminadas en "Nube" trabajan
 * directamente con Supabase.
 * ==========================================================
 */

const CobranzasService = {


    // ======================================================
    // REGISTRAR COBRO - LOCAL
    // ======================================================

    registrarCobro(datos = {}) {

        if (!datos.familiaId) {

            throw new Error(
                "Debe seleccionarse una familia."
            );
        }


        const importe =
            Number(
                datos.importe
            );


        if (
            Number.isNaN(importe) ||
            importe <= 0
        ) {

            throw new Error(
                "El importe debe ser mayor que cero."
            );
        }


        if (!datos.periodo) {

            throw new Error(
                "Debe indicarse el período."
            );
        }


        const pago =
            Database.registrarPago({

                ...datos,

                importe,

                concepto:
                    datos.concepto ||
                    "Cuota"

            });


        if (!pago) {

            throw new Error(
                "No se pudo registrar el cobro."
            );
        }


        /*
         * Cada cobro genera automáticamente su recibo.
         */

        const recibo =
            Database.generarRecibo(
                pago.id
            );


        return {

            pago,

            recibo

        };
    },


    // ======================================================
    // REGISTRAR COBRO - SUPABASE
    // ======================================================

    async registrarCobroNube(
        datos = {}
    ) {

        if (!datos.familiaId) {

            throw new Error(
                "Debe seleccionarse una familia."
            );
        }


        const importe =
            Number(
                datos.importe
            );


        if (
            Number.isNaN(importe) ||
            importe <= 0
        ) {

            throw new Error(
                "El importe debe ser mayor que cero."
            );
        }


        if (!datos.periodo) {

            throw new Error(
                "Debe indicarse el período."
            );
        }


        /*
         * CuotasService registra el pago en Supabase
         * y además mantiene la copia local.
         */

        const pago =
            await CuotasService
                .registrarPago({

                    ...datos,

                    importe,

                    concepto:
                        datos.concepto ||
                        "Cuota"

                });


        if (!pago) {

            throw new Error(
                "No se pudo registrar el cobro."
            );
        }


        /*
         * Generamos el recibo en Supabase.
         */

        const recibo =
            await CuotasService
                .generarRecibo(
                    pago.id
                );


        return {

            pago,

            recibo

        };
    },


    // ======================================================
    // OBTENER COBROS - LOCAL
    // ======================================================

    obtenerTodos() {

        return Database
            .obtenerPagos()
            .filter(
                pago =>
                    pago.anulado !== true
            );
    },


    obtenerPorFamilia(
        familiaId
    ) {

        if (!familiaId) {
            return [];
        }


        return Database
            .obtenerPagosFamilia(
                familiaId
            );
    },


    obtenerPorPeriodo(
        periodo
    ) {

        if (!periodo) {
            return [];
        }


        return Database
            .obtenerPagosPeriodo(
                periodo
            );
    },


    obtenerPorFecha(
        fecha
    ) {

        if (!fecha) {
            return [];
        }


        return this
            .obtenerTodos()
            .filter(
                pago =>
                    pago.fecha ===
                    fecha
            );
    },


    // ======================================================
    // OBTENER COBROS - SUPABASE
    // ======================================================

    async obtenerTodosNube() {

        const pagos =
            await CuotasService
                .obtenerTodosNube();


        return pagos.filter(
            pago =>
                pago.anulado !== true
        );
    },


    async obtenerPorFamiliaNube(
        familiaId
    ) {

        if (!familiaId) {
            return [];
        }


        const pagos =
            await CuotasService
                .obtenerPorFamiliaNube(
                    familiaId
                );


        return pagos.filter(
            pago =>
                pago.anulado !== true
        );
    },


    async obtenerPorPeriodoNube(
        periodo
    ) {

        if (!periodo) {
            return [];
        }


        const pagos =
            await CuotasService
                .obtenerPorPeriodoNube(
                    periodo
                );


        return pagos.filter(
            pago =>
                pago.anulado !== true
        );
    },


    async obtenerPorFechaNube(
        fecha
    ) {

        if (!fecha) {
            return [];
        }


        const pagos =
            await this
                .obtenerTodosNube();


        return pagos.filter(
            pago =>
                pago.fecha ===
                fecha
        );
    },


    // ======================================================
    // CONSULTAR COBRO - LOCAL
    // ======================================================

    obtenerPorId(
        id
    ) {

        if (!id) {
            return null;
        }


        return Database
            .obtenerPago(
                id
            );
    },


    // ======================================================
    // CONSULTAR COBRO - SUPABASE
    // ======================================================

    async obtenerPorIdNube(
        id
    ) {

        if (!id) {
            return null;
        }


        return await CuotasService
            .obtenerPorIdNube(
                id
            );
    },


    // ======================================================
    // RECIBOS - LOCAL
    // ======================================================

    obtenerRecibo(
        pagoId
    ) {

        if (!pagoId) {
            return null;
        }


        return Database
            .obtenerReciboPago(
                pagoId
            );
    },


    generarRecibo(
        pagoId
    ) {

        if (!pagoId) {

            throw new Error(
                "No se indicó el cobro."
            );
        }


        return Database
            .generarRecibo(
                pagoId
            );
    },


    // ======================================================
    // RECIBOS - SUPABASE
    // ======================================================

    async obtenerReciboNube(
        pagoId
    ) {

        if (!pagoId) {
            return null;
        }


        return await CuotasService
            .obtenerReciboNube(
                pagoId
            );
    },


    async generarReciboNube(
        pagoId
    ) {

        if (!pagoId) {

            throw new Error(
                "No se indicó el cobro."
            );
        }


        return await CuotasService
            .generarRecibo(
                pagoId
            );
    },


    // ======================================================
    // ANULAR COBRO - LOCAL
    // ======================================================

    anularCobro(
        id
    ) {

        if (!id) {

            throw new Error(
                "No se indicó el cobro."
            );
        }


        return Database
            .anularPago(
                id
            );
    },


    // ======================================================
    // ANULAR COBRO - SUPABASE
    // ======================================================

    async anularCobroNube(
        id
    ) {

        if (!id) {

            throw new Error(
                "No se indicó el cobro."
            );
        }


        return await CuotasService
            .anular(
                id
            );
    },


    // ======================================================
    // TOTALES - LOCAL
    // ======================================================

    obtenerTotal() {

        return this
            .obtenerTodos()
            .reduce(

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
    },


    obtenerTotalPeriodo(
        periodo
    ) {

        return this
            .obtenerPorPeriodo(
                periodo
            )
            .reduce(

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
    },


    obtenerTotalFecha(
        fecha
    ) {

        return this
            .obtenerPorFecha(
                fecha
            )
            .reduce(

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
    },


    // ======================================================
    // ESTADÍSTICAS
    // ======================================================

    obtenerEstadisticas() {

        const cobros =
            this.obtenerTodos();


        const cantidad =
            cobros.length;


        const total =
            cobros.reduce(

                (
                    suma,
                    pago
                ) =>

                    suma +
                    Number(
                        pago.importe ||
                        0
                    ),

                0
            );


        const promedio =
            cantidad > 0
                ? total /
                    cantidad
                : 0;


        return {

            cantidad,

            total,

            promedio

        };
    },


    // ======================================================
    // INFORMACIÓN PARA CAJA - LOCAL
    // ======================================================

    registrarIngresoCaja(
        pago
    ) {

        if (!pago) {
            return null;
        }


        return Database
            .registrarMovimiento({

                fecha:
                    pago.fecha,

                tipo:
                    "Ingreso",

                concepto:
                    pago.concepto ||
                    "Cobro",

                importe:
                    pago.importe,

                referencia:
                    pago.id,

                observaciones:
                    `Cobro correspondiente a ${pago.periodo || ""}`

            });
    },


    // ======================================================
    // INFORMACIÓN PARA CAJA - SUPABASE
    // ======================================================

    async registrarIngresoCajaNube(
        pago
    ) {

        if (
            !pago ||
            !pago.id
        ) {
            return null;
        }


        /*
         * Evitamos generar dos movimientos
         * para un mismo pago.
         */

        const {
            data:
                existente,

            error:
                errorConsulta

        } =
            await SupabaseClient
                .from(
                    "movimientos"
                )
                .select(
                    "*"
                )
                .eq(
                    "referencia",
                    pago.id
                )
                .maybeSingle();


        if (errorConsulta) {

            console.error(
                "Error al consultar movimiento de caja:",
                errorConsulta
            );


            throw errorConsulta;
        }


        /*
         * Si el movimiento ya existe en Supabase,
         * lo devolvemos y aseguramos su copia local.
         */

        if (existente) {

            const movimiento = {

                id:
                    existente.id,

                fecha:
                    existente.fecha,

                tipo:
                    existente.tipo,

                concepto:
                    existente.concepto ||
                    "",

                importe:
                    Number(
                        existente.importe
                    ) || 0,

                referencia:
                    existente.referencia ||
                    "",

                observaciones:
                    existente.observaciones ||
                    "",

                medioPago:
                    existente.medio_pago ||
                    "",

                origen:
                    existente.origen ||
                    ""

            };


            const movimientoLocal =
                Database.data
                    .movimientos
                    .find(
                        item =>
                            item.id ===
                            movimiento.id
                    );


            if (!movimientoLocal) {

                Database
                    .registrarMovimiento(
                        movimiento
                    );
            }


            return movimiento;
        }


        const id =
            "MOV" +
            Date.now() +
            Math.floor(
                Math.random() *
                1000
            );


        const registro = {

            id,

            fecha:
                pago.fecha ||
                Database.fechaActual(),

            tipo:
                "Ingreso",

            concepto:
                pago.concepto ||
                "Cobro",

            importe:
                Number(
                    pago.importe
                ) || 0,

            referencia:
                pago.id,

            observaciones:
                `Cobro correspondiente a ${pago.periodo || ""}`,

            medio_pago:
                pago.medioPago ||
                "",

            origen:
                "Cuotas"

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
                    registro
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Error al registrar ingreso en caja:",
                error
            );


            throw new Error(
                "No se pudo registrar el ingreso en caja."
            );
        }


        const movimiento = {

            id:
                data.id,

            fecha:
                data.fecha,

            tipo:
                data.tipo,

            concepto:
                data.concepto ||
                "",

            importe:
                Number(
                    data.importe
                ) || 0,

            referencia:
                data.referencia ||
                "",

            observaciones:
                data.observaciones ||
                "",

            medioPago:
                data.medio_pago ||
                "",

            origen:
                data.origen ||
                ""

        };


        /*
         * Guardamos también la copia local
         * para los módulos que todavía usan Database.
         */

        const movimientoLocal =
            Database.data
                .movimientos
                .find(
                    item =>
                        item.id ===
                        movimiento.id
                );


        if (!movimientoLocal) {

            Database
                .registrarMovimiento(
                    movimiento
                );
        }


        return movimiento;
    },


    // ======================================================
    // COBRO COMPLETO - LOCAL
    // ======================================================

    cobrar(
        datos = {}
    ) {

        const resultado =
            this.registrarCobro(
                datos
            );


        /*
         * Registramos el ingreso en caja una sola vez.
         */

        const movimiento =
            this.registrarIngresoCaja(
                resultado.pago
            );


        return {

            pago:
                resultado.pago,

            recibo:
                resultado.recibo,

            movimiento

        };
    },


    // ======================================================
    // COBRO COMPLETO - SUPABASE
    // ======================================================

    async cobrarNube(
        datos = {}
    ) {

        const resultado =
            await this
                .registrarCobroNube(
                    datos
                );


        /*
         * Registramos el mismo cobro
         * como ingreso en Caja.
         */

        const movimiento =
            await this
                .registrarIngresoCajaNube(
                    resultado.pago
                );


        return {

            pago:
                resultado.pago,

            recibo:
                resultado.recibo,

            movimiento

        };
    }

};