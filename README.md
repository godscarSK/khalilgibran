# Mi equipo

Página con la tabla de **los jugadores de tu propio equipo en Sokker**. Es una página estática (un solo `index.html`) publicada en GitHub Pages. Los datos se generan en tu computador con un script y se publican **cifrados**.

## Archivos

- `index.html`: la página del plantel.
- `juveniles.html`: la página de juveniles.
- `logo.png`: el escudo que se muestra junto al título (opcional: si falta, la página se ve igual, sin escudo).
- `config.js`: configuración propia (dirección del servicio que sincroniza la columna «Pos.» entre dispositivos). No hace falta tocarlo al actualizar `index.html`.
- `fetch-team.mjs`: script que se ejecuta en tu computador, inicia sesión en Sokker y genera los datos.
- `data/team.enc.json` y `data/team.prev.enc.json`: los datos cifrados del plantel (los crea el script).
- `data/juniors.enc.json`: los datos cifrados de los juveniles (los crea el script).

## Puesta en marcha

1. Instala Node 18 o superior.
2. En la carpeta del proyecto ejecuta `node fetch-team.mjs`. Te pide tu usuario de Sokker, tu contraseña de Sokker y la contraseña de la página (mínimo 8 caracteres, mejor una frase larga). Ninguna se guarda en un archivo.
   - También puedes pasarlas solo para esa ejecución. Mac o Linux: `SOKKER_USER="..." SOKKER_PASS="..." SITE_PASSWORD="..." node fetch-team.mjs`. En PowerShell: `$env:SOKKER_USER="..."; $env:SOKKER_PASS="..."; $env:SITE_PASSWORD="..."; node fetch-team.mjs`.
   - Si el script no encuentra el ID de tu equipo, agrega la variable `SOKKER_TEAM_ID` con tu ID de equipo.
3. Sube a la carpeta `data` del repositorio `team.enc.json`, `juniors.enc.json` (y `team.prev.enc.json` si existe).
4. En el repositorio: Settings → Pages → «Deploy from a branch» → rama `main`, carpeta `/ (root)`. La página queda en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

Para actualizar los datos, repite los pasos 2 y 3.

## Menú de secciones

Arriba a la derecha, junto al botón de tema, hay un menú desplegable con dos opciones: **Plantel** (`index.html`) y **Juveniles** (`juveniles.html`). La contraseña se escribe una sola vez: las dos páginas la comparten en el mismo navegador.

## Qué muestra el plantel

- Las 8 skills de cada jugador (la API las entrega completas porque son tus jugadores y el script inicia sesión con tu usuario), más **Suma**, **DEF**, **DEFside**, **MID**, **ATT** y **ATTside** (sumas simples de skills; si falta alguna, la celda muestra «—»).
- Edad, **Valor**, **Salario** (a la derecha de Valor) y forma.
- Junto al nombre: insignia **SEL** si el jugador está citado a la selección, cruz roja con los días restantes si está lesionado, y una **tarjeta roja** si está suspendido (campo `stats.cards.red`, la suspensión actual).
- Flechas ▲▼ en las skills que cambiaron respecto a la semana anterior.

### Filtros y botones

- Búsqueda por nombre o PID, rango de edad (mín. y máx.), botones por posición asignada, **Lesionados**, **Suspendidos** y **Selección**.
- **Ocultar Val/Sal** oculta las columnas Valor y Salario (queda recordado en cada dispositivo).
- **CSV** copia la tabla visible como texto separado por tabulaciones, para pegar en una planilla.
- El botón redondo de la esquina cambia entre modo claro y oscuro.
- Al hacer scroll horizontal quedan inmovilizadas las primeras columnas (en pantallas angostas, menos).

### Cuadro de resumen (esquina superior derecha)

Se muestra siempre y cuenta a todo el equipo, sin importar los filtros ni los botones:

- **Finanzas**: dinero disponible en tu cuenta.
- **Valor Total** y **Salario Total**: suma de todos los jugadores.
- **Edad Titulares**: promedio de edad de los marcados GK, DEF, MID y ATT (todos juntos).
- **Edad Entrenables**: promedio de edad de los marcados ENT.
- **Lesionados** y **Suspendidos**: cantidad de jugadores.

Finanzas y Salario dependen de los nombres de campo que entregue la API de Sokker. Al pasar el mouse sobre la cifra de Finanzas se ve qué campo se usó y cuáles otros se encontraron. Si la fila queda en «—», la página muestra un aviso con los nombres de los campos disponibles.

## Página de juveniles

