import EncryptedStorage from 'react-native-encrypted-storage';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mood?: string; // e.g., '☀️', '🌧️', '😌'
}

interface IndexedDiaryStorage {
  [date: string]: {
    [id: string]: DiaryEntry;
  };
}

const DIARY_ENTRIES_KEY = 'DIARY_ENTRIES_INDEXED';

const getDateKey = (isoString: string): string => {
  return isoString.split('T')[0];
};

export const getDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const jsonValue = await EncryptedStorage.getItem(DIARY_ENTRIES_KEY);
    if (!jsonValue) return [];
    
    const storage: IndexedDiaryStorage = JSON.parse(jsonValue);
    const allEntries: DiaryEntry[] = [];
    
    Object.values(storage).forEach(dateGroup => {
      Object.values(dateGroup).forEach(entry => {
        allEntries.push(entry);
      });
    });
    
    return allEntries;
  } catch (e) {
    console.error('Error reading diary entries', e);
    return [];
  }
};

export const saveDiaryEntry = async (entry: DiaryEntry): Promise<void> => {
  try {
    const jsonValue = await EncryptedStorage.getItem(DIARY_ENTRIES_KEY);
    const storage: IndexedDiaryStorage = jsonValue ? JSON.parse(jsonValue) : {};
    
    const dateKey = getDateKey(entry.createdAt);
    
    if (!storage[dateKey]) {
      storage[dateKey] = {};
    }
    
    storage[dateKey][entry.id] = entry;

    await EncryptedStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error('Error saving diary entry', e);
  }
};

export const deleteDiaryEntry = async (id: string, createdAt?: string): Promise<void> => {
  try {
    const jsonValue = await EncryptedStorage.getItem(DIARY_ENTRIES_KEY);
    if (!jsonValue) return;
    
    const storage: IndexedDiaryStorage = JSON.parse(jsonValue);
    
    if (createdAt) {
      const dateKey = getDateKey(createdAt);
      if (storage[dateKey]) {
        delete storage[dateKey][id];
        if (Object.keys(storage[dateKey]).length === 0) {
          delete storage[dateKey];
        }
      }
    } else {
      // Fallback: search all dates if createdAt is not provided
      for (const dateKey in storage) {
        if (storage[dateKey][id]) {
          delete storage[dateKey][id];
          if (Object.keys(storage[dateKey]).length === 0) {
            delete storage[dateKey];
          }
          break;
        }
      }
    }

    await EncryptedStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error('Error deleting diary entry', e);
  }
};
