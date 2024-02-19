import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { DefinicionSimple, ElementoLista, CamposEgresados } from '../src/tipos.js';
import { guardarJSON, ordenarListaObjetos } from './ayudas.js';

export interface Egresado {
  id: number;
  nombre: string;
  graduacion?: string;
  institucion?: DefinicionSimple;
  temas?: DefinicionSimple[];
  ambitos?: DefinicionSimple[];
  ciudades?: DefinicionSimple[];
  paises?: DefinicionSimple[];
}

export interface ListasEgresados {
  temas: ElementoLista[];
  ambitos: ElementoLista[];
  paises: ElementoLista[];
  ciudades: ElementoLista[];
}

const camposMultiplesEgresados: CamposEgresados = [
  { llave: 'ambitos', indice: 4 },
  { llave: 'paises', indice: 6 },
  { llave: 'temas', indice: 3 },
  { llave: 'ciudades', indice: 5 }
];

const camposEgresados = [...camposMultiplesEgresados];

export default async function procesarEgresados(archivo: string, listasEgresados: ListasEgresados): Promise<void> {
  const egresados: Egresado[] = [];

  return new Promise(async (resolver) => {
    const flujo = await getXlsxStream({
      filePath: archivo,
      sheet: 'Egresados',
      withHeader: false,
      ignoreEmpty: true
    });

    let numeroFila = 1;

    flujo.on('data', (fila) => {
      if (numeroFila > 2) {
        const datosFila = fila.formatted.arr;
        const egresado: Egresado = { nombre: datosFila[0].trim(), id: numeroFila - 2 };

        const añoGraduacion = datosFila[1] ? `${datosFila[1]}` : null;
        if (añoGraduacion && añoGraduacion.trim().toLocaleLowerCase() !== 'no disponible')
          egresado.graduacion = añoGraduacion.trim();

        const institucion = validarValorSingular(datosFila[2]);
        if (institucion) egresado.institucion = institucion;

        const temas = validarValorMultiple(datosFila[3], listasEgresados.temas);
        if (temas && temas.length) egresado.temas = temas;

        const ambitos = validarValorMultiple(datosFila[4], listasEgresados.ambitos);
        if (ambitos && ambitos.length) egresado.ambitos = ambitos;

        const ciudades = validarValorMultiple(datosFila[5], listasEgresados.ciudades);
        if (ciudades && ciudades.length) egresado.ciudades = ciudades;

        const paises = validarValorMultiple(datosFila[6], listasEgresados.paises);
        if (paises) egresado.paises = paises;

        egresados.push(egresado);
      }

      numeroFila++;
    });

    flujo.on('close', () => {
      ordenarListaObjetos(egresados, 'slug', true);

      egresados.forEach((egresado) => {
        const id = egresado.id;

        camposEgresados.forEach((campoRelacion) => {
          const datosRelacion = egresado[campoRelacion.llave];

          camposEgresados.forEach((campo) => {
            // Agregar datos de cada campo en todos los otros, excepto en sí mismo.
            if (campoRelacion.llave !== campo.llave && datosRelacion) {
              const llaveALlenar = campo.llave;
              const llaveDondeLllenar = campoRelacion.llave;
              const datosEgresado = egresado[llaveALlenar];

              // Si el proyecto tiene datos en este campo
              if (datosEgresado) {
                // Sacar los slugs del campo
                const slugsCampoProyecto = Array.isArray(datosEgresado)
                  ? (datosEgresado as DefinicionSimple[]).map(({ slug }) => slug)
                  : [(datosEgresado as DefinicionSimple).slug];

                slugsCampoProyecto.forEach((slug) => {
                  const i = listasEgresados[llaveALlenar].findIndex((obj) => obj.slug === slug);
                  const elementosDondeConectar = Array.isArray(datosRelacion)
                    ? (datosRelacion as DefinicionSimple[]).map(({ slug }) => slug)
                    : [datosRelacion];

                  elementosDondeConectar.forEach((elementoConector) => {
                    const elementoALlenar = listasEgresados[llaveDondeLllenar].find(
                      (obj) => obj.slug === elementoConector
                    );

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
      });

      console.log('fin egresados');
      guardarJSON(egresados, 'egresados');
      guardarJSON(listasEgresados, 'listasEgresados');
      resolver();
    });
  });

  function validarValorSingular(valor: string, lista?: ElementoLista[]) {
    if (
      !valor ||
      valor.toLocaleLowerCase() === 'no disponible' ||
      valor === 'No aplica' ||
      valor === 'undefined' ||
      valor === 'Sin Información'
    )
      return;
    const nombre = `${valor}`.trim();
    const slug = slugificar(nombre);

    if (lista) {
      const existe = lista.find((obj) => obj.slug === slug);

      if (!existe) {
        lista.push({ nombre, conteo: 1, slug, relaciones: [] });
      } else {
        existe.conteo++;
      }
    }

    return { nombre, slug };
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
}
