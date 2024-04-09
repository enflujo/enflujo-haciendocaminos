# Antropología Uniandes - 60 años haciendo caminos

![Portada del proyecto 60 años haciendo caminos](./estaticos/imagen_OG.png)

![Estilo Código](https://github.com/enflujo/enflujo-haciendocaminos/actions/workflows/estilo-codigo.yml/badge.svg)
![Despliegue](https://github.com/enflujo/enflujo-haciendocaminos/actions/workflows/despliegue.yml/badge.svg)
![Tamaño](https://img.shields.io/github/repo-size/enflujo/enflujo-haciendocaminos?color=%235757f7&label=Tama%C3%B1o%20repo&logo=open-access&logoColor=white)
![Licencia](https://img.shields.io/github/license/enflujo/enflujo-haciendocaminos?label=Licencia&logo=open-source-initiative&logoColor=white)

Haciendo Caminos es la historia del Departamento de Antropología de la Universidad de Los Andes contada a través de los proyectos de investigación que sus profesores y estudiantes han realizado desde su creación.

## Actualizar datos

Para poder actualizar el sitio debe tener una copia local de este repositorio.

### Copia local del repositorio

Debe tener instalado las siguientes aplicaciones:

- <a href="https://nodejs.org/en/learn/getting-started/how-to-install-nodejs" target="_blank">Node.js</a>
- <a href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git" target="_blank">Git</a>
- Yarn se instala desde el terminal después de instalar Node.js:

```bash
npm i yarn -g
```

Fork

```bash

```

### Paso 1: Descargar y reemplazar archivo de Excel.

Descargar el archivo de excel, este se debe llamar exactamente **`Listado de proyectos - 60 años dpto antropología .xlsx`** _(Ojo con el espacio entre `antropología` y el `.xlsx`)_ y se debe reemplazar el que existe en la ruta:

```md
- procesador/
  - datos/
    Listado de proyectos - 60 años dpto antropología .xlsx`.
```

### (Opcional) Actualizar imágenes

El procesador acepta imágenes en los siguientes formatos: `'JPEG', 'JPG', 'PNG', 'WebP', 'GIF', 'AVIF', 'TIFF', 'SVG'`.

Se deben copiar a la siguiente carpeta:

```md
- procesador/
  - imgs/
    nuevaimg.jpg
    ...
```

### Paso 2: Procesar datos

Correr el siguiente comando en la terminal:

```bash
yarn procesar
```

Cuando vea el mensaje `🦊 FIN 🦚` significa que ya se procesaron todos los datos.

### Paso 3: Enviar actualización

Pull request

```bash

```

## Problemas con librería Sharp

A veces la librería que procesa las imágenes no funciona, probar el siguiente comando para que se instale bien en Windows y Linux.

```bash
yarn add sharp --ignore-engines
```
