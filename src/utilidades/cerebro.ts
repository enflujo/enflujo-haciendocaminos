import { atom, map, onMount } from 'nanostores';
import { pedirDatos } from './ayudas';
import type { Lista, Proyectos } from '@/tipos';

export const proyectos = atom<Proyectos>([]);
export const listas = map<Lista>();

onMount(proyectos, () => {
  
});

onMount(listas, () => {
  pedirDatos<Lista>(`${import.meta.env.BASE_URL}listas.json`).then((res) => {
    listas.set(res);

    pedirDatos<Proyectos>(`${import.meta.env.BASE_URL}proyectos.json`).then((res) => {
      proyectos.set(res);
    });
  });

  
});
