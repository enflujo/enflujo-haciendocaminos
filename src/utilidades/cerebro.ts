import { atom, onMount } from 'nanostores';
import { parse } from 'papaparse';
import { ordenarListaObjetos } from './ayudas';
import type { Año, Años, Proyectos, Regiones, Tipos } from '@/tipos';

export const proyectos = atom<Proyectos>([]);
export const años = atom<Años>([]);
export const regiones = atom<Regiones>([]);
export const tipos = atom<Tipos>([]);

onMount(proyectos, () => {
  parse<string[]>(`${import.meta.env.BASE_URL}datos.csv`, {
    download: true,
    header: false, // No usar los nombres de las columnas como llaves porque tienen espacios, ñ y tíldes
    complete: (respuesta) => {
      procesarDatos(respuesta.data);
    },
  });
});

function procesarDatos(filas: string[][]) {
  filas.shift(); // sacar la primera fila
  const listaRegiones: Regiones = [];
  const listaAños: Años = [];
  const listaTipos: Tipos = [];

  const datosProyectos = filas.map((fila) => {
    validarRegion(fila[10].trim());
    validarValorSingular(fila[1].trim(), listaTipos);
    const añoProcesado = validarAño(fila[2].trim());

    return {
      nombre: fila[0].trim(),
      tipo: fila[1].trim(),
      años: añoProcesado,
      decada: fila[3].trim(),
      lideres: fila[4].split(',').map((lider) => lider.trim()),
      rol: fila[5].trim(),
      participantes: fila[6].split(',').map((participante) => participante.trim()),
      ramas: fila[7].split(',').map((rama) => rama.trim()),
      temas: fila[8].split(',').map((tema) => tema.trim()),
      objetos: fila[9].split(',').map((objeto) => objeto.trim()),
      regiones: fila[10].split(',').map((region) => region.trim()),
      lugares: fila[11].split(',').map((lugar) => lugar.trim()),
    };
  });

  ordenarListaObjetos(listaRegiones, 'conteo');
  ordenarListaObjetos(listaAños, 0, true);
  ordenarListaObjetos(listaTipos, 'nombre', true);

  console.log('Años:', listaAños);
  console.log('Tipos:', listaTipos);
  console.log('Regiones', listaRegiones);
  años.set(listaAños);
  regiones.set(listaRegiones);
  proyectos.set(datosProyectos);
  tipos.set(listaTipos);

  function validarAño(valorAño: string) {
    const añoProcesado: Año = {
      años: [],
      tipo: 'singular',
      valor: '',
    };

    if (valorAño.includes(',')) {
      const partes = valorAño.split(',');
      partes.forEach((año) => {
        procesarAño(año);
      });

      añoProcesado.años = partes.map((año) => +año);
      añoProcesado.tipo = 'multiples';
      añoProcesado.valor = valorAño;
    } else if (valorAño.includes('-')) {
      const [inicio, fin] = valorAño.split('-');

      for (let a = +inicio; a <= +fin; a++) {
        procesarAño(`${a}`);
        añoProcesado.años.push(a);
      }

      añoProcesado.tipo = 'rango';
      añoProcesado.valor = valorAño;
    } else if (valorAño) {
      procesarAño(valorAño);
      añoProcesado.años.push(+valorAño);
      añoProcesado.valor = valorAño;
    }

    return añoProcesado;
  }

  function procesarAño(año: string) {
    const elemento = listaAños.find((elemento) => elemento[0] === +año);

    if (!elemento) {
      listaAños.push([+año, 1]);
    } else {
      elemento[1]++;
    }
  }

  function validarValorSingular(valor: string, lista: Tipos) {
    const existe = lista.find((obj) => obj.nombre === valor);

    if (!existe) {
      lista.push({ nombre: valor, conteo: 1 });
    } else {
      existe.conteo++;
    }
  }

  function validarRegion(valor: string) {
    valor.split(',').forEach((region) => {
      const nombre = region.trim();
      const existeLugar = listaRegiones.find((dep) => dep.nombre === nombre);

      if (!existeLugar) {
        if (nombre.length && nombre !== 'No aplica') {
          listaRegiones.push({ nombre: region.trim(), lon: 0, lat: 0, conteo: 1 });
        }
      } else {
        existeLugar.conteo++;
      }
    });
  }
}
