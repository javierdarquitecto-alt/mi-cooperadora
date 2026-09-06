/**
 * ==========================================================
 * MI COOPERADORA
 * config.js
 * ==========================================================
 *
 * Configuración general e inicial de la aplicación.
 *
 * IMPORTANTE:
 * Los valores editables por el administrador se copiarán
 * posteriormente a la base de datos local.
 *
 * Este archivo contiene únicamente valores iniciales y
 * parámetros técnicos.
 * ==========================================================
 */

const CONFIG = {


    // ======================================================
    // INFORMACIÓN GENERAL
    // ======================================================

    APP_NAME:
        "Mi Cooperadora",

    APP_VERSION:
        "1.0.0",

    APP_DESCRIPTION:
        "Sistema de gestión para cooperadoras escolares",


    // ======================================================
    // ALMACENAMIENTO
    // ======================================================

    STORAGE_KEY:
        "miCooperadoraDB",


    // ======================================================
    // FORMATOS
    // ======================================================

    LOCALE:
        "es-AR",

    CURRENCY:
        "ARS",

    DATE_FORMAT:
        "DD/MM/YYYY",


    // ======================================================
    // COOPERADORA
    // ======================================================
    //
    // Datos iniciales.
    //
    // Después podrán modificarse desde:
    // Configuración → Datos institucionales.
    // ======================================================

    COOPERADORA: {

        nombre:
            "Mi Cooperadora",

        escuela:
            "",

        direccion:
            "",

        telefono:
            "",

        email:
            "",

        cuit:
            "",

        localidad:
            "",

        provincia:
            "Santa Fe"

    },


    // ======================================================
    // CUOTAS
    // ======================================================

    CUOTAS: {

        moneda:
            "ARS",

        periodoInicial:
            "2026",

        diaVencimiento:
            10,

        /*
         * Valor inicial actual.
         *
         * Se utilizará solamente cuando todavía
         * no exista un valor guardado en la base.
         */

        valorActual:
            8000

    },


    // ======================================================
    // RECIBOS
    // ======================================================

    RECIBOS: {

        prefijo:
            "REC",

        longitud:
            6,

        mostrarLogo:
            true,

        mostrarDireccion:
            true,

        mostrarTelefono:
            true,

        mostrarEmail:
            true

    },


    // ======================================================
    // IDENTIFICADORES
    // ======================================================

    IDS: {

        familia:
            "FAM",

        alumno:
            "ALU",

        pago:
            "PAG",

        movimiento:
            "MOV",

        recibo:
            "REC"

    },


    // ======================================================
    // ADMINISTRACIÓN
    // ======================================================
    //
    // NO ponemos una contraseña en este archivo.
    //
    // La primera vez que se ingrese al área administrativa
    // se deberá crear una clave.
    //
    // Esa clave quedará guardada en la configuración local.
    // ======================================================

    ADMIN: {

        pinMinLength:
            4,

        pinMaxLength:
            8,

        /*
         * Tiempo de sesión administrativa.
         *
         * Después de este período será necesario
         * volver a ingresar la clave.
         */

        sessionMinutes:
            30,

        /*
         * Cantidad máxima de intentos consecutivos.
         */

        maxIntentos:
            5

    },


    // ======================================================
    // RESPALDOS
    // ======================================================

    BACKUP: {

        /*
         * Nombre base que tendrán los archivos
         * exportados desde la aplicación.
         */

        nombreArchivo:
            "mi-cooperadora-backup",

        incluirFecha:
            true

    },


    // ======================================================
    // APLICACIÓN
    // ======================================================

    APP: {

        debug:
            true,

        confirmarEliminaciones:
            true,

        guardarAutomaticamente:
            true

    }

};