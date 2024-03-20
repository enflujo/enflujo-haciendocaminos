import { atom, map } from 'nanostores';
import { ordenarListaObjetos, pedirDatos } from './ayudas';
import type {
  Listas,
  Ficha,
  Proyecto,
  ElementoProyecto,
  RelacionesFicha,
  ElementoFicha,
  ElementoEgresado,
  ElementoBuscador,
  OpcionBuscadorDatos,
  ElementoLista,
  DefinicionSimple,
  TiposLugaresProyectos,
  TiposLugaresEgresados,
  ListasEgresados,
  Egresado
} from '@/tipos';
import type { FeatureCollection, Point } from 'geojson';

export const datosProyectos = atom<Proyecto[]>([]);
export const datosFicha = map<Ficha>({ visible: false });
export const datosListas = map<Listas>();
export const datosEgresados = atom<Egresado[]>([]);
export const datosListasEgresados = map<ListasEgresados>();
export const geo = map<FeatureCollection<Point>>();
export const geoEgresados = map<FeatureCollection<Point>>();
export const elementoSeleccionado = map<{ tipo: string; id: string }>();
export const opcionesBuscador = atom<ElementoBuscador[] | null>(null);
export const vista = atom<'proyectos' | 'egresados' | null>(null);
let _copiaDatosMapa: FeatureCollection<Point>;
let _copiaDatosMapaEgresados: FeatureCollection<Point>;

export const nombresListasProyectos = {
  proyecto: 'Proyecto',
  paises: 'Países',
  categorias: 'Categorías',
  lideres: 'Líderes de Proyectos',
  participantes: 'Participantes',
  ramas: 'Ramas',
  temas: 'Áreas',
  objetos: 'Objetos de Análisis',
  municipios: 'Municipios',
  decadas: 'Décadas',
  años: 'Años',
  regiones: 'Regiones',
  departamentos: 'Departamentos'
};

export const nombresListasEgresados = {
  paises: 'Países',
  temas: 'Áreas',
  municipios: 'Municipios',
  años: 'Años',
  egresado: 'Egresado/a',
  ambitos: 'Ámbitos',
  ciudades: 'Ciudades'
};

const base = import.meta.env.BASE_URL;

vista.subscribe(async (vistaActual) => {
  if (!vistaActual) return;

  if (vistaActual === 'proyectos') {
    const geoProyectos = await pedirDatos<FeatureCollection<Point>>(`${base}/datosMapa.geo.json`);
    geo.set(geoProyectos);
    _copiaDatosMapa = geoProyectos;

    const listas = await pedirDatos<Listas>(`${base}/listas.json`);
    datosListas.set(listas);

    const proyectos = await pedirDatos<Proyecto[]>(`${base}/proyectos.json`);
    datosProyectos.set(proyectos);

    revisarVariablesURL();
  } else if (vistaActual === 'egresados') {
    const geoEgresados = await pedirDatos<FeatureCollection<Point>>(`${base}/datosMapaEgresados.geo.json`);
    geo.set(geoEgresados);
    _copiaDatosMapaEgresados = geoEgresados;

    const listasEgresados = await pedirDatos<ListasEgresados>(`${base}/listasEgresados.json`);
    datosListasEgresados.set(listasEgresados);

    const egresados = await pedirDatos<Egresado[]>(`${base}/egresados.json`);
    datosEgresados.set(egresados);

    revisarVariablesURL();
  }

  const datosBuscador = await pedirDatos<OpcionBuscadorDatos[]>(`${base}/datosBuscador.json`);
  const sugerencias = document.getElementById('sugerencias') as HTMLDataListElement;
  const opciones: ElementoBuscador[] = datosBuscador.map((opcion) => {
    const elemento = document.createElement('li');
    elemento.className = 'resultadoBusqueda';
    elemento.innerText = opcion.nombre;

    elemento.addEventListener('click', () => {
      sugerencias.classList.remove('visible');

      if (opcion.tipo)
        if (opcion.vista !== vistaActual) {
          const ruta = opcion.vista === 'proyectos' ? base : `${base}/egresados`;
          actualizarUrl(
            [
              { nombre: 'id', valor: opcion.id },
              { nombre: 'tipo', valor: opcion.tipo }
            ],
            true,
            ruta
          );
        } else {
          actualizarUrl([
            { nombre: 'id', valor: opcion.id },
            { nombre: 'tipo', valor: opcion.tipo }
          ]);
        }
    });

    return { opcion: elemento, ...opcion };
  });

  opcionesBuscador.set(opciones);
});

