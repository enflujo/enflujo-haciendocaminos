import { writeFileSync } from 'fs';

export const guardarJSON = (json: any, nombre: string) => {
  writeFileSync(`./estaticos/${nombre}.json`, JSON.stringify(json));
};

export function ordenarListaObjetos(lista: any[], llave: string, descendente = false) {
  lista.sort((a, b) => {
    if (a[llave] < b[llave]) return descendente ? -1 : 1;
    else if (a[llave] > b[llave]) return descendente ? 1 : -1;
    return 0;
  });
}

export const normalizar = (texto: string): string => {
  return texto
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
};
