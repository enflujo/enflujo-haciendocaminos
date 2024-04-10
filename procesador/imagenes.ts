import { parse, resolve } from 'path';
import { logAviso, logCyan, logError, mensajeExito, separarPartes } from './ayudas.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import type { DatosImg } from '../src/tipos.js';
import type { Errata } from './procesador.js';
import sharp from 'sharp';
import { emojify } from 'node-emoji';
const formatosImg = ['JPEG', 'JPG', 'PNG', 'WebP', 'GIF', 'AVIF', 'TIFF', 'SVG'].map(
  (formato) => `.${formato.toLowerCase()}`
);
export const carpetaPublicaImgs = resolve('./estaticos/fotos');
export const carpetaFuenteImgs = resolve('./procesador/datos/imgs');
const imagenesFuente: { ext: string; nombre: string; ruta: string; ancho: number; alto: number }[] = [];

export async function analizarCarpetaImagenes(errata: Errata[]) {
  let imagenes: string[] = [];

  try {
    imagenes = readdirSync(carpetaFuenteImgs);
  } catch (error) {
    errata.push({
      tipo: 'ERROR',
      mensaje: `Debe tener las imágenes en la carpeta ${carpetaFuenteImgs}, parece que esta carpeta no existe`,
      fila: 0
    });
    throw new Error(`Debe tener las imágenes en la carpeta ${carpetaFuenteImgs}, parece que esta carpeta no existe`);
  }

  for await (const nombreImg of imagenes) {
    const rutaArchivo = resolve(carpetaFuenteImgs, nombreImg);

    const { ext, name } = parse(rutaArchivo);
    const esImagen = formatosImg.includes(ext.toLowerCase());

    if (esImagen) {
      try {
        const metadatos = await sharp(rutaArchivo).rotate().metadata();
        let ancho = metadatos.width ? metadatos.width : 0;
        let alto = metadatos.height ? metadatos.height : 0;

        if (metadatos.orientation && metadatos.orientation > 4) {
          const _ancho = ancho;
          ancho = alto;
          alto = _ancho;
        }

        imagenesFuente.push({
          nombre: name,
          ext: metadatos.format as string,
          ruta: rutaArchivo,
          ancho,
          alto
        });
      } catch (error) {
        const mensaje = `Problema procesando la imagen fuente: ${rutaArchivo}, el error del procesador es: ${JSON.stringify(error)}`;
        console.log(emojify(':question:'), logError(mensaje));
        errata.push({
          tipo: 'ERROR',
          mensaje: mensaje,
          fila: 0
        });
      }
    } else {
      if (ext.toLowerCase() !== '.pdf') {
        errata.push({
          tipo: 'ERROR',
          mensaje: `La imagen ${nombreImg} está en un formato que no se puede procesar por esta aplicación. Los formatos soportados son: ${formatosImg.join(', ')}`,
          fila: 0
        });
      }
    }
  }

  if (!existsSync(carpetaPublicaImgs)) {
    mkdirSync(carpetaPublicaImgs);
  }
}

export async function procesarImagenes(lista: string, errata: Errata[], numeroFila: number) {
  const nombresFotos = separarPartes(lista);
  const respuesta: DatosImg[] = [];

  for await (const nombreFoto of nombresFotos) {
    const existeImagenFuente = imagenesFuente.find((fuente) => fuente.nombre === nombreFoto);
    if (existeImagenFuente) {
      const ruta = resolve(carpetaPublicaImgs, `${nombreFoto}.webp`);
      const rutaPeque = resolve(carpetaPublicaImgs, `${nombreFoto}_p.webp`);

      if (!existsSync(ruta)) {
        console.log(emojify(':hammer:'), logAviso('Creando nueva img:'), logCyan(nombreFoto));

        const instanciaImg = sharp(existeImagenFuente.ruta).rotate();

        if (existeImagenFuente.alto > 1500) {
          instanciaImg.resize({ height: 1500 });
          const escala = 1500 / existeImagenFuente.alto;

          existeImagenFuente.alto = 1500;
          existeImagenFuente.ancho = (existeImagenFuente.ancho * escala) | 0;
        }
        await instanciaImg.webp({ effort: 4, quality: 80 }).toFile(ruta);
        await instanciaImg.resize({ height: 200 }).toFile(rutaPeque);

        console.log(mensajeExito(`Img ${nombreFoto}.webp creada`));
      }

      const datosImg = {
        grande: `${nombreFoto}.webp`,
        peque: `${nombreFoto}_p.webp`,
        ancho: existeImagenFuente.ancho,
        alto: existeImagenFuente.alto
      };

      respuesta.push(datosImg);
    } else {
      const mensaje = `La imagen ${nombreFoto} no existe en la carpeta de imágenes.`;
      console.log(emojify(':broken_heart:'), logError('ERROR IMG:'), logCyan(mensaje));

      errata.push({
        tipo: 'IMÁGENES',
        mensaje: mensaje,
        fila: numeroFila
      });
    }
  }

  return respuesta.length ? respuesta : undefined;
}
