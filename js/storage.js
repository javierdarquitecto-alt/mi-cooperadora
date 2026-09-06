/**
 * ==========================================================
 * MI COOPERADORA
 * storage.js
 * ==========================================================
 *
 * Capa de almacenamiento de la aplicación.
 *
 * Ningún otro módulo debería trabajar directamente con
 * localStorage. Todo pasa por este objeto.
 * ==========================================================
 */

const Storage = {

    /**
     * Guarda un dato.
     *
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    set(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error(
                "Error al guardar en Storage:",
                error
            );

            return false;
        }
    },


    /**
     * Obtiene un dato.
     *
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {

        try {

            const value = localStorage.getItem(key);

            if (value === null) {

                return defaultValue;
            }

            return JSON.parse(value);

        } catch (error) {

            console.error(
                "Error al leer Storage:",
                error
            );

            return defaultValue;
        }
    },


    /**
     * Elimina un dato.
     *
     * @param {string} key
     * @returns {boolean}
     */
    remove(key) {

        try {

            localStorage.removeItem(key);

            return true;

        } catch (error) {

            console.error(
                "Error al eliminar de Storage:",
                error
            );

            return false;
        }
    },


    /**
     * Comprueba si existe una clave.
     *
     * @param {string} key
     * @returns {boolean}
     */
    exists(key) {

        return localStorage.getItem(key) !== null;
    },


    /**
     * Elimina todos los datos de la aplicación.
     *
     * ATENCIÓN:
     * Este método se utilizará solamente desde funciones
     * administrativas o de mantenimiento.
     *
     * @returns {boolean}
     */
    clear() {

        try {

            localStorage.clear();

            return true;

        } catch (error) {

            console.error(
                "Error al limpiar Storage:",
                error
            );

            return false;
        }
    },


    /**
     * Devuelve todas las claves almacenadas.
     *
     * @returns {string[]}
     */
    keys() {

        return Object.keys(localStorage);
    },


    /**
     * Devuelve la cantidad de elementos almacenados.
     *
     * @returns {number}
     */
    count() {

        return localStorage.length;
    },


    /**
     * Comprueba si el almacenamiento local está disponible.
     *
     * @returns {boolean}
     */
    isAvailable() {

        try {

            const testKey =
                "__mi_cooperadora_storage_test__";

            localStorage.setItem(testKey, "1");

            localStorage.removeItem(testKey);

            return true;

        } catch (error) {

            return false;
        }
    }

};