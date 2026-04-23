import React from "react";
import { useTranslation } from "react-i18next";
// import { TrainingCard, TrainingManager } from "components";
import { useTraining } from "hooks/Training.hook";
import { NEW_TRAINING_TEMPLATE } from "models/Training";
import "./Trainings.scss";

interface TrainingsProps extends React.HTMLAttributes<HTMLDivElement> { }

const Trainings: React.FC<TrainingsProps> = ({ }) => {
    const { t } = useTranslation();

    const {
        currentTraining,
        setCurrentTraining,
        setTrainingMode,
        allTrainings,
        loading,
        error,
    } = useTraining();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading courses: {error.message}</p>;

    return (
        <div className="training-page">
            <div
                className="card add"
                onClick={() => {
                    setTrainingMode("new");
                    setCurrentTraining(NEW_TRAINING_TEMPLATE);
                }}
            >
                {t("training.new_training")}
            </div>

     
        </div>
    );
};
export default Trainings;
