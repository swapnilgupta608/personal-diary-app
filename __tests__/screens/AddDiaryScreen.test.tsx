import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddDiaryScreen from '../../src/screens/AddDiaryScreen';
import { saveDiaryEntry, getDiaryEntries, deleteDiaryEntry } from '../../src/storage/diary';
import { Alert } from 'react-native';

jest.mock('../../src/storage/diary');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
} as any;

const mockRoute = (id?: string) => ({
  params: { id },
}) as any;

describe('AddDiaryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockExistingEntry = {
    id: '123',
    title: '☀️',
    mood: '☀️',
    content: 'Existing Content',
    createdAt: '2023-10-27T10:00:00.000Z',
    updatedAt: '2023-10-27T10:00:00.000Z',
  };

  it('renders correctly in Add mode', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute()} />
    );

    expect(getByText('New Entry')).toBeTruthy();
    expect(getByPlaceholderText("Start writing...")).toBeTruthy();
    expect(queryByText('Delete')).toBeNull();
  });

  it('renders correctly in Edit mode and loads data', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue([mockExistingEntry]);

    const { getByText, getByDisplayValue } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute('123')} />
    );

    await waitFor(() => {
      expect(getByText('Edit Entry')).toBeTruthy();
      expect(getByDisplayValue('Existing Content')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  it('shows error alert if saving with empty content', async () => {
    const { getByText } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute()} />
    );

    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

    expect(Alert.alert).toHaveBeenCalledWith('Empty', 'Please write something before saving.');
    expect(saveDiaryEntry).not.toHaveBeenCalled();
  });

  it('saves a new entry and navigates back', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute()} />
    );

    fireEvent.changeText(getByPlaceholderText("Start writing..."), 'Some content');
    
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(saveDiaryEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Some content',
          mood: '☀️'
        })
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('updates an existing entry and navigates back', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue([mockExistingEntry]);

    const { getByDisplayValue, getByText } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute('123')} />
    );

    await waitFor(() => {
      expect(getByDisplayValue('Existing Content')).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue('Existing Content'), 'Updated Content');
    
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(saveDiaryEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123',
          content: 'Updated Content',
          createdAt: mockExistingEntry.createdAt,
        })
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('deletes an entry after confirmation and navigates back', async () => {
    (getDiaryEntries as jest.Mock).mockResolvedValue([mockExistingEntry]);

    const { getByText } = render(
      <AddDiaryScreen navigation={mockNavigation} route={mockRoute('123')} />
    );

    await waitFor(() => {
      expect(getByText('Delete')).toBeTruthy();
    });

    fireEvent.press(getByText('Delete'));

    // Verify alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      expect.any(Array),
      { cancelable: true }
    );

    // Simulate clicking the "Delete" button in the Alert
    const alertConfig = (Alert.alert as jest.Mock).mock.calls[0][2];
    const deleteOption = alertConfig.find((opt: any) => opt.text === 'Delete');
    
    await act(async () => {
      await deleteOption.onPress();
    });

    expect(deleteDiaryEntry).toHaveBeenCalledWith('123', mockExistingEntry.createdAt);
    expect(mockGoBack).toHaveBeenCalled();
  });
});
