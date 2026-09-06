/**
 * ==========================================================
 * MI COOPERADORA
 * cuotas.service.js
 * ==========================================================
 *
 * Servicio encargado de:
 * - Consultar pagos.
 * - Registrar pagos.
 * - Anular pagos.
 * - Generar recibos.
 * - Calcular estados mensuales de cuotas.
 *
 * MIGRACIÓN SUPABASE
 *
 * Durante la migración mantenemos una copia local
 * para que los módulos que todavía trabajan de forma
 * sincrónica continúen funcionando.
 * ==========================================================
 */

const CuotasService = {


    // ======================================================
    // CONVERSIÓN PAGO SUPABASE -> APP
    // ======================================================

    convertirPagoNube(
        registro
    ) {

        if (!registro) {
            return null;
        }


        return {

            id:
                registro.id,

            familiaId:
                registro.familia_id,

            alumnoId:
                registro.alumno_id ||
                null,

            fecha:
                registro.fecha ||
                "",

            periodo:
                registro.periodo ||
                "",

            concepto:
                registro.concepto ||
                "Cuota",

            importe:
                Number(
                    registro.importe
                ) || 0,

            medioPago:
                registro.medio_pago ||
                "Efectivo",

            observaciones:
                registro.observaciones ||
                "",

            anulado:
                registro.anulado === true,

            fechaAnulacion:
                registro.fecha_anulacion ||
                null

        };
    },


    // ======================================================
    // CONVERSIÓN RECIBO SUPABASE -> APP
    // ======================================================

    convertirReciboNube(
        registro
    ) {

        if (!registro) {
            return null;
        }


        return {

            id:
                registro.id,

            numero:
                registro.numero ||
                "",

            pagoId:
                registro.pago_id,

            familiaId:
                registro.familia_id,

            fecha:
                registro.fecha ||
                "",

            importe:
                Number(
                    registro.importe
                ) || 0,

            emitido:
                registro.emitido !== false,

            prefijo:
                registro.prefijo ||
                ""

        };
    },


    // ======================================================
    // CACHE LOCAL DE PAGOS
    // ======================================================

    guardarPagoLocal(
        pago
    ) {

        if (
            !pago ||
            !pago.id
        ) {
            return null;
        }


        const existente =
            Database.obtenerPago(
                pago.id
            );


        if (existente) {

            Object.assign(
                existente,
                pago
            );

        } else {

            Database.data
                .pagos
                .push(
                    pago
                );
        }


        Database.save();


        return pago;
    },


    guardarPagosLocales(
        pagos = []
    ) {

        if (
            !Array.isArray(
                pagos
            )
        ) {
            return [];
        }


        pagos.forEach(
            pago => {

                this.guardarPagoLocal(
                    pago
                );

            }
        );


        return pagos;
    },


    // ======================================================
    // CACHE LOCAL DE RECIBOS
    // ======================================================

    guardarReciboLocal(
        recibo
    ) {

        if (
            !recibo ||
            !recibo.id
        ) {
            return null;
        }


        const existente =
            Database.data
                .recibos
                .find(
                    item =>
                        item.id ===
                        recibo.id
                );


        if (existente) {

            Object.assign(
                existente,
                recibo
            );

        } else {

            Database.data
                .recibos
                .push(
                    recibo
                );
        }


        Database.save();


        return recibo;
    },


    // ======================================================
    // OBTENER PAGOS - LOCAL
    // ======================================================
    //
    // Estas funciones se mantienen sincrónicas por ahora
    // para no romper módulos que todavía dependen de ellas.
    // ======================================================

    obtenerTodos() {

        return Database.obtenerPagos();
    },


    obtenerPorId(
        id
    ) {

        if (!id) {
            return null;
        }


        return Database.obtenerPago(
            id
        );
    },


    obtenerPorFamilia(
        familiaId
    ) {

        if (!familiaId) {
            return [];
        }


        return Database.obtenerPagosFamilia(
            familiaId
        );
    },


    obtenerPorPeriodo(
        periodo
    ) {

        if (!periodo) {
            return [];
        }


        return Database.obtenerPagosPeriodo(
            periodo
        );
    },


    // ======================================================
    // OBTENER PAGOS - SUPABASE
    // ======================================================

    async obtenerTodosNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
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
                "Error al obtener pagos desde Supabase:",
                error
            );


            throw error;
        }


        const pagos =
            (data || [])
                .map(
                    registro =>
                        this.convertirPagoNube(
                            registro
                        )
                );


        this.guardarPagosLocales(
            pagos
        );


        return pagos;
    },


    async obtenerPorIdNube(
        id
    ) {

        if (!id) {
            return null;
        }


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error al obtener pago desde Supabase:",
                error
            );


            throw error;
        }


        if (!data) {
            return null;
        }


        const pago =
            this.convertirPagoNube(
                data
            );


        this.guardarPagoLocal(
            pago
        );


        return pago;
    },


    async obtenerPorFamiliaNube(
        familiaId
    ) {

        if (!familiaId) {
            return [];
        }


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .select(
                    "*"
                )
                .eq(
                    "familia_id",
                    familiaId
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
                "Error al obtener pagos de la familia:",
                error
            );


            throw error;
        }


        const pagos =
            (data || [])
                .map(
                    registro =>
                        this.convertirPagoNube(
                            registro
                        )
                );


        this.guardarPagosLocales(
            pagos
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


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .select(
                    "*"
                )
                .eq(
                    "periodo",
                    periodo
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
                "Error al obtener pagos del período:",
                error
            );


            throw error;
        }


        const pagos =
            (data || [])
                .map(
                    registro =>
                        this.convertirPagoNube(
                            registro
                        )
                );


        this.guardarPagosLocales(
            pagos
        );


        return pagos.filter(
            pago =>
                pago.anulado !== true
        );
    },


    // ======================================================
    // SINCRONIZAR PAGOS
    // ======================================================

    async sincronizarDesdeNube() {

        return await this
            .obtenerTodosNube();
    },


    // ======================================================
    // REGISTRAR PAGO EN SUPABASE
    // ======================================================

    async registrarPago(
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
            Number.isNaN(
                importe
            ) ||
            importe <= 0
        ) {

            throw new Error(
                "El importe del pago debe ser mayor que cero."
            );
        }


        if (!datos.periodo) {

            throw new Error(
                "Debe indicarse el período de la cuota."
            );
        }


        /*
         * Verificamos que la familia exista
         * realmente en Supabase.
         */

        const familia =
            await FamiliasService
                .obtenerPorIdNube(
                    datos.familiaId
                );


        if (!familia) {

            throw new Error(
                "La familia seleccionada no existe."
            );
        }


        const id =
            datos.id ||
            (
                "PAG" +
                Date.now() +
                Math.floor(
                    Math.random() *
                    1000
                )
            );


        const fecha =
            datos.fecha ||
            Database.fechaActual();


        const registro = {

            id,

            familia_id:
                datos.familiaId,

            alumno_id:
                datos.alumnoId ||
                null,

            fecha,

            periodo:
                datos.periodo,

            concepto:
                datos.concepto ||
                "Cuota",

            importe,

            medio_pago:
                datos.medioPago ||
                "Efectivo",

            observaciones:
                datos.observaciones ||
                "",

            anulado:
                false,

            fecha_anulacion:
                null

        };


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .insert(
                    registro
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Error al registrar pago en Supabase:",
                error
            );


            throw new Error(
                "No se pudo registrar el pago."
            );
        }


        const pago =
            this.convertirPagoNube(
                data
            );


        this.guardarPagoLocal(
            pago
        );


        return pago;
    },


    // ======================================================
    // ACTUALIZAR PAGO
    // ======================================================

    async actualizar(
        id,
        datos = {}
    ) {

        if (!id) {

            throw new Error(
                "No se indicó el pago a actualizar."
            );
        }


        const cambios = {};


        if (
            datos.familiaId !==
            undefined
        ) {

            cambios.familia_id =
                datos.familiaId;
        }


        if (
            datos.alumnoId !==
            undefined
        ) {

            cambios.alumno_id =
                datos.alumnoId ||
                null;
        }


        if (
            datos.fecha !==
            undefined
        ) {

            cambios.fecha =
                datos.fecha;
        }


        if (
            datos.periodo !==
            undefined
        ) {

            cambios.periodo =
                datos.periodo;
        }


        if (
            datos.concepto !==
            undefined
        ) {

            cambios.concepto =
                datos.concepto;
        }


        if (
            datos.medioPago !==
            undefined
        ) {

            cambios.medio_pago =
                datos.medioPago;
        }


        if (
            datos.observaciones !==
            undefined
        ) {

            cambios.observaciones =
                datos.observaciones;
        }


        if (
            datos.importe !==
            undefined
        ) {

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
                    "El importe debe ser mayor que cero."
                );
            }


            cambios.importe =
                importe;
        }


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .update(
                    cambios
                )
                .eq(
                    "id",
                    id
                )
                .select()
                .maybeSingle();


        if (error) {

            console.error(
                "Error al actualizar pago en Supabase:",
                error
            );


            throw error;
        }


        if (!data) {
            return null;
        }


        const pago =
            this.convertirPagoNube(
                data
            );


        this.guardarPagoLocal(
            pago
        );


        return pago;
    },


    // ======================================================
    // ANULAR PAGO
    // ======================================================

    async anular(
        id
    ) {

        if (!id) {

            throw new Error(
                "No se indicó el pago."
            );
        }


        const fechaAnulacion =
            Database.fechaActual();


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "pagos"
                )
                .update({

                    anulado:
                        true,

                    fecha_anulacion:
                        fechaAnulacion

                })
                .eq(
                    "id",
                    id
                )
                .select()
                .maybeSingle();


        if (error) {

            console.error(
                "Error al anular pago en Supabase:",
                error
            );


            throw error;
        }


        if (!data) {
            return false;
        }


        const pago =
            this.convertirPagoNube(
                data
            );


        this.guardarPagoLocal(
            pago
        );


        return true;
    },


    // ======================================================
    // TOTALES LOCALES
    // ======================================================

    totalFamilia(
        familiaId
    ) {

        if (!familiaId) {
            return 0;
        }


        return Database
            .obtenerTotalPagadoFamilia(
                familiaId
            );
    },


    totalPeriodo(
        periodo
    ) {

        if (!periodo) {
            return 0;
        }


        return Database
            .obtenerTotalCobradoPeriodo(
                periodo
            );
    },


    totalGeneral() {

        return Database
            .obtenerPagos()

            .filter(
                pago =>
                    pago.anulado !== true
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


    obtenerTodosLosRecibos() {

        return Database
            .obtenerRecibos();
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


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "recibos"
                )
                .select(
                    "*"
                )
                .eq(
                    "pago_id",
                    pagoId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error al obtener recibo desde Supabase:",
                error
            );


            throw error;
        }


        if (!data) {
            return null;
        }


        const recibo =
            this.convertirReciboNube(
                data
            );


        this.guardarReciboLocal(
            recibo
        );


        return recibo;
    },


    async obtenerTodosLosRecibosNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "recibos"
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
                "Error al obtener recibos desde Supabase:",
                error
            );


            throw error;
        }


        const recibos =
            (data || [])
                .map(
                    registro =>
                        this.convertirReciboNube(
                            registro
                        )
                );


        recibos.forEach(
            recibo =>
                this.guardarReciboLocal(
                    recibo
                )
        );


        return recibos;
    },


    // ======================================================
    // GENERAR RECIBO EN SUPABASE
    // ======================================================

    async generarRecibo(
        pagoId
    ) {

        if (!pagoId) {

            throw new Error(
                "No se indicó el pago."
            );
        }


        const pago =
            await this
                .obtenerPorIdNube(
                    pagoId
                );


        if (
            !pago ||
            pago.anulado
        ) {

            throw new Error(
                "No se pudo generar el recibo."
            );
        }


        /*
         * Si ya existe, no generamos otro.
         */

        const existente =
            await this
                .obtenerReciboNube(
                    pagoId
                );


        if (existente) {
            return existente;
        }


        const configuracion =
            Database
                .obtenerConfiguracionRecibos();


        const prefijo =
            configuracion.prefijo ||
            "REC";


        const longitud =
            Number(
                configuracion.longitud
            ) || 6;


        /*
         * Buscamos los números existentes
         * para continuar la numeración.
         */

        const {
            data:
                recibosExistentes,

            error:
                errorNumeracion

        } =
            await SupabaseClient
                .from(
                    "recibos"
                )
                .select(
                    "numero"
                );


        if (errorNumeracion) {

            console.error(
                "Error al obtener numeración de recibos:",
                errorNumeracion
            );


            throw errorNumeracion;
        }


        let mayor =
            0;


        (
            recibosExistentes ||
            []
        ).forEach(
            recibo => {

                const valor =
                    parseInt(

                        String(
                            recibo.numero ||
                            ""
                        )
                            .replace(
                                /\D/g,
                                ""
                            ),

                        10
                    );


                if (
                    !Number.isNaN(
                        valor
                    ) &&
                    valor > mayor
                ) {

                    mayor =
                        valor;
                }
            }
        );


        const numero =
            prefijo +
            String(
                mayor + 1
            ).padStart(
                longitud,
                "0"
            );


        const id =
            "REC" +
            Date.now() +
            Math.floor(
                Math.random() *
                1000
            );


        const registro = {

            id,

            numero,

            pago_id:
                pago.id,

            familia_id:
                pago.familiaId,

            fecha:
                Database.fechaActual(),

            importe:
                Number(
                    pago.importe
                ) || 0,

            emitido:
                true,

            prefijo

        };


        const {
            data,
            error
        } =
            await SupabaseClient
                .from(
                    "recibos"
                )
                .insert(
                    registro
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Error al generar recibo en Supabase:",
                error
            );


            throw new Error(
                "No se pudo generar el recibo."
            );
        }


        const recibo =
            this.convertirReciboNube(
                data
            );


        this.guardarReciboLocal(
            recibo
        );


        return recibo;
    },


    // ======================================================
    // RESUMEN
    // ======================================================

    obtenerResumenPeriodo(
        periodo
    ) {

        if (!periodo) {

            return {

                periodo:
                    "",

                cantidadPagos:
                    0,

                total:
                    0

            };
        }


        return Database
            .obtenerResumenPeriodo(
                periodo
            );
    },


    obtenerResumenFamilia(
        familiaId
    ) {

        if (!familiaId) {

            return {

                cantidadPagos:
                    0,

                total:
                    0

            };
        }


        const pagos =
            this.obtenerPorFamilia(
                familiaId
            );


        const total =
            pagos.reduce(

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


        return {

            cantidadPagos:
                pagos.length,

            total

        };
    },


    // ======================================================
    // ESTADO DE UNA CUOTA
    // ======================================================

    verificarPagoPeriodo(
        familiaId,
        periodo
    ) {

        if (
            !familiaId ||
            !periodo
        ) {

            return false;
        }


        const pagos =
            Database
                .obtenerPagosFamilia(
                    familiaId
                );


        return pagos.some(

            pago =>

                pago.periodo ===
                    periodo &&

                pago.anulado !==
                    true

        );
    },


    obtenerEstadoCuota(
        familiaId,
        periodo
    ) {

        const pagos =
            this.obtenerPorFamilia(
                familiaId
            )
                .filter(

                    pago =>

                        pago.periodo ===
                            periodo &&

                        pago.anulado !==
                            true

                );


        const totalPagado =
            pagos.reduce(

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


        const pagada =
            pagos.length > 0;


        return {

            familiaId,

            periodo,

            pagada,

            estado:
                pagada
                    ? "Pagada"
                    : "Pendiente",

            cantidadPagos:
                pagos.length,

            totalPagado

        };
    },


    // ======================================================
    // PERÍODOS DEL AÑO
    // ======================================================

    obtenerPeriodosAnio(
        anio = null
    ) {

        const hoy =
            new Date();


        const anioActual =
            hoy.getFullYear();


        const mesActual =
            hoy.getMonth() + 1;


        const anioSeleccionado =
            anio
                ? Number(
                    anio
                )
                : anioActual;


        const ultimoMes =
            anioSeleccionado ===
            anioActual
                ? mesActual
                : 12;


        const periodos =
            [];


        for (
            let mes = 1;
            mes <= ultimoMes;
            mes++
        ) {

            periodos.push(

                `${anioSeleccionado}-${String(
                    mes
                ).padStart(
                    2,
                    "0"
                )}`

            );
        }


        return periodos;
    },


    // ======================================================
    // ESTADO ANUAL DE UNA FAMILIA
    // ======================================================

    obtenerEstadoAnualFamilia(
        familiaId,
        anio = null
    ) {

        if (!familiaId) {
            return [];
        }


        const hoy =
            new Date();


        const anioSeleccionado =
            anio
                ? Number(
                    anio
                )
                : hoy.getFullYear();


        const periodos =
            this.obtenerPeriodosAnio(
                anioSeleccionado
            );


        return periodos.map(

            periodo => {

                const estado =
                    this.obtenerEstadoCuota(
                        familiaId,
                        periodo
                    );


                return {

                    ...estado,

                    nombreMes:
                        this.obtenerNombreMes(
                            periodo
                        )

                };

            }
        );
    },


    // ======================================================
    // RESUMEN DE DEUDA
    // ======================================================

    obtenerResumenEstadoFamilia(
        familiaId,
        anio = null
    ) {

        const estados =
            this.obtenerEstadoAnualFamilia(
                familiaId,
                anio
            );


        const pagadas =
            estados.filter(
                cuota =>
                    cuota.pagada
            );


        const pendientes =
            estados.filter(
                cuota =>
                    !cuota.pagada
            );


        return {

            totalPeriodos:
                estados.length,

            pagadas:
                pagadas.length,

            pendientes:
                pendientes.length,

            estados

        };
    },


    // ======================================================
    // NOMBRE DEL MES
    // ======================================================

    obtenerNombreMes(
        periodo
    ) {

        const nombres = [

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


        const partes =
            String(
                periodo
            ).split(
                "-"
            );


        const mes =
            Number(
                partes[1]
            );


        if (
            mes < 1 ||
            mes > 12
        ) {

            return periodo;
        }


        return nombres[
            mes - 1
        ];
    }

};