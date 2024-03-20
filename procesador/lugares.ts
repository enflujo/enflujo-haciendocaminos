import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { Listas, Lugar, TiposLugares } from '../src/tipos.js';
import { guardarJSON } from './ayudas.js';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { ListasEgresados } from './egresados.js';

function procesarDatosMapa(lugares: Lugar[]) {
  const geojson: FeatureCollection = { type: 'FeatureCollection', features: [] };

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

  return geojson;
}

function agregarLugarALista(
  nombre: string,
  slug: string,
  lon: number,
  lat: number,
  conteo: number,
  tipo: TiposLugares,
  lista: Lugar[]
) {
  const respuesta: Lugar = {
    nombre,
    slug,
    lon,
    lat,
    conteo,
    tipo
  };

  if (respuesta.lon && respuesta.lat) {
    lista.push(respuesta);
  }
}

export async function procesarLugares(archivo: string, listas: Listas, listasE: ListasEgresados): Promise<void> {
  return new Promise(async (resolver) => {
    const flujoLugares = await getXlsxStream({
      filePath: archivo,
      sheet: 'lugares',
      withHeader: true,
      ignoreEmpty: true
    });

    const lugaresProyectos: Lugar[] = [];
    const lugaresEgresados: Lugar[] = [];

    flujoLugares.on('data', (fila) => {
      const datos = fila.formatted.arr;
      const nombreLugar = datos[0].trim();
      const slug = slugificar(nombreLugar);
      const longitud = datos[6];
      const latitud = datos[5];

      const mun = listas.municipios.find((m) => m.slug === slug);
      if (mun) agregarLugarALista(nombreLugar, slug, +longitud, +latitud, mun.conteo, 'municipios', lugaresProyectos);

      const dep = listas.departamentos.find((d) => d.slug === slug);
      if (dep)
        agregarLugarALista(nombreLugar, slug, +longitud, +latitud, dep.conteo, 'departamentos', lugaresProyectos);

      const pais = listas.paises.find((p) => p.slug === slug);
      if (pais) agregarLugarALista(nombreLugar, slug, +longitud, +latitud, pais.conteo, 'paises', lugaresProyectos);

      // Egresados
      const ciudad = listasE.ciudades.find((c) => c.slug === slug);
      if (ciudad)
        agregarLugarALista(nombreLugar, slug, +longitud, +latitud, ciudad.conteo, 'ciudades', lugaresEgresados);

      const paisE = listasE.paises.find((p) => p.slug === slug);
      if (paisE) agregarLugarALista(nombreLugar, slug, +longitud, +latitud, paisE.conteo, 'paises', lugaresEgresados);
    });

    flujoLugares.on('close', () => {
      guardarJSON(procesarDatosMapa(lugaresProyectos), 'datosMapa.geo');
      guardarJSON(procesarDatosMapa(lugaresEgresados), 'datosMapaEgresados.geo');
      resolver();
    });
  });
}
