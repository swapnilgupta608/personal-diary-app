import { saveDiaryEntry, getDiaryEntries, deleteDiaryEntry, DiaryEntry } from '../../src/storage/diary';
import EncryptedStorage from 'react-native-encrypted-storage';

describe('diary storage', () => {
  beforeEach(async () => {
    // We mocked EncryptedStorage in jest/setup.js but it doesn't maintain state
    // Let's implement a simple in-memory store for these tests
    let mockStorage: Record<string, string> = {};
    
    (EncryptedStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return Promise.resolve(mockStorage[key] || null);
    });
    
    (EncryptedStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    });
    
    (EncryptedStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    });
    
    (EncryptedStorage.clear as jest.Mock).mockImplementation(() => {
      mockStorage = {};
      return Promise.resolve();
    });

    await EncryptedStorage.clear();
    jest.clearAllMocks();
  });

  const mockEntry: DiaryEntry = {
    id: '1',
    title: 'Test Title',
    content: 'Test Content',
    createdAt: '2023-10-27T10:00:00Z',
    updatedAt: '2023-10-27T10:00:00Z',
  };

  it('should save and retrieve a diary entry', async () => {
    await saveDiaryEntry(mockEntry);
    const entries = await getDiaryEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(mockEntry);
  });

  it('should update an existing entry', async () => {
    await saveDiaryEntry(mockEntry);
    const updatedEntry = { ...mockEntry, title: 'Updated Title' };
    await saveDiaryEntry(updatedEntry);
    
    const entries = await getDiaryEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Updated Title');
  });

  it('should delete an entry', async () => {
    await saveDiaryEntry(mockEntry);
    await deleteDiaryEntry(mockEntry.id);
    
    const entries = await getDiaryEntries();
    expect(entries).toHaveLength(0);
  });

  it('should handle multiple entries on different dates', async () => {
    const entry2: DiaryEntry = {
      id: '2',
      title: 'Entry 2',
      content: 'Content 2',
      createdAt: '2023-10-28T10:00:00Z',
      updatedAt: '2023-10-28T10:00:00Z',
    };

    await saveDiaryEntry(mockEntry);
    await saveDiaryEntry(entry2);

    const entries = await getDiaryEntries();
    expect(entries).toHaveLength(2);
  });

  it('should handle multiple entries on the same date', async () => {
    const entry2: DiaryEntry = {
      id: '2',
      title: 'Entry 2',
      content: 'Content 2',
      createdAt: '2023-10-27T14:00:00Z',
      updatedAt: '2023-10-27T14:00:00Z',
    };

    await saveDiaryEntry(mockEntry);
    await saveDiaryEntry(entry2);

    const entries = await getDiaryEntries();
    expect(entries).toHaveLength(2);
  });
});
