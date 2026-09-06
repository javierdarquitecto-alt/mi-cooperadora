/**
 * ==========================================================
 * MI COOPERADORA
 * dashboard.js
 * ==========================================================
 */

window.Dashboard = {

    async init() {

        this.render();

        await this.actualizarDatos();

    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "dashboard"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `

            <section class="dashboard">

                <header class="dashboard__header">

                    <div>

                        <span class="dashboard__eyebrow">
                            Panel principal
                        </span>

                        <h1>
                            Mi Cooperadora
                        </h1>

                        <p>
                            Resumen general de la gestión
                        </p>

                    </div>

                </header>


                <!-- ==================================================
                     INDICADORES PRINCIPALES
                =================================================== -->

                <section class="dashboard__cards">


                    <!-- FAMILIAS -->

                    <article class="dashboard-card">

                        <div class="dashboard-card__icon">
                            👨‍👩‍👧‍👦
                        </div>

                        <div>

                            <span class="dashboard-card__label">
                                Familias
                            </span>

                            <strong
                                id="dashboard-familias"
                                class="dashboard-card__value"
                            >
                                0
                            </strong>

                        </div>

                    </article>


                    <!-- ALUMNOS -->

                    <article class="dashboard-card">

                        <div class="dashboard-card__icon">
                            🎓
                        </div>

                        <div>

                            <span class="dashboard-card__label">
                                Alumnos
                            </span>

                            <strong
                                id="dashboard-alumnos"
                                class="dashboard-card__value"
                            >
                                0
                            </strong>

                        </div>

                    </article>


                    <!-- TOTAL INGRESOS -->

                    <article class="dashboard-card">

                        <div class="dashboard-card__icon">
                            💳
                        </div>

                        <div>

                            <span class="dashboard-card__label">
                                Total ingresos
                            </span>

                            <strong
                                id="dashboard-cobrado"
                                class="dashboard-card__value"
                            >
                                $ 0,00
                            </strong>

                        </div>

                    </article>


                    <!-- SALDO -->

                    <article class="dashboard-card">

                        <div class="dashboard-card__icon">
                            💰
                        </div>

                        <div>

                            <span class="dashboard-card__label">
                                Saldo de caja
                            </span>

                            <strong
                                id="dashboard-saldo"
                                class="dashboard-card__value"
                            >
                                $ 0,00
                            </strong>

                        </div>

                    </article>

                </section>


                <!-- ==================================================
                     RECAUDACIONES
                =================================================== -->

                <section class="dashboard-panel">

                    <div class="dashboard-panel__header">

                        <div>

                            <span class="dashboard__eyebrow">
                                Recaudaciones
                            </span>

                            <h2>
                                Actividades de la cooperadora
                            </h2>

                        </div>

                    </div>


                    <div class="dashboard__cards">


                        <!-- VENTAS -->

                        <article class="dashboard-card">

                            <div class="dashboard-card__icon">
                                👕
                            </div>

                            <div>

                                <span class="dashboard-card__label">
                                    Venta de productos
                                </span>

                                <strong
                                    id="dashboard-ventas"
                                    class="dashboard-card__value"
                                >
                                    $ 0,00
                                </strong>

                                <small>
                                    Cobrado
                                </small>

                            </div>

                        </article>


                        <!-- VENTAS PENDIENTES -->

                        <article class="dashboard-card">

                            <div class="dashboard-card__icon">
                                ⏳
                            </div>

                            <div>

                                <span class="dashboard-card__label">
                                    Ventas pendientes
                                </span>

                                <strong
                                    id="dashboard-ventas-pendientes"
                                    class="dashboard-card__value"
                                >
                                    $ 0,00
                                </strong>

                                <small>
                                    Por cobrar
                                </small>

                            </div>

                        </article>


                        <!-- SORTEOS -->

                        <article class="dashboard-card">

                            <div class="dashboard-card__icon">
                                🎟️
                            </div>

                            <div>

                                <span class="dashboard-card__label">
                                    Sorteos / Rifas
                                </span>

                                <strong
                                    id="dashboard-sorteos"
                                    class="dashboard-card__value"
                                >
                                    $ 0,00
                                </strong>

                                <small>
                                    Cobrado
                                </small>

                            </div>

                        </article>


                        <!-- SORTEOS PENDIENTES -->

                        <article class="dashboard-card">

                            <div class="dashboard-card__icon">
                                🧾
                            </div>

                            <div>

                                <span class="dashboard-card__label">
                                    Rifas pendientes
                                </span>

                                <strong
                                    id="dashboard-sorteos-pendientes"
                                    class="dashboard-card__value"
                                >
                                    $ 0,00
                                </strong>

                                <small>
                                    Por cobrar
                                </small>

                            </div>

                        </article>

                    </div>

                </section>


                <!-- ==================================================
                     PARTE INFERIOR
                =================================================== -->

                <section class="dashboard__main-grid">


                    <!-- ACCESOS RÁPIDOS -->

                    <article class="dashboard-panel">

                        <div class="dashboard-panel__header">

                            <div>

                                <span class="dashboard__eyebrow">
                                    Gestión
                                </span>

                                <h2>
                                    Accesos rápidos
                                </h2>

                            </div>

                        </div>


                        <div class="dashboard__quick-actions">


                            <button
                                type="button"
                                class="quick-action"
                                data-route="nueva-familia"
                            >

                                <span class="quick-action__icon">
                                    ＋
                                </span>

                                <span>

                                    <strong>
                                        Nueva familia
                                    </strong>

                                    <small>
                                        Registrar una familia
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="familias"
                            >

                                <span class="quick-action__icon">
                                    👥
                                </span>

                                <span>

                                    <strong>
                                        Familias
                                    </strong>

                                    <small>
                                        Consultar registros
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="cuotas"
                            >

                                <span class="quick-action__icon">
                                    $
                                </span>

                                <span>

                                    <strong>
                                        Cuotas
                                    </strong>

                                    <small>
                                        Registrar y consultar pagos
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="ventas"
                            >

                                <span class="quick-action__icon">
                                    👕
                                </span>

                                <span>

                                    <strong>
                                        Ventas
                                    </strong>

                                    <small>
                                        Buzos, remeras y productos
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="sorteos"
                            >

                                <span class="quick-action__icon">
                                    🎟️
                                </span>

                                <span>

                                    <strong>
                                        Sorteos
                                    </strong>

                                    <small>
                                        Rifas y números vendidos
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="caja"
                            >

                                <span class="quick-action__icon">
                                    ↔
                                </span>

                                <span>

                                    <strong>
                                        Caja
                                    </strong>

                                    <small>
                                        Ingresos y egresos
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                class="quick-action"
                                data-route="reportes"
                            >

                                <span class="quick-action__icon">
                                    ▥
                                </span>

                                <span>

                                    <strong>
                                        Reportes
                                    </strong>

                                    <small>
                                        Consultar información
                                    </small>

                                </span>

                            </button>

                        </div>

                    </article>


                    <!-- BIENVENIDA -->

                    <aside class="dashboard-welcome">

                        <div class="dashboard-welcome__logo">

                            <img
                                src="assets/logo.png"
                                alt="Mi Cooperadora"
                            >

                        </div>


                        <span class="dashboard__eyebrow">
                            Bienvenido
                        </span>

                        <h2>
                            Gestión simple y ordenada
                        </h2>

                        <p>
                            Desde este panel podés consultar
                            cuotas, ventas, sorteos, caja y
                            las principales actividades de
                            la cooperadora.
                        </p>

                    </aside>

                </section>

            </section>

        `;
    },


    // ======================================================
    // ACTUALIZAR DATOS
    // ======================================================

    async actualizarDatos() {

        try {

            // ==================================================
            // FAMILIAS DESDE SUPABASE
            // ==================================================

            const familias =
                await FamiliasService
                    .obtenerTodas();


            const familiasActivas =
                familias.filter(
                    familia =>
                        familia.activa !== false
                );


            this.actualizarElemento(
                "dashboard-familias",
                familiasActivas.length
            );


            // ==================================================
            // ALUMNOS DESDE SUPABASE
            // ==================================================

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


            this.actualizarElemento(
                "dashboard-alumnos",
                alumnosActivos.length
            );


            // ==================================================
            // CAJA DESDE SUPABASE
            // ==================================================

            const {
                data: movimientos,
                error: errorMovimientos
            } =
                await SupabaseClient
                    .from("movimientos")
                    .select("tipo, importe");


            if (errorMovimientos) {
                throw errorMovimientos;
            }


            let ingresos = 0;
            let egresos = 0;


            (movimientos || [])
                .forEach(
                    movimiento => {

                        const importe =
                            Number(
                                movimiento.importe
                            ) || 0;


                        if (
                            movimiento.tipo ===
                            "Ingreso"
                        ) {

                            ingresos += importe;
                        }


                        if (
                            movimiento.tipo ===
                            "Egreso"
                        ) {

                            egresos += importe;
                        }
                    }
                );


            const saldo =
                ingresos -
                egresos;


            this.actualizarElemento(
                "dashboard-cobrado",
                Utils.formatearImporte(
                    ingresos
                )
            );


            this.actualizarElemento(
                "dashboard-saldo",
                Utils.formatearImporte(
                    saldo
                )
            );


            // ==================================================
            // VENTAS DESDE SUPABASE
            // ==================================================

            const {
                data: ventas,
                error: errorVentas
            } =
                await SupabaseClient
                    .from("ventas")
                    .select(
                        "cantidad, precio_unitario, estado_pago"
                    );


            if (errorVentas) {
                throw errorVentas;
            }


            let ventasCobradas = 0;
            let ventasPendientes = 0;


            (ventas || [])
                .forEach(
                    venta => {

                        const total =
                            (
                                Number(
                                    venta.cantidad
                                ) || 0
                            ) *
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


            this.actualizarElemento(
                "dashboard-ventas",
                Utils.formatearImporte(
                    ventasCobradas
                )
            );


            this.actualizarElemento(
                "dashboard-ventas-pendientes",
                Utils.formatearImporte(
                    ventasPendientes
                )
            );


            // ==================================================
            // SORTEOS / RIFAS DESDE SUPABASE
            // ==================================================

            const {
                data: ventasSorteos,
                error: errorSorteos
            } =
                await SupabaseClient
                    .from("sorteo_ventas")
                    .select(
                        "importe, estado_pago"
                    );


            if (errorSorteos) {
                throw errorSorteos;
            }


            let sorteosCobrados = 0;
            let sorteosPendientes = 0;


            (ventasSorteos || [])
                .forEach(
                    venta => {

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


            this.actualizarElemento(
                "dashboard-sorteos",
                Utils.formatearImporte(
                    sorteosCobrados
                )
            );


            this.actualizarElemento(
                "dashboard-sorteos-pendientes",
                Utils.formatearImporte(
                    sorteosPendientes
                )
            );


        } catch (error) {

            console.error(
                "Error al actualizar Dashboard desde Supabase:",
                error
            );
        }
    },


    // ======================================================
    // UTILIDAD
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
    }

};