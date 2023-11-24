export interface ElementoLista {
  nombre: string;
  slug: string;
  conteo: number;
}
export type DefinicionSimple = {nombre: string; slug: string;};
export type Años = [año: number, conteo: number][];
export type Año = { años: number[]; tipo: 'singular' | 'rango' | 'multiples'; valor: string };
export type Regiones = { nombre: string; lon: number; lat: number; conteo: number }[];

export type Proyectos = {
  nombre: string;
  tipo: DefinicionSimple;
  años: Año;
  decada: string;
  lideres: DefinicionSimple[];
  rol: DefinicionSimple;
  participantes: DefinicionSimple[];
  ramas: string[];
  temas: string[];
  objetos: string[];
  regiones: string[];
  lugares: string[];
}[];

export type Lista = {
  regiones: Regiones;
  años: ElementoLista[];
  tipos: ElementoLista[];
  lideres: ElementoLista[];
  roles: ElementoLista[];
  participantes: ElementoLista[];
};
