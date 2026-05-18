import { type NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { LOCAL_VIDEO_FILES } from "@/app/components/canciones";

const CANCIONES_DIR = path.resolve(process.cwd(), "downloads", "canciones");
const NORMALIZADAS_DIR = path.resolve(process.cwd(), "cancionesnormalizadas");
const QUICKSHARE_DIR = path.resolve(process.cwd(), "public", "QuickShare_2605141502");

function nodeStreamToWeb(nodeStream: fs.ReadStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) =>
        controller.enqueue(chunk instanceof Buffer ? chunk : Buffer.from(chunk)),
      );
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

function streamFile(filePath: string, fileSize: number, req: NextRequest): NextResponse {
  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    return new NextResponse(
      nodeStreamToWeb(fs.createReadStream(filePath, { start, end })),
      {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "video/mp4",
        },
      },
    );
  }
  return new NextResponse(nodeStreamToWeb(fs.createReadStream(filePath)), {
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero: numeroStr } = await params;
  const numero = parseInt(numeroStr, 10);
  if (isNaN(numero)) return new NextResponse("Bad Request", { status: 400 });

  // Check normalized directories first
  const normalizedFileName = LOCAL_VIDEO_FILES[numero];
  if (normalizedFileName) {
    for (const dir of [NORMALIZADAS_DIR, QUICKSHARE_DIR]) {
      const filePath = path.join(dir, normalizedFileName);
      let stat: fs.Stats | null = null;
      try { stat = fs.statSync(filePath); } catch { /* try next */ }
      if (stat) return streamFile(filePath, stat.size, req);
    }
  }

  // Fallback: legacy downloads/canciones/ with format "NN - Título.mp4"
  const padded = numero.toString().padStart(2, "0");

  let files: string[];
  try {
    files = fs.readdirSync(CANCIONES_DIR);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fileName = files.find((f) => new RegExp(`^${padded}\\s+-\\s+`).test(f));
  if (!fileName) return new NextResponse("Not Found", { status: 404 });

  const filePath = path.join(CANCIONES_DIR, fileName);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  return streamFile(filePath, stat.size, req);
}
