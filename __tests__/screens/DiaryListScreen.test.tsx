import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import DiaryListScreen from '../../src/screens/DiaryListScreen';
import { getDiaryEntries } from '../../src/storage/diary';

jest.mock('../../src/storage/diary');

const mockNavigate = jest.fn();
const mockAddListener = jest.fn((event, callback) => {
  if (event === 'focus') {
    callback();
  }
  return jest.fn();
});

const mockNavigation = {
  navigate: mockNavigate,
  addListener: mockAddListener,
} as any;

describe('DiaryListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEntries = [
    {
      id: '1',
      title: '☀️',
      mood: '☀️',
      content: 'Content 1',
      createdAt: '2023-10-27T10:00:00Z',
      updatedAt: '2023-10-27T10:00:00Z',
    },
    {
      id: '2',
      title: '☁️',
      mood: '☁️',
      content: 'Content 2',
      createdAt: '2023-10-28T10:00:00Z',
      updatedAt: '2023-10-28T10:00:00Z',
    },
  ];

  it('renders empty list message when no entries exist', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<DiaryListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("It's quiet here.")).toBeTruthy();
    });
  });

  it('renders a list of diary entries', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue(mockEntries);

    const { getByText } = render(<DiaryListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Content 1')).toBeTruthy();
      expect(getByText('Content 2')).toBeTruthy();
    });
  });

  it('navigates to AddDiaryScreen when FAB is pressed', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<DiaryListScreen navigation={mockNavigation} />);

    const fab = getByText('+');
    fireEvent.press(fab);

    expect(mockNavigate).toHaveBeenCalledWith('AddDiary');
  });

  it('navigates to AddDiaryScreen with ID when an entry is pressed', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue(mockEntries);

    const { getByText } = render(<DiaryListScreen navigation={mockNavigation} />);

    let entry: any;
    await waitFor(() => {
      entry = getByText('Content 1');
      expect(entry).toBeTruthy();
    });

    fireEvent.press(entry);
    expect(mockNavigate).toHaveBeenCalledWith('AddDiary', { id: '1' });
  });
});
