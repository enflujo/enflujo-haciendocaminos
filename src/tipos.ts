export interface ElementoLista {
  nombre: string;
  descripcion?: string;
  slug: string;
  conteo: number;
  relaciones: { tipo: keyof Listas | string; conteo: number; indice: number; slug: string }[];
  proyectos?: number[];
  egresados?: number[];
  academia?: number;
}
export type DefinicionSimple = { nombre: string; slug: string };
export type Años = [año: number, conteo: number][];
export type Año = { años: number[]; tipo: 'singular' | 'rango' | 'multiples'; valor: string };
export type Regiones = { nombre: string; slug: string; lon: number; lat: number; conteo: number }[];
export type Municipios = { nombre: string; slug: string; lon: number; lat: number; conteo: number }[];

export type LLavesMultiples =
  | 'decadas'
  | 'vinculaciones'
  | 'lideres'
  | 'participantes'
  | 'ramas'
  | 'temas'
  | 'objetos'
  | 'regiones'
  | 'departamentos'
  | 'paises'
  | 'municipios'
  | 'categorias';

export type LlavesListasEgresados = 'ambitos' | 'ciudades' | 'paises' | 'temas';

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
  categorias?: DefinicionSimple[];
  años?: Año;
  decadas?: DefinicionSimple[];
  lideres?: DefinicionSimple[];
  participantes?: DefinicionSimple[];
  ramas?: DefinicionSimple[];
  temas?: DefinicionSimple[];
  objetos?: DefinicionSimple[];
  paises?: DefinicionSimple[];
  municipios?: DefinicionSimple[];
  regiones?: DefinicionSimple[];
  departamentos?: DefinicionSimple[];
  enlaces?: string[];
  videos?: string[];
  documentos?: string[];
  imagenes?: DatosImg[];
  vinculaciones?: DefinicionSimple[];
};

export type Listas = {
  paises: ElementoLista[];
  años: ElementoLista[];
  categorias: ElementoLista[];
  lideres: ElementoLista[];
  participantes: ElementoLista[];
  ramas: ElementoLista[];
  temas: ElementoLista[];
  objetos: ElementoLista[];
  municipios: ElementoLista[];
  decadas: ElementoLista[];
  regiones: ElementoLista[];
  departamentos: ElementoLista[];
  vinculaciones: ElementoLista[];
};

export type Campos = { llave: LLavesMultiples; indice: number; procesarAparte?: boolean }[];
export type TiposLugaresProyectos = 'municipios' | 'departamentos' | 'paises';
export type TiposLugaresEgresados = 'ciudades' | 'paises';
export type TiposLugares = TiposLugaresProyectos | TiposLugaresEgresados;

export type Lugar = {
  nombre: string;
  slug: string;
  lat: number;
  lon: number;
  conteo: number;
  tipo: TiposLugares;
};

export interface ElementoFicha {
  nombre: string;
  slug: string;
  conteo?: number;
  apellido?: string; // Sólo para lideres
  nombreCompleto?: string; // Sólo para lideres
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
  años?: ElementoFicha[];
  paises?: ElementoFicha[];
  categorias?: ElementoFicha[];
  lideres?: ElementoFicha[];
  vinculaciones?: ElementoFicha[];
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
  regiones?: ElementoFicha[];
  departamentos?: ElementoFicha[];
  graduacion?: ElementoFicha[];
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
  academia?: number;
  videos?: string[];
  documentos?: string[];
}

// Tipos egresados
export type CamposEgresados = { llave: LLavesMultiplesEgresados | 'graduacion'; indice: number }[];
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
  id: string;
  vista: 'proyectos' | 'egresados';
}

export interface ElementoBuscador extends OpcionBuscadorDatos {
  opcion: HTMLLIElement;
}

export interface PersonaID {
  [nombre: string]: number;
}

export interface Egresado {
  id: number;
  nombre: string;
  graduacion?: DefinicionSimple[];
  institucion?: DefinicionSimple;
  temas?: DefinicionSimple[];
  ambitos?: DefinicionSimple[];
  ciudades?: DefinicionSimple[];
  paises?: DefinicionSimple[];
}

export interface ListasEgresados {
  temas: ElementoLista[];
  ambitos: ElementoLista[];
  paises: ElementoLista[];
  ciudades: ElementoLista[];
  graduacion: ElementoLista[];
}
