import slugificar from 'slug';
import { separarPartes } from './ayudas.js';
import type { DefinicionSimple, ElementoLista, PersonaID } from '../src/tipos.js';

export function procesarNombresLideres(
  nombresSinProcesar: string,
  apellidosSinProcesar: string,
  nombreProyecto: string,
  numeroFila: number,
  listaLideres: ElementoLista[],
  personas: PersonaID
) {
  const respuesta: DefinicionSimple[] = [];
  const lideres: { nombre: string; slug: string; nombreCompleto?: string }[] = [];

  if (nombresSinProcesar && apellidosSinProcesar) {
    const nombre = nombresSinProcesar.trim();
    const apellido = apellidosSinProcesar.trim();

    const nombres = nombre ? separarPartes(nombre) : [];
    const apellidos = apellido ? separarPartes(apellido) : [];

    if (nombres.length && apellidos.length) {
      if (nombres.length !== apellidos.length) {
        console.log(
          'En fila',
          numeroFila,
          'no coincide el numero de nombres y apellidos, hay',
          nombres.length,
          `nombres (${nombresSinProcesar}) y`,
          apellidos.length,
          `apellidos (${apellidosSinProcesar}).`
        );
      } else {
        const lista = nombres.map((nombreLider, i) => {
          const nombreLimpio = nombreLider.trim();
          const apellidoLimpio = apellidos[i].trim();
          const nuevoNombre = [apellidoLimpio, nombreLimpio].join(', ');
          const nombreCompleto = [nombreLimpio, apellidoLimpio].join(' ');

          return {
            nombre: nuevoNombre,
            slug: slugificar(nuevoNombre),
            nombreCompleto
          };
        });

        lideres.push(...lista);
      }
    }
  } else {
    if (!apellidosSinProcesar) {
      console.log(`El proyecto ${nombreProyecto} en fila`, numeroFila, ' no tiene nombre o apellido de líder');
    } else if (apellidosSinProcesar.toLowerCase() !== 'no aplica') {
      const completo = apellidosSinProcesar.trim();
      lideres.push({ nombre: completo, slug: slugificar(completo) });
    }
  }

  lideres.forEach((lider) => {
    const existe = listaLideres.find((obj) => obj.slug === lider.slug);

    if (!existe) {
      const objeto: ElementoLista = {
        nombre: lider.nombre,
        conteo: 1,
        slug: lider.slug,
        relaciones: [],
        proyectos: []
      };

      // Agregar ID de Academia para mostrar red
      if (lider.nombreCompleto && personas[lider.nombreCompleto]) {
        objeto.academia = personas[lider.nombreCompleto];
      }

      listaLideres.push(objeto);
    } else {
      existe.conteo++;
    }

    respuesta.push(lider);
  });

  return respuesta;
}
