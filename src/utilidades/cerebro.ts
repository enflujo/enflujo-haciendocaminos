import { atom, map, onMount } from 'nanostores';
import { pedirDatos } from './ayudas';
import type { Listas, Ficha, Proyecto } from '@/tipos';
import type { FeatureCollection } from 'geojson';

export const datosProyectos = atom<Proyecto[]>([]);
export const datosFicha = map<Ficha>({ visible: false });
export const datosListas = map<Listas>();
export const geo = map<FeatureCollection>();
let _copiaDatosMapa: FeatureCollection;

onMount(datosListas, () => {
  pedirDatos<Listas>(`${import.meta.env.BASE_URL}/listas.json`).then((res) => {
    datosListas.set(res);

    pedirDatos<Proyecto[]>(`${import.meta.env.BASE_URL}/proyectos.json`).then((res) => {
      const datosOrdenados = res.sort((a, b) => {
        if (a.nombre.slug < b.nombre.slug) return -1;
        else if (a.nombre.slug > b.nombre.slug) return 1;
        return 0;
      });

      datosProyectos.set(datosOrdenados);
    });
  });
});

onMount(geo, () => {
  pedirDatos<FeatureCollection>(`${import.meta.env.BASE_URL}/datosMapa.geo.json`).then((res) => {
    geo.set(res);
    _copiaDatosMapa = res;
  });
});

export function filtrarMapa(lugares: string[]) {
  const lugaresFiltrados = _copiaDatosMapa?.features.filter((lugar) => lugares.includes(lugar.properties?.slug));
  if (lugaresFiltrados) {
    geo.setKey('features', lugaresFiltrados);
  }
}
