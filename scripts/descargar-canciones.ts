import { spawn } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  LISTA_CANCIONES,
  YOUTUBE_IDS,
  limpiarEtiqueta,
} from "../app/components/canciones";

const OUTPUT_DIR = path.resolve(process.cwd(), "downloads", "canciones");
const TEMP_DIR = path.resolve(process.cwd(), "downloads", ".tmp-canciones");

function limpiarNombreArchivo(texto: string) {
  return limpiarEtiqueta(texto)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function ejecutar(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} terminó con código ${code ?? "desconocido"}`));
    });
  });
}

function ejecutarCapturando(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "inherit"],
      shell: false,
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} terminó con código ${code ?? "desconocido"}`));
    });
  });
}

async function ejecutarYtDlpCapturando(args: string[]) {
  return await ejecutarCapturando("python", ["-m", "yt_dlp", ...args]);
}

type SearchEntry = {
  id?: string;
};

type SearchResponse = {
  entries?: SearchEntry[];
};

async function existeArchivo(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function descargarFuente(origen: string, numero: number) {
  const template = path.join(TEMP_DIR, `${String(numero).padStart(2, "0")}-%(id)s.%(ext)s`);
  const stdout = await ejecutarYtDlpCapturando([
    "--no-playlist",
    "--format",
    "bestvideo[height<=480]+bestaudio/best[height<=480]/best",
    "--merge-output-format",
    "mp4",
    "--print",
    "after_move:filepath",
    "--output",
    template,
    origen,
  ]);

  const filePath = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1);

  if (!filePath) {
    throw new Error("yt-dlp no devolvió la ruta del archivo descargado");
  }

  return filePath;
}

async function buscarCandidatos(query: string) {
  const stdout = await ejecutarYtDlpCapturando([
    "--dump-single-json",
    "--flat-playlist",
    "--playlist-end",
    "6",
    "--no-warnings",
    `ytsearch6:${query}`,
  ]);

  const data = JSON.parse(stdout) as SearchResponse;
  return (data.entries ?? [])
    .map((entry) => entry.id)
    .filter((id): id is string => Boolean(id));
}

async function convertirAFinal(inputPath: string, outputPath: string) {
  await ejecutar("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale=-2:480",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function descargarCancion(raw: string, numero: number) {
  const etiqueta = limpiarEtiqueta(raw);
  const videoId = YOUTUBE_IDS[numero];
  const nombreBase = `${String(numero).padStart(2, "0")} - ${limpiarNombreArchivo(raw)}`;
  const outputPath = path.join(OUTPUT_DIR, `${nombreBase}.mp4`);

  if (await existeArchivo(outputPath)) {
    console.log(`[${numero}] Ya existe, se omite: ${etiqueta}`);
    return;
  }

  console.log(`[${numero}] Descargando: ${etiqueta}`);
  const candidatos = new Set<string>();

  if (videoId) {
    candidatos.add(videoId);
  }

  for (const id of await buscarCandidatos(etiqueta)) {
    candidatos.add(id);
  }

  let tempPath = "";
  let ultimoError: unknown;

  for (const id of candidatos) {
    try {
      tempPath = await descargarFuente(
        `https://www.youtube.com/watch?v=${id}`,
        numero,
      );
      break;
    } catch (error) {
      ultimoError = error;
    }
  }

  if (!tempPath) {
    if (ultimoError instanceof Error) {
      throw ultimoError;
    }

    throw new Error(`No se pudo descargar la canción ${numero}`);
  }

  await convertirAFinal(tempPath, outputPath);
  await rm(tempPath, { force: true });
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TEMP_DIR, { recursive: true });

  for (const [numero, raw] of LISTA_CANCIONES.entries()) {
    await descargarCancion(raw, numero);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`Fallo al descargar canciones: ${message}`);
  process.exit(1);
});
