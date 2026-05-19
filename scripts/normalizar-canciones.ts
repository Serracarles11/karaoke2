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
  outputDirArg ?? "cancionesnormalizadas",
);

// Recorte por defecto para capturas verticales con interfaz de movil.
// Ajuste pensado para dejar visible la letra y eliminar barras superior/inferior.
const DEFAULT_CROP = {
  leftPct: 0.05,
  rightPct: 0.05,
  topPct: 0.23,
  bottomPct: 0.22,
};

const CROP_OVERRIDES: Record<
  string,
  {
    leftPct?: number;
    rightPct?: number;
    topPct?: number;
    bottomPct?: number;
  }
> = {
  // Jennifer Lopez - Una Noche Mas: keep more width and avoid cutting the first letters.
  "00 - Jennifer Lopez - Una Noche Mas.mp4": {
    leftPct: 0.005,
    rightPct: 0.005,
    topPct: 0.23,
    bottomPct: 0.22,
  },
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

function buildCropFilter(
  width: number,
  height: number,
  cropOverride?: Partial<typeof DEFAULT_CROP>,
) {
  const crop = {
    ...DEFAULT_CROP,
    ...cropOverride,
  };
  const cropX = Math.round(width * crop.leftPct);
  const cropY = Math.round(height * crop.topPct);
  const cropWidth = Math.max(
    2,
    Math.round(width * (1 - crop.leftPct - crop.rightPct)),
  );
  const cropHeight = Math.max(
    2,
    Math.round(height * (1 - crop.topPct - crop.bottomPct)),
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
  const filter = buildCropFilter(width, height, CROP_OVERRIDES[fileName]);

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
