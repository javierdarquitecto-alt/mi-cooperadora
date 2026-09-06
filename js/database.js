/**
 * ==========================================================
 * MI COOPERADORA
 * database.js
 * ==========================================================
 *
 * Base de datos local de la aplicación.
 *
 * Gestiona:
 * - Configuración institucional.
 * - Configuración de cuotas.
 * - Configuración de recibos.
 * - Seguridad administrativa.
 * - Familias.
 * - Alumnos.
 * - Pagos.
 * - Recibos.
 * - Caja.
 * - Reportes.
 * - Importación / exportación.
 * ==========================================================
 */

const Database = {


    // ======================================================
    // PROPIEDADES
    // ======================================================

    data: null,

    STORAGE_KEY:
        CONFIG.STORAGE_KEY,


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    init() {

        const datosGuardados =
            Storage.get(
                this.STORAGE_KEY,
                null
            );


        if (datosGuardados) {

            this.data =
                this.normalizarDatos(
                    datosGuardados
                );

        } else {

            this.data =
                this.crearBaseInicial();

        }


        /*
         * Guardamos nuevamente.
         *
         * Esto permite incorporar nuevas opciones
         * de configuración sin borrar la información
         * existente.
         */

        this.save();


        return this.data;
    },


    // ======================================================
    // BASE INICIAL
    // ======================================================

    crearBaseInicial() {

        return {

            version:
                CONFIG.APP_VERSION,

            creado:
                new Date().toISOString(),

            actualizado:
                new Date().toISOString(),


            configuracion: {

                cooperadora: {
                    ...CONFIG.COOPERADORA
                },


                cuotas: {
                    ...CONFIG.CUOTAS
                },


                recibos: {
                    ...CONFIG.RECIBOS
                },


                admin: {

                    /*
                     * Nunca guardamos el PIN directamente.
                     *
                     * Se guarda únicamente su hash.
                     */

                    pinHash:
                        "",

                    creado:
                        null,

                    actualizado:
                        null,

                    intentosFallidos:
                        0,

                    bloqueadoHasta:
                        null

                }

            },


            familias: [],
            alumnos: [],
            pagos: [],
            recibos: [],
            movimientos: [],
            ventas: [],
            sorteos: []

        };
    },


    // ======================================================
    // NORMALIZACIÓN
    // ======================================================

    normalizarDatos(
        datos = {}
    ) {

        const base =
            this.crearBaseInicial();


        const resultado = {

            ...base,

            ...datos

        };


        // --------------------------------------------------
        // COLECCIONES
        // --------------------------------------------------

        resultado.familias =
            Array.isArray(
                datos.familias
            )
                ? datos.familias
                : [];


        resultado.alumnos =
            Array.isArray(
                datos.alumnos
            )
                ? datos.alumnos
                : [];


        resultado.pagos =
            Array.isArray(
                datos.pagos
            )
                ? datos.pagos
                : [];


        resultado.recibos =
            Array.isArray(
                datos.recibos
            )
                ? datos.recibos
                : [];

        resultado.movimientos =
            Array.isArray(
                datos.movimientos
            )
                ? datos.movimientos
                : [];

        resultado.ventas =
            Array.isArray(
                 datos.ventas
            )
                 ? datos.ventas
                : [];

        resultado.sorteos =
            Array.isArray(
                datos.sorteos
            )
                ? datos.sorteos
                : [];

        // --------------------------------------------------
        // CONFIGURACIÓN
        // --------------------------------------------------

        resultado.configuracion = {

            cooperadora: {

                ...base.configuracion
                    .cooperadora,

                ...(
                    datos.configuracion
                        ?.cooperadora ||
                    {}
                )

            },


            cuotas: {

                ...base.configuracion
                    .cuotas,

                ...(
                    datos.configuracion
                        ?.cuotas ||
                    {}
                )

            },


            recibos: {

                ...base.configuracion
                    .recibos,

                ...(
                    datos.configuracion
                        ?.recibos ||
                    {}
                )

            },


            admin: {

                ...base.configuracion
                    .admin,

                ...(
                    datos.configuracion
                        ?.admin ||
                    {}
                )

            }

        };


        return resultado;
    },


    // ======================================================
    // GUARDAR
    // ======================================================

    save() {

        if (!this.data) {

            return false;
        }


        this.data.actualizado =
            new Date().toISOString();


        return Storage.set(
            this.STORAGE_KEY,
            this.data
        );
    },


    getData() {

        return this.data;
    },


    reset() {

        this.data =
            this.crearBaseInicial();


        return this.save();
    },


    // ======================================================
    // CONFIGURACIÓN GENERAL
    // ======================================================

    obtenerConfiguracion() {

        if (!this.data) {

            return null;
        }


        return this.data
            .configuracion;
    },


    // ======================================================
    // DATOS INSTITUCIONALES
    // ======================================================

    obtenerConfiguracionCooperadora() {

        return {

            ...CONFIG.COOPERADORA,

            ...(
                this.data
                    ?.configuracion
                    ?.cooperadora ||
                {}
            )

        };
    },


    actualizarConfiguracionCooperadora(
        cambios = {}
    ) {

        if (!this.data) {

            return false;
        }


        this.data
            .configuracion
            .cooperadora = {

                ...this.obtenerConfiguracionCooperadora(),

                ...cambios

            };


        this.save();


        return this.obtenerConfiguracionCooperadora();
    },


    // ======================================================
    // CONFIGURACIÓN DE CUOTAS
    // ======================================================

    obtenerConfiguracionCuotas() {

        return {

            ...CONFIG.CUOTAS,

            ...(
                this.data
                    ?.configuracion
                    ?.cuotas ||
                {}
            )

        };
    },


    obtenerValorCuota() {

        const configuracion =
            this.obtenerConfiguracionCuotas();


        const valor =
            Number(
                configuracion.valorActual
            );


        if (
            Number.isNaN(valor) ||
            valor <= 0
        ) {

            return Number(
                CONFIG.CUOTAS.valorActual
            ) || 0;
        }


        return valor;
    },


    actualizarValorCuota(
        nuevoValor
    ) {

        const valor =
            Number(
                nuevoValor
            );


        if (
            Number.isNaN(valor) ||
            valor <= 0
        ) {

            return false;
        }


        this.data
            .configuracion
            .cuotas
            .valorActual =
                valor;


        this.save();


        return true;
    },


    obtenerDiaVencimientoCuota() {

        const configuracion =
            this.obtenerConfiguracionCuotas();


        return Number(
            configuracion.diaVencimiento
        ) || 10;
    },


    actualizarDiaVencimientoCuota(
        dia
    ) {

        const valor =
            Number(
                dia
            );


        if (
            !Number.isInteger(valor) ||
            valor < 1 ||
            valor > 31
        ) {

            return false;
        }


        this.data
            .configuracion
            .cuotas
            .diaVencimiento =
                valor;


        this.save();


        return true;
    },


    actualizarPeriodoInicial(
        periodo
    ) {

        const valor =
            String(
                periodo || ""
            ).trim();


        if (!valor) {

            return false;
        }


        this.data
            .configuracion
            .cuotas
            .periodoInicial =
                valor;


        this.save();


        return true;
    },


    // ======================================================
    // CONFIGURACIÓN DE RECIBOS
    // ======================================================

    obtenerConfiguracionRecibos() {

        return {

            ...CONFIG.RECIBOS,

            ...(
                this.data
                    ?.configuracion
                    ?.recibos ||
                {}
            )

        };
    },


    actualizarConfiguracionRecibos(
        cambios = {}
    ) {

        if (!this.data) {

            return false;
        }


        this.data
            .configuracion
            .recibos = {

                ...this.obtenerConfiguracionRecibos(),

                ...cambios

            };


        this.save();


        return this.obtenerConfiguracionRecibos();
    },


    // ======================================================
    // ADMINISTRACIÓN
    // ======================================================

    obtenerConfiguracionAdmin() {

        return {

            pinHash:
                this.data
                    ?.configuracion
                    ?.admin
                    ?.pinHash ||
                "",

            creado:
                this.data
                    ?.configuracion
                    ?.admin
                    ?.creado ||
                null,

            actualizado:
                this.data
                    ?.configuracion
                    ?.admin
                    ?.actualizado ||
                null,

            intentosFallidos:
                Number(
                    this.data
                        ?.configuracion
                        ?.admin
                        ?.intentosFallidos ||
                    0
                ),

            bloqueadoHasta:
                this.data
                    ?.configuracion
                    ?.admin
                    ?.bloqueadoHasta ||
                null

        };
    },


    adminTienePin() {

        const admin =
            this.obtenerConfiguracionAdmin();


        return Boolean(
            admin.pinHash
        );
    },


    validarFormatoPin(
        pin
    ) {

        const texto =
            String(
                pin || ""
            );


        if (
            texto.length <
                CONFIG.ADMIN.pinMinLength ||

            texto.length >
                CONFIG.ADMIN.pinMaxLength
        ) {

            return false;
        }


        /*
         * Por simplicidad usamos números.
         */

        return /^\d+$/.test(
            texto
        );
    },


    async generarHash(
        texto
    ) {

        const contenido =
            new TextEncoder()
                .encode(
                    String(texto)
                );


        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                contenido
            );


        return Array
            .from(
                new Uint8Array(
                    hash
                )
            )
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join("");
    },


    async crearPinAdmin(
        pin
    ) {

        if (
            !this.validarFormatoPin(
                pin
            )
        ) {

            return false;
        }


        const pinHash =
            await this.generarHash(
                pin
            );


        const ahora =
            new Date().toISOString();


        this.data
            .configuracion
            .admin = {

                ...this.obtenerConfiguracionAdmin(),

                pinHash,

                creado:
                    this.data
                        .configuracion
                        .admin
                        .creado ||
                    ahora,

                actualizado:
                    ahora,

                intentosFallidos:
                    0,

                bloqueadoHasta:
                    null

            };


        this.save();


        return true;
    },


    adminEstaBloqueado() {

        const admin =
            this.obtenerConfiguracionAdmin();


        if (!admin.bloqueadoHasta) {

            return false;
        }


        const limite =
            new Date(
                admin.bloqueadoHasta
            );


        if (
            Number.isNaN(
                limite.getTime()
            )
        ) {

            return false;
        }


        if (
            new Date() >= limite
        ) {

            this.data
                .configuracion
                .admin
                .intentosFallidos =
                    0;


            this.data
                .configuracion
                .admin
                .bloqueadoHasta =
                    null;


            this.save();


            return false;
        }


        return true;
    },


    async verificarPinAdmin(
        pin
    ) {

        if (
            !this.adminTienePin()
        ) {

            return false;
        }


        if (
            this.adminEstaBloqueado()
        ) {

            return false;
        }


        const hash =
            await this.generarHash(
                pin
            );


        const admin =
            this.obtenerConfiguracionAdmin();


        const correcto =
            hash ===
            admin.pinHash;


        if (correcto) {

            this.data
                .configuracion
                .admin
                .intentosFallidos =
                    0;


            this.data
                .configuracion
                .admin
                .bloqueadoHasta =
                    null;


            this.save();


            return true;
        }


        const intentos =
            admin.intentosFallidos + 1;


        this.data
            .configuracion
            .admin
            .intentosFallidos =
                intentos;


        /*
         * Si alcanza el máximo de intentos,
         * bloqueamos durante 5 minutos.
         */

        if (
            intentos >=
            CONFIG.ADMIN.maxIntentos
        ) {

            const bloqueo =
                new Date();


            bloqueo.setMinutes(
                bloqueo.getMinutes() + 5
            );


            this.data
                .configuracion
                .admin
                .bloqueadoHasta =
                    bloqueo.toISOString();


            this.data
                .configuracion
                .admin
                .intentosFallidos =
                    0;
        }


        this.save();


        return false;
    },


    async cambiarPinAdmin(
        pinActual,
        pinNuevo
    ) {

        const correcto =
            await this.verificarPinAdmin(
                pinActual
            );


        if (!correcto) {

            return false;
        }


        return await this.crearPinAdmin(
            pinNuevo
        );
    },


    // ======================================================
    // FAMILIAS
    // ======================================================

    agregarFamilia(
        datos = {}
    ) {

        const familia = {

            id:
                datos.id ||
                this.generarId(
                    "FAM"
                ),

            apellido:
                datos.apellido ||
                "",

            nombre:
                datos.nombre ||
                "",

            dni:
                datos.dni ||
                "",

            telefono:
                datos.telefono ||
                "",

            email:
                datos.email ||
                "",

            direccion:
                datos.direccion ||
                "",

            observaciones:
                datos.observaciones ||
                "",

            activa:
                datos.activa !== false,

            fechaAlta:
                datos.fechaAlta ||
                this.fechaActual(),

            fechaBaja:
                datos.fechaBaja ||
                null

        };


        this.data
            .familias
            .push(
                familia
            );


        this.save();


        return familia;
    },


    obtenerFamilias() {

        return [
            ...this.data.familias
        ];
    },


    obtenerFamiliasActivas() {

        return this.data
            .familias
            .filter(
                familia =>
                    familia.activa !== false
            );
    },


    obtenerFamilia(
        id
    ) {

        return this.data
            .familias
            .find(
                familia =>
                    familia.id === id
            ) || null;
    },


    buscarFamilias(
        texto = ""
    ) {

        const termino =
            String(
                texto
            )
                .trim()
                .toLowerCase();


        if (!termino) {

            return this.obtenerFamilias();
        }


        return this.data
            .familias
            .filter(
                familia => {

                    const contenido = [

                        familia.id,

                        familia.apellido,

                        familia.nombre,

                        familia.dni,

                        familia.telefono,

                        familia.email

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return contenido
                        .includes(
                            termino
                        );
                }
            );
    },


    actualizarFamilia(
        id,
        cambios = {}
    ) {

        const familia =
            this.obtenerFamilia(
                id
            );


        if (!familia) {

            return null;
        }


        Object.assign(
            familia,
            cambios
        );


        this.save();


        return familia;
    },


    desactivarFamilia(
        id
    ) {

        return this.actualizarFamilia(

            id,

            {
                activa:
                    false,

                fechaBaja:
                    this.fechaActual()
            }

        );
    },


    activarFamilia(
        id
    ) {

        return this.actualizarFamilia(

            id,

            {
                activa:
                    true,

                fechaBaja:
                    null
            }

        );
    },


    eliminarFamilia(
        id
    ) {

        const indice =
            this.data
                .familias
                .findIndex(
                    familia =>
                        familia.id === id
                );


        if (indice === -1) {

            return false;
        }


        this.data
            .familias
            .splice(
                indice,
                1
            );


        this.save();


        return true;
    },


    existeFamilia(
        id
    ) {

        return Boolean(
            this.obtenerFamilia(
                id
            )
        );
    },


    // ======================================================
    // ALUMNOS
    // ======================================================

    agregarAlumno(
        datos = {}
    ) {

        if (!datos.familiaId) {

            return null;
        }


        if (
            !this.existeFamilia(
                datos.familiaId
            )
        ) {

            return null;
        }


        const alumno = {

            id:
                datos.id ||
                this.generarId(
                    "ALU"
                ),

            familiaId:
                datos.familiaId,

            apellido:
                datos.apellido ||
                "",

            nombre:
                datos.nombre ||
                "",

            dni:
                datos.dni ||
                "",

            fechaNacimiento:
                datos.fechaNacimiento ||
                "",

            curso:
                datos.curso ||
                "",

            division:
                datos.division ||
                "",

            turno:
                datos.turno ||
                "",

            activo:
                datos.activo !== false,

            observaciones:
                datos.observaciones ||
                ""

        };


        this.data
            .alumnos
            .push(
                alumno
            );


        this.save();


        return alumno;
    },


    obtenerAlumnos() {

        return [
            ...this.data.alumnos
        ];
    },


    obtenerAlumno(
        id
    ) {

        return this.data
            .alumnos
            .find(
                alumno =>
                    alumno.id === id
            ) || null;
    },


    obtenerAlumnosFamilia(
        familiaId
    ) {

        return this.data
            .alumnos
            .filter(
                alumno =>
                    alumno.familiaId ===
                    familiaId
            );
    },


    actualizarAlumno(
        id,
        cambios = {}
    ) {

        const alumno =
            this.obtenerAlumno(
                id
            );


        if (!alumno) {

            return null;
        }


        Object.assign(
            alumno,
            cambios
        );


        this.save();


        return alumno;
    },


    desactivarAlumno(
        id
    ) {

        return this.actualizarAlumno(

            id,

            {
                activo:
                    false
            }

        );
    },


    activarAlumno(
        id
    ) {

        return this.actualizarAlumno(

            id,

            {
                activo:
                    true
            }

        );
    },


    eliminarAlumno(
        id
    ) {

        const indice =
            this.data
                .alumnos
                .findIndex(
                    alumno =>
                        alumno.id === id
                );


        if (indice === -1) {

            return false;
        }


        this.data
            .alumnos
            .splice(
                indice,
                1
            );


        this.save();


        return true;
    },


    // ======================================================
    // PAGOS
    // ======================================================

    registrarPago(
        datos = {}
    ) {

        if (!datos.familiaId) {

            return null;
        }


        if (
            !this.existeFamilia(
                datos.familiaId
            )
        ) {

            return null;
        }


        const pago = {

            id:
                datos.id ||
                this.generarId(
                    "PAG"
                ),

            familiaId:
                datos.familiaId,

            alumnoId:
                datos.alumnoId ||
                null,

            fecha:
                datos.fecha ||
                this.fechaActual(),

            periodo:
                datos.periodo ||
                "",

            concepto:
                datos.concepto ||
                "Cuota",

            importe:
                Number(
                    datos.importe
                ) || 0,

            medioPago:
                datos.medioPago ||
                "Efectivo",

            observaciones:
                datos.observaciones ||
                "",

            anulado:
                false,

            fechaAnulacion:
                null

        };


        this.data
            .pagos
            .push(
                pago
            );


        this.save();


        return pago;
    },


    obtenerPagos() {

        return [
            ...this.data.pagos
        ];
    },


    obtenerPago(
        id
    ) {

        return this.data
            .pagos
            .find(
                pago =>
                    pago.id === id
            ) || null;
    },


    obtenerPagosFamilia(
        familiaId
    ) {

        return this.data
            .pagos
            .filter(

                pago =>

                    pago.familiaId ===
                        familiaId &&

                    pago.anulado !== true

            );
    },


    obtenerPagosPeriodo(
        periodo
    ) {

        return this.data
            .pagos
            .filter(

                pago =>

                    pago.periodo ===
                        periodo &&

                    pago.anulado !== true

            );
    },


    actualizarPago(
        id,
        cambios = {}
    ) {

        const pago =
            this.obtenerPago(
                id
            );


        if (!pago) {

            return null;
        }


        Object.assign(
            pago,
            cambios
        );


        this.save();


        return pago;
    },


    anularPago(
        id
    ) {

        const pago =
            this.obtenerPago(
                id
            );


        if (!pago) {

            return false;
        }


        pago.anulado =
            true;


        pago.fechaAnulacion =
            this.fechaActual();


        this.save();


        return true;
    },


    obtenerTotalPagadoFamilia(
        familiaId
    ) {

        return this
            .obtenerPagosFamilia(
                familiaId
            )
            .reduce(

                (total, pago) =>

                    total +
                    Number(
                        pago.importe ||
                        0
                    ),

                0

            );
    },


    obtenerTotalCobradoPeriodo(
        periodo
    ) {

        return this
            .obtenerPagosPeriodo(
                periodo
            )
            .reduce(

                (total, pago) =>

                    total +
                    Number(
                        pago.importe ||
                        0
                    ),

                0

            );
    },


    // ======================================================
    // RECIBOS
    // ======================================================

    generarRecibo(
        pagoId
    ) {

        const pago =
            this.obtenerPago(
                pagoId
            );


        if (
            !pago ||
            pago.anulado
        ) {

            return null;
        }


        const existente =
            this.data
                .recibos
                .find(
                    recibo =>
                        recibo.pagoId ===
                        pagoId
                );


        if (existente) {

            return existente;
        }


        const configuracion =
            this.obtenerConfiguracionRecibos();


        const recibo = {

            id:
                this.generarId(
                    "REC"
                ),

            numero:
                this.generarNumeroRecibo(),

            pagoId:
                pago.id,

            familiaId:
                pago.familiaId,

            fecha:
                this.fechaActual(),

            importe:
                pago.importe,

            emitido:
                true,

            prefijo:
                configuracion.prefijo

        };


        this.data
            .recibos
            .push(
                recibo
            );


        this.save();


        return recibo;
    },


    obtenerRecibos() {

        return [
            ...this.data.recibos
        ];
    },


    obtenerRecibo(
        id
    ) {

        return this.data
            .recibos
            .find(

                recibo =>

                    recibo.id === id ||

                    recibo.numero === id

            ) || null;
    },


    obtenerReciboPago(
        pagoId
    ) {

        return this.data
            .recibos
            .find(
                recibo =>
                    recibo.pagoId ===
                    pagoId
            ) || null;
    },


    generarNumeroRecibo() {

        const configuracion =
            this.obtenerConfiguracionRecibos();


        let mayor = 0;


        this.data
            .recibos
            .forEach(
                recibo => {

                    const numero =
                        String(
                            recibo.numero ||
                            ""
                        );


                    const valor =
                        parseInt(

                            numero.replace(
                                /\D/g,
                                ""
                            ),

                            10
                        );


                    if (
                        !isNaN(valor) &&
                        valor > mayor
                    ) {

                        mayor =
                            valor;
                    }
                }
            );


        return (

            configuracion.prefijo +

            String(
                mayor + 1
            )
                .padStart(
                    Number(
                        configuracion.longitud
                    ) || 6,

                    "0"
                )

        );
    },

// ======================================================
// VENTAS
// ======================================================

agregarVenta(
    datos = {}
) {

    if (!datos.familiaId) {
        return null;
    }


    if (
        !this.existeFamilia(
            datos.familiaId
        )
    ) {
        return null;
    }


    const cantidad =
        Number(
            datos.cantidad
        ) || 1;


    const precioUnitario =
        Number(
            datos.precioUnitario
        ) || 0;


    const venta = {

        id:
            datos.id ||
            this.generarId(
                "VEN"
            ),

        familiaId:
            datos.familiaId,

        alumnoId:
            datos.alumnoId ||
            null,

        producto:
            datos.producto ||
            "",

        talle:
            datos.talle ||
            "",

        cantidad,

        precioUnitario,

        total:
            cantidad *
            precioUnitario,

        fecha:
            datos.fecha ||
            this.fechaActual(),

        estadoPago:
            datos.estadoPago ||
            "Pendiente",

        estadoEntrega:
            datos.estadoEntrega ||
            "Pendiente",

        observaciones:
            datos.observaciones ||
            "",

        movimientoCajaId:
            datos.movimientoCajaId ||
            null

    };


    this.data
        .ventas
        .push(
            venta
        );


    this.save();


    return venta;
},


obtenerVentas() {

    return [
        ...this.data.ventas
    ];
},


obtenerVenta(
    id
) {

    return this.data
        .ventas
        .find(
            venta =>
                venta.id === id
        ) || null;
},


obtenerVentasFamilia(
    familiaId
) {

    return this.data
        .ventas
        .filter(
            venta =>
                venta.familiaId ===
                familiaId
        );
},


actualizarVenta(
    id,
    cambios = {}
) {

    const venta =
        this.obtenerVenta(
            id
        );


    if (!venta) {
        return null;
    }


    Object.assign(
        venta,
        cambios
    );


    venta.cantidad =
        Number(
            venta.cantidad
        ) || 1;


    venta.precioUnitario =
        Number(
            venta.precioUnitario
        ) || 0;


    venta.total =
        venta.cantidad *
        venta.precioUnitario;


    this.save();


    return venta;
},


eliminarVenta(
    id
) {

    const indice =
        this.data
            .ventas
            .findIndex(
                venta =>
                    venta.id === id
            );


    if (indice === -1) {
        return false;
    }


    this.data
        .ventas
        .splice(
            indice,
            1
        );


    this.save();


    return true;
},


obtenerTotalVentas() {

    return this.data
        .ventas
        .reduce(
            (total, venta) =>
                total +
                Number(
                    venta.total ||
                    0
                ),
            0
        );
},


obtenerTotalVentasPagadas() {

    return this.data
        .ventas
        .filter(
            venta =>
                venta.estadoPago ===
                "Pagado"
        )
        .reduce(
            (total, venta) =>
                total +
                Number(
                    venta.total ||
                    0
                ),
            0
        );
},
// ======================================================
// SORTEOS / RIFAS
// ======================================================

agregarSorteo(
    datos = {}
) {

    const nombre =
        String(
            datos.nombre || ""
        ).trim();


    const cantidadNumeros =
        Number(
            datos.cantidadNumeros
        );


    const valorNumero =
        Number(
            datos.valorNumero
        );


    if (!nombre) {
        return null;
    }


    if (
        !Number.isInteger(cantidadNumeros) ||
        cantidadNumeros < 1
    ) {
        return null;
    }


    if (
        Number.isNaN(valorNumero) ||
        valorNumero < 0
    ) {
        return null;
    }


    const sorteo = {

        id:
            datos.id ||
            this.generarId(
                "SOR"
            ),

        nombre,

        descripcion:
            datos.descripcion ||
            "",

        fechaCreacion:
            datos.fechaCreacion ||
            this.fechaActual(),

        fechaSorteo:
            datos.fechaSorteo ||
            "",

        cantidadNumeros,

        valorNumero,

        estado:
            datos.estado ||
            "Activo",

        numeroGanador:
            datos.numeroGanador ||
            null,

        ventas:
            Array.isArray(
                datos.ventas
            )
                ? datos.ventas
                : []

    };


    this.data
        .sorteos
        .push(
            sorteo
        );


    this.save();


    return sorteo;
},


obtenerSorteos() {

    return [
        ...this.data.sorteos
    ];
},


obtenerSorteosActivos() {

    return this.data
        .sorteos
        .filter(
            sorteo =>
                sorteo.estado ===
                "Activo"
        );
},


obtenerSorteo(
    id
) {

    return this.data
        .sorteos
        .find(
            sorteo =>
                sorteo.id === id
        ) || null;
},


actualizarSorteo(
    id,
    cambios = {}
) {

    const sorteo =
        this.obtenerSorteo(
            id
        );


    if (!sorteo) {
        return null;
    }


    Object.assign(
        sorteo,
        cambios
    );


    this.save();


    return sorteo;
},


eliminarSorteo(
    id
) {

    const indice =
        this.data
            .sorteos
            .findIndex(
                sorteo =>
                    sorteo.id === id
            );


    if (indice === -1) {
        return false;
    }


    this.data
        .sorteos
        .splice(
            indice,
            1
        );


    this.save();


    return true;
},


// ------------------------------------------------------
// VENTA DE NÚMEROS
// ------------------------------------------------------

registrarVentaSorteo(
    sorteoId,
    datos = {}
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (
        !sorteo ||
        sorteo.estado !== "Activo"
    ) {
        return null;
    }


    const numero =
        Number(
            datos.numero
        );


    if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > sorteo.cantidadNumeros
    ) {
        return null;
    }


    /*
     * Evitamos vender dos veces
     * el mismo número.
     */

    const ocupado =
        sorteo.ventas.some(
            venta =>
                Number(
                    venta.numero
                ) === numero
        );


    if (ocupado) {
        return null;
    }


    if (
        datos.familiaId &&
        !this.existeFamilia(
            datos.familiaId
        )
    ) {
        return null;
    }


    const venta = {

        id:
            "RSV" +
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        numero,

        familiaId:
            datos.familiaId ||
            null,

        comprador:
            String(
                datos.comprador || ""
            ).trim(),

        telefono:
            String(
                datos.telefono || ""
            ).trim(),

        fecha:
            datos.fecha ||
            this.fechaActual(),

        importe:
            Number(
                datos.importe
            ) ||
            Number(
                sorteo.valorNumero
            ) ||
            0,

        estadoPago:
            datos.estadoPago === "Pagado"
                ? "Pagado"
                : "Pendiente",

        observaciones:
            datos.observaciones ||
            "",

        movimientoCajaId:
            datos.movimientoCajaId ||
            null

    };


    sorteo.ventas.push(
        venta
    );


    this.save();


    return venta;
},


