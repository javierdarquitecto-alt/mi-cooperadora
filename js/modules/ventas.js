window.Ventas = {

    ventaEditandoId: null,

    ventas: [],
    familias: [],
    alumnos: [],


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
                "Error al iniciar Ventas:",
                error
            );

            alert(
                "No se pudieron cargar las ventas."
            );
        }
    },


    // ======================================================
    // CARGAR DATOS DESDE SUPABASE
    // ======================================================

    async cargarDatos() {

        // FAMILIAS

        this.familias =
            await FamiliasService
                .obtenerTodas();


        // ALUMNOS

        const {
            data: alumnos,
            error: errorAlumnos
        } =
            await SupabaseClient
                .from("alumnos")
                .select("*")
                .order(
                    "apellido",
                    {
                        ascending: true
                    }
                );


        if (errorAlumnos) {
            throw errorAlumnos;
        }


        this.alumnos =
            (alumnos || [])
                .map(
                    alumno => ({
                        id:
                            alumno.id,

                        familiaId:
                            alumno.familia_id,

                        apellido:
                            alumno.apellido || "",

                        nombre:
                            alumno.nombre || "",

                        activo:
                            alumno.activo !== false
                    })
                );


        // VENTAS

        const {
            data: ventas,
            error: errorVentas
        } =
            await SupabaseClient
                .from("ventas")
                .select("*")
                .order(
                    "fecha",
                    {
                        ascending: true
                    }
                );


        if (errorVentas) {
            throw errorVentas;
        }


        this.ventas =
            (ventas || [])
                .map(
                    registro =>
                        this.convertirVenta(
                            registro
                        )
                );


        this.sincronizarVentasLocales();
    },


    // ======================================================
    // CONVERTIR REGISTRO
    // ======================================================

    convertirVenta(
        registro
    ) {

        return {

            id:
                registro.id,

            familiaId:
                registro.familia_id,

            alumnoId:
                registro.alumno_id ||
                null,

            producto:
                registro.producto || "",

            talle:
                registro.talle || "",

            cantidad:
                Number(
                    registro.cantidad
                ) || 0,

            precioUnitario:
                Number(
                    registro.precio_unitario
                ) || 0,

            fecha:
                registro.fecha,

            estadoPago:
                registro.estado_pago ||
                "Pendiente",

            estadoEntrega:
                registro.estado_entrega ||
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

    sincronizarVentasLocales() {

        if (
            !Database.data ||
            !Array.isArray(
                Database.data.ventas
            )
        ) {
            return;
        }


        Database.data.ventas =
            this.ventas.map(
                venta => ({
                    ...venta
                })
            );


        Database.save();
    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "ventas"
            );


        if (!contenedor) {
            return;
        }


        const familiasActivas =
            this.familias
                .filter(
                    familia =>
                        familia.activa !== false
                );


        contenedor.innerHTML = `

            <section class="ventas">

                <header class="ventas__header">

                    <span class="ventas__eyebrow">
                        Recaudaciones
                    </span>

                    <h1>
                        Venta de productos
                    </h1>

                    <p>
                        Registro y seguimiento de buzos,
                        remeras y otros productos.
                    </p>

                </header>


                ${this.renderResumen()}


                <section class="ventas-card">

                    <div class="ventas-card__header">

                        <div>

                            <h2 id="ventas-form-titulo">
                                Nueva venta
                            </h2>

                            <p>
                                Registrá la venta asociada
                                a una familia o alumno.
                            </p>

                        </div>

                    </div>


                    <form id="form-venta">

                        <div class="ventas-grid">


                            <div class="form-group">

                                <label>
                                    Familia
                                </label>

                                <select
                                    id="venta-familia"
                                    name="familiaId"
                                    required
                                >

                                    <option value="">
                                        Seleccionar familia
                                    </option>

                                    ${
                                        familiasActivas
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

                                <label>
                                    Alumno
                                </label>

                                <select
                                    id="venta-alumno"
                                    name="alumnoId"
                                >

                                    <option value="">
                                        Sin seleccionar
                                    </option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label>
                                    Producto
                                </label>

                                <select
                                    name="producto"
                                    required
                                >

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option value="Buzo">
                                        Buzo
                                    </option>

                                    <option value="Remera">
                                        Remera
                                    </option>

                                    <option value="Otro">
                                        Otro
                                    </option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label>
                                    Talle
                                </label>

                                <select name="talle">

                                    <option value="">
                                        Sin talle
                                    </option>

                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                    <option value="8">8</option>
                                    <option value="10">10</option>
                                    <option value="12">12</option>
                                    <option value="14">14</option>
                                    <option value="16">16</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>

                                </select>

                            </div>


                            <div class="form-group">

                                <label>
                                    Cantidad
                                </label>

                                <input
                                    type="number"
                                    name="cantidad"
                                    min="1"
                                    value="1"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Precio unitario
                                </label>

                                <input
                                    type="number"
                                    name="precioUnitario"
                                    min="0"
                                    step="100"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Fecha
                                </label>

                                <input
                                    type="date"
                                    name="fecha"
                                    value="${this.fechaActual()}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Estado de pago
                                </label>

                                <select
                                    name="estadoPago"
                                    required
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

                                <label>
                                    Entrega
                                </label>

                                <select
                                    name="estadoEntrega"
                                    required
                                >

                                    <option value="Pendiente">
                                        Pendiente
                                    </option>

                                    <option value="Entregado">
                                        Entregado
                                    </option>

                                </select>

                            </div>


                            <div class="form-group ventas-observaciones">

                                <label>
                                    Observaciones
                                </label>

                                <input
                                    type="text"
                                    name="observaciones"
                                    placeholder="Opcional"
                                >

                            </div>

                        </div>


                        <div class="ventas__actions">

                            <button
                                type="button"
                                id="btn-cancelar-edicion"
                                class="ventas-btn-secundario"
                                hidden
                            >
                                Cancelar
                            </button>


                            <button
                                type="submit"
                                id="btn-guardar-venta"
                            >

                                <span id="ventas-btn-texto">
                                    Registrar venta
                                </span>

                            </button>

                        </div>

                    </form>

                </section>


                <section class="ventas-card">

                    <div class="ventas-card__header">

                        <div>

                            <h2>
                                Ventas registradas
                            </h2>

                            <p>
                                Control de cobros y entregas.
                            </p>

                        </div>

                    </div>


                    <div id="ventas-listado">

                        ${this.renderTablaVentas()}

                    </div>

                </section>

            </section>

        `;
    },


    // ======================================================
    // RESUMEN
    // ======================================================

    renderResumen() {

        const ventas =
            this.ventas;


        const totalVentas =
            ventas.reduce(
                (
                    total,
                    venta
                ) =>
                    total +
                    this.obtenerTotalVenta(
                        venta
                    ),
                0
            );


        const cobrado =
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
                        this.obtenerTotalVenta(
                            venta
                        ),
                    0
                );


        const pendiente =
            totalVentas -
            cobrado;


        const entregasPendientes =
            ventas.filter(
                venta =>
                    venta.estadoEntrega !==
                    "Entregado"
            ).length;


        return `

            <div class="ventas-resumen">

                <article class="ventas-resumen-card">

                    <span>
                        Ventas
                    </span>

                    <strong>
                        ${ventas.length}
                    </strong>

                </article>


                <article class="ventas-resumen-card">

                    <span>
                        Total vendido
                    </span>

                    <strong>
                        ${Utils.formatearImporte(
                            totalVentas
                        )}
                    </strong>

                </article>


                <article class="ventas-resumen-card">

                    <span>
                        Cobrado
                    </span>

                    <strong>
                        ${Utils.formatearImporte(
                            cobrado
                        )}
                    </strong>

                </article>


                <article class="ventas-resumen-card">

                    <span>
                        Pendiente de cobro
                    </span>

                    <strong>
                        ${Utils.formatearImporte(
                            pendiente
                        )}
                    </strong>

                </article>


                <article class="ventas-resumen-card">

                    <span>
                        Entregas pendientes
                    </span>

                    <strong>
                        ${entregasPendientes}
                    </strong>

                </article>

            </div>

        `;
    },


    // ======================================================
    // TABLA
    // ======================================================

    renderTablaVentas() {

        if (!this.ventas.length) {

            return `

                <div class="ventas-vacio">
                    Todavía no hay ventas registradas.
                </div>

            `;
        }


        return `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Fecha</th>
                            <th>Familia</th>
                            <th>Alumno</th>
                            <th>Producto</th>
                            <th>Talle</th>
                            <th>Cant.</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Entrega</th>
                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            this.ventas
                                .slice()
                                .reverse()
                                .map(
                                    venta =>
                                        this.renderFilaVenta(
                                            venta
                                        )
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;
    },


    renderFilaVenta(
        venta
    ) {

        const familia =
            this.familias.find(
                item =>
                    item.id ===
                    venta.familiaId
            );


        const alumno =
            venta.alumnoId
                ? this.alumnos.find(
                    item =>
                        item.id ===
                        venta.alumnoId
                )
                : null;


        const total =
            this.obtenerTotalVenta(
                venta
            );


        const pagado =
            venta.estadoPago ===
            "Pagado";


        const entregado =
            venta.estadoEntrega ===
            "Entregado";


        return `

            <tr>

                <td>
                    ${this.formatearFecha(venta.fecha)}
                </td>


                <td>

                    ${
                        familia
                            ? `${this.escapeHtml(familia.apellido)}, ${this.escapeHtml(familia.nombre)}`
                            : "-"
                    }

                </td>


                <td>

                    ${
                        alumno
                            ? `${this.escapeHtml(alumno.apellido)}, ${this.escapeHtml(alumno.nombre)}`
                            : "-"
                    }

                </td>


                <td>
                    ${this.escapeHtml(venta.producto)}
                </td>


                <td>
                    ${this.escapeHtml(venta.talle || "-")}
                </td>


                <td>
                    ${venta.cantidad}
                </td>


                <td>
                    ${Utils.formatearImporte(total)}
                </td>


                <td>

                    <span class="
                        ventas-estado
                        ${
                            pagado
                                ? "ventas-estado--ok"
                                : "ventas-estado--pendiente"
                        }
                    ">
                        ${venta.estadoPago}
                    </span>

                </td>


                <td>

                    <span class="
                        ventas-estado
                        ${
                            entregado
                                ? "ventas-estado--ok"
                                : "ventas-estado--pendiente"
                        }
                    ">
                        ${venta.estadoEntrega}
                    </span>

                </td>


                <td>

                    <div class="ventas-acciones-tabla">

                        <button
                            type="button"
                            data-accion="pago"
                            data-id="${venta.id}"
                        >

                            ${
                                pagado
                                    ? "Pendiente"
                                    : "Marcar pagado"
                            }

                        </button>


                        <button
                            type="button"
                            data-accion="entrega"
                            data-id="${venta.id}"
                        >

                            ${
                                entregado
                                    ? "No entregado"
                                    : "Entregar"
                            }

                        </button>


                        <button
                            type="button"
                            data-accion="editar"
                            data-id="${venta.id}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            data-accion="eliminar"
                            data-id="${venta.id}"
                            class="ventas-btn-eliminar"
                        >
                            Eliminar
                        </button>

                    </div>

                </td>

            </tr>

        `;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const familiaSelect =
            document.getElementById(
                "venta-familia"
            );


        if (familiaSelect) {

            familiaSelect.addEventListener(
                "change",
                () => {

                    this.actualizarAlumnos(
                        familiaSelect.value
                    );
                }
            );
        }


        const formulario =
            document.getElementById(
                "form-venta"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await this.guardarVenta(
                        formulario
                    );
                }
            );
        }


        const listado =
            document.getElementById(
                "ventas-listado"
            );


        if (listado) {

            listado.addEventListener(
                "click",
                async event => {

                    const boton =
                        event.target.closest(
                            "button[data-accion]"
                        );


                    if (!boton) {
                        return;
                    }


                    const id =
                        boton.dataset.id;


                    const accion =
                        boton.dataset.accion;


                    if (accion === "pago") {

                        await this
                            .cambiarEstadoPago(
                                id
                            );
                    }


                    if (accion === "entrega") {

                        await this
                            .cambiarEstadoEntrega(
                                id
                            );
                    }


                    if (accion === "editar") {

                        this.editarVenta(
                            id
                        );
                    }


                    if (accion === "eliminar") {

                        await this
                            .eliminarVenta(
                                id
                            );
                    }
                }
            );
        }


        const cancelar =
            document.getElementById(
                "btn-cancelar-edicion"
            );


        if (cancelar) {

            cancelar.addEventListener(
                "click",
                () => {

                    this.ventaEditandoId =
                        null;


                    this.render();

                    this.configurarEventos();
                }
            );
        }
    },


    // ======================================================
    // ALUMNOS
    // ======================================================

    actualizarAlumnos(
        familiaId,
        alumnoSeleccionado = ""
    ) {

        const select =
            document.getElementById(
                "venta-alumno"
            );


        if (!select) {
            return;
        }


        if (!familiaId) {

            select.innerHTML = `

                <option value="">
                    Sin seleccionar
                </option>

            `;

            return;
        }


        const alumnos =
            this.alumnos
                .filter(
                    alumno =>
                        alumno.familiaId ===
                            familiaId
                        &&
                        alumno.activo !==
                            false
                );


        select.innerHTML = `

            <option value="">
                Sin seleccionar
            </option>

            ${
                alumnos
                    .map(
                        alumno => `

                            <option
                                value="${alumno.id}"
                                ${
                                    alumno.id ===
                                    alumnoSeleccionado
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${this.escapeHtml(alumno.apellido)}, ${this.escapeHtml(alumno.nombre)}
                            </option>

                        `
                    )
                    .join("")
            }

        `;
    },


    // ======================================================
    // GUARDAR / EDITAR
    // ======================================================

    async guardarVenta(
        formulario
    ) {

        const boton =
            document.getElementById(
                "btn-guardar-venta"
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


            const cantidad =
                Number(
                    datos.cantidad
                );


            const precio =
                Number(
                    datos.precioUnitario
                );


            if (
                !cantidad ||
                cantidad < 1
            ) {

                alert(
                    "Ingresá una cantidad válida."
                );

                return;
            }


            if (
                precio < 0 ||
                Number.isNaN(
                    precio
                )
            ) {

                alert(
                    "Ingresá un precio válido."
                );

                return;
            }


            const registro = {

                familia_id:
                    datos.familiaId,

                alumno_id:
                    datos.alumnoId ||
                    null,

                producto:
                    datos.producto,

                talle:
                    datos.talle ||
                    "",

                cantidad:
                    cantidad,

                precio_unitario:
                    precio,

                fecha:
                    datos.fecha,

                estado_pago:
                    datos.estadoPago,

                estado_entrega:
                    datos.estadoEntrega,

                observaciones:
                    datos.observaciones ||
                    ""
            };


            // ==================================================
            // EDITAR
            // ==================================================

            if (
                this.ventaEditandoId
            ) {

                const ventaAnterior =
                    this.ventas.find(
                        venta =>
                            venta.id ===
                            this.ventaEditandoId
                    );


                if (!ventaAnterior) {
                    return;
                }


                if (
                    ventaAnterior.movimientoCajaId
                ) {

                    await this.eliminarMovimientoCaja(
                        ventaAnterior.movimientoCajaId
                    );


                    registro.movimiento_caja_id =
                        null;
                }


                const {
                    data,
                    error
                } =
                    await SupabaseClient
                        .from("ventas")
                        .update(registro)
                        .eq(
                            "id",
                            this.ventaEditandoId
                        )
                        .select()
                        .single();


                if (error) {
                    throw error;
                }


                let ventaActualizada =
                    this.convertirVenta(
                        data
                    );


                if (
                    ventaActualizada.estadoPago ===
                    "Pagado"
                ) {

                    const movimientoId =
                        await this.generarIngresoCaja(
                            ventaActualizada
                        );


                    const {
                        error: errorMovimiento
                    } =
                        await SupabaseClient
                            .from("ventas")
                            .update({
                                movimiento_caja_id:
                                    movimientoId
                            })
                            .eq(
                                "id",
                                ventaActualizada.id
                            );


                    if (errorMovimiento) {
                        throw errorMovimiento;
                    }
                }

            } else {

                // ==================================================
                // NUEVA VENTA
                // ==================================================

                const id =
                    "VEN" +
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
                        .from("ventas")
                        .insert({
                            id,
                            ...registro,
                            movimiento_caja_id:
                                null
                        })
                        .select()
                        .single();


                if (error) {
                    throw error;
                }


                const nuevaVenta =
                    this.convertirVenta(
                        data
                    );


                if (
                    nuevaVenta.estadoPago ===
                    "Pagado"
                ) {

                    const movimientoId =
                        await this.generarIngresoCaja(
                            nuevaVenta
                        );


                    const {
                        error: errorMovimiento
                    } =
                        await SupabaseClient
                            .from("ventas")
                            .update({
                                movimiento_caja_id:
                                    movimientoId
                            })
                            .eq(
                                "id",
                                nuevaVenta.id
                            );


                    if (errorMovimiento) {
                        throw errorMovimiento;
                    }
                }
            }


            this.ventaEditandoId =
                null;


            await this.recargar();

        } catch (error) {

            console.error(
                "Error al guardar venta:",
                error
            );


            alert(
                "No se pudo guardar la venta."
            );

        } finally {

            if (boton) {
                boton.disabled = false;
            }
        }
    },


    // ======================================================
    // EDITAR
    // ======================================================

    editarVenta(
        id
    ) {

        const venta =
            this.ventas.find(
                item =>
                    item.id === id
            );


        if (!venta) {
            return;
        }


        this.ventaEditandoId =
            id;


        const formulario =
            document.getElementById(
                "form-venta"
            );


        if (!formulario) {
            return;
        }


        formulario.elements.familiaId.value =
            venta.familiaId;


        this.actualizarAlumnos(
            venta.familiaId,
            venta.alumnoId || ""
        );


        formulario.elements.producto.value =
            venta.producto;


        formulario.elements.talle.value =
            venta.talle || "";


        formulario.elements.cantidad.value =
            venta.cantidad;


        formulario.elements.precioUnitario.value =
            venta.precioUnitario;


        formulario.elements.fecha.value =
            venta.fecha;


        formulario.elements.estadoPago.value =
            venta.estadoPago;


        formulario.elements.estadoEntrega.value =
            venta.estadoEntrega;


        formulario.elements.observaciones.value =
            venta.observaciones ||
            "";


        const titulo =
            document.getElementById(
                "ventas-form-titulo"
            );


        if (titulo) {

            titulo.textContent =
                "Editar venta";
        }


        const textoBoton =
            document.getElementById(
                "ventas-btn-texto"
            );


        if (textoBoton) {

            textoBoton.textContent =
                "Guardar cambios";
        }


        const cancelar =
            document.getElementById(
                "btn-cancelar-edicion"
            );


        if (cancelar) {

            cancelar.hidden =
                false;
        }


        formulario.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    },


    // ======================================================
    // CAMBIAR ESTADO DE PAGO
    // ======================================================

    async cambiarEstadoPago(
        id
    ) {

        try {

            const venta =
                this.ventas.find(
                    item =>
                        item.id === id
                );


            if (!venta) {
                return;
            }


            // PAGADO -> PENDIENTE

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
                        .from("ventas")
                        .update({

                            estado_pago:
                                "Pendiente",

                            movimiento_caja_id:
                                null

                        })
                        .eq(
                            "id",
                            id
                        );


                if (error) {
                    throw error;
                }

            } else {

                // PENDIENTE -> PAGADO

                const {
                    error
                } =
                    await SupabaseClient
                        .from("ventas")
                        .update({

                            estado_pago:
                                "Pagado"

                        })
                        .eq(
                            "id",
                            id
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
                    await this.generarIngresoCaja(
                        ventaPagada
                    );


                const {
                    error: errorMovimiento
                } =
                    await SupabaseClient
                        .from("ventas")
                        .update({

                            movimiento_caja_id:
                                movimientoId

                        })
                        .eq(
                            "id",
                            id
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
    // GENERAR INGRESO EN CAJA
    // ======================================================

    async generarIngresoCaja(
        venta
    ) {

        if (!venta) {
            return null;
        }


        if (
            venta.movimientoCajaId
        ) {

            return venta.movimientoCajaId;
        }


        const referencia =
            `VENTA:${venta.id}`;


        // EVITAR DUPLICADOS

        const {
            data: existente,
            error: errorBuscar
        } =
            await SupabaseClient
                .from("movimientos")
                .select("*")
                .eq(
                    "referencia",
                    referencia
                )
                .limit(1);


        if (errorBuscar) {
            throw errorBuscar;
        }


        if (
            existente &&
            existente.length
        ) {

            return existente[0].id;
        }


        const familia =
            this.familias.find(
                item =>
                    item.id ===
                    venta.familiaId
            );


        const familiaTexto =
            familia
                ? `${familia.apellido}, ${familia.nombre}`
                : "Sin familia";


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
                        `Venta ${venta.producto} - ${familiaTexto}`,

                    importe:
                        this.obtenerTotalVenta(
                            venta
                        ),

                    referencia:
                        referencia,

                    observaciones:
                        venta.observaciones ||
                        "",

                    medio_pago:
                        "",

                    origen:
                        "Venta de productos"
                });


        if (error) {
            throw error;
        }


        return movimientoId;
    },


    // ======================================================
    // ELIMINAR MOVIMIENTO DE CAJA
    // ======================================================

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
    // ENTREGA
    // ======================================================

    async cambiarEstadoEntrega(
        id
    ) {

        try {

            const venta =
                this.ventas.find(
                    item =>
                        item.id === id
                );


            if (!venta) {
                return;
            }


            const nuevoEstado =
                venta.estadoEntrega ===
                "Entregado"
                    ? "Pendiente"
                    : "Entregado";


            const {
                error
            } =
                await SupabaseClient
                    .from("ventas")
                    .update({

                        estado_entrega:
                            nuevoEstado

                    })
                    .eq(
                        "id",
                        id
                    );


            if (error) {
                throw error;
            }


            await this.recargar();

        } catch (error) {

            console.error(
                "Error al cambiar entrega:",
                error
            );


            alert(
                "No se pudo cambiar el estado de entrega."
            );
        }
    },


    // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminarVenta(
        id
    ) {

        const venta =
            this.ventas.find(
                item =>
                    item.id === id
            );


        if (!venta) {
            return;
        }


        const confirmar =
            window.confirm(
                `¿Eliminar la venta de ${venta.producto}?`
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
                    .from("ventas")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (error) {
                throw error;
            }


            if (
                this.ventaEditandoId ===
                id
            ) {

                this.ventaEditandoId =
                    null;
            }


            await this.recargar();

        } catch (error) {

            console.error(
                "Error al eliminar venta:",
                error
            );


            alert(
                "No se pudo eliminar la venta."
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
    // UTILIDADES
    // ======================================================

    obtenerTotalVenta(
        venta
    ) {

        return (
            Number(
                venta.cantidad
            ) || 0
        ) *
        (
            Number(
                venta.precioUnitario
            ) || 0
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