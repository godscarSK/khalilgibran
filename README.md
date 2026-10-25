# Mi equipo (equipo.html)

Página separada de CYMRU U21 con la tabla de **tus propios jugadores**. Usa el mismo diseño, y vive en el mismo repositorio, junto a `index.html`.

## Archivos

- `equipo.html`: la página.
- `fetch-team.mjs`: script que se ejecuta en tu computador, inicia sesión en Sokker y genera los datos.
- `data/team.enc.json` y `data/team.prev.enc.json`: los datos cifrados (los crea el script).

## Puesta en marcha

1. Instala Node 18 o superior.
2. En la carpeta del proyecto ejecuta `node fetch-team.mjs`. Te pide tu usuario de Sokker, tu contraseña de Sokker y la contraseña de la página (mínimo 8 caracteres). Ninguna se guarda en un archivo.
   - También puedes pasarlas solo para esa ejecución. Mac o Linux: `SOKKER_USER="..." SOKKER_PASS="..." SITE_PASSWORD="..." node fetch-team.mjs`. En PowerShell: `$env:SOKKER_USER="..."; $env:SOKKER_PASS="..."; $env:SITE_PASSWORD="..."; node fetch-team.mjs`.
   - Si el script no encuentra el ID de tu equipo, agrega `SOKKER_TEAM_ID` con tu ID de equipo.
3. Sube a la carpeta `data` del repositorio `team.enc.json` (y `team.prev.enc.json` si existe).
4. Abre `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/equipo.html`.

## Qué muestra

- Las 8 skills de cada jugador. La API las entrega completas porque son tus jugadores y el script inicia sesión con tu usuario.
- Columnas Suma, DEF, DEFside, MID, ATT y ATTside, igual que en la otra página, más el salario (Salario). Si la API no entrega el campo con un nombre que la página reconozca, un aviso arriba de la tabla lista los campos disponibles.
- Edad, valor, forma, lesión (con días restantes) e insignia SEL si el jugador está citado a la selección.
- Filtros: búsqueda, rango de edad (mín. y máx.), posición asignada, Lesionados y Selección. El botón **CSV** copia la tabla visible.

## Cambios semanales (▲▼)

La semana va de jueves a miércoles. El primer día que ejecutas el script en cada semana, la versión anterior pasa a `team.prev.enc.json`, y la página marca con ▲ o ▼ las skills que cambiaron. Puedes ejecutar el script varias veces en la semana sin perder la comparación. La primera comparación aparece después de la segunda semana de ejecuciones.

## Contraseña

Los datos se publican cifrados y la página pide la contraseña al abrirla; el navegador la recuerda y el botón **Bloquear** la olvida. Si cambias la contraseña, ese cambio hace que esa semana no haya flechas.

## Asignación GK / DEF / MID / ATT

La columna **Pos.** (GK, DEF, MID, ATT y ENT, cada una con su botón de filtro) se guarda en el navegador. Si `config.js` (el mismo de CYMRU U21) tiene la dirección `estUrl` del Apps Script, la página también sincroniza las asignaciones entre dispositivos usando ese servicio. Para que el servicio acepte la clave, usa **la misma contraseña de página** que en CYMRU U21.
