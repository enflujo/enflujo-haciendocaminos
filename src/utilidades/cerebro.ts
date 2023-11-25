import { atom, map, onMount } from 'nanostores';
import { pedirDatos } from './ayudas';
import type { Listas, Proyecto } from '@/tipos';

export const proyectos = atom<Proyecto[]>([]);
export const listas = map<Listas>();

onMount(proyectos, () => {});

onMount(listas, () => {
  pedirDatos<Listas>(`${import.meta.env.BASE_URL}listas.json`).then((res) => {
    listas.set(res);

    pedirDatos<Proyecto[]>(`${import.meta.env.BASE_URL}proyectos.json`).then((res) => {
      proyectos.set(res);
    });
  });
});
