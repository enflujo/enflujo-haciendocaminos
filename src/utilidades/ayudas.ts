/**
 * Ordena una lista de objetos, por ejemplo: [{a: 1}, {a: 2}, ...]
 * @param lista lista (array) con objetos a ordenar
 * @param llave llave donde esta el valor que define el orden
 * @param ascendiente Verdadero (`true`) si se quiere ordenar de menor a mayor
 */
export function ordenarListaObjetos(lista: any[], llave: string | number, ascendiente = false) {
  lista.sort((a, b) => {
    if (a[llave] < b[llave]) return ascendiente ? -1 : 1;
    else if (a[llave] > b[llave]) return ascendiente ? 1 : -1;
    return 0;
  });
}

/**
 * Permite definir el los tipos (Typescript) al pedir los datos
 *
 * @ejemplo
 * ```
 * const datos = pedirDatos<AlgunTipoOInterface>('...');
 * ```
 * @param url URL donde están los datos en formato JSON
 * @param config Opciones de `fetch()` https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
 * @returns Datos en JSON
 */
export async function pedirDatos<Respuesta>(url: string, config: RequestInit = {}): Promise<Respuesta> {
  const res = await fetch(url, config);
  const datos = await res.json();
  return datos as Respuesta;
}

/**
 * Función para cerrar algún contenedor al hacer clic por fuera de este.
 *
 * @param elemento Elemento de HTML que quiere cerrarse al hacer clic fuera de él
 * @param elemento2 Elemento de HTML que no debe cerrar el elemento 1 al hacer clic en él
 */
export function cerrarClicFuera(elemento: HTMLElement, elemento2?: HTMLElement) {
  document.body.addEventListener('click', (evento) => {
    if (!(elemento === evento.target || elemento.contains(evento.target as Node) || elemento2 === evento.target)) {
      if (elemento.classList.contains('visible')) {
        elemento.classList.remove('visible');
        elemento2?.classList.remove('activo');
      }
    }
  });
}
