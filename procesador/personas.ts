import { getXlsxStream } from 'xlstream';
import type { PersonaID } from '../src/tipos.js';

export default async function procesarPersonas(archivo: string): Promise<PersonaID> {
  return new Promise(async (resolver) => {
    const flujoLugares = await getXlsxStream({
      filePath: archivo,
      sheet: 'personas',
      withHeader: true,
      ignoreEmpty: true
    });

    const personas: PersonaID = {};

    flujoLugares.on('data', (fila) => {
      const { nombre, id_academia } = fila.formatted.obj;

      if (id_academia) {
        personas[nombre] = id_academia;
      }
    });

    flujoLugares.on('close', () => {
      resolver(personas);
    });
  });
}
