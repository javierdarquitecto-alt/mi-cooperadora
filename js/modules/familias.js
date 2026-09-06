/**
 * ==========================================================
 * MI COOPERADORA
 * familias.js
 * ==========================================================
 *
 * Módulo de gestión y listado de familias.
 * ==========================================================
 */

window.Familias = {


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async init() {

        this.render();

        await this.mostrarFamilias();

        this.configurarEventos();

    },


    // ======================================================
    // RENDER
    // ======================================================

    render() {

        const contenedor =
            document.getElementById(
                "familias"
            );

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = `

            <section class="familias">

                <header class="familias__header">

                    <div>

                        <h1>
                            Familias
                        </h1>

                        <p>
                            Gestión de familias
                        </p>

                    </div>


                    <button
                        type="button"
                        data-route="nueva-familia"
                    >
                        Nueva familia
                    </button>

                </header>


                <section
                    class="familias__search"
                >

                    <label
                        for="buscar-familia"
                    >
                        Buscar familia
                    </label>

                    <input
                        type="search"
                        id="buscar-familia"
                        placeholder="Apellido, nombre, DNI o teléfono..."
                        autocomplete="off"
                    >

                </section>


                <section
                    class="familias__table-container"
                >

                    <table
                        class="familias__table"
                    >

                        <thead>

                            <tr>

                                <th>
                                    Apellido
                                </th>

                                <th>
                                    Nombre
                                </th>

                                <th>
                                    DNI
                                </th>

                                <th>
                                    Teléfono
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Acciones
                                </th>

                            </tr>

                        </thead>


                        <tbody
                            id="lista-familias"
                        >

                        </tbody>

                    </table>

                </section>


                <p
                    id="familias-vacio"
                    class="familias__empty"
                    hidden
                >
                    No se encontraron familias.
                </p>

            </section>

        `;
    },


    // ======================================================
    // MOSTRAR FAMILIAS
    // ======================================================

    async mostrarFamilias(
        texto = ""
    ) {

        const lista =
            document.getElementById(
                "lista-familias"
            );

        const mensajeVacio =
            document.getElementById(
                "familias-vacio"
            );


        if (!lista) {
            return;
        }


        lista.innerHTML = `

            <tr>

                <td colspan="6">
                    Cargando familias...
                </td>

            </tr>

        `;


        try {

            let familias =
                await FamiliasService
                    .obtenerTodas();


            // ==================================================
            // BUSCADOR
            // ==================================================

            const busqueda =
                String(texto || "")
                    .trim()
                    .toLowerCase();


            if (busqueda) {

                familias =
                    familias.filter(
                        familia => {

                            const contenido = `

                                ${familia.apellido || ""}
                                ${familia.nombre || ""}
                                ${familia.dni || ""}
                                ${familia.telefono || ""}

                            `
                                .toLowerCase();


                            return contenido.includes(
                                busqueda
                            );
                        }
                    );
            }


            lista.innerHTML = "";


            if (familias.length === 0) {

                if (mensajeVacio) {

                    mensajeVacio.hidden =
                        false;
                }

                return;
            }


            if (mensajeVacio) {

                mensajeVacio.hidden =
                    true;
            }


            familias.forEach(
                familia => {

                    lista.appendChild(
                        this.crearFila(
                            familia
                        )
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error al cargar familias desde Supabase:",
                error
            );


            lista.innerHTML = `

                <tr>

                    <td colspan="6">
                        No se pudieron cargar las familias.
                    </td>

                </tr>

            `;


            if (mensajeVacio) {

                mensajeVacio.hidden =
                    true;
            }
        }
    },


    // ======================================================
    // CREAR FILA
    // ======================================================

    crearFila(
        familia
    ) {

        const fila =
            document.createElement(
                "tr"
            );


        const estado =
            familia.activa !== false
                ? "Activa"
                : "Inactiva";


        fila.innerHTML = `

            <td>
                ${Utils.escaparHTML(
                    familia.apellido
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    familia.nombre
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    familia.dni
                )}
            </td>

            <td>
                ${Utils.escaparHTML(
                    familia.telefono
                )}
            </td>

            <td>

                <span
                    class="estado-badge ${
                        familia.activa !== false
                            ? "estado-badge--activo"
                            : "estado-badge--inactivo"
                    }"
                >
                    ${estado}
                </span>

            </td>

            <td>

                <div class="tabla-acciones">

                    <button
                        type="button"
                        class="btn-tabla btn-tabla--ver"
                        data-accion="ver"
                        data-id="${familia.id}"
                    >
                        Ver ficha
                    </button>


                    <button
                        type="button"
                        class="btn-tabla btn-tabla--editar"
                        data-accion="editar"
                        data-id="${familia.id}"
                    >
                        Editar
                    </button>

                </div>

            </td>

        `;


        return fila;
    },


    // ======================================================
    // EVENTOS
    // ======================================================

    configurarEventos() {

        const buscador =
            document.getElementById(
                "buscar-familia"
            );


        if (buscador) {

            buscador.addEventListener(
                "input",
                Utils.debounce(
                    async () => {

                        await this.mostrarFamilias(
                            buscador.value
                        );

                    },
                    200
                )
            );
        }


        const lista =
            document.getElementById(
                "lista-familias"
            );


        if (lista) {

            lista.addEventListener(
                "click",
                event => {

                    const boton =
                        event.target.closest(
                            "[data-accion]"
                        );


                    if (!boton) {
                        return;
                    }


                    const id =
                        boton.dataset.id;


                    const accion =
                        boton.dataset.accion;


                    if (accion === "ver") {

                        Router.go(
                            "familia",
                            {
                                id
                            }
                        );

                    }


                    if (accion === "editar") {

                        Router.go(
                            "nueva-familia",
                            {
                                id
                            }
                        );

                    }

                }
            );
        }
    }

};