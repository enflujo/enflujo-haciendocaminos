import { writeFileSync } from 'fs';
import colores from 'cli-color';
import { emojify } from 'node-emoji';

export const logError = colores.red.bold;
export const logAviso = colores.bold.xterm(214);
export const logBloque = colores.bgCyan.black;
export const logCyan = colores.cyan.bold;
export const logVerde = colores.greenBright;
export const logNaranjaPulso = colores.xterm(214).blink;

// https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
export const cadena = emojify(':link:');
export const conector = emojify(':electric_plug:');
export const gorila = emojify(':gorilla:');
export const chulo = emojify(':white_check_mark:');

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

export const enMinusculas = (texto: string) => texto === texto.toLowerCase() && texto !== texto.toUpperCase();

export function separarPartes(entrada: string) {
  const valores = entrada.trim();
  const partes = valores.includes(';') ? valores.trim().split(';') : valores.trim().split(',');
  return partes.map((p) => p.trim());
}

export function mensajeExito(mensaje: string) {
  console.log(chulo, logAviso(mensaje));
}
