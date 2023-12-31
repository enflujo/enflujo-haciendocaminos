import type {
  Año,
  Campos,
  DefinicionSimple,
  ElementoLista,
  LLavesMultiples,
  Listas,
  LllavesSingulares,
  Proyecto,
} from '../src/tipos.ts';
import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import { guardarJSON, ordenarListaObjetos } from './ayudas.js';

const datosEmpiezanEnFila = 2;
const camposSingulares: Campos = [
  { llave: 'tipos', indice: 1 },
  { llave: 'roles', indice: 5 },
];
const camposMultiples: Campos = [
  { llave: 'decadas', indice: 3 },
  { llave: 'lideres', indice: 4 },
  { llave: 'participantes', indice: 6 },
  { llave: 'ramas', indice: 7 },
  { llave: 'temas', indice: 8 },
  { llave: 'objetos', indice: 9 },
  { llave: 'regiones', indice: 10 },
  { llave: 'lugares', indice: 11 },
];
const campos = [...camposSingulares, ...camposMultiples];

const proyectos: Proyecto[] = [];

const listas: Listas = {
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

procesar();

async function procesar() {
  const flujo = await getXlsxStream({
    filePath: './procesador/Listado de proyectos - 60 años dpto antropología .xlsx',
    sheet: 'Proyectos',
    withHeader: false,
    ignoreEmpty: true,
  });

  let numeroFila = 1;

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
      campos.forEach((campoRelacion) => {
        const datosRelacion = proyecto[campoRelacion.llave];

        campos.forEach((campo) => {
          // Agregar datos de cada campo en todos los otros, excepto en si mismo.
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

                    if (!existe) {
                      elementoALlenar.relaciones.push({
                        conteo: 1,
                        indice: i,
                        tipo: llaveALlenar,
                        slug,
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

    guardarJSON(proyectos, 'proyectos');
    guardarJSON(listas, 'listas');
    console.log('fin');
  });
}

function procesarFila(fila: string[]) {
  const nombreProyecto = fila[0].trim();
  const respuesta: Proyecto = {
    nombre: { nombre: nombreProyecto, slug: slugificar(nombreProyecto) },
  };
  const años = validarAño(`${fila[2]}`.trim());
  if (años) respuesta.años = años;

  camposSingulares.forEach((campo) => {
    const validacion = validarValorSingular(fila[campo.indice], listas[campo.llave]);
    if (validacion) respuesta[campo.llave as LllavesSingulares] = validacion;
  });

  camposMultiples.forEach((campo) => {
    const validacion = validarValorMultiple(fila[campo.indice], listas[campo.llave]);
    if (validacion) respuesta[campo.llave as LLavesMultiples] = validacion;
  });

  proyectos.push(respuesta);
}

function validarValorMultiple(valor: string, lista: ElementoLista[]) {
  if (!valor) return null;
  const partes = `${valor}`.trim().split(',');
  const respuesta: DefinicionSimple[] = [];

  partes.forEach((elemento) => {
    const valorProcesado = validarValorSingular(elemento, lista);
    if (valorProcesado) respuesta.push(valorProcesado);
  });

  return respuesta.length ? respuesta : null;
}

function validarValorSingular(valor: string, lista: ElementoLista[]) {
  if (!valor || valor === 'No aplica' || valor === 'undefined' || valor === 'Sin Información') return;
  const nombre = `${valor}`.trim();
  const slug = slugificar(nombre);
  const existe = lista.find((obj) => obj.slug === slug);

  if (!existe) {
    lista.push({ nombre, conteo: 1, slug, relaciones: [] });
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
    valor: '',
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
