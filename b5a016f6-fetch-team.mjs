#!/usr/bin/env node
// Descarga la plantilla de TU equipo desde la API de Sokker y genera los datos cifrados para equipo.html.
//
//   node fetch-team.mjs
//
// Pide usuario y contraseña de Sokker, y la contraseña de la página. También puedes pasarlos con variables
// de entorno, solo para esa ejecución: SOKKER_USER, SOKKER_PASS, SITE_PASSWORD (y, si hace falta, SOKKER_TEAM_ID).
//
// Escribe en data/:
//   team.enc.json        datos de hoy, cifrados con la contraseña de la página
//   team.prev.enc.json   respaldo de la semana anterior (se renueva el primer día que ejecutas cada jueves)

import { webcrypto } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

const API = "https://sokker.org/api";
const DIR = "data";
const FILE = `${DIR}/team.enc.json`;
const PREV = `${DIR}/team.prev.enc.json`;
const LOGIN_FIELDS = { username: "login", password: "password" };   // deben coincidir con LoginRequest en https://sokker.org/apidoc.html
const LOGIN_EXTRA = { remember: false };
const CONCURRENCY = 4;
const ITER = 250000;

/* ─────────────── Entrada ─────────────── */
function ask(question, hidden = false) {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: hidden ? new Writable({ write(_c, _e, cb) { cb(); } }) : process.stdout,
      terminal: true
    });
    if (hidden) process.stdout.write(question);
    rl.question(hidden ? "" : question, answer => { rl.close(); if (hidden) process.stdout.write("\n"); resolve(answer); });
  });
}

/* ─────────────── Cifrado (mismo formato que lee equipo.html) ─────────────── */
const b64 = u8 => Buffer.from(u8).toString("base64");
const unb64 = t => new Uint8Array(Buffer.from(t, "base64"));
async function deriveKey(pw, salt, iter) {
  const km = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(String(pw).normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
  return webcrypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encrypt(obj, pw) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pw, salt, ITER);
  const plain = gzipSync(Buffer.from(JSON.stringify(obj)));
  const ct = new Uint8Array(await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  return { v: 1, iter: ITER, z: 1, salt: b64(salt), iv: b64(iv), data: b64(ct) };
}
async function decrypt(env, pw) {
  const key = await deriveKey(pw, unb64(env.salt), env.iter);
  let buf = new Uint8Array(await webcrypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(env.iv) }, key, unb64(env.data)));
  if (env.z) buf = gunzipSync(buf);
  return JSON.parse(Buffer.from(buf).toString("utf8"));
}

