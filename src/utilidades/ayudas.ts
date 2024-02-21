export function ordenarListaObjetos(lista: any[], llave: string | number, descendente = false) {
  lista.sort((a, b) => {
    if (a[llave] < b[llave]) return descendente ? -1 : 1;
    else if (a[llave] > b[llave]) return descendente ? 1 : -1;
    return 0;
  });
}

export async function pedirDatos<Respuesta>(url: string, config: RequestInit = {}): Promise<Respuesta> {
  const res = await fetch(url, config);
  const datos = await res.json();
  return datos as Respuesta;
}

/**
 *
 * @param elemento : Elemento de HTML que quiere cerrarse al hacer clic fuera de él
 * @param elemento2 : Elemento de HTML que no debe cerrar el elemento 1 al hacer clic en él
 */
export function cerrarClicFuera(elemento: HTMLElement, elemento2?: HTMLElement) {
  document.body.addEventListener('click', (evento) => {
    if (!(elemento === evento.target || elemento.contains(evento.target as Node) || elemento2 === evento.target)) {
      if (elemento.classList.contains('visible')) {
        elemento.classList.remove('visible');
      }
    }
  });
}
