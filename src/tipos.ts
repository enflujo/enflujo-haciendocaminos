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

export type LllavesSingulares = 'categorias' | 'roles';
export type LLavesMultiples =
  | 'decadas'
  | 'lideres'
  | 'participantes'
  | 'ramas'
  | 'temas'
  | 'objetos'
  | 'paises'
  | 'municipios';

export type Proyecto = {
  id: number;
  nombre: DefinicionSimple;
  categorias?: DefinicionSimple;
  años?: Año;
  decadas?: DefinicionSimple[];
  lideres?: DefinicionSimple[];
  roles?: DefinicionSimple;
  participantes?: DefinicionSimple[];
  ramas?: DefinicionSimple[];
  temas?: DefinicionSimple[];
  objetos?: DefinicionSimple[];
  paises?: DefinicionSimple[];
  municipios?: DefinicionSimple[];
};

export type Listas = {
  paises: ElementoLista[];
  años: ElementoLista[];
  categorias: ElementoLista[];
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

export interface ElementoFicha {
  nombre: string;
  slug: string;
  conteo: number;
}

export interface ELementoProyecto {
  nombre: string;
  id: number;
}

export interface RelacionesFicha {
  paises?: ElementoFicha[];
  categorias?: ElementoFicha[];
  lideres?: ElementoFicha[];
  roles?: ElementoFicha[];
  participantes?: ElementoFicha[];
  ramas?: ElementoFicha[];
  temas?: ElementoFicha[];
  objetos?: ElementoFicha[];
  municipios?: ElementoFicha[];
  decadas?: ElementoFicha[];
  proyecto?: ELementoProyecto[];
}

export interface Ficha extends RelacionesFicha {
  lista?: string;
  titulo?: string;
  visible: boolean;
  conteo?: string;
}