Tabla con los juveniles de la academia del equipo: nombre, edad, **Sem.** (semanas que le faltan; «Listo» cuando terminó la academia y puede ascender), las 8 skills y la Suma. Se puede buscar por nombre, filtrar por rango de edad, ordenar por cualquier columna y copiar como CSV.

La API entrega los datos de los juveniles bajo nombres de campo que la página busca de forma flexible. Si no encuentra skills, edad o semanas, muestra un aviso con los nombres de los campos disponibles, para poder ajustarla. Para actualizar esta página hay que volver a ejecutar `node fetch-team.mjs` y subir `data/juniors.enc.json`.

## Columna «Pos.»

Cada jugador tiene una lista con las opciones **GK**, **DEF**, **MID**, **ATT**, **ENT** (entrenables) y **EXT**, cada una con su botón de filtro. La asignación se guarda en el navegador y, si configuraste el servicio de sincronización, también se comparte entre tus dispositivos.

## Cambios semanales (flechas ▲▼)

La semana va de **jueves a miércoles**. El primer día que ejecutas el script en cada semana, la versión anterior pasa a `team.prev.enc.json`, y la página compara ambos archivos. Puedes ejecutar el script varias veces en la semana sin perder la comparación. La primera comparación aparece después de la segunda semana de ejecuciones. Sube **los dos archivos** a la carpeta `data`.

## Contraseña de la página

Los datos se publican **cifrados**. Quien abra la página debe escribir la contraseña; el navegador la recuerda en ese dispositivo y el botón **Bloquear** la olvida.

- Para cambiarla, ejecuta `node fetch-team.mjs` con la nueva y sube el archivo. Esa semana no habrá flechas ▲▼ (el respaldo anterior ya no se puede leer) y los dispositivos que tengan la contraseña vieja guardada pedirán la nueva.
- Sube solo archivos `.enc.json`. GitHub conserva el historial: lo que alguna vez se publicó sin cifrar sigue siendo recuperable desde commits antiguos.
- El cifrado protege los datos, no el código de la página. Una contraseña corta se puede adivinar por fuerza bruta.

## Sincronizar las asignaciones entre dispositivos

Sin configurar nada, las asignaciones de «Pos.» se guardan solo en el navegador donde las haces. Para compartirlas se usa un pequeño servicio de Google Apps Script en tu hoja de Google (una sola vez):

1. Abre tu hoja de Google → **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `est-sync.gs`. Guarda.
2. **Implementar → Nueva implementación → Aplicación web**. *Ejecutar como*: **Yo**; *Quién tiene acceso*: **Cualquier persona**. Autoriza cuando Google lo pida.
3. Copia la **URL de la aplicación web** (termina en `/exec`) y pégala en `config.js`, en `estUrl`. Sube `config.js` al repositorio, junto a `index.html`.

Qué tener en cuenta:

- Los valores viajan **cifrados** con la contraseña de la página y se guardan en una pestaña `EST` de tu hoja.
- Usa **la misma contraseña** de página en todas las páginas que compartan el servicio: la clave de escritura se fija la primera vez que se guarda algo. Si cambias la contraseña, ejecuta una vez la función `reiniciarClave` en el editor de Apps Script.
- Si dos dispositivos cambian al mismo jugador, gana el cambio más reciente. El servicio ignora sin avisar un cambio con una hora anterior a la que ya guarda; la página lo evita usando siempre una hora mayor que la conocida.
- Arriba, junto a la fecha de los datos, la página indica si las asignaciones están sincronizadas o pendientes.

## Si algo no se ve como esperas

- **Un dispositivo muestra una versión antigua** (por ejemplo, una opción de «Pos.» que no aparece o no se sincroniza): el navegador guardó la página en memoria. Abre la dirección con algo al final, como `?v=2`, o borra los datos del sitio. Si la instalaste como acceso directo, ábrela desde el navegador.
- **Diagnóstico de sincronización**: abre la página con `?diag=1` al final. Aparece un botón **Diagnóstico** que compara lo que hay en el dispositivo con lo que hay en el servicio. Cópialo con el botón **Copiar**.
- **La página aparece en blanco con solo un título**: falta `index.html` en la raíz del repositorio.
- **Una página abierta como archivo local no muestra datos**: el navegador bloquea la lectura de `data/` desde un archivo. Usa GitHub Pages o, en esta carpeta, `python -m http.server` y entra a `http://localhost:8000/`.
- **El script trae menos jugadores de los que tienes**: la API entrega la plantilla por páginas; el script ya las pide todas.
