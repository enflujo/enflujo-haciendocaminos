import type {
  Año,
  Campos,
  DefinicionSimple,
  ElementoLista,
  LLavesMultiples,
  Listas,
  LlavesSingulares,
  OpcionBuscadorDatos,
  PersonaID,
  Proyecto
} from '../src/tipos.ts';
import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import { guardarJSON, ordenarListaObjetos } from './ayudas.js';
import { procesarLugares, procesarLugaresEgresados } from './lugares.js';
import procesarEgresados from './egresados.js';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { imageSize } from 'image-size';
import type { Egresado, ListasEgresados } from './egresados.js';
import procesarPersonas from './personas.js';

const datosEmpiezanEnFila = 2;
const camposSingulares: Campos = [{ llave: 'categorias', indice: 2 }];
const camposMultiples: Campos = [
  { llave: 'decadas', indice: 4 },
  { llave: 'lideres', indice: 5 },
  { llave: 'participantes', indice: 7 },
  { llave: 'ramas', indice: 8 },
  { llave: 'temas', indice: 9 },
  { llave: 'objetos', indice: 10 },
  { llave: 'paises', indice: 11 },
  { llave: 'municipios', indice: 14 }
];
const campos = [...camposSingulares, ...camposMultiples];

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
  decadas: []
};

const listasEgresados: ListasEgresados = {
  paises: [],
  temas: [],
  ambitos: [],
  ciudades: []
};

const archivo = './procesador/datos/Listado de proyectos - 60 años dpto antropología .xlsx';
let personas: PersonaID;

async function procesar() {
  personas = await procesarPersonas(archivo);

  const egresados = await procesarEgresados(archivo, listasEgresados);
  await procesarProyectos();
  console.log('Proyectos procesados');
  await procesarLugares(archivo, listas);

  console.log('fin de lugares');
  await procesarLugaresEgresados(archivo, listasEgresados);

  procesarDatosBuscador(egresados);
  console.log('listos datos buscador');

  console.log('fin');
}

procesar().catch(console.error);

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

  return new Promise((resolver) => {
    flujo.on('data', (fila) => {
      if (numeroFila > datosEmpiezanEnFila) {
        procesarFila(fila.formatted.arr);
      }

      numeroFila++;
    });

    flujo.on('close', () => {
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
                    : [datosRelacion.slug];

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
                const slugs = Array.isArray(datosCampo) ? datosCampo.map(({ slug }) => slug) : [datosCampo.slug];

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
        camposMultiples.forEach((campo) => {
          if (proyecto[campo.llave as LLavesMultiples])
            ordenarListaObjetos(proyecto[campo.llave as LLavesMultiples] as DefinicionSimple[], 'slug', true);
        });
      });

      guardarJSON(proyectos, 'proyectos');
      guardarJSON(listas, 'listas');
      resolver();
    });
  });
}

function procesarFila(fila: string[]) {
  const nombreProyecto = fila[1].trim();
  const respuesta: Proyecto = {
    id: +fila[0],
    nombre: { nombre: nombreProyecto, slug: slugificar(nombreProyecto) },
    descripcion: fila[16],
    enlaces: fila[17] && fila[17] !== 'No aplica' ? fila[17].trim().split(' ') : [],
    imagenes: []
  };
  const años = validarAño(`${fila[3]}`.trim());
  if (años) respuesta.años = años;

  if (fila[19] && fila[19] !== 'No aplica') {
    const nombresFotos = fila[19].split(',').map((nombre) => nombre.trim());
    const carpetaFotos = resolve('./estaticos/imgs/fotos', `${fila[0]}`);

    if (existsSync(carpetaFotos)) {
      const archivosEnCarpeta = readdirSync(carpetaFotos);

      nombresFotos.forEach((nombreFoto) => {
        const versionesFoto = archivosEnCarpeta.filter((nombre) => nombre.includes(nombreFoto));
        const indicePeque = versionesFoto.findIndex((version) => version.includes('_p.'));
        const indiceGrande = versionesFoto.findIndex((version) => !version.includes('_p.'));
        if (indiceGrande < 0) {
          return;
        }
        const datosImgGrande = imageSize(resolve(carpetaFotos, versionesFoto[indiceGrande]));

        const datosImg = {
          grande: versionesFoto[indiceGrande],
          peque: versionesFoto[indicePeque],
          ancho: datosImgGrande.width ? datosImgGrande.width : 0,
          alto: datosImgGrande.height ? datosImgGrande.height : 0
        };

        respuesta.imagenes?.push(datosImg);
      });
    }
  }

  camposSingulares.forEach((campo) => {
    const validacion = validarValorSingular(fila[campo.indice], listas[campo.llave]);
    if (validacion) respuesta[campo.llave as LlavesSingulares] = validacion;
  });

  camposMultiples.forEach((campo) => {
    const validacion = validarValorMultiple(fila[campo.indice], listas[campo.llave], campo.llave);
    if (validacion) respuesta[campo.llave as LLavesMultiples] = validacion;
  });

  proyectos.push(respuesta);
}

function validarValorMultiple(valor: string, lista: ElementoLista[], tipo: LLavesMultiples | 'categorias') {
  if (!valor) return null;
  const partes = `${valor}`.trim().split(',');
  const respuesta: DefinicionSimple[] = [];

  partes.forEach((elemento) => {
    const valorProcesado = validarValorSingular(elemento, lista, tipo);

    if (valorProcesado) respuesta.push(valorProcesado);
  });

  return respuesta.length ? respuesta : null;
}

function validarValorSingular(valor: string, lista: ElementoLista[], tipo?: LLavesMultiples | LlavesSingulares) {
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
  if (!validarAño.length || valorAño === 'undefined') return;
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
