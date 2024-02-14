import { atom, map, onMount } from 'nanostores';
import { ordenarListaObjetos, pedirDatos } from './ayudas';
import type { Listas, Ficha, Proyecto, ELementoProyecto, RelacionesFicha, ElementoFicha } from '@/tipos';
import type { FeatureCollection, Geometry, Point } from 'geojson';

export const datosProyectos = atom<Proyecto[]>([]);
export const datosFicha = map<Ficha>({ visible: false });
export const datosListas = map<Listas>();
export const geo = map<FeatureCollection<Point>>();
export const elementoSeleccionado = map<{ tipo: string; id: string; lista: string }>();
let _copiaDatosMapa: FeatureCollection<Point>;

onMount(datosListas, () => {
  pedirDatos<Listas>(`${import.meta.env.BASE_URL}/listas.json`).then((res) => {
    datosListas.set(res);

    pedirDatos<Proyecto[]>(`${import.meta.env.BASE_URL}/proyectos.json`).then((res) => {
      datosProyectos.set(res);
    });
  });
});

onMount(geo, () => {
  pedirDatos<FeatureCollection<Point>>(`${import.meta.env.BASE_URL}/datosMapa.geo.json`).then((res) => {
    geo.set(res);
    _copiaDatosMapa = res;
  });
});

export function filtrarMapa(lugares?: string[]) {
  if (lugares) {
    const lugaresFiltrados = _copiaDatosMapa?.features.filter((lugar) => lugares.includes(lugar.properties?.slug));
    if (lugaresFiltrados) {
      geo.setKey('features', lugaresFiltrados);
    }
  } else {
    geo.setKey('features', _copiaDatosMapa?.features);
  }
}

elementoSeleccionado.subscribe((elemento) => {
  if (!Object.keys(elemento).length) return;

  const { tipo, id, lista } = elemento;

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
      roles: datosProyecto.roles ? [datosProyecto.roles] : [],
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
      const proyectos = datos.proyectos?.reduce((lista: ELementoProyecto[], indiceProyecto) => {
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
      filtrarMapa(lugaresMapa.map((lugar) => lugar.slug));

      datosFicha.set({
        visible: true,
        lista,
        titulo: datos.nombre,
        conteo: `${datos.conteo}`,
        paises: relaciones.paises ? relaciones.paises : [],
        categorias: relaciones.categorias ? relaciones.categorias : [],
        lideres: relaciones.lideres ? relaciones.lideres : [],
        roles: relaciones.roles ? relaciones.roles : [],
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
});
