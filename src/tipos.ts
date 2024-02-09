export interface ElementoLista {
  nombre: string;
  slug: string;
  conteo: number;
  relaciones: { tipo: keyof Listas | string; conteo: number; indice: number; slug: string }[];
  proyectos: number[];
}
export type DefinicionSimple = { nombre: string; slug: string };
export type Años = [año: number, conteo: number][];
export type Año = { años: number[]; tipo: 'singular' | 'rango' | 'multiples'; valor: string };
export type Regiones = { nombre: string; slug: string; lon: number; lat: number; conteo: number }[];
export type Municipios = { nombre: string; slug: string; lon: number; lat: number; conteo: number }[];

export type LllavesSingulares = 'tipos' | 'roles';
export type LLavesMultiples =
  | 'decadas'
  | 'lideres'
  | 'participantes'
  | 'ramas'
  | 'temas'
  | 'objetos'
  | 'regiones'
  | 'municipios';

export type Proyecto = {
  id: number;
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
  municipios?: DefinicionSimple[];
};

export type Listas = {
  id: ElementoLista[];
  regiones: ElementoLista[];
  años: ElementoLista[];
  tipos: ElementoLista[];
  lideres: ElementoLista[];
  roles: ElementoLista[];
  participantes: ElementoLista[];
  ramas: ElementoLista[];
  temas: ElementoLista[];
  objetos: ElementoLista[];
  municipios: ElementoLista[];
  decadas: ElementoLista[];
};

export type Campos = { llave: LllavesSingulares | LLavesMultiples; indice: number }[];

export type Lugar = {
  nombre: string;
  slug: string;
  lat: number;
  lon: number;
  conteo: number;
};

export type elementoGeoJson = {
  type: string;
  properties: {
    slug: string;
    conteo: number;
  };
  geometry: { type: string; coordinates: [number, number] };
};

export interface Ficha {
  lista?: string;
  titulo?: string;
  visible: boolean;
  conteo?: string;
}
