window.Configuracion = {

    sesionAdminActiva: false,

    configuracionNube: null,


    // ======================================================
    // INICIO
    // ======================================================

    async init() {

        /*
         * El PIN administrativo continúa siendo LOCAL.
         * No se guarda en Supabase.
         */

        if (!Database.adminTienePin()) {

            this.renderCrearPin();

            this.configurarEventosCrearPin();

            return;
        }


        this.renderLogin();

        this.configurarEventosLogin();
    },


    // ======================================================
    // CONFIGURACIÓN COMPARTIDA - SUPABASE
    // ======================================================

    async obtenerConfiguracionNube() {

        const {
            data,
            error
        } =
            await SupabaseClient
                .from("configuracion")
                .select("*")
                .eq("id", "principal")
                .single();


        if (error) {

            throw error;
        }


        return data;
    },


    async cargarConfiguracionCompartida() {

        try {

            const datos =
                await this.obtenerConfiguracionNube();


            this.configuracionNube =
                datos;


            /*
             * Sincronizamos también la copia local.
             *
             * De esta manera Cuotas, Recibos y otros módulos
             * que todavía consultan Database siguen funcionando.
             */

            Database
                .actualizarConfiguracionCooperadora({

                    nombre:
                        datos.nombre || "",

                    escuela:
                        datos.escuela || "",

                    direccion:
                        datos.direccion || "",

                    localidad:
                        datos.localidad || "",

                    provincia:
                        datos.provincia || "",

                    telefono:
                        datos.telefono || "",

                    email:
                        datos.email || "",

                    cuit:
                        datos.cuit || ""

                });


            Database
                .actualizarValorCuota(
                    Number(
                        datos.valor_cuota
                    ) || 0
                );


            Database
                .actualizarDiaVencimientoCuota(
                    Number(
                        datos.dia_vencimiento
                    ) || 10
                );


            Database
                .actualizarPeriodoInicial(
                    String(
                        datos.periodo_inicial ||
                        ""
                    )
                );


            Database
                .actualizarConfiguracionRecibos({

                    prefijo:
                        datos.recibo_prefijo || "",

                    longitud:
                        Number(
                            datos.recibo_longitud
                        ) || 6,

                    mostrarLogo:
                        datos.recibo_mostrar_logo !== false,

                    mostrarDireccion:
                        datos.recibo_mostrar_direccion !== false,

                    mostrarTelefono:
                        datos.recibo_mostrar_telefono !== false,

                    mostrarEmail:
                        datos.recibo_mostrar_email !== false

                });


            return true;


        } catch (error) {

            console.error(
                "No se pudo cargar la configuración desde Supabase:",
                error
            );


            /*
             * Si momentáneamente falla Internet,
             * usamos la copia local para no dejar
             * inutilizable la pantalla.
             */

            this.configuracionNube =
                null;


            return false;
        }
    },


    // ======================================================
    // CREAR PIN POR PRIMERA VEZ
    // ======================================================

    renderCrearPin() {

        const contenedor =
            document.getElementById(
                "configuracion"
            );


        if (!contenedor) return;


        contenedor.innerHTML = `

            <section class="configuracion">

                <header class="configuracion__header">

                    <span class="configuracion__eyebrow">
                        Administración
                    </span>

                    <h1>Crear acceso administrativo</h1>

                    <p>
                        Configuración es un área restringida.
                        Creá una clave para proteger el acceso.
                    </p>

                </header>


                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            🔐
                        </div>

                        <div>

                            <h2>Clave de administrador</h2>

                            <p>
                                La clave debe contener entre
                                ${CONFIG.ADMIN.pinMinLength}
                                y
                                ${CONFIG.ADMIN.pinMaxLength}
                                números.
                            </p>

                        </div>

                    </div>


                    <form id="form-crear-pin-admin">

                        <div class="configuracion-grid">

                            <div class="form-group">

                                <label for="admin-pin-nuevo">
                                    Nueva clave
                                </label>

                                <input
                                    type="password"
                                    id="admin-pin-nuevo"
                                    name="pin"
                                    inputmode="numeric"
                                    autocomplete="new-password"
                                    minlength="${CONFIG.ADMIN.pinMinLength}"
                                    maxlength="${CONFIG.ADMIN.pinMaxLength}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="admin-pin-confirmar">
                                    Repetir clave
                                </label>

                                <input
                                    type="password"
                                    id="admin-pin-confirmar"
                                    name="confirmarPin"
                                    inputmode="numeric"
                                    autocomplete="new-password"
                                    minlength="${CONFIG.ADMIN.pinMinLength}"
                                    maxlength="${CONFIG.ADMIN.pinMaxLength}"
                                    required
                                >

                            </div>

                        </div>


                        <div
                            id="configuracion-mensaje"
                            class="configuracion-mensaje"
                            hidden
                        ></div>


                        <div class="configuracion__actions">

                            <button type="submit">
                                Crear clave administrativa
                            </button>

                        </div>

                    </form>

                </section>

            </section>

        `;
    },


    configurarEventosCrearPin() {

        const formulario =
            document.getElementById(
                "form-crear-pin-admin"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const datos =
                    Object.fromEntries(
                        new FormData(
                            formulario
                        ).entries()
                    );


                const pin =
                    String(
                        datos.pin || ""
                    );


                const confirmarPin =
                    String(
                        datos.confirmarPin || ""
                    );


                if (
                    !Database.validarFormatoPin(
                        pin
                    )
                ) {

                    this.mostrarMensaje(

                        `La clave debe tener entre ${CONFIG.ADMIN.pinMinLength} y ${CONFIG.ADMIN.pinMaxLength} números.`,

                        true

                    );

                    return;
                }


                if (
                    pin !==
                    confirmarPin
                ) {

                    this.mostrarMensaje(
                        "Las claves no coinciden.",
                        true
                    );

                    return;
                }


                const creado =
                    await Database
                        .crearPinAdmin(
                            pin
                        );


                if (!creado) {

                    this.mostrarMensaje(
                        "No se pudo crear la clave.",
                        true
                    );

                    return;
                }


                this.sesionAdminActiva =
                    true;


                await this.abrirConfiguracion();

            }

        );
    },


    // ======================================================
    // LOGIN ADMINISTRATIVO
    // ======================================================

    renderLogin() {

        const contenedor =
            document.getElementById(
                "configuracion"
            );


        if (!contenedor) return;


        const bloqueado =
            Database.adminEstaBloqueado();


        contenedor.innerHTML = `

            <section class="configuracion">

                <header class="configuracion__header">

                    <span class="configuracion__eyebrow">
                        Área restringida
                    </span>

                    <h1>Configuración</h1>

                    <p>
                        Ingresá la clave administrativa
                        para continuar.
                    </p>

                </header>


                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            🔒
                        </div>

                        <div>

                            <h2>Acceso administrativo</h2>

                            <p>
                                Esta sección está protegida.
                            </p>

                        </div>

                    </div>


                    ${
                        bloqueado
                            ? `
                                <div
                                    class="configuracion-mensaje
                                    configuracion-mensaje--error"
                                >
                                    Acceso temporalmente bloqueado
                                    por varios intentos incorrectos.
                                </div>
                            `
                            : `
                                <form id="form-login-admin">

                                    <div class="form-group">

                                        <label for="admin-pin">
                                            Clave
                                        </label>

                                        <input
                                            type="password"
                                            id="admin-pin"
                                            name="pin"
                                            inputmode="numeric"
                                            autocomplete="current-password"
                                            required
                                            autofocus
                                        >

                                    </div>


                                    <div
                                        id="configuracion-mensaje"
                                        class="configuracion-mensaje"
                                        hidden
                                    ></div>


                                    <div class="configuracion__actions">

                                        <button type="submit">
                                            Ingresar
                                        </button>

                                    </div>

                                </form>
                            `
                    }

                </section>

            </section>

        `;
    },


    configurarEventosLogin() {

        const formulario =
            document.getElementById(
                "form-login-admin"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const datos =
                    Object.fromEntries(
                        new FormData(
                            formulario
                        ).entries()
                    );


                const pin =
                    String(
                        datos.pin || ""
                    );


                const correcto =
                    await Database
                        .verificarPinAdmin(
                            pin
                        );


                if (!correcto) {

                    if (
                        Database
                            .adminEstaBloqueado()
                    ) {

                        this.renderLogin();

                        return;
                    }


                    this.mostrarMensaje(
                        "Clave incorrecta.",
                        true
                    );

                    return;
                }


                this.sesionAdminActiva =
                    true;


                await this.abrirConfiguracion();

            }

        );
    },


    // ======================================================
    // ABRIR CONFIGURACIÓN
    // ======================================================

    async abrirConfiguracion() {

        const cargadaDesdeNube =
            await this
                .cargarConfiguracionCompartida();


        this.renderConfiguracionCompleta();

        this.configurarEventosConfiguracion();


        if (!cargadaDesdeNube) {

            this.mostrarMensaje(
                "No se pudo conectar con la configuración en la nube. Se muestran temporalmente los datos guardados en este dispositivo.",
                true
            );
        }
    },


    // ======================================================
    // CONFIGURACIÓN COMPLETA
    // ======================================================

    renderConfiguracionCompleta() {

        const contenedor =
            document.getElementById(
                "configuracion"
            );


        if (!contenedor) return;


        /*
         * Estos valores locales ya fueron sincronizados
         * con Supabase en abrirConfiguracion().
         */

        const cooperadora =
            Database
                .obtenerConfiguracionCooperadora();


        const cuotas =
            Database
                .obtenerConfiguracionCuotas();


        const recibos =
            Database
                .obtenerConfiguracionRecibos();


        contenedor.innerHTML = `

            <section class="configuracion">

                <header class="configuracion__header">

                    <span class="configuracion__eyebrow">
                        Administración
                    </span>

                    <h1>Configuración</h1>

                    <p>
                        Ajustes generales de Mi Cooperadora.
                    </p>

                </header>


                <!-- ======================================
                     DATOS INSTITUCIONALES
                ======================================= -->

                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            🏫
                        </div>

                        <div>

                            <h2>Datos institucionales</h2>

                            <p>
                                Información de la escuela
                                y la cooperadora.
                            </p>

                        </div>

                    </div>


                    <form id="form-configuracion-institucion">

                        <div class="configuracion-grid">

                            <div class="form-group">

                                <label>
                                    Nombre de la cooperadora
                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value="${this.escapeHtml(cooperadora.nombre)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Escuela
                                </label>

                                <input
                                    type="text"
                                    name="escuela"
                                    value="${this.escapeHtml(cooperadora.escuela)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Dirección
                                </label>

                                <input
                                    type="text"
                                    name="direccion"
                                    value="${this.escapeHtml(cooperadora.direccion)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Localidad
                                </label>

                                <input
                                    type="text"
                                    name="localidad"
                                    value="${this.escapeHtml(cooperadora.localidad)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Provincia
                                </label>

                                <input
                                    type="text"
                                    name="provincia"
                                    value="${this.escapeHtml(cooperadora.provincia)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Teléfono
                                </label>

                                <input
                                    type="text"
                                    name="telefono"
                                    value="${this.escapeHtml(cooperadora.telefono)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value="${this.escapeHtml(cooperadora.email)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    CUIT
                                </label>

                                <input
                                    type="text"
                                    name="cuit"
                                    value="${this.escapeHtml(cooperadora.cuit)}"
                                >

                            </div>

                        </div>


                        <div class="configuracion__actions">

                            <button type="submit">
                                Guardar datos institucionales
                            </button>

                        </div>

                    </form>

                </section>


                <!-- ======================================
                     CUOTAS
                ======================================= -->

                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            $
                        </div>

                        <div>

                            <h2>Cuota mensual</h2>

                            <p>
                                Configuración general
                                de las cuotas.
                            </p>

                        </div>

                    </div>


                    <form id="form-configuracion-cuota">

                        <div class="configuracion-grid">

                            <div class="form-group">

                                <label>
                                    Valor actual
                                </label>

                                <input
                                    type="number"
                                    name="valorCuota"
                                    min="100"
                                    step="100"
                                    value="${cuotas.valorActual}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Día de vencimiento
                                </label>

                                <input
                                    type="number"
                                    name="diaVencimiento"
                                    min="1"
                                    max="31"
                                    value="${cuotas.diaVencimiento}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Período inicial
                                </label>

                                <input
                                    type="number"
                                    name="periodoInicial"
                                    min="2020"
                                    max="2100"
                                    value="${cuotas.periodoInicial}"
                                    required
                                >

                            </div>

                        </div>


                        <div class="configuracion__actions">

                            <button type="submit">
                                Guardar cuotas
                            </button>

                        </div>

                    </form>

                </section>


                <!-- ======================================
                     RECIBOS
                ======================================= -->

                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            🧾
                        </div>

                        <div>

                            <h2>Recibos</h2>

                            <p>
                                Configuración de numeración
                                y datos visibles.
                            </p>

                        </div>

                    </div>


                    <form id="form-configuracion-recibos">

                        <div class="configuracion-grid">

                            <div class="form-group">

                                <label>
                                    Prefijo
                                </label>

                                <input
                                    type="text"
                                    name="prefijo"
                                    value="${this.escapeHtml(recibos.prefijo)}"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Cantidad de dígitos
                                </label>

                                <input
                                    type="number"
                                    name="longitud"
                                    min="3"
                                    max="10"
                                    value="${recibos.longitud}"
                                >

                            </div>

                        </div>


                        <div class="configuracion-checks">

                            ${this.renderCheckbox(
                                "mostrarLogo",
                                "Mostrar logo",
                                recibos.mostrarLogo
                            )}

                            ${this.renderCheckbox(
                                "mostrarDireccion",
                                "Mostrar dirección",
                                recibos.mostrarDireccion
                            )}

                            ${this.renderCheckbox(
                                "mostrarTelefono",
                                "Mostrar teléfono",
                                recibos.mostrarTelefono
                            )}

                            ${this.renderCheckbox(
                                "mostrarEmail",
                                "Mostrar email",
                                recibos.mostrarEmail
                            )}

                        </div>


                        <div class="configuracion__actions">

                            <button type="submit">
                                Guardar recibos
                            </button>

                        </div>

                    </form>

                </section>


                <!-- ======================================
                     SEGURIDAD
                ======================================= -->

                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            🔐
                        </div>

                        <div>

                            <h2>Seguridad</h2>

                            <p>
                                Cambiar la clave administrativa.
                            </p>

                        </div>

                    </div>


                    <form id="form-cambiar-pin">

                        <div class="configuracion-grid">

                            <div class="form-group">

                                <label>
                                    Clave actual
                                </label>

                                <input
                                    type="password"
                                    name="pinActual"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Nueva clave
                                </label>

                                <input
                                    type="password"
                                    name="pinNuevo"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Repetir nueva clave
                                </label>

                                <input
                                    type="password"
                                    name="pinConfirmacion"
                                    required
                                >

                            </div>

                        </div>


                        <div class="configuracion__actions">

                            <button type="submit">
                                Cambiar clave
                            </button>

                        </div>

                    </form>

                </section>


                <!-- ======================================
                     SISTEMA
                ======================================= -->

                <section class="configuracion-card">

                    <div class="configuracion-card__header">

                        <div class="configuracion-card__icon">
                            ⚙
                        </div>

                        <div>

                            <h2>Sistema</h2>

                            <p>
                                Información general
                                de la aplicación.
                            </p>

                        </div>

                    </div>


                    <div class="configuracion-sistema">

                        <p>
                            <strong>Aplicación:</strong>
                            ${CONFIG.APP_NAME}
                        </p>

                        <p>
                            <strong>Versión:</strong>
                            ${CONFIG.APP_VERSION}
                        </p>

                    </div>


                    <div class="configuracion__actions">

                        <button
                            type="button"
                            id="btn-cerrar-admin"
                            class="button-secondary"
                        >
                            Cerrar acceso administrativo
                        </button>

                    </div>

                </section>


                <div
                    id="configuracion-mensaje"
                    class="configuracion-mensaje"
                    hidden
                ></div>

            </section>

        `;
    },


    // ======================================================
    // EVENTOS DE CONFIGURACIÓN
    // ======================================================

    configurarEventosConfiguracion() {

        this.configurarFormularioInstitucion();

        this.configurarFormularioCuotas();

        this.configurarFormularioRecibos();

        this.configurarCambioPin();


        const btnCerrar =
            document.getElementById(
                "btn-cerrar-admin"
            );


        if (btnCerrar) {

            btnCerrar.addEventListener(

                "click",

                () => {

                    this.sesionAdminActiva =
                        false;


                    this.renderLogin();

                    this.configurarEventosLogin();

                }

            );
        }
    },


    // ======================================================
    // GUARDAR DATOS INSTITUCIONALES
    // ======================================================

    configurarFormularioInstitucion() {

        const formulario =
            document.getElementById(
                "form-configuracion-institucion"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const datos =
                    Object.fromEntries(
                        new FormData(
                            formulario
                        ).entries()
                    );


                try {

                    const {
                        error
                    } =
                        await SupabaseClient
                            .from("configuracion")
                            .update({

                                nombre:
                                    String(
                                        datos.nombre || ""
                                    ).trim(),

                                escuela:
                                    String(
                                        datos.escuela || ""
                                    ).trim(),

                                direccion:
                                    String(
                                        datos.direccion || ""
                                    ).trim(),

                                localidad:
                                    String(
                                        datos.localidad || ""
                                    ).trim(),

                                provincia:
                                    String(
                                        datos.provincia || ""
                                    ).trim(),

                                telefono:
                                    String(
                                        datos.telefono || ""
                                    ).trim(),

                                email:
                                    String(
                                        datos.email || ""
                                    ).trim(),

                                cuit:
                                    String(
                                        datos.cuit || ""
                                    ).trim(),

                                actualizado_en:
                                    new Date()
                                        .toISOString()

                            })
                            .eq(
                                "id",
                                "principal"
                            );


                    if (error) {

                        throw error;
                    }


                    Database
                        .actualizarConfiguracionCooperadora(
                            datos
                        );


                    this.mostrarMensaje(
                        "Datos institucionales guardados en la nube.",
                        false
                    );


                } catch (error) {

                    console.error(
                        "Error al guardar datos institucionales:",
                        error
                    );


                    this.mostrarMensaje(
                        "No se pudieron guardar los datos institucionales en la nube.",
                        true
                    );
                }

            }

        );
    },


    // ======================================================
    // GUARDAR CUOTAS
    // ======================================================

    configurarFormularioCuotas() {

        const formulario =
            document.getElementById(
                "form-configuracion-cuota"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const datos =
                    Object.fromEntries(
                        new FormData(
                            formulario
                        ).entries()
                    );


                const valor =
                    Number(
                        datos.valorCuota
                    );


                const dia =
                    Number(
                        datos.diaVencimiento
                    );


                const periodo =
                    Number(
                        datos.periodoInicial
                    );


                if (
                    Number.isNaN(valor) ||
                    valor <= 0
                ) {

                    this.mostrarMensaje(
                        "El valor de cuota no es válido.",
                        true
                    );

                    return;
                }


                if (
                    !Number.isInteger(dia) ||
                    dia < 1 ||
                    dia > 31
                ) {

                    this.mostrarMensaje(
                        "El día de vencimiento no es válido.",
                        true
                    );

                    return;
                }


                if (
                    !Number.isInteger(periodo) ||
                    periodo < 2020 ||
                    periodo > 2100
                ) {

                    this.mostrarMensaje(
                        "El período inicial no es válido.",
                        true
                    );

                    return;
                }


                try {

                    const {
                        error
                    } =
                        await SupabaseClient
                            .from("configuracion")
                            .update({

                                valor_cuota:
                                    valor,

                                dia_vencimiento:
                                    dia,

                                periodo_inicial:
                                    periodo,

                                actualizado_en:
                                    new Date()
                                        .toISOString()

                            })
                            .eq(
                                "id",
                                "principal"
                            );


                    if (error) {

                        throw error;
                    }


                    Database
                        .actualizarValorCuota(
                            valor
                        );


                    Database
                        .actualizarDiaVencimientoCuota(
                            dia
                        );


                    Database
                        .actualizarPeriodoInicial(
                            String(periodo)
                        );


                    this.mostrarMensaje(
                        `Configuración de cuotas guardada en la nube. Valor actual: ${Utils.formatearImporte(valor)}`,
                        false
                    );


                } catch (error) {

                    console.error(
                        "Error al guardar configuración de cuotas:",
                        error
                    );


                    this.mostrarMensaje(
                        "No se pudo guardar la configuración de cuotas en la nube.",
                        true
                    );
                }

            }

        );
    },


    // ======================================================
    // GUARDAR RECIBOS
    // ======================================================

    configurarFormularioRecibos() {

        const formulario =
            document.getElementById(
                "form-configuracion-recibos"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const formData =
                    new FormData(
                        formulario
                    );


                const datos = {

                    prefijo:
                        String(
                            formData.get(
                                "prefijo"
                            ) || ""
                        )
                            .trim()
                            .toUpperCase(),

                    longitud:
                        Number(
                            formData.get(
                                "longitud"
                            )
                        ) || 6,

                    mostrarLogo:
                        formData.has(
                            "mostrarLogo"
                        ),

                    mostrarDireccion:
                        formData.has(
                            "mostrarDireccion"
                        ),

                    mostrarTelefono:
                        formData.has(
                            "mostrarTelefono"
                        ),

                    mostrarEmail:
                        formData.has(
                            "mostrarEmail"
                        )

                };


                if (
                    datos.longitud < 3 ||
                    datos.longitud > 10
                ) {

                    this.mostrarMensaje(
                        "La cantidad de dígitos debe estar entre 3 y 10.",
                        true
                    );

                    return;
                }


                try {

                    const {
                        error
                    } =
                        await SupabaseClient
                            .from("configuracion")
                            .update({

                                recibo_prefijo:
                                    datos.prefijo,

                                recibo_longitud:
                                    datos.longitud,

                                recibo_mostrar_logo:
                                    datos.mostrarLogo,

                                recibo_mostrar_direccion:
                                    datos.mostrarDireccion,

                                recibo_mostrar_telefono:
                                    datos.mostrarTelefono,

                                recibo_mostrar_email:
                                    datos.mostrarEmail,

                                actualizado_en:
                                    new Date()
                                        .toISOString()

                            })
                            .eq(
                                "id",
                                "principal"
                            );


                    if (error) {

                        throw error;
                    }


                    Database
                        .actualizarConfiguracionRecibos(
                            datos
                        );


                    this.mostrarMensaje(
                        "Configuración de recibos guardada en la nube.",
                        false
                    );


                } catch (error) {

                    console.error(
                        "Error al guardar configuración de recibos:",
                        error
                    );


                    this.mostrarMensaje(
                        "No se pudo guardar la configuración de recibos en la nube.",
                        true
                    );
                }

            }

        );
    },


    // ======================================================
    // CAMBIO DE PIN
    // ======================================================

    configurarCambioPin() {

        const formulario =
            document.getElementById(
                "form-cambiar-pin"
            );


        if (!formulario) return;


        formulario.addEventListener(

            "submit",

            async event => {

                event.preventDefault();


                const datos =
                    Object.fromEntries(
                        new FormData(
                            formulario
                        ).entries()
                    );


                if (
                    datos.pinNuevo !==
                    datos.pinConfirmacion
                ) {

                    this.mostrarMensaje(
                        "La nueva clave y su confirmación no coinciden.",
                        true
                    );

                    return;
                }


                if (
                    !Database
                        .validarFormatoPin(
                            datos.pinNuevo
                        )
                ) {

                    this.mostrarMensaje(

                        `La nueva clave debe tener entre ${CONFIG.ADMIN.pinMinLength} y ${CONFIG.ADMIN.pinMaxLength} números.`,

                        true

                    );

                    return;
                }


                const resultado =
                    await Database
                        .cambiarPinAdmin(

                            datos.pinActual,

                            datos.pinNuevo

                        );


                if (!resultado) {

                    this.mostrarMensaje(
                        "La clave actual es incorrecta.",
                        true
                    );

                    return;
                }


                formulario.reset();


                this.mostrarMensaje(
                    "Clave administrativa actualizada.",
                    false
                );

            }

        );
    },


    // ======================================================
    // UTILIDADES
    // ======================================================

    mostrarMensaje(
        mensaje,
        error = false
    ) {

        const elemento =
            document.getElementById(
                "configuracion-mensaje"
            );


        if (!elemento) return;


        elemento.textContent =
            mensaje;


        elemento.classList.toggle(
            "configuracion-mensaje--error",
            error
        );


        elemento.classList.toggle(
            "configuracion-mensaje--ok",
            !error
        );


        elemento.hidden =
            false;


        elemento.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    },


    renderCheckbox(
        nombre,
        texto,
        marcado
    ) {

        return `

            <label class="configuracion-check">

                <input
                    type="checkbox"
                    name="${nombre}"
                    ${marcado ? "checked" : ""}
                >

                <span>
                    ${texto}
                </span>

            </label>

        `;
    },


    escapeHtml(
        texto
    ) {

        return String(
            texto || ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

};