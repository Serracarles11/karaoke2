import { execFileSync } from "node:child_process";
import { LISTA_CANCIONES, limpiarEtiqueta } from "../app/components/canciones";

type SearchEntry = {
  id?: string;
  title?: string;
  channel?: string;
  uploader?: string;
};

type SearchResponse = {
  entries?: SearchEntry[];
};

const PREFER_POSITIVE = [
  /lyrics?/i,
  /letra/i,
  /karaoke/i,
  /lyric video/i,
  /video lyrics/i,
  /lyrics video/i,
  /con letra/i,
  /sub esp/i,
  /subtit/i,
];

const AVOID_NEGATIVE = [
  /official video/i,
  /video oficial/i,
  /official music video/i,
  /audio oficial/i,
  /official audio/i,
  /live\b/i,
  /concert/i,
  /remix\b/i,
];

function ejecutarYtDlp(query: string) {
  const args = [
    "-m",
    "yt_dlp",
    "--dump-single-json",
    "--flat-playlist",
    "--playlist-end",
    "8",
    "--no-warnings",
    `ytsearch8:${query}`,
  ];

  const output = execFileSync("python", args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });

  return JSON.parse(output) as SearchResponse;
}

function puntuar(query: string, entry: SearchEntry) {
  const q = query.toLowerCase();
  const title = entry.title?.toLowerCase() ?? "";
  const channel = entry.channel?.toLowerCase() ?? entry.uploader?.toLowerCase() ?? "";
  const text = `${title} ${channel}`;

  let score = 0;

  for (const pattern of PREFER_POSITIVE) {
    if (pattern.test(text)) score += 20;
  }

  for (const pattern of AVOID_NEGATIVE) {
    if (pattern.test(text)) score -= 15;
  }

  if (q.includes("karaoke") && /karaoke/i.test(text)) score += 40;
  if ((q.includes("lyrics") || q.includes("letra")) && /lyrics?|letra/i.test(text)) score += 35;
  if (q.includes("video") && /video/i.test(text)) score += 5;

  const importantTerms = q
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((term) => !["lyrics", "lyric", "letra", "karaoke", "video"].includes(term));

  for (const term of importantTerms) {
    if (title.includes(term)) score += 3;
    if (channel.includes(term)) score += 1;
  }

  return score;
}

function elegirMejorResultado(query: string, entries: SearchEntry[]) {
  return [...entries]
    .filter((entry) => entry.id && entry.title)
    .map((entry) => ({ entry, score: puntuar(query, entry) }))
    .sort((a, b) => b.score - a.score)[0];
}

async function main() {
  const lineas: string[] = [];
  lineas.push("export const YOUTUBE_IDS: Partial<Record<number, string>> = {");

  for (const [numero, original] of LISTA_CANCIONES.entries()) {
    const query = limpiarEtiqueta(original);

    try {
      const data = ejecutarYtDlp(query);
      const mejor = elegirMejorResultado(query, data.entries ?? []);

      if (mejor?.entry.id) {
        console.error(
          `[${numero}] ${mejor.entry.id} | ${mejor.entry.title ?? "sin titulo"} | score=${mejor.score}`,
        );
        lineas.push(`  ${numero}: "${mejor.entry.id}",`);
      } else {
        console.error(`[${numero}] Sin resultado valido para: ${query}`);
        lineas.push(`  ${numero}: "",`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error(`[${numero}] Error buscando "${query}": ${message}`);
      lineas.push(`  ${numero}: "",`);
    }
  }

  lineas.push("};");
  console.log(lineas.join("\n"));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`Fallo al generar YOUTUBE_IDS: ${message}`);
  process.exit(1);
});