obtenerVentaSorteo(
    sorteoId,
    ventaId
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return null;
    }


    return sorteo.ventas
        .find(
            venta =>
                venta.id === ventaId
        ) || null;
},


actualizarVentaSorteo(
    sorteoId,
    ventaId,
    cambios = {}
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return null;
    }


    const venta =
        this.obtenerVentaSorteo(
            sorteoId,
            ventaId
        );


    if (!venta) {
        return null;
    }


    /*
     * Si se modifica el número,
     * verificamos que siga siendo válido
     * y que no esté vendido a otra persona.
     */

    if (
        cambios.numero !== undefined
    ) {

        const nuevoNumero =
            Number(
                cambios.numero
            );


        if (
            !Number.isInteger(
                nuevoNumero
            ) ||
            nuevoNumero < 1 ||
            nuevoNumero >
                sorteo.cantidadNumeros
        ) {
            return null;
        }


        const ocupado =
            sorteo.ventas.some(
                item =>
                    item.id !== ventaId &&
                    Number(
                        item.numero
                    ) === nuevoNumero
            );


        if (ocupado) {
            return null;
        }


        cambios.numero =
            nuevoNumero;
    }


    Object.assign(
        venta,
        cambios
    );


    this.save();


    return venta;
},


eliminarVentaSorteo(
    sorteoId,
    ventaId
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return false;
    }


    const indice =
        sorteo.ventas
            .findIndex(
                venta =>
                    venta.id === ventaId
            );


    if (indice === -1) {
        return false;
    }


    sorteo.ventas.splice(
        indice,
        1
    );


    this.save();


    return true;
},


