export interface ElementoLista {
  nombre: string;
  slug: string;
  conteo: number;
}
export type DefinicionSimple = { nombre: string; slug: string };
export type Años = [año: number, conteo: number][];
export type Año = { años: number[]; tipo: 'singular' | 'rango' | 'multiples'; valor: string };
export type Regiones = { nombre: string; lon: number; lat: number; conteo: number }[];

export type Proyectos = {
  nombre: DefinicionSimple;
  tipo: DefinicionSimple;
  años: Año;
  decada: DefinicionSimple;
  lideres: DefinicionSimple[];
  rol: DefinicionSimple;
  participantes: DefinicionSimple[];
  ramas: DefinicionSimple[];
  temas: DefinicionSimple[];
  objetos: DefinicionSimple[];
  regiones: DefinicionSimple[];
  lugares: DefinicionSimple[];
}[];

export type Lista = {
  regiones: Regiones;
  años: ElementoLista[];
  tipos: ElementoLista[];
  lideres: ElementoLista[];
  roles: ElementoLista[];
  participantes: ElementoLista[];
  ramas: ElementoLista[];
  temas: ElementoLista[];
  objetos: ElementoLista[];
  lugares: ElementoLista[];
  decadas: ElementoLista[];
};
