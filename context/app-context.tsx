import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";
import { User } from "../types/models";
import {
  AppAction,
  appReducer,
  AppState,
  INITIAL_STATE,
} from "./app-reducer";

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  dispatch: Dispatch<AppAction>;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  const currentUser =
    state.users.find((u) => u.id === state.currentUserId) ?? null;

  return (
    <AppContext.Provider value={{ state, currentUser, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used inside an AppProvider");
  }

  return ctx;
}
