import type {
  Año,
  Campos,
  DefinicionSimple,
  Egresado,
  ElementoLista,
  LLavesMultiples,
  Listas,
  ListasEgresados,
  OpcionBuscadorDatos,
  PersonaID,
  Proyecto
} from '../src/tipos.ts';
import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import { type VideoTypeData, extract } from '@extractus/oembed-extractor';
import { enMinusculas, guardarJSON, logBloque, mensajeExito, ordenarListaObjetos, separarPartes } from './ayudas.js';
import { procesarLugares } from './lugares.js';
import procesarEgresados from './egresados.js';
import procesarPersonas from './personas.js';
import { analizarCarpetaImagenes, carpetaFuenteImgs, carpetaPublicaImgs, procesarImagenes } from './imagenes.js';
import { emojify } from 'node-emoji';
import { procesarNombresLideres } from './lideres.js';
import { constants, copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const datosEmpiezanEnFila = 2;
const campos: Campos = [
  { llave: 'lideres', indice: 5, procesarAparte: true },
  { llave: 'categorias', indice: 2 },
  { llave: 'decadas', indice: 4 },
  { llave: 'vinculaciones', indice: 7 },
  { llave: 'participantes', indice: 8 },
  { llave: 'ramas', indice: 9 },
  { llave: 'temas', indice: 10 },
  { llave: 'objetos', indice: 11 },
  { llave: 'paises', indice: 12 },
  { llave: 'regiones', indice: 13 },
  { llave: 'departamentos', indice: 14 },
  { llave: 'municipios', indice: 15 }
];

const proyectos: Proyecto[] = [];

const listas: Listas = {
  paises: [],
  años: [],
  categorias: [],
  lideres: [],
  participantes: [],
  ramas: [],
  temas: [],
  objetos: [],
  municipios: [],
  decadas: [],
  regiones: [],
  departamentos: [],
  vinculaciones: []
};

const listasEgresados: ListasEgresados = {
  paises: [],
  temas: [],
  ambitos: [],
  ciudades: [],
  graduacion: []
};
export interface Errata {
  tipo: string;
  fila: number;
  mensaje: string;
}

const errata: Errata[] = [];

const archivo = './procesador/datos/Listado de proyectos - 60 años dpto antropología .xlsx';
let personas: PersonaID;

async function procesar() {
  await analizarCarpetaImagenes(errata);
  personas = await procesarPersonas(archivo);
  const egresados = await procesarEgresados(archivo, listasEgresados);
  mensajeExito('Egresados procesados');
  await procesarProyectos();
  mensajeExito('Proyectos procesados');
  await procesarLugares(archivo, listas, listasEgresados);
  mensajeExito('Lugares procesados');
  procesarDatosBuscador(egresados);
  mensajeExito('Datos buscador');
  await agregarDescripciones();
  mensajeExito('Descripciones áreas');
  await agregarDescripcionesRamas();
  mensajeExito('Descripciones ramas');
  guardarJSON(listas, 'listas');
  console.log(emojify(':fox_face:'), logBloque('FIN'), emojify(':peacock:'));

  guardarJSON(errata, 'errata');
}

procesar().catch(console.error);

function agregarDescripciones(): Promise<void> {
  return new Promise(async (resolver) => {
    const flujoDescAreas = await getXlsxStream({
      filePath: archivo,
      sheet: 'Descripción áreas',
      withHeader: true,
      ignoreEmpty: true
    });

    flujoDescAreas.on('data', (fila) => {
      const [area, desc] = fila.formatted.arr;
      // console.log(area, '----', desc);
      const tema = listas.temas.find((t) => t.nombre.toLowerCase() === area.trim().toLowerCase());

      if (tema) {
        // console.log('SI', area);
        tema.descripcion = desc;
      } else {
        // console.log('??????', area);
      }
    });

    flujoDescAreas.on('close', () => {
      resolver();
    });
  });
}

function agregarDescripcionesRamas(): Promise<void> {
  return new Promise(async (resolver) => {
    const flujo = await getXlsxStream({
      filePath: archivo,
      sheet: 'Descripción Ramas',
      withHeader: false,
      ignoreEmpty: true
    });

    flujo.on('data', (fila) => {
      const [nombre, desc] = fila.formatted.arr;
      // console.log(area, '----', desc);
      const rama = listas.ramas.find((t) => t.nombre.toLowerCase() === nombre.trim().toLowerCase());

      if (rama) {
        // console.log('SI', nombre);
        rama.descripcion = desc;
      } else {
        // console.log('??????', nombre);
      }
    });

    flujo.on('close', () => {
      resolver();
    });
  });
}

function procesarDatosBuscador(egresados: Egresado[]) {
  const opciones: OpcionBuscadorDatos[] = [];

  proyectos.forEach((proyecto, i) => {
    opciones.push({ nombre: proyecto.nombre.nombre, tipo: 'proyecto', id: `${i}`, vista: 'proyectos' });
  });

  egresados.forEach((egresado, i) => {
    opciones.push({ nombre: egresado.nombre, tipo: 'egresado', id: `${i}`, vista: 'egresados' });
  });

  for (const llaveListaP in listas) {
    const lista = listas[llaveListaP as keyof Listas];
    lista.forEach((elemento, i) => {
      const elementoBuscador: OpcionBuscadorDatos = {
        nombre: elemento.nombre,
        tipo: llaveListaP,
        id: `${i}`,
        vista: 'proyectos'
      };
      opciones.push(elementoBuscador);
    });
  }

  for (const llaveListaE in listasEgresados) {
    const lista = listasEgresados[llaveListaE as keyof ListasEgresados];
    lista.forEach((elemento, i) => {
      const elementoBuscador: OpcionBuscadorDatos = {
        nombre: elemento.nombre,
        tipo: llaveListaE,
        id: `${i}`,
        vista: 'egresados'
      };

      opciones.push(elementoBuscador);
    });
  }

  guardarJSON(opciones, 'datosBuscador');
}

async function procesarProyectos(): Promise<void> {
  const flujo = await getXlsxStream({
    filePath: archivo,
    sheet: 'Proyectos',
    withHeader: false,
    ignoreEmpty: true
  });

  let numeroFila = 1;
  let filasProcesadas = 0;
  let conteoFilas = -datosEmpiezanEnFila;
  let totalFilas = Infinity;
  let filasPreprocesadas = false;

  return new Promise((resolver) => {
    flujo.on('data', async (fila) => {
      conteoFilas++;

      if (numeroFila > datosEmpiezanEnFila) {
        await procesarFila(fila.formatted.arr, numeroFila);
        filasProcesadas++;
      }
      // console.log(conteoFilas, filasProcesadas);
      numeroFila++;

      if (!filasPreprocesadas && totalFilas === filasProcesadas) {
        filasPreprocesadas = true;
        construirRelacionesDeProyectos();
      }
    });

    flujo.on('close', () => {
      totalFilas = conteoFilas;

      if (!filasPreprocesadas && totalFilas === filasProcesadas) {
        filasPreprocesadas = true;
        construirRelacionesDeProyectos();
      }
    });

    // Antes esto se estaba haciendo en el evento `flujo.on('close', () => {})` pero toca esperar a los async await.
    function construirRelacionesDeProyectos() {
      for (const lista in listas) {
        ordenarListaObjetos(listas[lista as keyof Listas], 'slug', true);
      }

      proyectos.forEach((proyecto) => {
        const id = proyecto.id;

        campos.forEach((campoRelacion) => {
          const datosRelacion = proyecto[campoRelacion.llave];

          campos.forEach((campo) => {
            // Agregar datos de cada campo en todos los otros, excepto en sí mismo.
            if (campoRelacion.llave !== campo.llave && datosRelacion) {
              const llaveALlenar = campo.llave;
              const llaveDondeLllenar = campoRelacion.llave;
              const datosProyecto = proyecto[llaveALlenar];

              // Si el proyecto tiene datos en este campo
              if (datosProyecto) {
                // Sacar los slugs del campo
                const slugsCampoProyecto = Array.isArray(datosProyecto)
                  ? (datosProyecto as DefinicionSimple[]).map(({ slug }) => slug)
                  : [(datosProyecto as DefinicionSimple).slug];

                slugsCampoProyecto.forEach((slug) => {
                  const i = listas[llaveALlenar].findIndex((obj) => obj.slug === slug);
                  const elementosDondeConectar = Array.isArray(datosRelacion)
                    ? (datosRelacion as DefinicionSimple[]).map(({ slug }) => slug)
                    : [(datosRelacion as DefinicionSimple).slug];

                  elementosDondeConectar.forEach((elementoConector) => {
                    const elementoALlenar = listas[llaveDondeLllenar].find((obj) => obj.slug === elementoConector);

                    if (elementoALlenar) {
                      const existe = elementoALlenar.relaciones.find((obj) => obj.slug === slug);

                      if (!elementoALlenar.proyectos?.includes(id)) {
                        elementoALlenar.proyectos?.push(id);
                      }

                      if (!existe) {
                        elementoALlenar.relaciones.push({
                          conteo: 1,
                          indice: i,
                          tipo: llaveALlenar,
                          slug
                        });
                      } else {
                        existe.conteo++;
                      }
                    }
                  });
                });
              }
            }
          });
        });

        // Años
        if (proyecto.años) {
          proyecto.años.años.forEach((año) => {
            const añoEnSlug = `${año}`;

            campos.forEach((campo) => {
              const datosCampo = proyecto[campo.llave];
              const llaveALlenar = campo.llave;
              if (datosCampo) {
                const slugs = Array.isArray(datosCampo)
                  ? datosCampo.map(({ slug }) => slug)
                  : [(datosCampo as DefinicionSimple).slug];

                slugs.forEach((slug) => {
                  const objALlenar = listas[llaveALlenar].find((obj) => obj.slug === slug);

                  if (objALlenar) {
                    const i = listas.años.findIndex((año) => año.slug === añoEnSlug);
                    const existe = objALlenar.relaciones.find((obj) => obj.slug === añoEnSlug && obj.tipo === 'años');

                    if (!existe) {
                      objALlenar.relaciones.push({ conteo: 1, indice: i, tipo: 'años', slug: añoEnSlug });
                    } else {
                      existe.conteo++;
                    }
                  }

                  // Llenar este en años
                  const objAño = listas.años.find((obj) => obj.slug === añoEnSlug);

                  if (objAño) {
                    const i = listas[llaveALlenar].findIndex((obj) => obj.slug === slug);
                    const existe = objAño.relaciones.find((obj) => obj.slug === slug);

                    if (!existe) {
                      objAño.relaciones.push({ conteo: 1, indice: i, tipo: llaveALlenar, slug });
                    }
                  }
                });
              }
            });
          });
        }
      });

      proyectos.sort((a, b) => {
        if (a.nombre.slug < b.nombre.slug) return -1;
        else if (a.nombre.slug > b.nombre.slug) return 1;
        return 0;
      });

      proyectos.forEach((proyecto) => {
        campos.forEach((campo) => {
          if (proyecto[campo.llave as LLavesMultiples])
            ordenarListaObjetos(proyecto[campo.llave as LLavesMultiples] as DefinicionSimple[], 'slug', true);
        });
      });

      guardarJSON(proyectos, 'proyectos');

      resolver();
    }

    flujo.on('close', () => {});
  });
}

async function procesarFila(fila: string[], numeroFila: number) {
  const nombreProyecto = fila[1].trim();
  const respuesta: Proyecto = {
    id: +fila[0],
    nombre: { nombre: nombreProyecto, slug: slugificar(nombreProyecto) },
    descripcion: fila[17],
    enlaces: fila[18] && fila[18].toLocaleLowerCase() !== 'no aplica' ? fila[18].trim().split(' ') : [],
    imagenes: [],
    videos: [],
    documentos: [],
    lideres: procesarNombresLideres(fila[5], fila[6], nombreProyecto, numeroFila, listas.lideres, personas)
  };

  const años = validarAño(`${fila[3]}`.trim());
  if (años) respuesta.años = años;

  // Agregar la portada de primero en la lista de imágenes
  if (fila[19] && fila[19].toLowerCase() !== 'no aplica') {
    const portada = await procesarImagenes(fila[19], errata, numeroFila);
    if (portada && portada.length) respuesta.imagenes?.push(portada[0]);
  }

  if (fila[20] && fila[20].toLowerCase() !== 'no aplica') {
    respuesta.imagenes = await procesarImagenes(fila[20], errata, numeroFila);
  }

  if (fila[21] && fila[21].toLowerCase() !== 'no aplica') {
    const partes = separarPartes(fila[21]);
    if (partes && partes.length) {
      for await (const url of partes) {
        const datosVideo = (await extract(url)) as VideoTypeData;
        respuesta.videos?.push(datosVideo.html);
      }
    }
  }

  if (fila[22] && fila[22].toLowerCase() !== 'no aplica') {
    const partes = separarPartes(fila[22]);

    partes.forEach((nombreDoc) => {
      const fuenteDoc = resolve(carpetaFuenteImgs, nombreDoc);
      const existe = existsSync(fuenteDoc);

      if (existe) {
        copyFileSync(fuenteDoc, resolve(carpetaPublicaImgs, nombreDoc));
        respuesta.documentos?.push(nombreDoc);
      }
    });
  }

  campos.forEach((campo) => {
    if (!campo.procesarAparte) {
      const validacion = validarValorMultiple(fila[campo.indice], listas[campo.llave], campo.llave);
      if (validacion) respuesta[campo.llave as LLavesMultiples] = validacion;
    }
  });

  proyectos.push(respuesta);
}

function validarValorMultiple(valor: string, lista: ElementoLista[], tipo: LLavesMultiples) {
  if (!valor) return null;
  const partes = separarPartes(valor);
  const nombres: string[] = [];

  partes.forEach((valorCrudo, i) => {
    const valor = valorCrudo.trim();

    if (enMinusculas(valor.charAt(0)) && i > 0) {
      nombres[i - 1] += `, ${valor}`;
      return '';
    } else {
      nombres.push(valor);
    }
  });

  const respuesta: DefinicionSimple[] = [];

  nombres.forEach((elemento) => {
    const valorProcesado = validarValorSingular(elemento, lista, tipo);

    if (valorProcesado) respuesta.push(valorProcesado);
  });

  return respuesta.length ? respuesta : null;
}

function validarValorSingular(valor: string, lista: ElementoLista[], tipo?: LLavesMultiples) {
  if (!valor || valor === 'No aplica' || valor === 'undefined' || valor === 'Sin Información') return;
  const nombre = `${valor}`.trim();
  const slug = slugificar(nombre);
  const existe = lista.find((obj) => obj.slug === slug);

  if (!existe) {
    const objeto: ElementoLista = { nombre, conteo: 1, slug, relaciones: [], proyectos: [] };

    // Agregar ID de Academia para mostrar red
    if (tipo === 'lideres' && personas[objeto.nombre]) {
      objeto.academia = personas[objeto.nombre];
    }

    lista.push(objeto);
  } else {
    existe.conteo++;
  }

  return { nombre, slug };
}

function validarAño(valorAño: string) {
  if (!validarAño.length || valorAño === 'undefined' || valorAño.toLowerCase() === 'no aplica') return;
  const añoProcesado: Año = {
    años: [],
    tipo: 'singular',
    valor: ''
  };

  if (valorAño.includes(',')) {
    const partes = valorAño.split(',');

    partes.forEach((año) => {
      validarValorSingular(año, listas.años);
    });

    añoProcesado.años = partes.map((año) => +año);
    añoProcesado.tipo = 'multiples';
    añoProcesado.valor = valorAño;
  } else if (valorAño.includes('-')) {
    const [inicio, fin] = valorAño.split('-');

    for (let a = +inicio; a <= +fin; a++) {
      validarValorSingular(`${a}`, listas.años);
      añoProcesado.años.push(a);
    }

    añoProcesado.tipo = 'rango';
    añoProcesado.valor = valorAño;
  } else if (valorAño) {
    validarValorSingular(valorAño, listas.años);
    añoProcesado.años.push(+valorAño);
    añoProcesado.valor = valorAño;
  }

  return añoProcesado;
}