// ------------------------------------------------------
// CONSULTAS DEL SORTEO
// ------------------------------------------------------

numeroSorteoDisponible(
    sorteoId,
    numero
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return false;
    }


    const valor =
        Number(
            numero
        );


    if (
        !Number.isInteger(valor) ||
        valor < 1 ||
        valor >
            sorteo.cantidadNumeros
    ) {
        return false;
    }


    return !sorteo.ventas.some(
        venta =>
            Number(
                venta.numero
            ) === valor
    );
},


obtenerNumerosDisponibles(
    sorteoId
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return [];
    }


    const vendidos =
        new Set(
            sorteo.ventas.map(
                venta =>
                    Number(
                        venta.numero
                    )
            )
        );


    const disponibles =
        [];


    for (
        let numero = 1;
        numero <= sorteo.cantidadNumeros;
        numero++
    ) {

        if (
            !vendidos.has(
                numero
            )
        ) {
            disponibles.push(
                numero
            );
        }
    }


    return disponibles;
},


obtenerResumenSorteo(
    sorteoId
) {

    const sorteo =
        this.obtenerSorteo(
            sorteoId
        );


    if (!sorteo) {
        return null;
    }


    const cantidadVendidos =
        sorteo.ventas.length;


    const cantidadDisponibles =
        Math.max(
            0,
            sorteo.cantidadNumeros -
            cantidadVendidos
        );


    const totalVendido =
        sorteo.ventas.reduce(
            (total, venta) =>
                total +
                Number(
                    venta.importe || 0
                ),
            0
        );


    const totalCobrado =
        sorteo.ventas
            .filter(
                venta =>
                    venta.estadoPago ===
                    "Pagado"
            )
            .reduce(
                (total, venta) =>
                    total +
                    Number(
                        venta.importe || 0
                    ),
                0
            );


    return {

        cantidadTotal:
            sorteo.cantidadNumeros,

        cantidadVendidos,

        cantidadDisponibles,

        totalPosible:
            Number(
                sorteo.cantidadNumeros
            ) *
            Number(
                sorteo.valorNumero
            ),

        totalVendido,

        totalCobrado,

        totalPendiente:
            totalVendido -
            totalCobrado

    };
},


