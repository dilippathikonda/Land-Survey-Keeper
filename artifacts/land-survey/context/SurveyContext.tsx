import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'land-survey-records-v1';

export type SurveyRecord = {
  id: string;
  plotNumber: string;
  ownerName: string;
  village: string;
  surveyNumber: string;
  deedReference: string;
  area: string;
  areaUnit: string;
  boundaryNorth: string;
  boundaryEast: string;
  boundarySouth: string;
  boundaryWest: string;
  latitude: number | null;
  longitude: number | null;
  photoUris: string[];
  documentReference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SurveyDraft = Omit<SurveyRecord, 'id' | 'createdAt' | 'updatedAt'>;

type SurveyContextValue = {
  records: SurveyRecord[];
  isLoading: boolean;
  addRecord: (draft: SurveyDraft) => Promise<SurveyRecord>;
  updateRecord: (id: string, draft: SurveyDraft) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecord: (id: string) => SurveyRecord | undefined;
};

const SurveyContext = createContext<SurveyContextValue | null>(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed = JSON.parse(stored) as SurveyRecord[];
          setRecords(Array.isArray(parsed) ? parsed : []);
        }
      })
      .catch(() => {
        if (active) setRecords([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = async (next: SurveyRecord[]) => {
    setRecords(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addRecord = async (draft: SurveyDraft) => {
    const now = new Date().toISOString();
    const record: SurveyRecord = { ...draft, id: createId(), createdAt: now, updatedAt: now };
    await persist([record, ...records]);
    return record;
  };

  const updateRecord = async (id: string, draft: SurveyDraft) => {
    const next = records.map((record) =>
      record.id === id ? { ...record, ...draft, updatedAt: new Date().toISOString() } : record,
    );
    await persist(next);
  };

  const deleteRecord = async (id: string) => {
    await persist(records.filter((record) => record.id !== id));
  };

  const value = useMemo(
    () => ({
      records,
      isLoading,
      addRecord,
      updateRecord,
      deleteRecord,
      getRecord: (id: string) => records.find((record) => record.id === id),
    }),
    [records, isLoading],
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurveyRecords() {
  const context = useContext(SurveyContext);
  if (!context) throw new Error('useSurveyRecords must be used within SurveyProvider');
  return context;
}