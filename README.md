# Antropología Uniandes - 60 años haciendo caminos

![Portada del proyecto 60 años haciendo caminos](./estaticos/imagen_OG.png)

![Estilo Código](https://github.com/enflujo/enflujo-haciendocaminos/actions/workflows/estilo-codigo.yml/badge.svg)
![Despliegue](https://github.com/enflujo/enflujo-haciendocaminos/actions/workflows/despliegue.yml/badge.svg)
![Tamaño](https://img.shields.io/github/repo-size/enflujo/enflujo-haciendocaminos?color=%235757f7&label=Tama%C3%B1o%20repo&logo=open-access&logoColor=white)
![Licencia](https://img.shields.io/github/license/enflujo/enflujo-haciendocaminos?label=Licencia&logo=open-source-initiative&logoColor=white)

Haciendo Caminos es la historia del Departamento de Antropología de la Universidad de Los Andes contada a través de los proyectos de investigación que sus profesores y estudiantes han realizado desde su creación.

Para poder actualizar el sitio debe tener una copia local de este repositorio.

## Hacer una copia local del repositorio

Deben tener instaladas en el computador las siguientes aplicaciones:

- <a href="https://nodejs.org/en/learn/getting-started/how-to-install-nodejs" target="_blank">Node.js</a>
- <a href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git" target="_blank">Git</a>
- Yarn se instala desde el terminal después de instalar Node.js:

```bash
npm i yarn -g
```

### Fork

Desde el repositorio original hacer un _fork_ a la cuenta de GitHub personal:

![fork](https://github.com/enflujo/enflujo-haciendocaminos/assets/5365329/57d8579b-f6a2-4228-bd66-761d59e2910d)

Una vez hecho el fork, clonar el repositorio:

- Copiar la url del repositorio que sale en el botón `< > Code`:

  ![fork2](https://github.com/enflujo/enflujo-haciendocaminos/assets/5365329/0a26c4b9-dc2c-4f7c-b259-b839ed21e567)

- En la terminal, ubicados en la carpeta en la que queremos guardar el proyecto, correr el siguiente comando:

```bash
git clone <url-del-repositorio-que-acabamos-de-copiar>
```

ej. (reemplazar la url por la propia):

```bash
git clone https://github.com/anattolia/enflujo-haciendocaminos.git
```

- Una vez clonado, entrar a la carpeta:

```bash
cd enflujo-haciendocaminos
```

- Y correr yarn desde la terminal para instalar las dependiencias:

```bash
yarn
```

## Reemplazar los datos

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

Ubicados en la carpeta donde clonamos el repositorio, correr el siguiente comando en la terminal:

```bash
yarn procesar
```

Cuando vea el mensaje `🦊 FIN 🦚` significa que ya se procesaron todos los datos.

### Paso 3: Enviar actualización

- Alistar todos los archivos que se cambiaron para enviarlos al repositorio remoto:

```bash
git add .
```

- Dejar un mensaje explicando qué cambió (el mensaje entre comillas puede cambiarse):

```bash
git commit -m "Actualización de datos e imágenes"
```

Enviar los cambios al repositorio remoto:

```bash
git push
```

### Hacer un _pull request_

Desde el repositorio donde hicimos el _fork_ solicitar la integración de los cambios haciendo un _pull request_:

![pull-request](https://github.com/enflujo/enflujo-haciendocaminos/assets/5365329/2c7eebc1-1276-486b-90dc-11b3c9490968)

## Posibles problemas con librería Sharp

A veces la librería que procesa las imágenes no funciona, probar el siguiente comando para que se instale bien en Windows y Linux.

```bash
yarn add sharp --ignore-engines
```
