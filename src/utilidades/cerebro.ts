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
  OpcionBuscadorDatos
} from '@/tipos';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { Egresado, ListasEgresados } from '../../procesador/egresados';

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
  objetos: 'Objetos',
  municipios: 'Municipios',
  decadas: 'Décadas',
  años: 'Años'
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

    const listasEgresados = await pedirDatos<ListasEgresados>(`${base}/listasEgresados.json`);
    datosListasEgresados.set(listasEgresados);

    const egresados = await pedirDatos<Egresado[]>(`${base}/egresados.json`);
    datosEgresados.set(egresados);

    _copiaDatosMapaEgresados = geoEgresados;
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
    let lugaresFiltrados: Feature<Point>[] = [];

    if (vistaActual === 'proyectos') {
      lugaresFiltrados = _copiaDatosMapa?.features.filter((lugar) =>
        lugares.find((obj) => obj.slug === lugar.properties?.slug)
      );

      lugaresFiltrados.map((punto) => {
        if (punto.properties) {
          const datosLugar = lugares.find((obj) => obj.slug === punto.properties?.slug);
          punto.properties.conteo = datosLugar?.conteo;
        }
        return punto;
      });
    } else if (vistaActual === 'egresados') {
      lugaresFiltrados = _copiaDatosMapaEgresados?.features.filter((lugar) =>
        lugares.find((obj) => obj.slug === lugar.properties?.slug)
      );

      lugaresFiltrados.map((punto) => {
        if (punto.properties) {
          const datosLugar = lugares.find((obj) => obj.slug === punto.properties?.slug);
          punto.properties.conteo = datosLugar?.conteo;
        }

        return punto;
      });
    }
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

elementoSeleccionado.subscribe((elemento) => {
  if (!Object.keys(elemento).length) return;

  const { tipo, id } = elemento;
  const enEgresados = window.location.pathname.includes('egresados');

  if (!enEgresados) {
    if (tipo === 'proyecto') {
      const datosProyecto = datosProyectos.get()[+id];

      if (!datosProyecto) return;

      datosFicha.set({
        visible: true,
        lista: 'Proyecto',
        id: datosProyecto.id,
        titulo: datosProyecto.nombre.nombre,
        descripcion: datosProyecto.descripcion ? datosProyecto.descripcion : '',
        paises: datosProyecto.paises ? datosProyecto.paises : [],
        categorias: datosProyecto.categorias ? [datosProyecto.categorias] : [],
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
          if (proyecto) {
            lista.push({ nombre: proyecto.nombre.nombre, id: proyecto.id });
          }

          ordenarListaObjetos(lista, 'nombre', true);
          return lista;
        }, []);

        const relaciones: RelacionesFicha = datos.relaciones.reduce(
          (lista: { [llave: string]: ElementoFicha[] }, valorActual) => {
            if (!lista[valorActual.tipo]) {
              lista[valorActual.tipo] = [];
            }

            lista[valorActual.tipo].push({
              slug: valorActual.slug,
              conteo: valorActual.conteo,
              nombre: listas[valorActual.tipo as keyof Listas][valorActual.indice].nombre
            });

            ordenarListaObjetos(lista[valorActual.tipo], 'slug', true);
            return lista;
          },
          {}
        );

        const lugaresMapa = datos.relaciones.filter((relacion) => relacion.tipo === 'municipios');

        filtrarMapa(
          lugaresMapa.map((lugar) => {
            return { slug: lugar.slug, conteo: lugar.conteo };
          })
        );

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
          proyecto: proyectos
        });
      }
    }
  } else {
    if (tipo === 'egresado') {
      const datosEgresado = datosEgresados.get()[+id];

      if (!datosEgresado) return;

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
          if (egresado) {
            lista.push({ nombre: egresado.nombre, id: egresado.id });
          }

          ordenarListaObjetos(lista, 'nombre', true);
          return lista;
        }, []);

        const relaciones: RelacionesFicha = datos.relaciones.reduce(
          (lista: { [llave: string]: ElementoFicha[] }, valorActual) => {
            if (!lista[valorActual.tipo]) {
              lista[valorActual.tipo] = [];
            }

            lista[valorActual.tipo].push({
              slug: valorActual.slug,
              conteo: valorActual.conteo,
              nombre: listas[valorActual.tipo as keyof ListasEgresados][valorActual.indice].nombre
            });

            ordenarListaObjetos(lista[valorActual.tipo], 'slug', true);
            return lista;
          },
          {}
        );

        const lugaresMapa = datos.relaciones.filter((relacion) => relacion.tipo === 'ciudades');

        filtrarMapa(
          lugaresMapa.map((lugar) => {
            return { slug: lugar.slug, conteo: lugar.conteo };
          })
        );

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
      if (obj.valor) {
        parametros.set(obj.nombre, obj.valor);
      } else {
        parametros.delete(obj.nombre);
      }
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
