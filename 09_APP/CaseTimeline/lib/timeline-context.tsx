import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TimelineState,
  TimelineAction,
  DEFAULT_EVENT_TYPES,
  DEFAULT_LANES,
  Event,
  Lane,
} from "@/types/timeline";

const STORAGE_KEY = "case_timeline_data";

const initialState: TimelineState = {
  lanes: DEFAULT_LANES,
  eventTypes: DEFAULT_EVENT_TYPES,
  events: {},
  selectedYear: new Date().getFullYear(),
  zoomLevel: 3,
};

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case "SET_ZOOM_LEVEL":
      return { ...state, zoomLevel: action.payload };

    case "SET_SELECTED_YEAR":
      return { ...state, selectedYear: action.payload };

    case "ADD_EVENT":
      return {
        ...state,
        events: {
          ...state.events,
          [action.payload.id]: action.payload,
        },
      };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: {
          ...state.events,
          [action.payload.id]: action.payload,
        },
      };

    case "DELETE_EVENT":
      const { [action.payload]: deleted, ...remainingEvents } = state.events;
      return {
        ...state,
        events: remainingEvents,
      };

    case "ADD_LANE":
      return {
        ...state,
        lanes: [...state.lanes, action.payload],
      };

    case "UPDATE_LANE":
      return {
        ...state,
        lanes: state.lanes.map((lane) =>
          lane.id === action.payload.id ? action.payload : lane
        ),
      };

    case "DELETE_LANE":
      return {
        ...state,
        lanes: state.lanes.filter((lane) => lane.id !== action.payload),
      };

    case "IMPORT_DATA":
      return action.payload;

    case "RESET_DATA":
      return initialState;

    default:
      return state;
  }
}

interface TimelineContextType {
  state: TimelineState;
  dispatch: React.Dispatch<TimelineAction>;
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save timeline data:", error);
    }
  };

  const loadFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as TimelineState;
        dispatch({ type: "IMPORT_DATA", payload: parsed });
      }
    } catch (error) {
      console.error("Failed to load timeline data:", error);
    }
  };

  // Auto-save on state changes
  useEffect(() => {
    saveToStorage();
  }, [state]);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <TimelineContext.Provider value={{ state, dispatch, saveToStorage, loadFromStorage }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within TimelineProvider");
  }
  return context;
}