finalizarSorteo(
    id,
    numeroGanador = null
) {

    const sorteo =
        this.obtenerSorteo(
            id
        );


    if (!sorteo) {
        return false;
    }


    if (
        numeroGanador !== null &&
        numeroGanador !== ""
    ) {

        const numero =
            Number(
                numeroGanador
            );


        if (
            !Number.isInteger(numero) ||
            numero < 1 ||
            numero >
                sorteo.cantidadNumeros
        ) {
            return false;
        }


        sorteo.numeroGanador =
            numero;

    } else {

        sorteo.numeroGanador =
            null;
    }


    sorteo.estado =
        "Finalizado";


    this.save();


    return true;
},

    // ======================================================
    // CAJA
    // ======================================================

    registrarMovimiento(
        datos = {}
    ) {

        const importe =
            Number(
                datos.importe
            ) || 0;


        if (importe <= 0) {

            return null;
        }


        const tipo =
            datos.tipo === "Egreso"
                ? "Egreso"
                : "Ingreso";


        const movimiento = {

            id:
                datos.id ||
                this.generarId(
                    "MOV"
                ),

            fecha:
                datos.fecha ||
                this.fechaActual(),

            tipo,

            concepto:
                datos.concepto ||
                "",

            importe,

            referencia:
                datos.referencia ||
                "",

            observaciones:
                datos.observaciones ||
                ""

        };


        this.data
            .movimientos
            .push(
                movimiento
            );


        this.save();


        return movimiento;
    },


    obtenerMovimientos() {

        return [
            ...this.data.movimientos
        ];
    },


    obtenerMovimiento(
        id
    ) {

        return this.data
            .movimientos
            .find(
                movimiento =>
                    movimiento.id === id
            ) || null;
    },


    obtenerIngresos() {

        return this.data
            .movimientos
            .filter(
                movimiento =>
                    movimiento.tipo ===
                    "Ingreso"
            );
    },


    obtenerEgresos() {

        return this.data
            .movimientos
            .filter(
                movimiento =>
                    movimiento.tipo ===
                    "Egreso"
            );
    },


    obtenerTotalIngresos() {

        return this
            .obtenerIngresos()
            .reduce(

                (total, movimiento) =>

                    total +
                    Number(
                        movimiento.importe ||
                        0
                    ),

                0

            );
    },


    obtenerTotalEgresos() {

        return this
            .obtenerEgresos()
            .reduce(

                (total, movimiento) =>

                    total +
                    Number(
                        movimiento.importe ||
                        0
                    ),

                0

            );
    },


    obtenerSaldoCaja() {

        return (

            this.obtenerTotalIngresos() -

            this.obtenerTotalEgresos()

        );
    },


    eliminarMovimiento(
        id
    ) {

        const indice =
            this.data
                .movimientos
                .findIndex(
                    movimiento =>
                        movimiento.id === id
                );


        if (indice === -1) {

            return false;
        }


        this.data
            .movimientos
            .splice(
                indice,
                1
            );


        this.save();


        return true;
    },

