"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Match {
  photoUrl: string;
  faceId: string;
  boundingBox: [number, number, number, number];
  confidence: number;
}

interface MatchDataSummary {
  totalMatchedPhotos: number;
  totalFacesConsidered: number;
  matchingThreshold: number;
}

interface MatchData {
  matches: Match[];
  summary: MatchDataSummary;
}

interface MatchDataContextType {
  matchData: MatchData | null;
  setMatchData: (data: MatchData | null) => void;
}

const MatchDataContext = createContext<MatchDataContextType | undefined>(
  undefined,
);

export function MatchDataProvider({ children }: { children: ReactNode }) {
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  return (
    <MatchDataContext.Provider value={{ matchData, setMatchData }}>
      {children}
    </MatchDataContext.Provider>
  );
}

export function useMatchData() {
  const context = useContext(MatchDataContext);
  if (context === undefined) {
    throw new Error("useMatchData must be used within a MatchDataProvider");
  }
  return context;
}
