interface Config {
    /** Base URL for API requests (origin only; API is at /api, not under base path). */
    apiUrl: string;
    /** True when built as student microfrontend (npm run build:student). */
    isStudentBuild: boolean;
}

const basePath = process.env.REACT_APP_BASE_PATH || "";

function getApiOrigin(): string {
    // Build-time or runtime env (Docker, dev) – use for API and SignalR
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
    if (process.env.REACT_APP_API_ORIGIN) return process.env.REACT_APP_API_ORIGIN;
    if (typeof window === "undefined") return "http://localhost:5000";
    const { protocol, hostname, port } = window.location;
    // Local dev: frontend often on 3000/3001/3002, backend on 5000
    if (port === "3000" || port === "3001" || port === "3002") return "http://localhost:5000";
    return `${protocol}//${hostname}:5000`;
}

const port = typeof window !== "undefined" ? window.location.port : "";

export const config: Config = {
    //  apiUrl: getApiOrigin(),
    apiUrl: "http://192.168.1.2:5000",
    isStudentBuild:
        process.env.REACT_APP_MICROFRONTEND_NAME === "classroom-student" ||
        port === "3002",
};

export default config;
