# Cantera

Tabla de jugadores con buscador, filtros, orden por columna y cálculo de posiciones. Es una página estática: un solo `index.html`.

## De dónde salen los datos

- **La lista de jugadores** sale de una hoja de Google Sheets (columna `PID`). Debe estar compartida como «Cualquier persona con el enlace puede ver».
- **Los datos de cada jugador** salen de la API de Sokker (`/api/player/{PID}`): nombre, edad, equipo, valor, forma, disciplina táctica, trabajo en equipo, experiencia y lesión.
- **Las skills** (resistencia, rapidez, técnica, pase, portero, defensa, creación, anotación) la API no las entrega para jugadores de otros equipos. Si las agregas a la hoja en columnas llamadas `RES`, `RAP`, `TEC`, `PAS`, `POR`, `DEF`, `CRE` y `ANO`, la página calcula las posiciones.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube `index.html` (y, si lo generas, la carpeta `data/`).
2. En el repositorio: Settings → Pages → «Deploy from a branch» → rama `main`, carpeta `/ (root)`.
3. En uno o dos minutos la página queda en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

## Si el navegador no puede leer la API de Sokker

Si la página muestra «El navegador no pudo leer la API de Sokker», es un bloqueo CORS. Se resuelve generando los datos fuera del navegador:

1. Instala Node 18 o superior.
2. En esta carpeta, ejecuta `node fetch-players.mjs`. Crea `data/players.json`.
3. Sube `data/players.json` al repositorio.

Mientras exista ese archivo, la página lo usa y no llama a la API. Para actualizarlo, repite los pasos 2 y 3.

## Conectar con tu usuario de Sokker

El botón «Conectar a Sokker» abre un cuadro para escribir tu usuario y tu contraseña. Se envían directo a `sokker.org`; la página no los guarda. Con la sesión iniciada, la API entrega las skills de tus propios jugadores y de los que están en venta (no las de otros equipos).

Dos cosas pueden impedirlo:

- Los campos del login están en `CONFIG.loginFields` (`login` y `password`) y `CONFIG.loginExtra` (`remember: false`, es decir, no recordar la sesión). Deben coincidir con `LoginRequest` en https://sokker.org/apidoc.html, sección Schemas. Si Sokker responde que no acepta los datos, revísalos ahí.
- Los navegadores suelen bloquear las cookies de otro sitio. Si Sokker acepta el login pero la página no mantiene la sesión, usa el script.

**Con el script** (no depende del navegador). Con tu usuario y contraseña en variables de entorno, solo para esa ejecución:

- Windows (PowerShell): `$env:SOKKER_USER="tu_usuario"; $env:SOKKER_PASS="tu_contraseña"; node fetch-players.mjs`
- Mac o Linux: `SOKKER_USER="tu_usuario" SOKKER_PASS="tu_contraseña" node fetch-players.mjs`

El `data/players.json` que genera incluye lo que tu sesión puede ver. Si lo subes a un repositorio público, esos datos quedan públicos. Nunca subas tu contraseña.

## Configuración

Todo está al inicio del `<script>` de `index.html`, en `CONFIG`: título, ID de la hoja, nombre de la pestaña, tiempo de caché y concurrencia. El script `fetch-players.mjs` tiene su propio `SHEET_ID` al inicio.

## Columnas y botón de tema

- Después de las 8 skills hay 5 columnas de suma: **DEF** (defensa + rapidez), **DEFside** (creación + técnica + pase), **MID** (creación + rapidez + técnica + pase), **ATT** (rapidez + técnica + anotación) y **ATTside** (defensa + creación + pase). Si falta alguna skill del jugador, muestran "—".
- El botón redondo de la esquina superior derecha cambia entre modo claro y oscuro y recuerda tu elección. Si nunca lo usas, sigue el modo de tu sistema.
- Las columnas "Equipo" y las 7 de posiciones (Portero… Delantero) están ocultas. Para verlas, agrega al final de la dirección `?equipo=1` y/o `?posiciones=1` (por ejemplo `.../index.html?equipo=1&posiciones=1`).

## Equipos bot

Junto al nombre del jugador aparece "Equipo bot" cuando su equipo no tiene dueño. Se detecta con `GET /team/{id}/owner` (404 = sin dueño). `node fetch-players.mjs` lo guarda en `data/players.json` (clave `teams`), así que hay que volver a ejecutarlo para que aparezcan las etiquetas.

## Cambios semanales (flechas ▲▼)

- Cada vez que ejecutas `node fetch-players.mjs`, el script guarda además `data/players.prev.json`: el `players.json` de la semana anterior.
- La semana va de **jueves a miércoles**. El respaldo se renueva solo la primera vez que ejecutas el script cada jueves, y se conserva sin cambios hasta el miércoles siguiente. Puedes ejecutarlo varias veces en la semana sin perder la comparación.
- La página compara ambos archivos y marca con ▲ (subió) o ▼ (bajó) las skills que cambiaron. Al pasar el mouse se ve el valor anterior.
- Sube **los dos archivos** (`players.json` y `players.prev.json`) a la carpeta `data` del repositorio.
- No se marca nada si el jugador no tenía skills visibles en alguna de las dos semanas, ni si es nuevo en la hoja. La primera comparación aparece después de la segunda ejecución semanal.