export function filtrarMapa(lugares?: { slug: string; conteo: number }[]) {
  if (lugares) {
    const vistaActual = vista.get();
    const fuente = vistaActual === 'proyectos' ? _copiaDatosMapa : _copiaDatosMapaEgresados;
    const lugaresFiltrados = fuente?.features.filter((lugar) =>
      lugares.find((obj) => obj.slug === lugar.properties?.slug)
    );

    lugaresFiltrados.forEach((punto) => {
      if (punto.properties) {
        const datosLugar = lugares.find((obj) => obj.slug === punto.properties?.slug);
        punto.properties.conteo = datosLugar?.conteo;
      }
    });

    if (lugaresFiltrados) {
      geo.setKey('features', lugaresFiltrados);
    }
  } else {
    if (vista.get() === 'proyectos') {
      geo.setKey('features', _copiaDatosMapa?.features);
    } else if (vista.get() === 'egresados') {
      geo.setKey('features', _copiaDatosMapaEgresados?.features);
    }
  }
}

function actualizarLugar(tipo: string, slug: string, conteo: number, relaciones: ElementoLista['relaciones']) {
  if (tipo === 'municipios' || tipo === 'departamentos' || tipo === 'paises' || tipo === 'ciudades') {
    filtrarMapa([{ slug, conteo }]);
  } else {
    const lugaresMapa = relaciones.filter((relacion) => {
      return (
        relacion.tipo === 'municipios' ||
        relacion.tipo === 'departamentos' ||
        relacion.tipo === 'paises' ||
        relacion.tipo === 'ciudades'
      );
    });

    filtrarMapa(
      lugaresMapa.map((lugar) => {
        return { slug: lugar.slug, conteo: lugar.conteo };
      })
    );
  }
}

function buscarLugares(tipo: 'proyectos' | 'egresados', datos: Proyecto | Egresado) {
  const lugares: { slug: string; conteo: number }[] = [];

  if (tipo === 'proyectos') {
    const { departamentos, municipios } = datos as Proyecto;
    if (municipios) lugares.push(...filtrar('municipios', municipios));
    if (departamentos) lugares.push(...filtrar('departamentos', departamentos));
  } else {
    const { ciudades } = datos as Egresado;
    if (ciudades) lugares.push(...filtrar('ciudades', ciudades));
  }

  if (datos.paises) lugares.push(...filtrar('paises', datos.paises));
  lugares.length ? filtrarMapa(lugares) : filtrarMapa([]);

  function filtrar(tipoLugar: 'municipios' | 'departamentos' | 'paises' | 'ciudades', lugares: DefinicionSimple[]) {
    const esProyectos = tipo === 'proyectos';

    const datosLugares = esProyectos
      ? datosListas.get()[tipoLugar as TiposLugaresProyectos]
      : datosListasEgresados.get()[tipoLugar as TiposLugaresEgresados];

    return lugares.map((obj) => {
      const lugar = datosLugares.find((l) => l.slug === obj.slug);
      return { slug: obj.slug, conteo: lugar ? lugar.conteo : 1 };
    });
  }
}

function agruparRelaciones(
  tipo: 'proyectos' | 'egresados',
  relaciones: ElementoLista['relaciones'],
  listas: Listas | ListasEgresados
) {
  return relaciones.reduce((lista: { [llave: string]: ElementoFicha[] }, valorActual) => {
    if (!lista[valorActual.tipo]) {
      lista[valorActual.tipo] = [];
    }
    const { nombre } =
      tipo === 'proyectos'
        ? (listas as Listas)[valorActual.tipo as keyof Listas][valorActual.indice]
        : (listas as ListasEgresados)[valorActual.tipo as keyof ListasEgresados][valorActual.indice];

    lista[valorActual.tipo].push({
      slug: valorActual.slug,
      conteo: valorActual.conteo,
      nombre
    });

    ordenarListaObjetos(lista[valorActual.tipo], 'slug', true);
    return lista;
  }, {});
}

