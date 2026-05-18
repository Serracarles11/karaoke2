import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const [inputDirArg, outputDirArg] = process.argv.slice(2);
const INPUT_DIR = path.resolve(
  process.cwd(),
  inputDirArg ?? path.join("downloads", "canciones"),
);
const OUTPUT_DIR = path.resolve(
  process.cwd(),
  outputDirArg ?? path.join("downloads", "canciones-normalizadas"),
);

// Recorte por defecto para capturas verticales con interfaz de movil.
// Ajuste pensado para dejar visible la letra y eliminar barras superior/inferior.
const DEFAULT_CROP = {
  leftPct: 0.05,
  rightPct: 0.05,
  topPct: 0.23,
  bottomPct: 0.22,
};

const OUTPUT_WIDTH = 720;
const OUTPUT_HEIGHT = 1280;
const VIDEO_CRF = 22;

function run(command: string, args: string[]) {
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

function runCapture(command: string, args: string[]) {
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

async function probeVideo(filePath: string) {
  const stdout = await runCapture("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0:s=x",
    filePath,
  ]);

  const [widthStr, heightStr] = stdout.trim().split("x");
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);

  if (!width || !height) {
    throw new Error(`No se pudieron leer dimensiones de ${path.basename(filePath)}`);
  }

  return { width, height };
}

function buildCropFilter(width: number, height: number) {
  const cropX = Math.round(width * DEFAULT_CROP.leftPct);
  const cropY = Math.round(height * DEFAULT_CROP.topPct);
  const cropWidth = Math.max(
    2,
    Math.round(width * (1 - DEFAULT_CROP.leftPct - DEFAULT_CROP.rightPct)),
  );
  const cropHeight = Math.max(
    2,
    Math.round(height * (1 - DEFAULT_CROP.topPct - DEFAULT_CROP.bottomPct)),
  );

  const evenWidth = cropWidth - (cropWidth % 2);
  const evenHeight = cropHeight - (cropHeight % 2);

  return [
    `crop=${evenWidth}:${evenHeight}:${cropX}:${cropY}`,
    `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=decrease`,
    `pad=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black`,
    `hue=s=0`,
    `curves=all='0/0 0.35/0 0.65/1 1/1'`,
  ].join(",");
}

async function normalizeVideo(fileName: string) {
  const inputPath = path.join(INPUT_DIR, fileName);
  const outputPath = path.join(OUTPUT_DIR, fileName);
  const { width, height } = await probeVideo(inputPath);
  const filter = buildCropFilter(width, height);

  console.log(`Normalizando ${fileName} (${width}x${height})`);

  await run("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vf",
    filter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    String(VIDEO_CRF),
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Entrada: ${INPUT_DIR}`);
  console.log(`Salida: ${OUTPUT_DIR}`);

  const files = (await readdir(INPUT_DIR))
    .filter((file) => file.toLowerCase().endsWith(".mp4"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log("No hay vídeos MP4 en downloads/canciones");
    return;
  }

  for (const file of files) {
    await normalizeVideo(file);
  }

  console.log(`Listo. Vídeos normalizados en ${OUTPUT_DIR}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`Fallo al normalizar canciones: ${message}`);
  process.exit(1);
});