## Contraseña de la página

Los datos se publican **cifrados** (`data/players.enc.json` y `data/players.prev.enc.json`). Quien abra la página debe escribir la contraseña; el navegador la recuerda en ese dispositivo, y el botón «Bloquear» la olvida.

- Al ejecutar `node fetch-players.mjs`, el script pide la contraseña de la página (mínimo 8 caracteres, mejor una frase larga). También puedes pasarla con la variable `SITE_PASSWORD`. No se escribe en ningún archivo.
- Sube a `data` solo los archivos `.enc.json`. **Borra del repositorio** `data/players.json` y `data/players.prev.json` si aún existen: están sin cifrar. Ojo: GitHub conserva el historial, así que lo que ya estuvo publicado sin cifrar sigue siendo recuperable desde commits antiguos.
- Para cambiar la contraseña, ejecuta el script con la nueva. Esa semana no habrá flechas (el respaldo anterior ya no se puede leer) y quienes tengan la contraseña vieja guardada verán el aviso para escribir la nueva.
- El cifrado protege los datos, no el código de la página (botones y diseño), que sigue siendo público. Una contraseña corta se puede adivinar por fuerza bruta.
- `node check-players.mjs` también lee el archivo cifrado, pidiendo la contraseña.

## Compartir las asignaciones (GK / DEF / MID / ATT) entre dispositivos

Sin configurar nada, las asignaciones de la columna «Pos.» se guardan solo en el navegador donde las haces. Para compartirlas entre tus dispositivos se usa un pequeño servicio en tu propia hoja de Google (una sola vez):

1. Abre tu hoja de Google → **Extensiones → Apps Script**.
2. Borra lo que haya y pega todo el contenido de `est-sync.gs`. Guarda (icono del disquete).
3. Arriba a la derecha: **Implementar → Nueva implementación → ⚙ → Aplicación web**. Configura *Ejecutar como*: **Yo**, y *Quién tiene acceso*: **Cualquier persona**. Pulsa **Implementar**.
4. Google pedirá autorización: elige tu cuenta → «Configuración avanzada» → «Ir a (nombre del proyecto)» → **Permitir**. Es tu propio script; solo necesita acceso a esta hoja.
5. Copia la **URL de la aplicación web** (termina en `/exec`) y pégala en el archivo **`config.js`**, entre las comillas de `estUrl: ""`. Sube `config.js` al repositorio, junto a `index.html`. Ese archivo es solo tuyo: al actualizar `index.html` no hace falta tocarlo.

Cómo funciona y qué tener en cuenta:
- Los valores viajan **cifrados** con la contraseña de la página: Google y quien conozca la dirección del servicio no pueden leerlos. Se guardan en una pestaña nueva llamada `EST` de tu hoja (no afecta a la primera pestaña, que es la que lee la página).
- Cada cambio se guarda en el dispositivo al instante y se envía al servicio. Si no hay conexión, queda pendiente y se envía cuando vuelva. Al abrir la página o volver a la pestaña, se traen los cambios hechos en otros dispositivos. Si dos dispositivos cambian al mismo jugador, gana el cambio más reciente.
- Arriba, junto a la fecha de los datos, la página indica si las asignaciones están sincronizadas o pendientes.
- Solo se sincroniza con la contraseña de la página puesta (datos cifrados). La clave de escritura del servicio se fija la primera vez que se guarda algo. **Si cambias la contraseña de la página**, ejecuta una vez la función `reiniciarClave` en el editor de Apps Script (menú desplegable de funciones → Ejecutar). Las asignaciones guardadas con la contraseña vieja ya no se podrán leer; cada dispositivo vuelve a enviar las suyas.
- Si cambias el código del Apps Script, hay que crear una **nueva implementación** (o administrar la actual y elegir «Nueva versión»); la URL no cambia si editas la implementación existente.

**Si la página muestra «Motivo: el navegador no pudo conectar con el servicio»** aunque la URL abra bien en una ventana privada: el navegador está bloqueando la lectura entre sitios. La página ya lo intenta de otra forma (JSONP), pero necesita la versión actual de `est-sync.gs`: pégala de nuevo en Apps Script (reemplazando todo), guarda, y en **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL no cambia.

## Tabla
- La columna **#** es solo la posición en la vista actual (siempre 1, 2, 3…, aunque ordenes o filtres). Pulsar su encabezado vuelve al orden de la hoja.
- Al hacer scroll horizontal quedan inmovilizadas las columnas hasta **Forma** y **Cond.** (en pantallas angostas se inmovilizan menos).
- **CSV** copia la tabla visible como texto separado por tabulaciones, para pegar en una planilla.
- **Ocultar Valor** oculta la columna Valor (queda recordado en cada dispositivo).
- **Países** (a la derecha de Clubes) reemplaza la tabla por un resumen: cada país de los clubes de los jugadores visibles (respeta filtros) y cuántos equipos distintos tiene. Pulsa de nuevo para volver. Requiere haber ejecutado `fetch-players.mjs` (guarda el país de cada club).
- **U21** muestra solo los jugadores citados a la selección (los que llevan la marca U21).
- **Cambios** muestra solo los jugadores con alguna skill que subió o bajó respecto al respaldo semanal.
