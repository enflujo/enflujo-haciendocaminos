import type { Año, ElementoLista, Lista, Proyectos, Regiones } from '../src/tipos.ts';
import { writeFileSync } from 'fs';
import { getXlsxStream } from 'xlstream';
import slug from 'slug';

const guardarJSON = (json: any, nombre: string) => {
  writeFileSync(`./estaticos/${nombre}.json`, JSON.stringify(json));
};

function ordenarListaObjetos(lista: any[], llave: string, descendente = false) {
  lista.sort((a, b) => {
    const valorA = normalizar(`${a[llave]}`);
    const valorB = normalizar(`${b[llave]}`);
    if (valorA < valorB) return descendente ? -1 : 1;
    else if (valorA > valorB) return descendente ? 1 : -1;
    return 0;
  });
}

export const normalizar = (texto: string): string => {
  return texto
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
};

procesar();

const listaRegiones: Regiones = [];
const listaAños: ElementoLista[] = [];
const listaTipos: ElementoLista[] = [];
const listaLideres: ElementoLista[] = [];
const listaRoles: ElementoLista[] = [];
const listaParticipantes: ElementoLista[] = [];
const listaRamas: ElementoLista[] = [];
const listaTemas: ElementoLista[] = [];
const listaObjetos: ElementoLista[] = [];
const listaLugares: ElementoLista[] = [];
const listaDecadas: ElementoLista[] = [];
const proyectos: Proyectos = [];
const listas: Lista = {
  regiones: [],
  años: [],
  tipos: [],
  lideres: [],
  roles: [],
  participantes: [],
  ramas: [],
  temas: [],
  objetos: [],
  lugares: [],
  decadas: [],
};

async function procesar() {
  const flujo = await getXlsxStream({
    filePath: './procesador/Listado de proyectos - 60 años dpto antropología.xlsx',
    sheet: 'Proyectos',
    withHeader: false,
    ignoreEmpty: true,
  });

  let numeroFila = 1;

  flujo.on('data', (fila) => {
    if (numeroFila > 2) {
      procesarFila(fila.formatted.arr);
    } else {
    }

    numeroFila++;
  });

  flujo.on('close', () => {
    ordenarListaObjetos(listaRegiones, 'nombre', true);
    ordenarListaObjetos(listaAños, 'nombre', true);
    ordenarListaObjetos(listaTipos, 'nombre', true);
    ordenarListaObjetos(listaLideres, 'nombre', true);
    ordenarListaObjetos(listaRoles, 'nombre', true);
    ordenarListaObjetos(listaParticipantes, 'nombre', true);
    ordenarListaObjetos(listaRamas, 'nombre', true);
    ordenarListaObjetos(listaTemas, 'nombre', true);
    ordenarListaObjetos(listaObjetos, 'nombre', true);
    ordenarListaObjetos(listaLugares, 'nombre', true);
    ordenarListaObjetos(listaDecadas, 'nombre', true);
    listas.regiones = listaRegiones;
    listas.años = listaAños;
    listas.tipos = listaTipos;
    listas.lideres = listaLideres;
    listas.roles = listaRoles;
    listas.participantes = listaParticipantes;
    listas.ramas = listaRamas;
    listas.temas = listaTemas;
    listas.objetos = listaObjetos;
    listas.lugares = listaLugares;
    listas.decadas = listaDecadas;
    guardarJSON(proyectos, 'proyectos');
    guardarJSON(listas, 'listas');
    console.log('fin');
  });
}

function procesarFila(fila: string[]) {
  const regiones = validarRegion(fila[10]);
  const tipo = validarValorSingular(fila[1], listaTipos);
  const años = validarAño(`${fila[2]}`.trim());
  const lideres = validarValorMultiple(fila[4], listaLideres);
  const rol = validarValorSingular(fila[5], listaRoles);
  const participantes = validarValorMultiple(fila[6], listaParticipantes);
  const ramas = validarValorMultiple(fila[7], listaRamas);
  const temas = validarValorMultiple(fila[8], listaTemas);
  const objetos = validarValorMultiple(fila[9], listaObjetos);
  const lugares = validarValorMultiple(fila[11], listaLugares);
  const decada = validarValorSingular(fila[3], listaDecadas);
  const nombreProyecto = fila[0].trim();

  proyectos.push({
    nombre: { nombre: nombreProyecto, slug: slug(nombreProyecto) },
    tipo,
    años,
    decada,
    lideres,
    rol,
    participantes,
    ramas,
    temas,
    objetos,
    regiones,
    lugares,
  });
}

function validarRegion(valor: string) {
  if (!valor) return [];

  return valor
    .trim()
    .split(',')
    .map((region) => {
      const nombre = region.trim();
      const existeLugar = listaRegiones.find((dep) => dep.nombre === nombre);

      if (!existeLugar) {
        if (nombre.length && nombre !== 'No aplica') {
          listaRegiones.push({ nombre: region.trim(), lon: 0, lat: 0, conteo: 1 });
        }
      } else {
        existeLugar.conteo++;
      }

      return { nombre, slug: slug(nombre) };
    });
}

function validarValorMultiple(valor: string, lista: ElementoLista[]) {
  if (!valor) return [];

  const respuesta = valor
    .trim()
    .split(',')
    .map((elemento) => {
      return validarValorSingular(elemento, lista);
    });

  return respuesta;
}

function validarValorSingular(valor: string, lista: ElementoLista[]) {
  const existe = lista.find((obj) => obj.nombre === valor);

  if (!existe) {
    lista.push({ nombre: valor, conteo: 1, slug: slug(`${valor}`) });
  } else {
    existe.conteo++;
  }

  const nombre = `${valor}`.trim();
  return { nombre, slug: slug(nombre) };
}

function validarAño(valorAño: string) {
  const añoProcesado: Año = {
    años: [],
    tipo: 'singular',
    valor: '',
  };

  if (valorAño.includes(',')) {
    const partes = valorAño.split(',');
    partes.forEach((año) => {
      procesarAño(año.trim());
    });

    añoProcesado.años = partes.map((año) => +año);
    añoProcesado.tipo = 'multiples';
    añoProcesado.valor = valorAño;
  } else if (valorAño.includes('-')) {
    const [inicio, fin] = valorAño.split('-');

    for (let a = +inicio; a <= +fin; a++) {
      procesarAño(`${a}`);
      añoProcesado.años.push(a);
    }

    añoProcesado.tipo = 'rango';
    añoProcesado.valor = valorAño;
  } else if (valorAño) {
    procesarAño(valorAño);
    añoProcesado.años.push(+valorAño);
    añoProcesado.valor = valorAño;
  }

  return añoProcesado;
}

function procesarAño(año: string) {
  const elemento = listaAños.find((elemento) => elemento.nombre === año);

  if (!elemento) {
    listaAños.push({ nombre: año, conteo: 1, slug: slug(`${año}`) });
  } else {
    elemento.conteo++;
  }
}
