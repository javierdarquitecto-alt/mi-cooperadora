/**
 * ==========================================================
 * MI COOPERADORA
 * familias.service.js
 * ==========================================================
 *
 * Servicio encargado de las operaciones relacionadas con
 * familias y alumnos.
 *
 * Etapa de migración:
 *
 * FAMILIAS
 * - Lectura desde Supabase.
 * - Creación en Supabase + copia local.
 * - Edición en Supabase + copia local.
 * - Activación/desactivación en Supabase + copia local.
 *
 * ALUMNOS
 * - Lectura desde Supabase.
 * - Creación en Supabase + copia local.
 * - Edición en Supabase + copia local.
 * - Activación/desactivación en Supabase + copia local.
 *
 * ==========================================================
 */

const FamiliasService = {


    // ======================================================
    // CREAR FAMILIA
    // ======================================================

    async crear(datos = {}) {

        if (!datos.apellido && !datos.nombre) {

            throw new Error(
                "La familia debe tener al menos un apellido o nombre."
            );
        }


        const id =
            "FAM" + Date.now();


        const fechaAlta =
            Database.fechaActual();


        const { error } =
            await SupabaseClient
                .from("familias")
                .insert({

                    id,

                    apellido:
                        datos.apellido || "",

                    nombre:
                        datos.nombre || "",

                    dni:
                        datos.dni || "",

                    telefono:
                        datos.telefono || "",

                    email:
                        datos.email || "",

                    direccion:
                        datos.direccion || "",

                    observaciones:
                        datos.observaciones || "",

                    activa:
                        true,

                    fecha_alta:
                        fechaAlta,

                    fecha_baja:
                        null

                });


        if (error) {

            console.error(
                "Error al crear familia en Supabase:",
                error
            );

            throw new Error(
                "No se pudo guardar la familia en la nube."
            );
        }


        return Database.agregarFamilia({

            ...datos,

            id,

            activa:
                true,

            fechaAlta,

            fechaBaja:
                null

        });
    },


    // ======================================================
    // OBTENER TODAS LAS FAMILIAS DESDE SUPABASE
    // ======================================================

    async obtenerTodas() {

        const { data, error } =
            await SupabaseClient
                .from("familias")
                .select("*")
                .order(
                    "apellido",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Error al obtener familias:",
                error
            );

            throw new Error(
                "No se pudieron obtener las familias desde la nube."
            );
        }


        return (data || []).map(
            familia =>
                this.mapearFamiliaSupabase(
                    familia
                )
        );
    },


    // ======================================================
    // OBTENER FAMILIA POR ID LOCAL
    // ======================================================

    obtenerPorId(id) {

        if (!id) {

            return null;
        }


        return Database.obtenerFamilia(
            id
        );
    },


    // ======================================================
    // OBTENER FAMILIA POR ID DESDE SUPABASE
    // ======================================================

    async obtenerPorIdNube(id) {

        if (!id) {

            return null;
        }


        const { data, error } =
            await SupabaseClient
                .from("familias")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error al obtener familia desde Supabase:",
                error
            );

            throw new Error(
                "No se pudo obtener la familia desde la nube."
            );
        }


        if (!data) {

            return null;
        }


        return this.mapearFamiliaSupabase(
            data
        );
    },


    // ======================================================
    // CONVERTIR FAMILIA DE SUPABASE AL FORMATO DE LA APP
    // ======================================================

    mapearFamiliaSupabase(
        familia
    ) {

        if (!familia) {

            return null;
        }


        return {

            id:
                familia.id,

            apellido:
                familia.apellido || "",

            nombre:
                familia.nombre || "",

            dni:
                familia.dni || "",

            telefono:
                familia.telefono || "",

            email:
                familia.email || "",

            direccion:
                familia.direccion || "",

            observaciones:
                familia.observaciones || "",

            activa:
                familia.activa !== false,

            fechaAlta:
                familia.fecha_alta || "",

            fechaBaja:
                familia.fecha_baja || null

        };
    },


    // ======================================================
    // ASEGURAR COPIA LOCAL DE UNA FAMILIA
    // ======================================================

    asegurarFamiliaLocal(
        familia
    ) {

        if (!familia || !familia.id) {

            return null;
        }


        const existente =
            Database.obtenerFamilia(
                familia.id
            );


        if (existente) {

            return existente;
        }


        return Database.agregarFamilia({

            id:
                familia.id,

            apellido:
                familia.apellido || "",

            nombre:
                familia.nombre || "",

            dni:
                familia.dni || "",

            telefono:
                familia.telefono || "",

            email:
                familia.email || "",

            direccion:
                familia.direccion || "",

            observaciones:
                familia.observaciones || "",

            activa:
                familia.activa !== false,

            fechaAlta:
                familia.fechaAlta ||
                Database.fechaActual(),

            fechaBaja:
                familia.fechaBaja || null

        });
    },


    // ======================================================
    // OBTENER FAMILIAS ACTIVAS LOCAL
    // ======================================================

    obtenerActivas() {

        return Database.obtenerFamiliasActivas();
    },


    // ======================================================
    // BUSCAR FAMILIAS LOCAL
    // ======================================================

    buscar(texto = "") {

        return Database.buscarFamilias(
            texto
        );
    },


    // ======================================================
    // ACTUALIZAR FAMILIA
    // ======================================================

    async actualizar(
        id,
        datos = {}
    ) {

        if (!id) {

            throw new Error(
                "No se indicó la familia a actualizar."
            );
        }


        const { error } =
            await SupabaseClient
                .from("familias")
                .update({

                    apellido:
                        datos.apellido || "",

                    nombre:
                        datos.nombre || "",

                    dni:
                        datos.dni || "",

                    telefono:
                        datos.telefono || "",

                    email:
                        datos.email || "",

                    direccion:
                        datos.direccion || "",

                    observaciones:
                        datos.observaciones || "",

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al actualizar familia en Supabase:",
                error
            );

            throw new Error(
                "No se pudo actualizar la familia en la nube."
            );
        }


        const familiaLocal =
            Database.obtenerFamilia(
                id
            );


        if (familiaLocal) {

            return Database.actualizarFamilia(
                id,
                datos
            );
        }


        const familiaNube =
            await this.obtenerPorIdNube(
                id
            );


        return this.asegurarFamiliaLocal(
            familiaNube
        );
    },


    // ======================================================
    // ACTIVAR FAMILIA
    // ======================================================

    async activar(id) {

        if (!id) {

            return false;
        }


        const { error } =
            await SupabaseClient
                .from("familias")
                .update({

                    activa:
                        true,

                    fecha_baja:
                        null,

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al activar familia en Supabase:",
                error
            );

            throw new Error(
                "No se pudo activar la familia en la nube."
            );
        }


        const familiaLocal =
            Database.obtenerFamilia(
                id
            );


        if (familiaLocal) {

            return Database.activarFamilia(
                id
            );
        }


        const familiaNube =
            await this.obtenerPorIdNube(
                id
            );


        return this.asegurarFamiliaLocal(
            familiaNube
        );
    },


    // ======================================================
    // DESACTIVAR FAMILIA
    // ======================================================

    async desactivar(id) {

        if (!id) {

            return false;
        }


        const fechaBaja =
            Database.fechaActual();


        const { error } =
            await SupabaseClient
                .from("familias")
                .update({

                    activa:
                        false,

                    fecha_baja:
                        fechaBaja,

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al desactivar familia en Supabase:",
                error
            );

            throw new Error(
                "No se pudo desactivar la familia en la nube."
            );
        }


        const familiaLocal =
            Database.obtenerFamilia(
                id
            );


        if (familiaLocal) {

            return Database.desactivarFamilia(
                id
            );
        }


        const familiaNube =
            await this.obtenerPorIdNube(
                id
            );


        return this.asegurarFamiliaLocal(
            familiaNube
        );
    },


    // ======================================================
    // ELIMINAR FAMILIA LOCAL
    // ======================================================

    eliminar(id) {

        if (!id) {

            return false;
        }


        const alumnos =
            Database.obtenerAlumnosFamilia(
                id
            );


        const pagos =
            Database.obtenerPagosFamilia(
                id
            );


        if (
            alumnos.length > 0 ||
            pagos.length > 0
        ) {

            throw new Error(
                "No se puede eliminar una familia que tiene alumnos o pagos asociados. Puede desactivarse."
            );
        }


        return Database.eliminarFamilia(
            id
        );
    },


    // ======================================================
    // OBTENER ALUMNOS LOCAL
    // ======================================================

    obtenerAlumnos(
        familiaId
    ) {

        if (!familiaId) {

            return [];
        }


        return Database.obtenerAlumnosFamilia(
            familiaId
        );
    },


    // ======================================================
    // OBTENER ALUMNOS DESDE SUPABASE
    // ======================================================

    async obtenerAlumnosNube(
        familiaId
    ) {

        if (!familiaId) {

            return [];
        }


        const { data, error } =
            await SupabaseClient
                .from("alumnos")
                .select("*")
                .eq(
                    "familia_id",
                    familiaId
                )
                .order(
                    "apellido",
                    {
                        ascending: true
                    }
                )
                .order(
                    "nombre",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Error al obtener alumnos desde Supabase:",
                error
            );

            throw new Error(
                "No se pudieron obtener los alumnos desde la nube."
            );
        }


        return (data || []).map(
            alumno =>
                this.mapearAlumnoSupabase(
                    alumno
                )
        );
    },


    // ======================================================
    // AGREGAR ALUMNO
    // ======================================================

    async agregarAlumno(
        datos = {}
    ) {

        if (!datos.familiaId) {

            throw new Error(
                "El alumno debe estar asociado a una familia."
            );
        }


        if (!datos.apellido && !datos.nombre) {

            throw new Error(
                "El alumno debe tener al menos un apellido o nombre."
            );
        }


        const familia =
            await this.obtenerPorIdNube(
                datos.familiaId
            );


        if (!familia) {

            throw new Error(
                "La familia asociada no existe."
            );
        }


        this.asegurarFamiliaLocal(
            familia
        );


        const id =
            "ALU" + Date.now();


        const { error } =
            await SupabaseClient
                .from("alumnos")
                .insert({

                    id,

                    familia_id:
                        datos.familiaId,

                    apellido:
                        datos.apellido || "",

                    nombre:
                        datos.nombre || "",

                    dni:
                        datos.dni || "",

                    fecha_nacimiento:
                        datos.fechaNacimiento || null,

                    curso:
                        datos.curso || "",

                    division:
                        datos.division || "",

                    turno:
                        datos.turno || "",

                    activo:
                        true,

                    observaciones:
                        datos.observaciones || ""

                });


        if (error) {

            console.error(
                "Error al crear alumno en Supabase:",
                error
            );

            throw new Error(
                "No se pudo guardar el alumno en la nube."
            );
        }


        return Database.agregarAlumno({

            ...datos,

            id,

            activo:
                true

        });
    },


    // ======================================================
    // ACTUALIZAR ALUMNO
    // ======================================================

    async actualizarAlumno(
        id,
        datos = {}
    ) {

        if (!id) {

            throw new Error(
                "No se indicó el alumno a actualizar."
            );
        }


        const alumnoNube =
            await this.obtenerAlumnoNube(
                id
            );


        if (!alumnoNube) {

            throw new Error(
                "El alumno no existe."
            );
        }


        const { error } =
            await SupabaseClient
                .from("alumnos")
                .update({

                    apellido:
                        datos.apellido || "",

                    nombre:
                        datos.nombre || "",

                    dni:
                        datos.dni || "",

                    fecha_nacimiento:
                        datos.fechaNacimiento || null,

                    curso:
                        datos.curso || "",

                    division:
                        datos.division || "",

                    turno:
                        datos.turno || "",

                    observaciones:
                        datos.observaciones || "",

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al actualizar alumno en Supabase:",
                error
            );

            throw new Error(
                "No se pudo actualizar el alumno en la nube."
            );
        }


        const alumnoLocal =
            Database.obtenerAlumno(
                id
            );


        if (alumnoLocal) {

            return Database.actualizarAlumno(
                id,
                datos
            );
        }


        this.asegurarFamiliaLocal(
            await this.obtenerPorIdNube(
                alumnoNube.familiaId
            )
        );


        return Database.agregarAlumno({

            ...alumnoNube,

            ...datos,

            id:
                alumnoNube.id,

            familiaId:
                alumnoNube.familiaId,

            activo:
                alumnoNube.activo !== false

        });
    },


    // ======================================================
    // ACTIVAR ALUMNO
    // ======================================================

    async activarAlumno(id) {

        if (!id) {

            return false;
        }


        const alumnoNube =
            await this.obtenerAlumnoNube(
                id
            );


        if (!alumnoNube) {

            throw new Error(
                "El alumno no existe."
            );
        }


        const { error } =
            await SupabaseClient
                .from("alumnos")
                .update({

                    activo:
                        true,

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al reactivar alumno en Supabase:",
                error
            );

            throw new Error(
                "No se pudo reactivar el alumno en la nube."
            );
        }


        const alumnoLocal =
            Database.obtenerAlumno(
                id
            );


        if (alumnoLocal) {

            return Database.activarAlumno(
                id
            );
        }


        this.asegurarFamiliaLocal(
            await this.obtenerPorIdNube(
                alumnoNube.familiaId
            )
        );


        return Database.agregarAlumno({

            ...alumnoNube,

            activo:
                true

        });
    },


    // ======================================================
    // DESACTIVAR ALUMNO
    // ======================================================

    async desactivarAlumno(id) {

        if (!id) {

            return false;
        }


        const alumnoNube =
            await this.obtenerAlumnoNube(
                id
            );


        if (!alumnoNube) {

            throw new Error(
                "El alumno no existe."
            );
        }


        const { error } =
            await SupabaseClient
                .from("alumnos")
                .update({

                    activo:
                        false,

                    actualizado_en:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Error al desactivar alumno en Supabase:",
                error
            );

            throw new Error(
                "No se pudo desactivar el alumno en la nube."
            );
        }


        const alumnoLocal =
            Database.obtenerAlumno(
                id
            );


        if (alumnoLocal) {

            return Database.desactivarAlumno(
                id
            );
        }


        this.asegurarFamiliaLocal(
            await this.obtenerPorIdNube(
                alumnoNube.familiaId
            )
        );


        return Database.agregarAlumno({

            ...alumnoNube,

            activo:
                false

        });
    },


    // ======================================================
    // ELIMINAR ALUMNO LOCAL
    // ======================================================

    eliminarAlumno(id) {

        if (!id) {

            return false;
        }


        return Database.eliminarAlumno(
            id
        );
    },


    // ======================================================
    // OBTENER ALUMNO LOCAL
    // ======================================================

    obtenerAlumno(id) {

        if (!id) {

            return null;
        }


        return Database.obtenerAlumno(
            id
        );
    },


    // ======================================================
    // OBTENER ALUMNO DESDE SUPABASE
    // ======================================================

    async obtenerAlumnoNube(id) {

        if (!id) {

            return null;
        }


        const { data, error } =
            await SupabaseClient
                .from("alumnos")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error al obtener alumno desde Supabase:",
                error
            );

            throw new Error(
                "No se pudo obtener el alumno desde la nube."
            );
        }


        if (!data) {

            return null;
        }


        return this.mapearAlumnoSupabase(
            data
        );
    },


    // ======================================================
    // CONVERTIR ALUMNO DE SUPABASE AL FORMATO DE LA APP
    // ======================================================

    mapearAlumnoSupabase(
        alumno
    ) {

        if (!alumno) {

            return null;
        }


        return {

            id:
                alumno.id,

            familiaId:
                alumno.familia_id,

            apellido:
                alumno.apellido || "",

            nombre:
                alumno.nombre || "",

            dni:
                alumno.dni || "",

            fechaNacimiento:
                alumno.fecha_nacimiento || "",

            curso:
                alumno.curso || "",

            division:
                alumno.division || "",

            turno:
                alumno.turno || "",

            activo:
                alumno.activo !== false,

            observaciones:
                alumno.observaciones || ""

        };
    },


    // ======================================================
    // RESUMEN DE FAMILIA
    // ======================================================

    obtenerResumenFamilia(
        familiaId
    ) {

        const familia =
            this.obtenerPorId(
                familiaId
            );


        if (!familia) {

            return null;
        }


        const alumnos =
            this.obtenerAlumnos(
                familiaId
            );


        const pagos =
            Database.obtenerPagosFamilia(
                familiaId
            );


        const totalPagado =
            Database.obtenerTotalPagadoFamilia(
                familiaId
            );


        return {

            familia,

            alumnos,

            cantidadAlumnos:
                alumnos.length,

            pagos,

            cantidadPagos:
                pagos.length,

            totalPagado

        };
    }

};