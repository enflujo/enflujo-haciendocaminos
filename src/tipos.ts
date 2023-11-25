export interface ElementoLista {
  nombre: string;
  slug: string;
  conteo: number;
  relaciones: { tipo: keyof Listas | string; conteo: number; indice: number; slug: string }[];
}
export type DefinicionSimple = { nombre: string; slug: string };
export type Años = [año: number, conteo: number][];
export type Año = { años: number[]; tipo: 'singular' | 'rango' | 'multiples'; valor: string };
export type Regiones = { nombre: string; slug: string; lon: number; lat: number; conteo: number }[];

export type LllavesSingulares = 'tipos' | 'roles';
export type LLavesMultiples =
  | 'decadas'
  | 'lideres'
  | 'participantes'
  | 'ramas'
  | 'temas'
  | 'objetos'
  | 'regiones'
  | 'lugares';

export type Proyecto = {
  nombre: DefinicionSimple;
  tipos?: DefinicionSimple;
  años?: Año;
  decadas?: DefinicionSimple[];
  lideres?: DefinicionSimple[];
  roles?: DefinicionSimple;
  participantes?: DefinicionSimple[];
  ramas?: DefinicionSimple[];
  temas?: DefinicionSimple[];
  objetos?: DefinicionSimple[];
  regiones?: DefinicionSimple[];
  lugares?: DefinicionSimple[];
};

export type Listas = {
  regiones: ElementoLista[];
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

export type Campos = { llave: LllavesSingulares | LLavesMultiples; indice: number }[];
