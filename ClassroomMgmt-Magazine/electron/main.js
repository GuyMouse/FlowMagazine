const { app, BrowserWindow } = require("electron");
const path = require("path");
const pkg = require("../package.json");

/**
 * Single Instance Lock
 * This prevents multiple versions of the application from running at the same time.
 */
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow = null;

if (!gotTheLock) {
  // If the lock cannot be acquired, another instance is already running.
  // We quit this second instance immediately.
  app.quit();
} else {
  /**
   * Listen for the 'second-instance' event.
   * This is triggered when a user tries to launch a second instance of the app.
   */
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      // If the existing window is minimized, restore it to its original state.
      if (mainWindow.isMinimized()) mainWindow.restore();
      // Bring the existing window to the front and focus it.
      mainWindow.focus();
    }
  });

  /**
   * standard build target logic to determine which folder to load.
   */
  const BUILD_TARGET = process.env.ELECTRON_BUILD_TARGET || pkg.buildTarget || "student";
  const buildFolder = BUILD_TARGET === "instructor" ? "build-instructor" : "build-student";

  function createWindow() {
    const iconPath = path.join(__dirname, "..", "buildResources", "icon.ico");

    mainWindow = new BrowserWindow({
      fullscreen: true,       // Starts the app in full screen mode.
      kiosk: true,            // High security mode for exams: hides taskbars and locks exits.
      autoHideMenuBar: true,  // Hides the top menu (File, Edit, etc.).
      icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    /**
     * Security Policy: Prevent the application from opening any new windows.
     * This blocks links or scripts that try to spawn a browser or popup.
     */
    mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    // Explicitly remove the menu bar to prevent keyboard shortcuts from opening it.
    mainWindow.setMenu(null);

    const indexPath = path.join(__dirname, "..", buildFolder, "index.html");
    mainWindow.loadFile(indexPath);
  }

  // Initialize the application once Electron is ready and the lock is secured.
  app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}