// ======================================================
// INTEGRACIÓN AUTOMÁTICA CON CAJA
// ======================================================

registrarIngresoAutomatico(
    datos = {}
) {

    const importe =
        Number(
            datos.importe
        ) || 0;


    if (importe <= 0) {
        return null;
    }


    const movimiento = {

        id:
            this.generarId(
                "MOV"
            ),

        tipo:
            "Ingreso",

        concepto:
            datos.concepto ||
            "Ingreso",

        importe,

        fecha:
            datos.fecha ||
            this.fechaActual(),

        medioPago:
            datos.medioPago ||
            "Sin especificar",

        referencia:
            datos.referencia ||
            "",

        origen:
            datos.origen ||
            "Automatico",

        observaciones:
            datos.observaciones ||
            ""

    };


    this.data
        .movimientos
        .push(
            movimiento
        );


    this.save();


    return movimiento;
},


eliminarMovimientoAutomatico(
    movimientoId
) {

    if (!movimientoId) {
        return false;
    }


    const indice =
        this.data
            .movimientos
            .findIndex(
                movimiento =>
                    movimiento.id ===
                    movimientoId
            );


    if (indice === -1) {
        return false;
    }


    this.data
        .movimientos
        .splice(
            indice,
            1
        );


    this.save();


    return true;
},

    // ======================================================
    // REPORTES
    // ======================================================

    obtenerResumen() {

        const familias =
            this.obtenerFamilias();


        const familiasActivas =
            this.obtenerFamiliasActivas();


        const alumnos =
            this.obtenerAlumnos();


        const alumnosActivos =
            alumnos.filter(
                alumno =>
                    alumno.activo !== false
            );


        const pagos =
            this.obtenerPagos()
                .filter(
                    pago =>
                        pago.anulado !== true
                );


        return {

            familias:
                familias.length,

            familiasActivas:
                familiasActivas.length,

            alumnos:
                alumnos.length,

            alumnosActivos:
                alumnosActivos.length,

            pagos:
                pagos.length,

            recibos:
                this.data.recibos.length,

            ingresos:
                this.obtenerTotalIngresos(),

            egresos:
                this.obtenerTotalEgresos(),

            saldo:
                this.obtenerSaldoCaja(),

            valorCuota:
                this.obtenerValorCuota()

        };
    },


    obtenerResumenPeriodo(
        periodo
    ) {

        const pagos =
            this.obtenerPagosPeriodo(
                periodo
            );


        const total =
            pagos.reduce(

                (suma, pago) =>

                    suma +
                    Number(
                        pago.importe ||
                        0
                    ),

                0

            );


        return {

            periodo,

            cantidadPagos:
                pagos.length,

            total

        };
    },


    // ======================================================
    // UTILIDADES
    // ======================================================

    generarId(
        prefijo
    ) {

        const colecciones = {

    FAM:
        this.data.familias,

    ALU:
        this.data.alumnos,

    PAG:
        this.data.pagos,

    MOV:
        this.data.movimientos,

    REC:
        this.data.recibos,

    VEN:
        this.data.ventas,

    SOR:
        this.data.sorteos

};


        const lista =
            colecciones[prefijo] ||
            [];


        let mayor =
            0;


        lista.forEach(
            item => {

                const valor =
                    String(
                        item.id ||
                        item.numero ||
                        ""
                    );


                const numero =
                    parseInt(

                        valor.replace(
                            /\D/g,
                            ""
                        ),

                        10
                    );


                if (
                    !isNaN(numero) &&
                    numero > mayor
                ) {

                    mayor =
                        numero;
                }

            }
        );


        return (

            prefijo +

            String(
                mayor + 1
            )
                .padStart(
                    6,
                    "0"
                )

        );
    },


    fechaActual() {

        const fecha =
            new Date();


        const year =
            fecha.getFullYear();


        const month =
            String(
                fecha.getMonth() + 1
            )
                .padStart(
                    2,
                    "0"
                );


        const day =
            String(
                fecha.getDate()
            )
                .padStart(
                    2,
                    "0"
                );


        return (
            `${year}-${month}-${day}`
        );
    },


    // ======================================================
    // EXPORTAR / IMPORTAR
    // ======================================================

    exportar() {

        return JSON.stringify(
            this.data,
            null,
            2
        );
    },


    importar(
        json
    ) {

        try {

            const datos =
                typeof json ===
                    "string"

                    ? JSON.parse(
                        json
                    )

                    : json;


            this.data =
                this.normalizarDatos(
                    datos
                );


            return this.save();


        } catch (error) {

            console.error(
                "Error al importar la base de datos:",
                error
            );


            return false;
        }
    }

};