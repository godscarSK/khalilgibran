# Mi equipo

Página con la tabla de **los jugadores de tu propio equipo en Sokker**. Es una página estática (un solo `index.html`) publicada en GitHub Pages. Los datos se generan en tu computador con un script y se publican **cifrados**.

## Archivos

- `index.html`: la página del plantel.
- `juveniles.html`: la página de juveniles.
- `alineaciones.html`: la página de alineaciones.
- `logo.png`: el escudo que se muestra junto al título (opcional: si falta, la página se ve igual, sin escudo).
- `config.js`: configuración propia (dirección del servicio que sincroniza la columna «Pos.» entre dispositivos). No hace falta tocarlo al actualizar `index.html`.
- `fetch-team.mjs`: script que se ejecuta en tu computador, inicia sesión en Sokker y genera los datos.
- `data/team.enc.json` y `data/team.prev.enc.json`: los datos cifrados del plantel (los crea el script).
- `data/juniors.enc.json` y `data/juniors.prev.enc.json`: los datos cifrados de los juveniles y su respaldo de la semana anterior (los crea el script).

## Puesta en marcha

1. Instala Node 18 o superior.
2. En la carpeta del proyecto ejecuta `node fetch-team.mjs`. Te pide tu usuario de Sokker, tu contraseña de Sokker y la contraseña de la página (mínimo 8 caracteres, mejor una frase larga). Ninguna se guarda en un archivo.
   - También puedes pasarlas solo para esa ejecución. Mac o Linux: `SOKKER_USER="..." SOKKER_PASS="..." SITE_PASSWORD="..." node fetch-team.mjs`. En PowerShell: `$env:SOKKER_USER="..."; $env:SOKKER_PASS="..."; $env:SITE_PASSWORD="..."; node fetch-team.mjs`.
   - Si el script no encuentra el ID de tu equipo, agrega la variable `SOKKER_TEAM_ID` con tu ID de equipo.
3. Sube a la carpeta `data` del repositorio `team.enc.json`, `juniors.enc.json` (y `team.prev.enc.json` y `juniors.prev.enc.json` si existen).
4. En el repositorio: Settings → Pages → «Deploy from a branch» → rama `main`, carpeta `/ (root)`. La página queda en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

Para actualizar los datos, repite los pasos 2 y 3.

## Temporada y semana

Si la API entrega la temporada y la semana actuales, ambas páginas las muestran bajo el título («Temporada 87 · Semana 5»). Si no se encuentran, la línea no aparece y el script avisa al ejecutarse con los campos relacionados que vio. Se actualiza al ejecutar `node fetch-team.mjs`.

## Menú de secciones

Arriba a la derecha, junto al botón de tema, hay un menú desplegable con tres opciones: **Plantel** (`index.html`), **Juveniles** (`juveniles.html`) y **Alineaciones** (`alineaciones.html`). La contraseña se escribe una sola vez: las tres páginas la comparten en el mismo navegador.

## Qué muestra el plantel

- Las 8 skills de cada jugador (la API las entrega completas porque son tus jugadores y el script inicia sesión con tu usuario), más **Suma**, **DEF**, **DEFside**, **MID**, **ATT** y **ATTside** (sumas simples de skills; si falta alguna, la celda muestra «—»).
- Edad, **Valor**, **Salario** (a la derecha de Valor) y forma.
- Junto al nombre: insignia **SEL** si el jugador está citado a la selección, cruz roja con los días restantes si está lesionado, y una **tarjeta roja** si está suspendido (campo `stats.cards.red`, la suspensión actual).
- Flechas ▲▼ en las skills que cambiaron respecto a la semana anterior.

### Filtros y botones

- Búsqueda por nombre o PID, rango de edad (mín. y máx.), botones por posición asignada, **Lesionados**, **Suspendidos** y **Selección**.
- **Ocultar Val/Sal** oculta las columnas Valor y Salario (queda recordado en cada dispositivo).
- **CSV** copia la tabla visible como texto separado por tabulaciones, para pegar en una planilla; incluye una columna **PID** a la derecha de Jugador.
- El botón redondo de la esquina cambia entre modo claro y oscuro.
- El orden por defecto es por **Valor, de mayor a menor**; al pulsar el encabezado **#** se vuelve a ese orden. El resto de los encabezados ordenan como siempre (el orden elegido se recuerda en cada dispositivo).
- Al hacer scroll horizontal quedan inmovilizadas las primeras columnas (en pantallas angostas, menos).

