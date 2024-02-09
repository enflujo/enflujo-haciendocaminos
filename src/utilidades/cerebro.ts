import { atom, map, onMount } from 'nanostores';
import { pedirDatos } from './ayudas';
import type { Ficha, Proyecto } from '@/tipos';

export const datosProyectos = atom<Proyecto[]>([]);
export const datosFicha = map<Ficha>({ visible: false });

onMount(datosProyectos, () => {
  pedirDatos<Proyecto[]>(`${import.meta.env.BASE_URL}/proyectos.json`).then((res) => {
    datosProyectos.set(res);
  });
});
