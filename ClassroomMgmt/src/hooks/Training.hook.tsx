import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CourseMode, Training } from "models";
import { getAllTrainings } from "services/Trainings";

interface TrainingContextType {
  allTrainings: Training[] | null;
  currentTraining: Training | null;
  setCurrentTraining: (a: Training) => void;
  clearCurrentTraining: () => void;
  fetchTrainings: () => void;
  setTrainingMode: (m: "new" | "edit" | null) => void;
  trainingMode: string | null;
  loading: boolean;
  error: Error | null;
}

const defaultTrainingContext: TrainingContextType = {
  allTrainings: null,
  currentTraining: null,
  setTrainingMode: () => { },
  fetchTrainings: () => { },
  trainingMode: null,
  loading: true,
  error: null,
  setCurrentTraining: () => { },
  clearCurrentTraining: () => { },
};

const TrainingContext = createContext<TrainingContextType>(
  defaultTrainingContext,
);

interface TrainingProviderProps {
  children?: ReactNode;
}

export const TrainingProvider: FC<TrainingProviderProps> = ({ children }) => {
  const [allTrainings, setAllTrainings] = useState<Training[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentTraining, setCurrentTraining] = useState<Training | null>(null);
  const [trainingMode, setTrainingMode] = useState<"new" | "edit" | null>(null);

  const clearCurrentTraining = () => setCurrentTraining(null);

  useEffect(() => {
    fetchTrainings();
  }, []);
  const fetchTrainings = async () => {
    try {
      const data = await getAllTrainings();
      setAllTrainings(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unexpected error occurred"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainingContext.Provider
      value={{
        allTrainings,
        currentTraining,
        setCurrentTraining,
        clearCurrentTraining,
        fetchTrainings,
        setTrainingMode,
        trainingMode,
        loading,
        error,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error("useTraining must be used within a TrainingProvider");
  }
  return context;
};

export default TrainingContext;
