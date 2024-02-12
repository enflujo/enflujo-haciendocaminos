import { getXlsxStream } from 'xlstream';
import slugificar from 'slug';
import type { DefinicionSimple, ElementoLista } from '../src/tipos.js';
import { guardarJSON } from './ayudas.js';

export interface Egresado {
  nombre: string;
  graduacion?: string;
  institucion?: DefinicionSimple;
  temas?: DefinicionSimple[];
  ambitos?: DefinicionSimple[];
  ciudad?: DefinicionSimple;
  pais?: DefinicionSimple;
}

export interface ListasEgresados {
  instituciones: ElementoLista[];
  temas: ElementoLista[];
  ambitos: ElementoLista[];
  ciudades: ElementoLista[];
  paises: ElementoLista[];
}

const listasEgresados: ListasEgresados = {
  instituciones: [],
  temas: [],
  ambitos: [],
  ciudades: [],
  paises: []
};

export default async function procesarEgresados(archivo: string): Promise<void> {
  const egresados: Egresado[] = [];

  return new Promise(async (resolver, rechazar) => {
    const flujo = await getXlsxStream({
      filePath: archivo,
      sheet: 'Egresados',
      withHeader: false,
      ignoreEmpty: true
    });

    let numeroFila = 1;

    flujo.on('data', (fila) => {
      if (numeroFila > 2) {
        const datosFila = fila.formatted.arr;
        const egresado: Egresado = { nombre: datosFila[0].trim() };

        const añoGraduacion = datosFila[1] ? `${datosFila[1]}` : null;
        if (añoGraduacion && añoGraduacion.trim().toLocaleLowerCase() !== 'no disponible')
          egresado.graduacion = añoGraduacion.trim();

        const institucion = validarValorSingular(datosFila[2], listasEgresados.instituciones);
        if (institucion) egresado.institucion = institucion;

        const temas = validarValorMultiple(datosFila[3], listasEgresados.temas);
        if (temas && temas.length) egresado.temas = temas;

        const ambitos = validarValorMultiple(datosFila[4], listasEgresados.ambitos);
        if (ambitos && ambitos.length) egresado.ambitos = ambitos;

        const ciudad = validarValorSingular(datosFila[5], listasEgresados.ciudades);
        if (ciudad) egresado.ciudad = ciudad;

        const pais = validarValorSingular(datosFila[6], listasEgresados.paises);
        if (pais) egresado.pais = pais;

        egresados.push(egresado);
      }

      numeroFila++;
    });

    flujo.on('close', () => {
      console.log('fin egresados');
      guardarJSON(egresados, 'egresados');
      guardarJSON(listasEgresados, 'listasEgresados');
      resolver();
    });
  });

  function validarValorSingular(valor: string, lista: ElementoLista[]) {
    if (
      !valor ||
      valor.toLocaleLowerCase() === 'no disponible' ||
      valor === 'No aplica' ||
      valor === 'undefined' ||
      valor === 'Sin Información'
    )
      return;
    const nombre = `${valor}`.trim();
    const slug = slugificar(nombre);
    const existe = lista.find((obj) => obj.slug === slug);

    if (!existe) {
      lista.push({ nombre, conteo: 1, slug, relaciones: [] });
    } else {
      existe.conteo++;
    }

    return { nombre, slug };
  }

  function validarValorMultiple(valor: string, lista: ElementoLista[]) {
    if (!valor) return null;
    const partes = `${valor}`.trim().split(',');
    const respuesta: DefinicionSimple[] = [];

    partes.forEach((elemento) => {
      const valorProcesado = validarValorSingular(elemento, lista);
      if (valorProcesado) respuesta.push(valorProcesado);
    });

    return respuesta.length ? respuesta : null;
  }
}
