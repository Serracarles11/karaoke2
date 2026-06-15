const { app, BrowserWindow } = require("electron");
const http = require("node:http");
const path = require("node:path");
const handler = require("serve-handler");

const isDev = !app.isPackaged;
const devUrl = process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:3000";

let mainWindow = null;
let staticServer = null;
let staticServerUrl = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: "#08111f",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startStaticServer() {
  if (staticServer && staticServer.listening && staticServerUrl) {
    return Promise.resolve(staticServerUrl);
  }

  const outDir = path.join(app.getAppPath(), "out");

  staticServer = http.createServer((request, response) =>
    handler(request, response, {
      public: outDir,
      cleanUrls: true,
      headers: [
        {
          source: "**/*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store",
            },
          ],
        },
      ],
    }),
  );

  return new Promise((resolve, reject) => {
    staticServer.once("error", reject);
    staticServer.listen(0, "127.0.0.1", () => {
      staticServer?.removeListener("error", reject);
      const address = staticServer?.address();
      const port = typeof address === "object" && address ? address.port : 0;
      staticServerUrl = `http://127.0.0.1:${port}`;
      resolve(staticServerUrl);
    });
  });
}

async function loadApplication() {
  const targetUrl = isDev ? devUrl : await startStaticServer();
  if (!mainWindow) return;
  await mainWindow.loadURL(targetUrl);
}

app.whenReady().then(async () => {
  createWindow();
  await loadApplication();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      void loadApplication();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  staticServer?.close();
  staticServer = null;
  staticServerUrl = null;
});
