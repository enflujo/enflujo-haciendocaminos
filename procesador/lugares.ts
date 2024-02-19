import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { Listas, Lugar } from '../src/tipos.js';
import { guardarJSON } from './ayudas.js';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { ListasEgresados } from './egresados.js';

export async function procesarLugares(archivo: string, listas: Listas): Promise<void> {
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
      procesarDatosMapa();
      guardarJSON(geojson, 'datosMapa.geo');

      resolver();
    });

    function procesarLugar(fila: string[]) {
      const nombreLugar = fila[0].trim();
      const slug = slugificar(nombreLugar);
      const longitud = fila[6];
      const latitud = fila[5];
      const lugar = listas.municipios.filter((elemento) => elemento.slug === slug);
      const conteo = lugar[0] ? lugar[0].conteo : 0;

      const respuesta: Lugar = {
        nombre: nombreLugar,
        slug: slug,
        lon: +longitud,
        lat: +latitud,
        conteo
      };

      if (respuesta.lon && respuesta.lat) {
        lugares.push(respuesta);
      }
    }

    // Función para crear geojson con lugares y cantidad de proyectos por lugar
    function procesarDatosMapa() {
      for (let lugar in lugares) {
        const conteo = lugares[lugar].conteo;

        const elemento: Feature<Point> = {
          type: 'Feature',
          properties: {
            slug: lugares[lugar].slug,
            conteo
          },
          geometry: { type: 'Point', coordinates: [lugares[lugar].lon, lugares[lugar].lat] }
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
      console.log('listo');
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
        conteo
      };

      if (respuesta.lon && respuesta.lat) {
        lugares.push(respuesta);
      }
    }

    // Función para crear geojson con lugares y cantidad de proyectos por lugar
    function procesarDatosMapaEgresados() {
      for (let lugar in lugares) {
        const conteo = lugares[lugar].conteo;

        const elemento: Feature<Point> = {
          type: 'Feature',
          properties: {
            slug: lugares[lugar].slug,
            conteo
          },
          geometry: { type: 'Point', coordinates: [lugares[lugar].lon, lugares[lugar].lat] }
        };

        if (conteo > 0) {
          geojson.features.push(elemento);
        }
      }
    }
  });
}
