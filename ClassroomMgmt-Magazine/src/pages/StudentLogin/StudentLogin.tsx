import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "components";
import ShahamLogo from "../../assets/logos/ShahamLogo.svg";
import "./StudentLogin.scss";
import { DEFAULT_NUMBER_OF_STATIONS} from "../../components/CourseTabs/StudyContentTab"

import {
    getFlowHub,
    initializeNewStation,
    getActiveStations,
    getStudentByIdNumber,
} from "../../services/Socket";

/** Station assigned to this device from the flow (minimal shape). */
interface AssignedStation {
    id: string;
    stationName?: string;
    [key: string]: unknown;
}

const StudentLogin: React.FC = () => {
    const [personalId, setPersonalId] = useState<string>("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [station, setStation] = useState<AssignedStation | null>(null);
    const [stationNumber, setStationNumber] = useState<number | null>(null);
    const [hubReady, setHubReady] = useState(false);
    const [noLiveTraining, setNoLiveTraining] = useState(false);

    const hubRef = useRef<ReturnType<typeof getFlowHub> | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        let cancelled = false;
        const hub = getFlowHub();
        hubRef.current = hub;

        const tryGetStation = async () => {
            const assigned = await initializeNewStation();
            console.log('assigned', assigned);
            if (cancelled) return;
            if (assigned && assigned.id) {
                const assignedStation = assigned as AssignedStation;
                setStation(assigned as AssignedStation);
                setNoLiveTraining(false);
                // Derive station number from position in active stations list (1-based)
                const activeStations = await getActiveStations();
                console.log('activeStations', activeStations);
                const assignedId = String(assignedStation.id ?? (assignedStation as Record<string, unknown>).Id ?? "").toLowerCase();
                if (activeStations && activeStations.length > 0 && assignedId) {
                    const index = activeStations.findIndex((s) => {
                        const sid = String(s.id ?? s.Id ?? "").toLowerCase();
                        return sid === assignedId;
                    });
                    if ((index >= 0 && (index + 1) <= activeStations.length)|| activeStations.length < DEFAULT_NUMBER_OF_STATIONS) {
                        setStationNumber(index + 1);
                    } else {
                        setStationNumber(null);
                    }
                }

                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            } else {
                setNoLiveTraining(true);
                setStation(null);
                setStationNumber(null);
            }
        };

        hub.start()
            .then(() => {
                setHubReady(true);
                return tryGetStation();
            })
            .then(() => {
                if (cancelled) return;
                pollingRef.current = setInterval(tryGetStation, 5000);
            })
            .catch((err) => {
                console.error("Flow hub or station init failed:", err);
                if (!cancelled) {
                    setNoLiveTraining(true);
                    setHubReady(true);
                }
            });

        return () => {
            cancelled = true;
            hubRef.current = null;
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, []);

    const handleLogIn = async () => {
        setShowError(false);
        setErrorMessage("");

        if (!station || !hubRef.current) {
            setErrorMessage(noLiveTraining ? "אין אימון פעיל כרגע" : "מחכה לחיבור...");
            setShowError(true);
            return;
        }

        const personalIdTrimmed = personalId.trim();
        if (!personalIdTrimmed) {
            setShowError(true);
            return;
        }

        setIsLoading(true);

        const student = await getStudentByIdNumber(personalIdTrimmed);
        if (!student || student.id == null) {
            setErrorMessage("המשתמש לא נמצא במערכת");
            setShowError(true);
            setIsLoading(false);
            return;
        }

        const hub = hubRef.current;
        const studentId = String(student.id);

        return new Promise<void>((resolve) => {
            const unregisterRegistered = hub.trainingConnectionRegistered(async (payload: { Station?: AssignedStation; TrainingTask?: unknown; station?: AssignedStation; trainingTask?: unknown }) => {
                unregisterRegistered();
                unregisterRejected();
                const assignedStation = payload.Station ?? payload.station ?? station;
                const assignedTrainingTask = payload.TrainingTask ?? payload.trainingTask;
                setStation(assignedStation);
                const assignedId = assignedStation && String(assignedStation.id ?? (assignedStation as Record<string, unknown>).Id ?? "").toLowerCase();
                if (assignedId) {
                    const activeStations = await getActiveStations();
                    if (activeStations && activeStations.length > 0) {
                        const index = activeStations.findIndex((s) => {
                            const sid = String(s.id ?? s.Id ?? "").toLowerCase();
                            return sid === assignedId;
                        });
                        if (index >= 0) setStationNumber(index + 1);
                    }
                }
                setIsLoading(false);
                navigate("/trainingpage", { state: { station: assignedStation, trainingTask: assignedTrainingTask } });

                /* // FUTURE NAVIGATION: Redirect to the new NewTrainingPage.tsx
                // This passes only the stationId as a "prop" via the router state
                
                if (assignedId) {
                    navigate("/new-training", { 
                        state: { 
                            stationId: assignedId 
                        } 
                    });
                }
                */

                // 4. Finalize the process
                if (typeof setIsLoading === 'function') {
                    setIsLoading(false);
                }

                resolve();
            });



            const unregisterRejected = hub.connectionRejected((payload: { Message?: string }) => {
                unregisterRejected();
                unregisterRegistered();
                setErrorMessage(payload?.Message ?? "ההתחברות נדחתה");
                setShowError(true);
                setIsLoading(false);
                resolve();
            });

            hub.registerTrainingConnection({
                OwnerId: station.id,
                IsStation: true,
                StudentIds: [studentId],
            })
                .catch((err) => {
                    console.error("RegisterTrainingConnection failed:", err);
                    unregisterRegistered();
                    unregisterRejected();
                    setErrorMessage("שגיאה בהתחברות לעמדה");
                    setShowError(true);
                    setIsLoading(false);
                    resolve();
                });
        });
    };

    if (isLoading) {
        return (
            <div className="login-page">
                <div className="waiting-screen">
                    <span className="waiting-text">מחכה להוראה...</span>
                    <div className="waiting-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            {station && (
                <h1>STATION: {stationNumber ?? station?.stationName ?? "—"}</h1>
            )}
            <div className="blur-overlay-container">
                <div className="login-header">
                    <div className="title-row">
                        <h1>Flow TMS</h1>
                        <img className="shaham-logo-top" src={ShahamLogo} alt="Shaham Logo" />
                    </div>
                    <h2 className="station-number">
                        {stationNumber != null
                            ? `עמדה ${stationNumber}`
                            : station?.stationName ?? (station ? "עמדה" : noLiveTraining ? "אין אימון פעיל" : "מתחבר...")}
                    </h2>
                </div>

                {noLiveTraining && !station && (
                    <p className="login-no-training">אין אימון פעיל. המתן עד שהמדריך יתחיל שיעור.</p>
                )}

                <div className="login-card">
                    <h3 className="card-title">כניסה למערכת</h3>
                    <div className="input-section">
                        <label className="input-label">מספר אישי:</label>
                        <TextField
                            name="personal_id"
                            value={personalId}
                            onChange={(e) => {
                                setPersonalId(e.target.value);
                                if (showError) setShowError(false);
                            }}
                            onEnter={handleLogIn}
                        />
                    </div>
                    {showError && errorMessage && (
                        <p className="login-error-message">{errorMessage}</p>
                    )}
                </div>

                <div className="action-section">
                    <Button
                        onClick={handleLogIn}
                        disabled={personalId.length === 0 || !station || !hubReady}
                        variant="action"
                    >
                        כניסה
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
