import React, { Suspense } from "react";
import "./App.scss";
import "./i18n";
import { NavBarProvider } from "hooks/NavBar.hook";

import { BrowserRouter, HashRouter } from "react-router-dom";
import InnerRoutes from "./Routes";
import { LoginProvider } from "hooks/Login.hook";

const isElectron =
    typeof navigator !== "undefined" && navigator.userAgent.includes("Electron");

function getBasePath(): string {
    if (isElectron) return "";
    if (process.env.REACT_APP_BASE_PATH) return process.env.REACT_APP_BASE_PATH;
    if (typeof window === "undefined") return "";
    const { port, pathname } = window.location;
    if (port === "3002") return "/student";
    if (port === "3001") return "/instructor";
    if (pathname.startsWith("/student")) return "/student";
    if (pathname.startsWith("/instructor")) return "/instructor";
    return "";
}

const basePath = getBasePath();

if (!isElectron && typeof window !== "undefined" && basePath && !window.location.pathname.startsWith(basePath)) {
    window.location.replace(basePath + "/");
}

const Router: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    isElectron
        ? <HashRouter>{children}</HashRouter>
        : <BrowserRouter basename={basePath}>{children}</BrowserRouter>;

function App() {
    return (
        <Suspense fallback={<div style={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
            <Router>
                <LoginProvider>
                    <NavBarProvider>

                        <div className="App">
                            <InnerRoutes />
                        </div>

                    </NavBarProvider>
                </LoginProvider>
            </Router>
        </Suspense>
    );
}

export default App;