/* ─────────────── API de Sokker (con cookie de sesión) ─────────────── */
const jar = new Map();
function storeCookies(res) {
  const list = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of list) {
    const kv = c.split(";")[0];
    const i = kv.indexOf("=");
    if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
  }
}
async function call(path, opts = {}) {
  const headers = { Accept: "application/json", ...(opts.body ? { "Content-Type": "application/json" } : {}) };
  if (jar.size) headers.Cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  const res = await fetch(API + path, { ...opts, headers });
  storeCookies(res);
  return res;
}
const getJson = async path => {
  const res = await call(path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
};

const listFrom = j => {
  if (Array.isArray(j)) return j;
  for (const k of ["items", "players", "data", "results", "collection", "list"]) if (Array.isArray(j?.[k])) return j[k];
  return Object.values(j || {}).find(Array.isArray) || [];
};
const pidOf = it => it?.id ?? it?.playerId ?? it?.info?.id ?? it?.player?.id ?? it?.info?.playerId;
const teamIdOf = j => [j?.team?.id, j?.teamId, j?.user?.teamId, j?.user?.team?.id, j?.currentTeam?.id]
  .find(x => Number.isFinite(Number(x)) && Number(x) > 0);

/* ─────────────── Principal ─────────────── */
async function main() {
  const user = process.env.SOKKER_USER || (await ask("Usuario de Sokker: ")).trim();
  const pass = process.env.SOKKER_PASS || await ask("Contraseña de Sokker (no se muestra): ", true);
  const sitePw = process.env.SITE_PASSWORD || await ask("Contraseña de la página (mín. 8 caracteres, no se muestra): ", true);
  if (!user || !pass) throw new Error("Faltan el usuario o la contraseña de Sokker.");
  if (sitePw.length < 8) throw new Error("La contraseña de la página debe tener al menos 8 caracteres.");

  console.log("Iniciando sesión en Sokker…");
  const login = await call("/auth/login", {
    method: "POST",
    body: JSON.stringify({ [LOGIN_FIELDS.username]: user, [LOGIN_FIELDS.password]: pass, ...LOGIN_EXTRA })
  });
  if (login.status === 400 || login.status === 401) {
    const detail = (await login.text().catch(() => "")).slice(0, 200).trim();
    throw new Error(`Sokker no aceptó el usuario o la contraseña${detail ? ` (${detail})` : ""}. Si son correctos, revisa LOGIN_FIELDS y LOGIN_EXTRA al inicio del script contra LoginRequest en https://sokker.org/apidoc.html.`);
  }
  if (!login.ok && login.status !== 403) throw new Error(`Sokker respondió con el error ${login.status} al iniciar sesión.`);

  const me = await getJson("/current");
  const teamId = process.env.SOKKER_TEAM_ID || teamIdOf(me);
  if (!teamId) throw new Error(`No encontré el ID de tu equipo en /current (claves: ${Object.keys(me || {}).join(", ")}). Vuelve a ejecutar con SOKKER_TEAM_ID=<tu id de equipo>.`);
  console.log(`Equipo ${teamId}. Leyendo la plantilla…`);

  const list = listFrom(await getJson(`/team/${teamId}/player`));
  const pids = [...new Set(list.map(pidOf).filter(x => x != null).map(String))];
  if (!pids.length) throw new Error("La API no devolvió jugadores para tu equipo.");
  console.log(`${pids.length} jugadores. Descargando el detalle de cada uno…`);

  const api = {};
  let next = 0, failed = 0;
  const worker = async () => {
    while (next < pids.length) {
      const pid = pids[next++];
      try { api[pid] = await getJson(`/player/${pid}`); }
      catch (e) { failed++; console.warn(`  - No pude leer el jugador ${pid}: ${e.message}`); }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = pids.filter(pid => api[pid]);
  if (!ok.length) throw new Error("No se pudo leer ningún jugador.");
  const rows = ok.map((pid, i) => ({ n: i + 1, name: api[pid].info?.name?.full || "", pid }));
  const teamName = api[ok[0]].info?.team?.name || "";
  const withSkills = ok.filter(pid => api[pid].info?.skills && Object.keys(api[pid].info.skills).length > 4).length;

  const out = { generatedAt: new Date().toISOString(), team: { id: Number(teamId), name: teamName }, rows, api };

  // Respaldo semanal: la semana va de jueves a miércoles. El archivo anterior pasa a ser el respaldo
  // solo la primera vez que se ejecuta el script en cada semana.
  await mkdir(DIR, { recursive: true });
  let old = null;
  try { old = JSON.parse(await readFile(FILE, "utf8")); } catch {}
  if (old) {
    let oldData = null;
    try { oldData = await decrypt(old, sitePw); } catch {}
    if (!oldData) {
      console.warn("Aviso: el archivo anterior no se pudo leer con esta contraseña; esta semana no habrá flechas ▲▼.");
    } else {
      const now = new Date();
      const back = (now.getDay() - 4 + 7) % 7;                      // días desde el último jueves
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back).getTime();
      if (Date.parse(oldData.generatedAt) < weekStart) {
        await copyFile(FILE, PREV);
        console.log("Respaldo de la semana anterior renovado (data/team.prev.enc.json).");
      }
    }
  }

  await writeFile(FILE, JSON.stringify(await encrypt(out, sitePw)));
  console.log(`\nListo: ${FILE} con ${ok.length} jugadores${teamName ? ` de ${teamName}` : ""}${failed ? ` (${failed} no se pudieron leer)` : ""}.`);
  if (withSkills < ok.length) console.warn(`Aviso: solo ${withSkills} de ${ok.length} jugadores traen skills. Si esperabas verlas todas, revisa que el inicio de sesión haya funcionado.`);
  console.log("Sube a la carpeta data del repositorio: team.enc.json y team.prev.enc.json (si existe).");
}

main().catch(e => { console.error("\nError: " + e.message); process.exit(1); });