elementoSeleccionado.subscribe((elemento) => {
  if (!Object.keys(elemento).length) return;

  const { tipo, id } = elemento;
  const enEgresados = window.location.pathname.includes('egresados');

  if (!enEgresados) {
    if (tipo === 'proyecto') {
      const datosProyecto = datosProyectos.get()[+id];
      if (!datosProyecto) return;

      buscarLugares('proyectos', datosProyecto);

      datosFicha.set({
        visible: true,
        lista: 'Proyecto',
        id: datosProyecto.id,
        titulo: datosProyecto.nombre.nombre,
        descripcion: datosProyecto.descripcion ? datosProyecto.descripcion : '',
        paises: datosProyecto.paises ? datosProyecto.paises : [],
        categorias: datosProyecto.categorias ? datosProyecto.categorias : [],
        lideres: datosProyecto.lideres ? datosProyecto.lideres : [],
        participantes: datosProyecto.participantes ? datosProyecto.participantes : [],
        ramas: datosProyecto.ramas ? datosProyecto.ramas : [],
        temas: datosProyecto.temas ? datosProyecto.temas : [],
        objetos: datosProyecto.objetos ? datosProyecto.objetos : [],
        municipios: datosProyecto.municipios ? datosProyecto.municipios : [],
        decadas: datosProyecto.decadas ? datosProyecto.decadas : [],
        enlaces: datosProyecto.enlaces ? datosProyecto.enlaces : [],
        imagenes: datosProyecto.imagenes ? datosProyecto.imagenes : []
      });
    } else {
      const listas = datosListas.value;
      if (!listas) return;

      const datos = listas[tipo as keyof Listas][+id];

      if (datos) {
        const proyectos = datos.proyectos?.reduce((lista: ElementoProyecto[], indiceProyecto) => {
          const proyecto = datosProyectos.value?.find((p) => p.id === indiceProyecto);
          if (proyecto) lista.push({ nombre: proyecto.nombre.nombre, id: proyecto.id });
          ordenarListaObjetos(lista, 'nombre', true);
          return lista;
        }, []);

        actualizarLugar(tipo, datos.slug, datos.conteo, datos.relaciones);
        const relaciones: RelacionesFicha = agruparRelaciones('proyectos', datos.relaciones, listas);

        datosFicha.set({
          visible: true,
          lista: nombresListasProyectos[tipo as keyof Listas],
          titulo: datos.nombre,
          conteo: `${datos.conteo}`,
          paises: relaciones.paises ? relaciones.paises : [],
          categorias: relaciones.categorias ? relaciones.categorias : [],
          lideres: relaciones.lideres ? relaciones.lideres : [],
          participantes: relaciones.participantes ? relaciones.participantes : [],
          ramas: relaciones.ramas ? relaciones.ramas : [],
          temas: relaciones.temas ? relaciones.temas : [],
          objetos: relaciones.objetos ? relaciones.objetos : [],
          municipios: relaciones.municipios ? relaciones.municipios : [],
          decadas: relaciones.decadas ? relaciones.decadas : [],
          proyecto: proyectos,
          academia: datos.academia ? datos.academia : undefined,
          descripcion: datos.descripcion ? datos.descripcion : ''
        });
      }
    }
  } else {
    if (tipo === 'egresado') {
      const datosEgresado = datosEgresados.get()[+id];
      if (!datosEgresado) return;

      buscarLugares('egresados', datosEgresado);

      datosFicha.set({
        visible: true,
        lista: 'Egresado/a',
        id: datosEgresado.id,
        titulo: datosEgresado.nombre,
        paises: datosEgresado.paises ? datosEgresado.paises : [],
        temas: datosEgresado.temas ? datosEgresado.temas : [],
        ciudades: datosEgresado.ciudades ? datosEgresado.ciudades : [],
        ambitos: datosEgresado.ambitos ? datosEgresado.ambitos : []
      });
    } else {
      const listas = datosListasEgresados.value;
      if (!listas) return;
      const datos = listas[tipo as keyof ListasEgresados][+id];

      if (datos) {
        const egresados = datos.egresados?.reduce((lista: ElementoEgresado[], indiceEgresado) => {
          const egresado = datosEgresados.value?.find((p) => p.id === indiceEgresado);
          if (egresado) lista.push({ nombre: egresado.nombre, id: egresado.id });
          ordenarListaObjetos(lista, 'nombre', true);
          return lista;
        }, []);

        actualizarLugar(tipo, datos.slug, datos.conteo, datos.relaciones);
        const relaciones: RelacionesFicha = agruparRelaciones('egresados', datos.relaciones, listas);

        datosFicha.set({
          visible: true,
          lista: nombresListasEgresados[tipo as keyof ListasEgresados],
          titulo: datos.nombre,
          conteo: `${datos.conteo}`,
          paises: relaciones.paises ? relaciones.paises : [],
          temas: relaciones.temas ? relaciones.temas : [],
          ciudades: relaciones.ciudades ? relaciones.ciudades : [],
          egresado: egresados,
          ambitos: relaciones.ambitos ? relaciones.ambitos : []
        });
      }
    }
  }
});

export function actualizarUrl(valores: { nombre: string; valor: string }[], nuevaPagina = false, ruta?: string) {
  if (nuevaPagina) {
    const parametros = new URLSearchParams();

    valores.forEach((obj) => {
      if (obj.valor) parametros.set(obj.nombre, obj.valor);
    });

    const nuevaRuta = decodeURIComponent(`${window.location.origin}${ruta}?${parametros}`);
    window.location.href = nuevaRuta;
  } else {
    const parametros = new URLSearchParams(window.location.search);

    valores.forEach((obj) => {
      if (obj.valor) parametros.set(obj.nombre, obj.valor);
      else parametros.delete(obj.nombre);
    });

    window.history.pushState({}, '', decodeURIComponent(`${window.location.pathname}?${parametros}`));
    revisarVariablesURL();
  }
}

export function revisarVariablesURL() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get('id');
  const tipo = parametros.get('tipo');

  if (id && tipo) {
    elementoSeleccionado.set({ tipo, id });
  } else {
    datosFicha.setKey('visible', false);
    window.history.pushState({}, '', decodeURIComponent(window.location.pathname));
    filtrarMapa();
  }
}
