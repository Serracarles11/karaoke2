import fs from "node:fs";
import path from "node:path";
import { LOCAL_VIDEO_FILES } from "../app/components/canciones";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "cancionesnormalizadas");
const fallbackDir = path.join(rootDir, "downloads", "canciones");
const targetDir = path.join(rootDir, "public", "canciones");
const manifestPath = path.join(rootDir, "public", "canciones-manifest.json");

type ManifestEntry = {
  numero: number;
  archivo: string;
  src: string;
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeUnlink(filePath: string) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function copyVideoIfNeeded(sourcePath: string, targetPath: string) {
  const sourceStat = fs.statSync(sourcePath);

  try {
    const targetStat = fs.statSync(targetPath);
    if (targetStat.size === sourceStat.size) {
      return;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  try {
    fs.copyFileSync(sourcePath, targetPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EBUSY" && fs.existsSync(targetPath)) {
      return;
    }
    throw error;
  }
}

function findFallbackSource(numero: number) {
  if (!fs.existsSync(fallbackDir)) return null;

  const prefix = `${numero.toString().padStart(2, "0")} - `;

  for (const candidate of fs.readdirSync(fallbackDir)) {
    if (!candidate.startsWith(prefix)) continue;

    const candidatePath = path.join(fallbackDir, candidate);
    if (fs.statSync(candidatePath).isFile()) {
      return candidatePath;
    }
  }

  return null;
}

function main() {
  ensureDir(targetDir);

  const manifest: ManifestEntry[] = [];
  const copiedFiles = new Set<string>();

  for (const [numeroRaw, fileName] of Object.entries(LOCAL_VIDEO_FILES)) {
    if (!fileName) continue;

    const numero = Number(numeroRaw);
    const normalizedSourcePath = path.join(sourceDir, fileName);
    const sourcePath = fs.existsSync(normalizedSourcePath)
      ? normalizedSourcePath
      : findFallbackSource(numero);
    const targetPath = path.join(targetDir, fileName);

    if (!sourcePath) {
      console.warn(`[vercel] Falta el video ${fileName} para la cancion ${numero}.`);
      safeUnlink(targetPath);
      continue;
    }

    copyVideoIfNeeded(sourcePath, targetPath);
    copiedFiles.add(fileName);

    manifest.push({
      numero,
      archivo: fileName,
      src: `/canciones/${encodeURIComponent(fileName)}`,
    });
  }

  for (const existingFile of fs.readdirSync(targetDir)) {
    if (copiedFiles.has(existingFile)) continue;
    safeUnlink(path.join(targetDir, existingFile));
  }

  manifest.sort((a, b) => a.numero - b.numero);
  fs.writeFileSync(manifestPath, `${JSON.stringify({ canciones: manifest }, null, 2)}\n`);
  console.log(`[vercel] Videos preparados: ${manifest.length}`);
}

main();
