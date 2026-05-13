import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const CANCIONES_DIR = path.resolve(process.cwd(), "downloads", "canciones");
const TMP_DIR = path.resolve(process.cwd(), "downloads", ".tmp-canciones");

function leerNumerosDeDirectorio(dir: string, patron: RegExp): number[] {
  try {
    return fs
      .readdirSync(dir)
      .map((nombre) => {
        const match = nombre.match(patron);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);
  } catch {
    return [];
  }
}

export function GET() {
  const descargadas = leerNumerosDeDirectorio(CANCIONES_DIR, /^(\d+)\s+-\s+/);
  const descargando = leerNumerosDeDirectorio(TMP_DIR, /^(\d+)-/);

  const numeros = [...new Set([...descargadas, ...descargando])].sort(
    (a, b) => a - b,
  );

  return NextResponse.json({ numeros });
}
