import React from "react";
import { NAV_BAR_OPTIONS, ROUTE_OPTIONS } from "hooks/NavBar.hook";

import { Route, Routes } from "react-router-dom";
import { createRoutesFromOptions } from "./helpers/navbar.helpers";
import { useLogin } from "hooks/Login.hook";
import { Login, StudentLogin, TrainingPage } from "pages";
import { NavBar } from "components";
import config from "./config";

function InnerRoutes() {
    const { isLoggedIn } = useLogin();
    // config.isStudentBuild = true; // REMEMBER TO FUCKING DELETE
    // Student build: StudentLogin first, then TrainingPage (no instructor login, no nav).
    if (config.isStudentBuild) {
        return (
            <Routes>
                <Route path="/" element={<StudentLogin />} />
                <Route path="/studentlogin" element={<StudentLogin />} />
                <Route path="/trainingpage" element={<TrainingPage />} />
            </Routes>
        );
    }

    // Instructor build: login gate then NavBar + routes.
    if (!isLoggedIn) {
        return <Login />;
    }
    return (
        <>
            <NavBar />
            <Routes>
                {createRoutesFromOptions([...NAV_BAR_OPTIONS, ...ROUTE_OPTIONS]).map(
                    (route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ),
                )}
            </Routes>
        </>
    );
}

export default InnerRoutes;
