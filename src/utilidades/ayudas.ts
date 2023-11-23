export function ordenarListaObjetos(lista: any[], llave: string | number, descendente = false) {
  lista.sort((a, b) => {
    if (a[llave] < b[llave]) return descendente ? -1 : 1;
    else if (a[llave] > b[llave]) return descendente ? 1 : -1;
    return 0;
  });
}
