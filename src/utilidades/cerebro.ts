import { atom, map, onMount } from 'nanostores';
import { pedirDatos } from './ayudas';
import type { Listas, Ficha, Proyecto } from '@/tipos';

export const datosProyectos = atom<Proyecto[]>([]);
export const datosFicha = map<Ficha>({ visible: false });
export const datosListas = map<Listas>();

onMount(datosListas, () => {
  pedirDatos<Listas>(`${import.meta.env.BASE_URL}/listas.json`).then((res) => {
    datosListas.set(res);

    pedirDatos<Proyecto[]>(`${import.meta.env.BASE_URL}/proyectos.json`).then((res) => {
      datosProyectos.set(res);
    });
  });
});
