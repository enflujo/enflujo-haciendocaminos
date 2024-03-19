import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { Listas, Lugar, TiposLugares } from '../src/tipos.js';
import { guardarJSON } from './ayudas.js';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { ListasEgresados } from './egresados.js';

export async function procesarLugares(archivo: string, listas: Listas): Promise<void> {
  return new Promise(async (resolver) => {
    const flujoLugares = await getXlsxStream({
      filePath: archivo,
      sheet: 'lugares',
      withHeader: true,
      ignoreEmpty: true
    });

    const lugares: Lugar[] = [];
    const geojson: FeatureCollection = { type: 'FeatureCollection', features: [] };

    flujoLugares.on('data', (fila) => {
      const datos = fila.formatted.arr;
      const nombreLugar = datos[0].trim();
      const slug = slugificar(nombreLugar);
      const longitud = datos[6];
      const latitud = datos[5];
      let conteo = 0;
      let tipo: TiposLugares = 'municipios';

      const esMunicipio = listas.municipios.find((elemento) => elemento.slug === slug);

      if (esMunicipio) {
        conteo = esMunicipio.conteo;
      } else {
        const esDepartamento = listas.departamentos.find((dep) => dep.slug === slug);

        if (esDepartamento) {
          conteo = esDepartamento.conteo;
          tipo = 'departamentos';
        } else {
          const esPais = listas.paises.find((pais) => pais.slug === slug);

          if (esPais) {
            conteo = esPais.conteo;
            tipo = 'paises';
          }
        }
      }

      const respuesta: Lugar = {
        nombre: nombreLugar,
        slug: slug,
        lon: +longitud,
        lat: +latitud,
        conteo,
        tipo
      };

      if (respuesta.lon && respuesta.lat) {
        lugares.push(respuesta);
      }
    });

    flujoLugares.on('close', () => {
      procesarDatosMapa();
      guardarJSON(geojson, 'datosMapa.geo');

      resolver();
    });

    // Función para crear geojson con lugares y cantidad de proyectos por lugar
    function procesarDatosMapa() {
      for (let lugar in lugares) {
        const datosLugar = lugares[lugar];
        const conteo = datosLugar.conteo;

        const elemento: Feature<Point> = {
          type: 'Feature',
          properties: {
            slug: datosLugar.slug,
            nombre: datosLugar.nombre,
            tipo: datosLugar.tipo,
            conteo
          },
          geometry: { type: 'Point', coordinates: [datosLugar.lon, datosLugar.lat] }
        };

        if (conteo > 0) {
          geojson.features.push(elemento);
        }
      }
    }
  });
}

export async function procesarLugaresEgresados(archivo: string, listas: ListasEgresados): Promise<void> {
  return new Promise(async (resolver) => {
    const flujoLugares = await getXlsxStream({
      filePath: archivo,
      sheet: 'lugares',
      withHeader: false,
      ignoreEmpty: true
    });

    let numeroFila = 1;
    const lugares: Lugar[] = [];
    const geojson: FeatureCollection = { type: 'FeatureCollection', features: [] };

    flujoLugares.on('data', (fila) => {
      if (numeroFila > 2) {
        procesarLugar(fila.formatted.arr);
      } else {
      }

      numeroFila++;
    });

    flujoLugares.on('close', () => {
      procesarDatosMapaEgresados();
      guardarJSON(geojson, 'datosMapaEgresados.geo');
      resolver();
    });

    function procesarLugar(fila: string[]) {
      const nombreLugar = fila[0].trim();
      const slug = slugificar(nombreLugar);
      const longitud = fila[6];
      const latitud = fila[5];
      const lugar = listas.ciudades.filter((elemento) => elemento.slug === slug);
      const conteo = lugar[0] ? lugar[0].conteo : 0;

      const respuesta: Lugar = {
        nombre: nombreLugar,
        slug: slug,
        lon: +longitud,
        lat: +latitud,
        conteo,
        tipo: 'ciudades'
      };

      if (respuesta.lon && respuesta.lat) {
        lugares.push(respuesta);
      }
    }

    // Función para crear geojson con lugares y cantidad de proyectos por lugar
    function procesarDatosMapaEgresados() {
      for (let lugar in lugares) {
        const datosLugar = lugares[lugar];
        const conteo = datosLugar.conteo;

        const elemento: Feature<Point> = {
          type: 'Feature',
          properties: {
            slug: datosLugar.slug,
            nombre: datosLugar.nombre,
            tipo: datosLugar.tipo,
            conteo
          },
          geometry: { type: 'Point', coordinates: [datosLugar.lon, datosLugar.lat] }
        };

        if (conteo > 0) {
          geojson.features.push(elemento);
        }
      }
    }
  });
}
