import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { DefinicionSimple, ElementoLista, CamposEgresados, ListasEgresados, Egresado } from '../src/tipos.js';
import { guardarJSON, ordenarListaObjetos, separarPartes } from './ayudas.js';

const camposEgresados: CamposEgresados = [
  { llave: 'ambitos', indice: 4 },
  { llave: 'paises', indice: 6 },
  { llave: 'temas', indice: 3 },
  { llave: 'ciudades', indice: 5 },
  { llave: 'graduacion', indice: 1 }
];

export default async function procesarEgresados(
  archivo: string,
  listasEgresados: ListasEgresados
): Promise<Egresado[]> {
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
        fila.formatted.arr[1] = `${fila.formatted.arr[1]}`;
        const datosFila = fila.formatted.arr;
        const egresado: Egresado = { nombre: datosFila[0].trim(), id: numeroFila - 2 };

        const añoGraduacion = validarValorSingular(datosFila[1], listasEgresados.graduacion);
        if (añoGraduacion) egresado.graduacion = [añoGraduacion];

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
      for (const lista in listasEgresados) {
        ordenarListaObjetos(listasEgresados[lista as keyof ListasEgresados], 'slug', true);
      }
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

              // Si el egresado tiene datos en este campo
              if (datosEgresado) {
                // Sacar los slugs del campo
                const slugsCampoEgresado = Array.isArray(datosEgresado)
                  ? (datosEgresado as DefinicionSimple[]).map(({ slug }) => slug)
                  : [(datosEgresado as DefinicionSimple).slug];

                slugsCampoEgresado.forEach((slug) => {
                  const i = listasEgresados[llaveALlenar].findIndex((obj) => obj.slug === slug);

                  const elementosDondeConectar = Array.isArray(datosRelacion)
                    ? (datosRelacion as DefinicionSimple[]).map(({ slug }) => slug)
                    : [(datosRelacion as DefinicionSimple).slug];

                  elementosDondeConectar.forEach((elementoConector) => {
                    const elementoALlenar = listasEgresados[llaveDondeLllenar].find(
                      (obj) => obj.slug === elementoConector
                    );

                    if (elementoALlenar) {
                      const existe = elementoALlenar.relaciones.find((obj) => obj.slug === slug);

                      if (!elementoALlenar.egresados?.includes(id)) {
                        elementoALlenar.egresados?.push(id);
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
              } else {
                const elementosDondeConectar = Array.isArray(datosRelacion)
                  ? (datosRelacion as DefinicionSimple[]).map(({ slug }) => slug)
                  : [(datosRelacion as DefinicionSimple).slug];
                elementosDondeConectar.forEach((elementoConector) => {
                  const elementoALlenar = listasEgresados[llaveDondeLllenar].find(
                    (obj) => obj.slug === elementoConector
                  );

                  if (!elementoALlenar?.egresados?.includes(id)) {
                    elementoALlenar?.egresados?.push(id);
                  }
                });
              }
            }
          });
        });
      });

      guardarJSON(egresados, 'egresados');
      guardarJSON(listasEgresados, 'listasEgresados');
      resolver(egresados);
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
        lista.push({ nombre, conteo: 1, slug, relaciones: [], egresados: [] });
      } else {
        existe.conteo++;
      }
    }

    return { nombre, slug };
  }

  function validarValorMultiple(valor: string, lista: ElementoLista[]) {
    if (!valor) return null;
    const partes = separarPartes(valor);
    const respuesta: DefinicionSimple[] = [];

    partes.forEach((elemento) => {
      const valorProcesado = validarValorSingular(elemento, lista);
      if (valorProcesado) respuesta.push(valorProcesado);
    });

    return respuesta.length ? respuesta : null;
  }
}