### Cuadro de resumen (esquina superior derecha)

Se muestra siempre y cuenta a todo el equipo, sin importar los filtros ni los botones:

- **Finanzas**: dinero disponible en tu cuenta. Sigue al botón **Ocultar Val/Sal**: muestra «-» mientras Valor y Salario están ocultos.
- **Jugadores**: cantidad de jugadores del equipo principal.
- **Valor Total** y **Salario Total**: suma de todos los jugadores.
- **Edad Titulares**: promedio de edad de los marcados GK, DEF, MID y ATT (todos juntos).
- **Edad Entrenables**: promedio de edad de los marcados ENT.
- **Lesionados** y **Suspendidos**: cantidad de jugadores.

Finanzas y Salario dependen de los nombres de campo que entregue la API de Sokker. Al pasar el mouse sobre la cifra de Finanzas se ve qué campo se usó y cuáles otros se encontraron. Si la fila queda en «—», la página muestra un aviso con los nombres de los campos disponibles.

## Página de juveniles

Al hacer scroll horizontal quedan inmovilizadas las columnas hasta Nivel (#, Pos., Juvenil, Edad y Nivel; en pantallas angostas, menos). Tabla (con una línea vertical a la izquierda de Edad, otra a la izquierda de Edad Final otra a la derecha de Nivel Final y otra a la derecha de Semanas Entrenadas) con los juveniles de la academia del equipo: nombre, edad, **Nivel** (campo `skill`), **Semanas Restantes** (semanas que le faltan; «Listo» cuando terminó la academia y puede ascender), **Semanas Entrenadas** (`weeksIn`), y **Talento** (`talent`). Se puede buscar por nombre, mostrar solo a los **Talentosos** (los que tienen ★★★), ordenar por cualquier columna y copiar como CSV.

La API entrega los datos de los juveniles bajo nombres de campo que la página busca de forma flexible. Si no encuentra edad, semanas, skill o talento, muestra un aviso con los nombres de los campos disponibles, para poder ajustarla. La última columna, **Progreso**, es un campo de texto libre (hasta 200 caracteres) para anotar lo que quieras de cada juvenil. Se guarda en el navegador y, con `estUrl` configurado en `config.js`, se sincroniza entre dispositivos con el mismo servicio de Apps Script que las asignaciones «Pos.»: usa la misma contraseña de página y la versión actual de `est-sync.gs` (acepta claves `j…` para los juveniles y textos más largos). Tras pegar el nuevo `est-sync.gs` hay que publicarlo como **nueva versión** (Implementar → Administrar implementaciones → editar → Versión nueva) para que la URL siga siendo la misma. **Cuadro resumen de la escuela (esquina superior derecha):** Plazas (`size`), Juveniles (cantidad), Talentosos (juveniles con ★★★), Nivel Escuela (`averageSkill`), Entrenador, Salario DT y Costo Escuela (`weeklyCost` + salario del entrenador). Los datos de la escuela los junta `fetch-team.mjs` (de `/junior`, incluida su lista `trainers`, de `GET /trainer` —la lista de entrenadores del equipo— y de otros endpoints candidatos; si hay varios entrenadores se elige el asignado a la escuela o, si no se distingue, el primero) en `juniors.enc.json` y la página los busca por nombre de campo; si falta alguno la fila queda en «—», al pasar el mouse se ve qué campo se usó y, si algo no se encontró, aparece un aviso con los campos disponibles. El cuadro no depende de los filtros.

**Tipo:** el valor del campo `formation` aparece como una pequeña marca junto al nombre de cada juvenil (ya no es una columna). No depende del botón Simplificar. La marca «GK» se muestra en amarillo.

**Marca Pos. (✘/GK/DEF/MID/ATT):** a la izquierda del nombre de cada juvenil hay un desplegable con las opciones vacío, **GK**, **DEF**, **MID**, **ATT** (con los mismos colores que la columna Pos. del plantel) y **✘** (roja). Se guarda en el navegador y se sincroniza entre dispositivos por el mismo servicio que Progreso (con una clave propia que no interfiere con las asignaciones del plantel, así que no hace falta actualizar `est-sync.gs`). Las marcas ✔ de versiones anteriores ya no existen y aparecen vacías. Al pulsar el encabezado se ordenan GK, DEF, MID, ATT y ✘; el CSV las incluye.

**Nivel automático en Progreso:** al abrir la página (con la sincronización ya al día), si **Semanas Entrenadas** supera al **Recuento de Entrenos** en exactamente 1, la página añade el Nivel actual del juvenil al final de su Progreso (separado por coma) y avisa con un mensaje (que queda visible bajo el título hasta recargar) cuántos y cuáles juveniles actualizó. Con ello el Recuento sube y la condición deja de cumplirse, así que no se repite. No actúa si Progreso está vacío. El número «1» está en `autoAppendDiff` al inicio de `juveniles.html`.

**Columnas de regresión:** a partir de los elementos de Progreso (y = valor de cada elemento, x = su posición 0, 1, 2…) la página calcula, a la derecha de Progreso: **Talento Estimado** (1 / pendiente), **R2** (coeficiente de determinación) y **Regresión** (la recta, por ejemplo `y = 2,00x + 10,0`; el número junto a x es la pendiente, lo que sube el Nivel por semana). Los elementos no numéricos se omiten; con menos de 2 numéricos, o con pendiente 0 (Talento Estimado) o valores todos iguales (R2), se muestra «—». Se recalculan mientras escribes y todas se pueden ordenar. **Talento Estimado** se resalta en verde cuando vale 4,5 o menos (incluye valores negativos) y **R2** cuando vale 0,7 o más; los umbrales están en `HI_TREAL` y `HI_R2` en `juveniles.html`.

**Nivel Inicial:** a la derecha de Nivel; muestra el primer elemento de Progreso (se actualiza mientras escribes).

**Nivel Final:** (a la derecha de Nivel) = último elemento de Progreso + Semanas Restantes / divisor. El divisor es **3,5** si Semanas Entrenadas < 10, o si Talento Estimado es menor que 0 o mayor que 10; en cualquier otro caso es el **Talento Estimado**. Muestra «—» si falta el último elemento numérico de Progreso, las Semanas Restantes o las Semanas Entrenadas (o el Talento Estimado cuando hace falta). Al pasar el mouse indica qué fórmula se usó. Cada valor lleva una marca según la **Edad Final**: ★ dorada si Edad Final 16 (siempre), 17 con Nivel Final ≥ 5, 18 con ≥ 8, 19 con ≥ 11 o 20 con ≥ 14 (se compara el valor tal como se ve, con 1 decimal); en cualquier otro caso, ! roja (incluye edades finales sin criterio y cuando falta la Edad Final). Los mínimos están en `LF_MIN` en `juveniles.html`. **Tres estrellas junto al nombre:** el juvenil lleva ★★★ junto a su nombre cuando su Nivel Final tiene ★ dorada y su Talento Estimado está entre 3 y 4,3 (ambos incluidos; límites `TRIPLE_MIN` y `TRIPLE_MAX`).

**Edad Final:** a la derecha de Edad. Se suma la semana actual de la temporada (`seasonweek`, la que entrega el script) y las Semanas Restantes; hasta 13 → Edad; 14–26 → Edad+1; 27–39 → Edad+2; 40–52 → Edad+3 (y así cada 13 semanas más). Cada edad tiene su propio color (16 naranjo, 17 rosado, 18 verde turquesa, 19 amarillo, 20 índigo, 21 celeste; las demás sin color; tabla `AGE_HUES` en `juveniles.html`) y **Sem. Final** usa el mismo color que **Edad Final** del mismo juvenil. Fijos: 16 naranjo y 18 verde (`AGE_HUES` en `juveniles.html`). Si falta la semana, la edad o las semanas restantes, muestra «—».

**Sem. Final:** (a la derecha de Edad Final) número de semana de la temporada (1 a 13) en que las Semanas Restantes llegan a 0: (semana actual + Semanas Restantes) con temporadas de 13 semanas. Al pasar el mouse indica si ocurre en la temporada actual, la próxima o más adelante. Ordena por fecha real de salida. Si falta la semana actual o las semanas restantes, muestra «—».

**Botones Simplificar y Calculadora:** **Simplificar** oculta las columnas Talento, Progreso, Regresión y Recuento de Entrenos (el botón pasa a «Mostrar todo»; se recuerda en cada dispositivo y el CSV copia solo las columnas visibles). **Calculadora** oculta todas las filas y deja visibles solo las últimas cinco columnas (desde Progreso: Progreso, Talento Estimado, R2, Regresión y Recuento de Entrenos), con una sola fila vacía donde escribes el Progreso; el resto se calcula al escribir (el ✓/✗ del Recuento no aparece, porque no hay Semanas Entrenadas). Mientras está activa, Simplificar y CSV se desactivan. Esa fila vive solo en memoria: nada se guarda ni se sincroniza, y siempre empieza vacía.

**Flechas ▲▼ en Nivel:** igual que en Plantel, el script guarda cada jueves un respaldo de los juveniles (`juniors.prev.enc.json`) y la página marca con ▲ o ▼ los juveniles cuyo Nivel subió o bajó respecto a la semana anterior (se compara por id). La primera comparación aparece después de la segunda semana de ejecuciones; sube los dos archivos a `data`. Un juvenil que no estaba la semana anterior no lleva flecha.

Los textos se identifican por el id del juvenil. Si pegas (o escribes) números separados por espacios, la página pone una coma entre ellos automáticamente («10 12 14» queda «10,12,14»). Junto a Progreso, la columna **Recuento de Entrenos** cuenta cuántos elementos tiene el texto (separados por coma, sin espacios) y le resta 1 (nunca baja de 0) y se actualiza mientras escribes. Muestra ✓ si el número coincide con **Semanas Entrenadas** y ✗ si no.

Para actualizar esta página hay que volver a ejecutar `node fetch-team.mjs` y subir `data/juniors.enc.json`.

## Página de alineaciones

En pantallas anchas, la lista **Jugadores** queda a la derecha; en pantallas angostas (teléfono vertical) sigue arriba.

`alineaciones.html` (sección **Alineaciones** del menú) arma cuatro alineaciones de 11 puestos con los jugadores del plantel: **Copa Internacional** (viernes), **Liga 1** (domingo), **Copa/Amistoso** (lunes) y **Liga 2** (miércoles). Cada una tiene, bajo el título, el día, un campo para el **rival** y otro para la **fecha**.

- **Armar:** arrastra un apellido (junto con sus marcas ✚ lesión y tarjeta roja, que siempre lo acompañan) desde la lista «Jugadores» a un puesto; la posición y el contador de la lista no se mueven. En el celular el arrastre se hace desde el asa ⠿, que está a la izquierda del apellido. También puedes tocar el espacio a la derecha del apellido para seleccionar al jugador y luego tocar el puesto (la selección se mantiene para ponerlo en otras alineaciones).
- **Entrenamiento por posición:** sobre las alineaciones hay un cuadro con GK, DEF, MID y ATT y, a la derecha de cada una, un desplegable con el entrenamiento: RAP (celeste), TEC (violeta), PAS (rosado), DEF (naranjo), CRE (rojo) o ATT (gris). Los jugadores marcados **ENT** en el Plantel se ven con el fondo del color del entrenamiento asignado a la posición del puesto en que están (si el puesto o la posición no tienen entrenamiento, sin color). Bajo el cuadro hay un selector de **color para cada entrenamiento** (por defecto los de siempre). Los colores elegidos también se guardan y se cargan igual que las alineaciones.
- **Sustitutos y minutos:** cada número puede tener hasta 3 jugadores (titular y dos sustitutos, que aparecen debajo). Con el botón **＋** del número (o soltando a un jugador sobre él, o seleccionándolo y tocando ＋) se agrega un sustituto. Soltar un jugador sobre otro dentro de la alineación los intercambia. Junto a cada apellido hay un campo con los **minutos** que jugará: se reparten solos (90 con un jugador en el número, 45 con dos, 30 con tres), pero se pueden escribir a mano (el campo queda en negrita; si lo vacías vuelve al automático). En la lista de Jugadores, la marca con ′ muestra los **minutos acumulados** del jugador en todas las alineaciones. Los minutos se guardan y sincronizan con la alineación.
- **Ocultar alineaciones:** cada alineación tiene un botón **Ocultar**; la que está al lado (en la misma fila) pasa a ocupar todo el espacio, y arriba aparece un botón «Mostrar …» para volver a verla. Es una preferencia de cada dispositivo (no se sincroniza).
- **Actualización semanal (jueves):** la semana de Sokker va de jueves a miércoles. Cuando la página carga datos de una semana nueva (los de `fetch-team.mjs` ejecutado en un jueves o después), **la fecha de cada alineación avanza 7 días** (7 por cada semana transcurrida) y el campo **Rival** se rellena con el equipo contrario del partido de ese día según los datos de la API, o con una raya «—» si no hay partido o no tiene rival asignado. Ocurre una sola vez por semana, solo después de cargar lo guardado en la nube, y queda como cambio sin guardar (aparece un aviso; presiona «Guardar Datos»). La primera vez solo se anota la semana de cada alineación, sin cambiar nada. Si cambias una fecha a mano, esa alineación toma la semana de los datos actuales. `fetch-team.mjs` busca los partidos en varios endpoints candidatos (`/team/{id}/matches`, `/matches`, …) y los guarda como `matches` en `team.enc.json`; si no encuentra ninguno, escribe en pantalla los campos que vio y los rivales quedan con una raya.
- **Skills:** al tocar un apellido se abre un cuadro con Forma, Condición, Rapidez, Técnica y Pases (primera columna) y Portería, Defensa, Creación y Anotación (segunda). Se cierra con ✕, Escape o tocando fuera.
- **Posición de cada puesto:** cada número tiene un desplegable (GK, DEF, MID, ATT o vacío), por defecto 1 GK, 4 DEF, 4 MID y 2 ATT. Es independiente del jugador, se cambia a mano y se guarda y sincroniza con la alineación.
- **Mover:** dentro de una alineación, arrastrar sobre otro puesto los intercambia; entre alineaciones, copia al jugador (los jugadores pueden repetirse entre alineaciones, pero no dentro de una). Para quitarlo: la ✕ del puesto, o soltarlo sobre la lista de jugadores. **Vaciar** limpia una alineación.
- **Filtrar la lista:** bajo el buscador hay botones **GK, DEF, MID, ATT, ENT y EXT** para mostrar solo a los jugadores con esa marca del Plantel (se pueden combinar varios). La lista es un poco más ancha para que no se corten los apellidos.
- **Contador:** cada jugador muestra en cuántas de las 4 alineaciones está (0 a 4). **Sin alinear** muestra solo a los que están en 0. Debajo hay botones **GK, DEF, MID, ATT, ENT y EXT** para filtrar la lista por la posición que tiene cada jugador en el Plantel (se pueden combinar varios). Si dos jugadores comparten apellido, se agrega la inicial del nombre.
- **Marcas:** en la lista de jugadores aparece su posición asignada en el Plantel (GK, DEF, MID, ATT, ENT, EXT; solo lectura). Junto al apellido, en la lista y en los puestos, ✚ con los días de lesión (por ejemplo «4 d») y una tarjeta roja si está suspendido.
- **Guardar y cargar:** al abrir la página se cargan los datos guardados en la nube (si el servicio de `config.js` está disponible), y reemplazan a los de este dispositivo. Los cambios que haces se guardan en el navegador, pero solo suben a la nube cuando presionas **Guardar Datos** (arriba de la lista de jugadores), que reemplaza lo anterior con lo que ves en pantalla. Mientras haya cambios sin subir, bajo el título aparece un aviso; si recargas sin guardar, se pierden y vuelve lo de la nube. Usa el mismo servicio que Progreso (claves `j2…`; no hace falta cambiar `est-sync.gs`).

## Columna «Pos.»

Cada jugador tiene una lista con las opciones **GK**, **DEF**, **MID**, **ATT**, **ENT** (entrenables) y **EXT**, cada una con su botón de filtro. La asignación se guarda en el navegador y, si configuraste el servicio de sincronización, también se comparte entre tus dispositivos.

Las marcas son ovaladas. En la fila **Colores de las marcas** (bajo los filtros) puedes elegir el color de cada una (GK, DEF, MID, ATT, ENT, EXT); el cambio se guarda en la nube junto a las asignaciones y también lo usan Juveniles y Alineaciones.

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
