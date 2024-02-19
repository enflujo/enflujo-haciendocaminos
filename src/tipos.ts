export interface ElementoLista {
  nombre: string;
  slug: string;
  conteo: number;
  relaciones: { tipo: keyof Listas | string; conteo: number; indice: number; slug: string }[];
  proyectos?: number[];
  egresados?: number[];
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

export interface DatosImg {
  grande: string;
  peque: string;
  ancho: number;
  alto: number;
}

export type Proyecto = {
  id: number;
  nombre: DefinicionSimple;
  descripcion?: string;
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
  enlaces?: string[];
  imagenes?: DatosImg[];
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
  conteo?: number;
}

export interface ElementoProyecto {
  nombre: string;
  id: number;
}

export interface ElementoEgresado {
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
  proyecto?: ElementoProyecto[];
  egresado?: ElementoEgresado[];
  ambitos?: ElementoFicha[];
  ciudades?: ElementoFicha[];
}

export interface Ficha extends RelacionesFicha {
  lista?: string;
  titulo?: string;
  visible: boolean;
  conteo?: string;
  descripcion?: string;
  enlaces?: string[];
  imagenes?: DatosImg[];
  id?: number;
}

// Tipos egresados
export type CamposEgresados = { llave: LLavesMultiplesEgresados; indice: number }[];
export type LLavesMultiplesEgresados = 'ambitos' | 'temas' | 'paises' | 'ciudades';

export interface ElementoListaEgresados {
  nombre: string;
  slug: string;
  conteo: number;
  relaciones: { tipo: keyof Listas | string; conteo: number; indice: number; slug: string }[];
  egresados?: number[];
}

export interface OpcionBuscadorDatos {
  nombre: string;
  tipo: string;
}

export interface ElementoBuscador extends OpcionBuscadorDatos {
  opcion: HTMLLIElement;
}
