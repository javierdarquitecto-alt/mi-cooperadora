window.Sorteos = {

    sorteoSeleccionadoId: null,

    sorteos: [],
    familias: [],


    // ======================================================
    // INICIO
    // ======================================================

    async init() {

        try {

            await this.cargarDatos();

            this.render();
            this.configurarEventos();

        } catch (error) {

            console.error(
                "Error al iniciar Sorteos:",
                error
            );

            alert(
                "No se pudieron cargar los sorteos."
            );
        }
    },


    // ======================================================
    // CARGAR DATOS DESDE SUPABASE
    // ======================================================

    async cargarDatos() {

        const {
            data: sorteosNube,
            error: errorSorteos
        } =
            await SupabaseClient
                .from("sorteos")
                .select("*")
                .order(
                    "fecha_sorteo",
                    {
                        ascending: true,
                        nullsFirst: false
                    }
                );


        if (errorSorteos) {
            throw errorSorteos;
        }


        const {
            data: ventasNube,
            error: errorVentas
        } =
            await SupabaseClient
                .from("sorteo_ventas")
                .select("*")
                .order(
                    "numero",
                    {
                        ascending: true
                    }
                );


        if (errorVentas) {
            throw errorVentas;
        }


        this.familias =
            await FamiliasService
                .obtenerTodas();


        const ventasPorSorteo = {};


        (ventasNube || [])
            .forEach(
                registro => {

                    const venta =
                        this.convertirVenta(
                            registro
                        );


                    if (
                        !ventasPorSorteo[
                            venta.sorteoId
                        ]
                    ) {

                        ventasPorSorteo[
                            venta.sorteoId
                        ] = [];
                    }


                    ventasPorSorteo[
                        venta.sorteoId
                    ].push(
                        venta
                    );
                }
            );


        this.sorteos =
            (sorteosNube || [])
                .map(
                    registro =>
                        this.convertirSorteo(
                            registro,
                            ventasPorSorteo[
                                registro.id
                            ] || []
                        )
                );


        this.sincronizarSorteosLocales();
    },


    convertirSorteo(
        registro,
        ventas = []
    ) {

        return {

            id:
                registro.id,

            nombre:
                registro.nombre || "",

            descripcion:
                registro.descripcion || "",

            fechaCreacion:
                registro.fecha_creacion || "",

            fechaSorteo:
                registro.fecha_sorteo || "",

            cantidadNumeros:
                Number(
                    registro.cantidad_numeros
                ) || 0,

            valorNumero:
                Number(
                    registro.valor_numero
                ) || 0,

            estado:
                registro.estado ||
                "Activo",

            numeroGanador:
                registro.numero_ganador ??
                null,

            ventas:
                Array.isArray(ventas)
                    ? ventas
                    : []
        };
    },


    convertirVenta(
        registro
    ) {

        return {

            id:
                registro.id,

            sorteoId:
                registro.sorteo_id,

            numero:
                Number(
                    registro.numero
                ),

            familiaId:
                registro.familia_id ||
                null,

            comprador:
                registro.comprador || "",

            telefono:
                registro.telefono || "",

            fecha:
                registro.fecha || "",

            importe:
                Number(
                    registro.importe
                ) || 0,

            estadoPago:
                registro.estado_pago ||
                "Pendiente",

            observaciones:
                registro.observaciones || "",

            movimientoCajaId:
                registro.movimiento_caja_id ||
                null
        };
    },


    // ======================================================
    // COPIA LOCAL TEMPORAL
    // ======================================================

    sincronizarSorteosLocales() {

        if (
            !Database.data ||
            !Array.isArray(
                Database.data.sorteos
            )
        ) {
            return;
        }


        Database.data.sorteos =
            this.sorteos.map(
                sorteo => ({

                    ...sorteo,

                    ventas:
                        sorteo.ventas.map(
                            venta => ({
                                ...venta
                            })
                        )
                })
            );


        Database.save();
    },


    // ======================================================
    // RENDER PRINCIPAL
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "sorteos"
            );


        if (!contenedor) {
            return;
        }


        if (
            this.sorteoSeleccionadoId &&
            !this.obtenerSorteo(
                this.sorteoSeleccionadoId
            )
        ) {

            this.sorteoSeleccionadoId =
                null;
        }


        contenedor.innerHTML = `

            <section class="sorteos">

                <header class="sorteos__header">

                    <span class="sorteos__eyebrow">
                        Recaudaciones
                    </span>

                    <h1>Sorteos y rifas</h1>

                    <p>
                        Administrá rifas, números vendidos,
                        cobros y resultados.
                    </p>

                </header>


                ${this.renderResumenGeneral(this.sorteos)}


                <section class="sorteos-card">

                    <div class="sorteos-card__header">

                        <div>

                            <h2>Nuevo sorteo</h2>

                            <p>
                                Creá una nueva rifa
                                o campaña de números.
                            </p>

                        </div>

                    </div>


                    <form id="form-nuevo-sorteo">

                        <div class="sorteos-grid">

                            <div class="form-group">

                                <label>Nombre</label>

                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ej: Rifa Día del Niño"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>Fecha del sorteo</label>

                                <input
                                    type="date"
                                    name="fechaSorteo"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>Cantidad de números</label>

                                <input
                                    type="number"
                                    name="cantidadNumeros"
                                    min="1"
                                    value="100"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>Valor por número</label>

                                <input
                                    type="number"
                                    name="valorNumero"
                                    min="0"
                                    step="100"
                                    required
                                >

                            </div>


                            <div class="form-group sorteos-descripcion">

                                <label>Descripción</label>

                                <input
                                    type="text"
                                    name="descripcion"
                                    placeholder="Premio, motivo u observaciones"
                                >

                            </div>

                        </div>


                        <div class="sorteos__actions">

                            <button type="submit">
                                Crear sorteo
                            </button>

                        </div>

                    </form>

                </section>


                <section class="sorteos-card">

                    <div class="sorteos-card__header">

                        <div>

                            <h2>Sorteos registrados</h2>

                            <p>
                                Seleccioná uno para administrar
                                sus números.
                            </p>

                        </div>

                    </div>


                    ${this.renderListadoSorteos(this.sorteos)}

                </section>


                ${
                    this.sorteoSeleccionadoId
                        ? this.renderDetalleSorteo(
                            this.sorteoSeleccionadoId
                        )
                        : ""
                }

            </section>

        `;
    },


    // ======================================================
    // RESUMEN GENERAL
    // ======================================================

    renderResumenGeneral(
        sorteos
    ) {

        const activos =
            sorteos.filter(
                sorteo =>
                    sorteo.estado ===
                    "Activo"
            ).length;


        let vendidos = 0;
        let cobrado = 0;
        let pendiente = 0;


        sorteos.forEach(
            sorteo => {

                const resumen =
                    this.obtenerResumenSorteo(
                        sorteo
                    );


                vendidos +=
                    resumen.cantidadVendidos;


                cobrado +=
                    resumen.totalCobrado;


                pendiente +=
                    resumen.totalPendiente;
            }
        );


        return `

            <div class="sorteos-resumen">

                <article class="sorteos-resumen-card">

                    <span>Sorteos activos</span>

                    <strong>
                        ${activos}
                    </strong>

                </article>


                <article class="sorteos-resumen-card">

                    <span>Números vendidos</span>

                    <strong>
                        ${vendidos}
                    </strong>

                </article>


                <article class="sorteos-resumen-card">

                    <span>Total cobrado</span>

                    <strong>
                        ${Utils.formatearImporte(cobrado)}
                    </strong>

                </article>


                <article class="sorteos-resumen-card">

                    <span>Pendiente de cobro</span>

                    <strong>
                        ${Utils.formatearImporte(pendiente)}
                    </strong>

                </article>

            </div>

        `;
    },


    // ======================================================
    // LISTADO DE SORTEOS
    // ======================================================

    renderListadoSorteos(
        sorteos
    ) {

        if (!sorteos.length) {

            return `

                <div class="sorteos-vacio">
                    Todavía no hay sorteos registrados.
                </div>

            `;
        }


        return `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Nombre</th>
                            <th>Fecha</th>
                            <th>Números</th>
                            <th>Valor</th>
                            <th>Vendidos</th>
                            <th>Cobrado</th>
                            <th>Estado</th>
                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            sorteos
                                .slice()
                                .reverse()
                                .map(
                                    sorteo => {

                                        const resumen =
                                            this.obtenerResumenSorteo(
                                                sorteo
                                            );


                                        return `

                                            <tr>

                                                <td>
                                                    <strong>
                                                        ${this.escapeHtml(sorteo.nombre)}
                                                    </strong>
                                                </td>


                                                <td>
                                                    ${this.formatearFecha(sorteo.fechaSorteo)}
                                                </td>


                                                <td>
                                                    ${sorteo.cantidadNumeros}
                                                </td>


                                                <td>
                                                    ${Utils.formatearImporte(sorteo.valorNumero)}
                                                </td>


                                                <td>
                                                    ${resumen.cantidadVendidos}
                                                    /
                                                    ${resumen.cantidadTotal}
                                                </td>


                                                <td>
                                                    ${Utils.formatearImporte(resumen.totalCobrado)}
                                                </td>


                                                <td>

                                                    <span class="
                                                        sorteos-estado
                                                        ${
                                                            sorteo.estado === "Activo"
                                                                ? "sorteos-estado--activo"
                                                                : "sorteos-estado--finalizado"
                                                        }
                                                    ">
                                                        ${sorteo.estado}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div class="sorteos-acciones-tabla">

                                                        <button
                                                            type="button"
                                                            data-accion="abrir-sorteo"
                                                            data-id="${sorteo.id}"
                                                        >
                                                            Administrar
                                                        </button>


                                                        ${
                                                            sorteo.estado === "Activo"
                                                                ? ""
                                                                : `
                                                                    <button
                                                                        type="button"
                                                                        data-accion="eliminar-sorteo"
                                                                        data-id="${sorteo.id}"
                                                                        class="sorteos-btn-eliminar"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                `
                                                        }

                                                    </div>

                                                </td>

                                            </tr>

                                        `;
                                    }
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;
    },


    // ======================================================
    // DETALLE DEL SORTEO
    // ======================================================

    renderDetalleSorteo(
        id
    ) {

        const sorteo =
            this.obtenerSorteo(
                id
            );


        if (!sorteo) {
            return "";
        }


        const resumen =
            this.obtenerResumenSorteo(
                sorteo
            );


        const familias =
            this.familias.filter(
                familia =>
                    familia.activa !== false
            );


        return `

            <section
                class="sorteos-card sorteos-detalle"
                id="detalle-sorteo"
            >

                <div class="sorteos-card__header sorteos-detalle-header">

                    <div>

                        <span class="sorteos__eyebrow">
                            ${sorteo.estado}
                        </span>

                        <h2>
                            ${this.escapeHtml(sorteo.nombre)}
                        </h2>

                        <p>
                            Sorteo:
                            ${this.formatearFecha(sorteo.fechaSorteo)}
                        </p>

                    </div>


                    <button
                        type="button"
                        id="btn-cerrar-sorteo"
                        class="sorteos-btn-secundario"
                    >
                        Cerrar
                    </button>

                </div>


                <div class="sorteos-resumen sorteos-resumen--detalle">

                    <article class="sorteos-resumen-card">

                        <span>Vendidos</span>

                        <strong>
                            ${resumen.cantidadVendidos}
                            /
                            ${resumen.cantidadTotal}
                        </strong>

                    </article>


                    <article class="sorteos-resumen-card">

                        <span>Disponibles</span>

                        <strong>
                            ${resumen.cantidadDisponibles}
                        </strong>

                    </article>


                    <article class="sorteos-resumen-card">

                        <span>Vendido</span>

                        <strong>
                            ${Utils.formatearImporte(resumen.totalVendido)}
                        </strong>

                    </article>


                    <article class="sorteos-resumen-card">

                        <span>Cobrado</span>

                        <strong>
                            ${Utils.formatearImporte(resumen.totalCobrado)}
                        </strong>

                    </article>


                    <article class="sorteos-resumen-card">

                        <span>Pendiente</span>

                        <strong>
                            ${Utils.formatearImporte(resumen.totalPendiente)}
                        </strong>

                    </article>

                </div>


                ${
                    sorteo.estado === "Activo"
                        ? this.renderFormularioVenta(
                            sorteo,
                            familias
                        )
                        : this.renderSorteoFinalizado(
                            sorteo
                        )
                }


                <div class="sorteos-subseccion">

                    <h3>Números vendidos</h3>

                    ${this.renderVentasSorteo(sorteo)}

                </div>


                ${
                    sorteo.estado === "Activo"
                        ? `

                            <div class="sorteos-subseccion sorteos-finalizar">

                                <h3>Finalizar sorteo</h3>

                                <p>
                                    Cuando se realice el sorteo,
                                    podés registrar el número ganador
                                    y cerrar la campaña.
                                </p>


                                <div class="sorteos-finalizar__acciones">

                                    <input
                                        type="number"
                                        id="numero-ganador"
                                        min="1"
                                        max="${sorteo.cantidadNumeros}"
                                        placeholder="Número ganador"
                                    >


                                    <button
                                        type="button"
                                        id="btn-finalizar-sorteo"
                                    >
                                        Finalizar sorteo
                                    </button>

                                </div>

                            </div>

                        `
                        : ""
                }

            </section>

        `;
    },


    renderFormularioVenta(
        sorteo,
        familias
    ) {

        return `

            <div class="sorteos-subseccion">

                <h3>Vender número</h3>


                <form id="form-venta-sorteo">

                    <div class="sorteos-grid">

                        <div class="form-group">

                            <label>Número</label>

                            <input
                                type="number"
                                name="numero"
                                min="1"
                                max="${sorteo.cantidadNumeros}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>Familia</label>

                            <select
                                name="familiaId"
                                id="sorteo-familia"
                            >

                                <option value="">
                                    Venta externa
                                </option>

                                ${
                                    familias
                                        .map(
                                            familia => `
                                                <option value="${familia.id}">
                                                    ${this.escapeHtml(familia.apellido)}, ${this.escapeHtml(familia.nombre)}
                                                </option>
                                            `
                                        )
                                        .join("")
                                }

                            </select>

                        </div>


                        <div class="form-group">

                            <label>Comprador</label>

                            <input
                                type="text"
                                name="comprador"
                                placeholder="Nombre y apellido"
                            >

                        </div>


                        <div class="form-group">

                            <label>Teléfono</label>

                            <input
                                type="text"
                                name="telefono"
                            >

                        </div>


                        <div class="form-group">

                            <label>Importe</label>

                            <input
                                type="number"
                                name="importe"
                                min="0"
                                step="100"
                                value="${sorteo.valorNumero}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>Estado de pago</label>

                            <select
                                name="estadoPago"
                            >

                                <option value="Pendiente">
                                    Pendiente
                                </option>

                                <option value="Pagado">
                                    Pagado
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label>Fecha</label>

                            <input
                                type="date"
                                name="fecha"
                                value="${this.fechaActual()}"
                                required
                            >

                        </div>

                    </div>


                    <div class="sorteos__actions">

                        <button type="submit">
                            Registrar número
                        </button>

                    </div>

                </form>

            </div>

        `;
    },


    renderSorteoFinalizado(
        sorteo
    ) {

        return `

            <div class="sorteos-finalizado">

                <strong>
                    Sorteo finalizado
                </strong>

                <span>

                    Número ganador:

                    ${
                        sorteo.numeroGanador !== null
                            ? this.formatearNumero(
                                sorteo.numeroGanador,
                                sorteo.cantidadNumeros
                            )
                            : "No informado"
                    }

                </span>

            </div>

        `;
    },


    // ======================================================
    // NÚMEROS VENDIDOS
    // ======================================================

    renderVentasSorteo(
        sorteo
    ) {

        if (
            !Array.isArray(sorteo.ventas) ||
            !sorteo.ventas.length
        ) {

            return `

                <div class="sorteos-vacio">
                    Todavía no se vendieron números.
                </div>

            `;
        }


        return `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Número</th>
                            <th>Familia / comprador</th>
                            <th>Fecha</th>
                            <th>Importe</th>
                            <th>Pago</th>
                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            sorteo.ventas
                                .slice()
                                .sort(
                                    (a, b) =>
                                        Number(a.numero) -
                                        Number(b.numero)
                                )
                                .map(
                                    venta => {

                                        const familia =
                                            venta.familiaId
                                                ? this.familias.find(
                                                    item =>
                                                        item.id ===
                                                        venta.familiaId
                                                )
                                                : null;


                                        const comprador =
                                            familia
                                                ? `${familia.apellido}, ${familia.nombre}`
                                                : venta.comprador ||
                                                    "Venta externa";


                                        const pagado =
                                            venta.estadoPago ===
                                            "Pagado";


                                        return `

                                            <tr>

                                                <td>

                                                    <strong class="sorteos-numero">

                                                        ${this.formatearNumero(
                                                            venta.numero,
                                                            sorteo.cantidadNumeros
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>
                                                    ${this.escapeHtml(comprador)}
                                                </td>


                                                <td>
                                                    ${this.formatearFecha(venta.fecha)}
                                                </td>


                                                <td>
                                                    ${Utils.formatearImporte(venta.importe)}
                                                </td>


                                                <td>

                                                    <span class="
                                                        sorteos-estado
                                                        ${
                                                            pagado
                                                                ? "sorteos-estado--activo"
                                                                : "sorteos-estado--pendiente"
                                                        }
                                                    ">
                                                        ${venta.estadoPago}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div class="sorteos-acciones-tabla">

                                                        <button
                                                            type="button"
                                                            data-accion="cambiar-pago"
                                                            data-venta-id="${venta.id}"
                                                        >

                                                            ${
                                                                pagado
                                                                    ? "Marcar pendiente"
                                                                    : "Marcar pagado"
                                                            }

                                                        </button>


                                                        ${
                                                            sorteo.estado === "Activo"
                                                                ? `
                                                                    <button
                                                                        type="button"
                                                                        data-accion="eliminar-venta"
                                                                        data-venta-id="${venta.id}"
                                                                        class="sorteos-btn-eliminar"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                `
                                                                : ""
                                                        }

                                                    </div>

                                                </td>

                                            </tr>

                                        `;
                                    }
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const formNuevo =
            document.getElementById(
                "form-nuevo-sorteo"
            );


        if (formNuevo) {

            formNuevo.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await this.crearSorteo(
                        formNuevo
                    );
                }
            );
        }


        document
            .querySelectorAll(
                '[data-accion="abrir-sorteo"]'
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            this.sorteoSeleccionadoId =
                                boton.dataset.id;


                            this.render();
                            this.configurarEventos();


                            setTimeout(
                                () => {

                                    document
                                        .getElementById(
                                            "detalle-sorteo"
                                        )
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start"
                                        });

                                },
                                50
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                '[data-accion="eliminar-sorteo"]'
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        async () => {

                            await this.eliminarSorteo(
                                boton.dataset.id
                            );
                        }
                    );
                }
            );


        const cerrar =
            document.getElementById(
                "btn-cerrar-sorteo"
            );


        if (cerrar) {

            cerrar.addEventListener(
                "click",
                () => {

                    this.sorteoSeleccionadoId =
                        null;


                    this.render();
                    this.configurarEventos();
                }
            );
        }


        const formVenta =
            document.getElementById(
                "form-venta-sorteo"
            );


        if (formVenta) {

            formVenta.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await this.venderNumero(
                        formVenta
                    );
                }
            );
        }


        document
            .querySelectorAll(
                '[data-accion="cambiar-pago"]'
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        async () => {

                            await this.cambiarEstadoPago(
                                boton.dataset.ventaId
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                '[data-accion="eliminar-venta"]'
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        async () => {

                            await this.eliminarVenta(
                                boton.dataset.ventaId
                            );
                        }
                    );
                }
            );


        const finalizar =
            document.getElementById(
                "btn-finalizar-sorteo"
            );


        if (finalizar) {

            finalizar.addEventListener(
                "click",
                async () => {

                    await this.finalizarSorteo();
                }
            );
        }
    },


    // ======================================================
    // CREAR SORTEO
    // ======================================================

    async crearSorteo(
        formulario
    ) {

        const boton =
            formulario.querySelector(
                'button[type="submit"]'
            );


        if (boton) {
            boton.disabled = true;
        }


        try {

            const datos =
                Object.fromEntries(
                    new FormData(
                        formulario
                    ).entries()
                );


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

                alert(
                    "Ingresá un nombre para el sorteo."
                );

                return;
            }


            if (
                !Number.isInteger(
                    cantidadNumeros
                ) ||
                cantidadNumeros < 1
            ) {

                alert(
                    "Ingresá una cantidad de números válida."
                );

                return;
            }


            if (
                Number.isNaN(
                    valorNumero
                ) ||
                valorNumero < 0
            ) {

                alert(
                    "Ingresá un valor por número válido."
                );

                return;
            }


            const id =
                "SOR" +
                Date.now() +
                Math.floor(
                    Math.random() *
                    1000
                );


            const {
                error
            } =
                await SupabaseClient
                    .from("sorteos")
                    .insert({

                        id,

                        nombre,

                        descripcion:
                            datos.descripcion ||
                            "",

                        fecha_creacion:
                            this.fechaActual(),

                        fecha_sorteo:
                            datos.fechaSorteo ||
                            null,

                        cantidad_numeros:
                            cantidadNumeros,

                        valor_numero:
                            valorNumero,

                        estado:
                            "Activo",

                        numero_ganador:
                            null
                    });


            if (error) {
                throw error;
            }


            this.sorteoSeleccionadoId =
                id;


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al crear sorteo:",
                error
            );


            alert(
                "No se pudo crear el sorteo."
            );

        } finally {

            if (boton) {
                boton.disabled = false;
            }
        }
    },


    // ======================================================
    // VENDER NÚMERO
    // ======================================================

    async venderNumero(
        formulario
    ) {

        if (
            !this.sorteoSeleccionadoId
        ) {
            return;
        }


        const boton =
            formulario.querySelector(
                'button[type="submit"]'
            );


        if (boton) {
            boton.disabled = true;
        }


        try {

            const sorteo =
                this.obtenerSorteo(
                    this.sorteoSeleccionadoId
                );


            if (
                !sorteo ||
                sorteo.estado !== "Activo"
            ) {
                return;
            }


            const datos =
                Object.fromEntries(
                    new FormData(
                        formulario
                    ).entries()
                );


            const numero =
                Number(
                    datos.numero
                );


            if (
                !Number.isInteger(numero) ||
                numero < 1 ||
                numero >
                    sorteo.cantidadNumeros
            ) {

                alert(
                    "Ingresá un número válido."
                );

                return;
            }


            if (
                !this.numeroDisponible(
                    sorteo,
                    numero
                )
            ) {

                alert(
                    "Ese número no está disponible."
                );

                return;
            }


            if (
                !datos.familiaId &&
                !String(
                    datos.comprador || ""
                ).trim()
            ) {

                alert(
                    "Seleccioná una familia o escribí el nombre del comprador."
                );

                return;
            }


            const importe =
                Number(
                    datos.importe
                );


            if (
                Number.isNaN(importe) ||
                importe < 0
            ) {

                alert(
                    "Ingresá un importe válido."
                );

                return;
            }


            const ventaId =
                "RSV" +
                Date.now() +
                Math.floor(
                    Math.random() *
                    1000
                );


            const {
                data,
                error
            } =
                await SupabaseClient
                    .from("sorteo_ventas")
                    .insert({

                        id:
                            ventaId,

                        sorteo_id:
                            sorteo.id,

                        numero,

                        familia_id:
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

                        importe,

                        estado_pago:
                            datos.estadoPago === "Pagado"
                                ? "Pagado"
                                : "Pendiente",

                        observaciones:
                            "",

                        movimiento_caja_id:
                            null
                    })
                    .select()
                    .single();


            if (error) {

                if (
                    error.code === "23505"
                ) {

                    alert(
                        "Ese número ya fue vendido."
                    );

                    return;
                }

                throw error;
            }


            const venta =
                this.convertirVenta(
                    data
                );


            if (
                venta.estadoPago ===
                "Pagado"
            ) {

                const movimientoId =
                    await this.generarIngresoCajaSorteo(
                        sorteo,
                        venta
                    );


                const {
                    error:
                        errorActualizar
                } =
                    await SupabaseClient
                        .from("sorteo_ventas")
                        .update({

                            movimiento_caja_id:
                                movimientoId

                        })
                        .eq(
                            "id",
                            venta.id
                        );


                if (errorActualizar) {
                    throw errorActualizar;
                }
            }


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al vender número:",
                error
            );


            alert(
                "No se pudo registrar el número."
            );

        } finally {

            if (boton) {
                boton.disabled = false;
            }
        }
    },


    // ======================================================
    // CAMBIAR ESTADO DE PAGO
    // ======================================================

    async cambiarEstadoPago(
        ventaId
    ) {

        try {

            const sorteo =
                this.obtenerSorteo(
                    this.sorteoSeleccionadoId
                );


            if (!sorteo) {
                return;
            }


            const venta =
                sorteo.ventas.find(
                    item =>
                        item.id ===
                        ventaId
                );


            if (!venta) {
                return;
            }


            if (
                venta.estadoPago ===
                "Pagado"
            ) {

                if (
                    venta.movimientoCajaId
                ) {

                    await this.eliminarMovimientoCaja(
                        venta.movimientoCajaId
                    );
                }


                const {
                    error
                } =
                    await SupabaseClient
                        .from("sorteo_ventas")
                        .update({

                            estado_pago:
                                "Pendiente",

                            movimiento_caja_id:
                                null

                        })
                        .eq(
                            "id",
                            venta.id
                        );


                if (error) {
                    throw error;
                }

            } else {

                const {
                    error
                } =
                    await SupabaseClient
                        .from("sorteo_ventas")
                        .update({

                            estado_pago:
                                "Pagado"

                        })
                        .eq(
                            "id",
                            venta.id
                        );


                if (error) {
                    throw error;
                }


                const ventaPagada = {
                    ...venta,
                    estadoPago:
                        "Pagado"
                };


                const movimientoId =
                    await this.generarIngresoCajaSorteo(
                        sorteo,
                        ventaPagada
                    );


                const {
                    error:
                        errorMovimiento
                } =
                    await SupabaseClient
                        .from("sorteo_ventas")
                        .update({

                            movimiento_caja_id:
                                movimientoId

                        })
                        .eq(
                            "id",
                            venta.id
                        );


                if (errorMovimiento) {
                    throw errorMovimiento;
                }
            }


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al cambiar estado de pago:",
                error
            );


            alert(
                "No se pudo cambiar el estado del pago."
            );
        }
    },


    // ======================================================
    // INTEGRACIÓN CON CAJA
    // ======================================================

    async generarIngresoCajaSorteo(
        sorteo,
        venta
    ) {

        if (
            !sorteo ||
            !venta
        ) {
            return null;
        }


        if (
            venta.movimientoCajaId
        ) {

            return venta.movimientoCajaId;
        }


        const referencia =
            `SORTEO:${sorteo.id}:${venta.id}`;


        const {
            data: existentes,
            error: errorBuscar
        } =
            await SupabaseClient
                .from("movimientos")
                .select("id")
                .eq(
                    "referencia",
                    referencia
                )
                .limit(1);


        if (errorBuscar) {
            throw errorBuscar;
        }


        if (
            existentes &&
            existentes.length
        ) {

            return existentes[0].id;
        }


        let comprador =
            venta.comprador ||
            "Venta externa";


        if (
            venta.familiaId
        ) {

            const familia =
                this.familias.find(
                    item =>
                        item.id ===
                        venta.familiaId
                );


            if (familia) {

                comprador =
                    `${familia.apellido}, ${familia.nombre}`;
            }
        }


        const movimientoId =
            "MOV" +
            Date.now() +
            Math.floor(
                Math.random() *
                1000
            );


        const {
            error
        } =
            await SupabaseClient
                .from("movimientos")
                .insert({

                    id:
                        movimientoId,

                    fecha:
                        venta.fecha,

                    tipo:
                        "Ingreso",

                    concepto:
                        `Rifa ${sorteo.nombre} - N° ${this.formatearNumero(
                            venta.numero,
                            sorteo.cantidadNumeros
                        )}`,

                    importe:
                        Number(
                            venta.importe
                        ) || 0,

                    referencia,

                    observaciones:
                        comprador,

                    medio_pago:
                        "",

                    origen:
                        "Sorteo / Rifa"
                });


        if (error) {
            throw error;
        }


        return movimientoId;
    },


    async eliminarMovimientoCaja(
        movimientoId
    ) {

        if (!movimientoId) {
            return;
        }


        const {
            error
        } =
            await SupabaseClient
                .from("movimientos")
                .delete()
                .eq(
                    "id",
                    movimientoId
                );


        if (error) {
            throw error;
        }
    },


    // ======================================================
    // ELIMINAR VENTA DE NÚMERO
    // ======================================================

    async eliminarVenta(
        ventaId
    ) {

        const sorteo =
            this.obtenerSorteo(
                this.sorteoSeleccionadoId
            );


        if (!sorteo) {
            return;
        }


        const venta =
            sorteo.ventas.find(
                item =>
                    item.id ===
                    ventaId
            );


        if (!venta) {
            return;
        }


        const confirmar =
            window.confirm(
                "¿Eliminar la venta de este número?"
            );


        if (!confirmar) {
            return;
        }


        try {

            if (
                venta.movimientoCajaId
            ) {

                await this.eliminarMovimientoCaja(
                    venta.movimientoCajaId
                );
            }


            const {
                error
            } =
                await SupabaseClient
                    .from("sorteo_ventas")
                    .delete()
                    .eq(
                        "id",
                        venta.id
                    );


            if (error) {
                throw error;
            }


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al eliminar venta de sorteo:",
                error
            );


            alert(
                "No se pudo eliminar la venta del número."
            );
        }
    },


    // ======================================================
    // FINALIZAR SORTEO
    // ======================================================

    async finalizarSorteo() {

        const sorteo =
            this.obtenerSorteo(
                this.sorteoSeleccionadoId
            );


        if (!sorteo) {
            return;
        }


        const input =
            document.getElementById(
                "numero-ganador"
            );


        const valor =
            input
                ? String(
                    input.value || ""
                ).trim()
                : "";


        let numeroGanador =
            null;


        if (valor) {

            numeroGanador =
                Number(valor);


            if (
                !Number.isInteger(
                    numeroGanador
                ) ||
                numeroGanador < 1 ||
                numeroGanador >
                    sorteo.cantidadNumeros
            ) {

                alert(
                    "El número ganador no es válido."
                );

                return;
            }
        }


        const confirmar =
            window.confirm(
                "¿Confirmás que querés finalizar este sorteo?"
            );


        if (!confirmar) {
            return;
        }


        try {

            const {
                error
            } =
                await SupabaseClient
                    .from("sorteos")
                    .update({

                        estado:
                            "Finalizado",

                        numero_ganador:
                            numeroGanador

                    })
                    .eq(
                        "id",
                        sorteo.id
                    );


            if (error) {
                throw error;
            }


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al finalizar sorteo:",
                error
            );


            alert(
                "No se pudo finalizar el sorteo."
            );
        }
    },


    // ======================================================
    // ELIMINAR SORTEO
    // ======================================================

    async eliminarSorteo(
        id
    ) {

        const sorteo =
            this.obtenerSorteo(
                id
            );


        if (!sorteo) {
            return;
        }


        const tieneMovimientosCaja =
            Array.isArray(
                sorteo.ventas
            ) &&
            sorteo.ventas.some(
                venta =>
                    venta.movimientoCajaId
            );


        if (
            tieneMovimientosCaja
        ) {

            alert(
                "Este sorteo tiene cobros registrados en Caja. No puede eliminarse mientras existan esos movimientos."
            );

            return;
        }


        const confirmar =
            window.confirm(
                `¿Eliminar definitivamente "${sorteo.nombre}"?`
            );


        if (!confirmar) {
            return;
        }


        try {

            const {
                error
            } =
                await SupabaseClient
                    .from("sorteos")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (error) {
                throw error;
            }


            if (
                this.sorteoSeleccionadoId ===
                id
            ) {

                this.sorteoSeleccionadoId =
                    null;
            }


            await this.recargar();


        } catch (error) {

            console.error(
                "Error al eliminar sorteo:",
                error
            );


            alert(
                "No se pudo eliminar el sorteo."
            );
        }
    },


    // ======================================================
    // RECARGAR
    // ======================================================

    async recargar() {

        await this.cargarDatos();

        this.render();
        this.configurarEventos();
    },


    // ======================================================
    // CONSULTAS DEL MÓDULO
    // ======================================================

    obtenerSorteo(
        id
    ) {

        return (
            this.sorteos.find(
                sorteo =>
                    sorteo.id === id
            ) ||
            null
        );
    },


    obtenerResumenSorteo(
        sorteo
    ) {

        const ventas =
            Array.isArray(
                sorteo.ventas
            )
                ? sorteo.ventas
                : [];


        const cantidadVendidos =
            ventas.length;


        const cantidadTotal =
            Number(
                sorteo.cantidadNumeros
            ) || 0;


        const cantidadDisponibles =
            Math.max(
                0,
                cantidadTotal -
                cantidadVendidos
            );


        const totalVendido =
            ventas.reduce(
                (
                    total,
                    venta
                ) =>
                    total +
                    (
                        Number(
                            venta.importe
                        ) || 0
                    ),
                0
            );


        const totalCobrado =
            ventas
                .filter(
                    venta =>
                        venta.estadoPago ===
                        "Pagado"
                )
                .reduce(
                    (
                        total,
                        venta
                    ) =>
                        total +
                        (
                            Number(
                                venta.importe
                            ) || 0
                        ),
                    0
                );


        const totalPendiente =
            totalVendido -
            totalCobrado;


        return {

            cantidadVendidos,
            cantidadTotal,
            cantidadDisponibles,
            totalVendido,
            totalCobrado,
            totalPendiente
        };
    },


    numeroDisponible(
        sorteo,
        numero
    ) {

        return !sorteo.ventas.some(
            venta =>
                Number(
                    venta.numero
                ) ===
                Number(numero)
        );
    },


    // ======================================================
    // UTILIDADES
    // ======================================================

    fechaActual() {

        const fecha =
            new Date();


        const year =
            fecha.getFullYear();


        const month =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;
    },


    formatearFecha(
        fecha
    ) {

        if (!fecha) {
            return "-";
        }


        const partes =
            String(
                fecha
            ).split("-");


        if (
            partes.length !== 3
        ) {

            return fecha;
        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    },


    formatearNumero(
        numero,
        cantidadTotal
    ) {

        const digitos =
            String(
                cantidadTotal
            ).length;


        return String(
            numero
        ).padStart(
            digitos,
            "0"
        );
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