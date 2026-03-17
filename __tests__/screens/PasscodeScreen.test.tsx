import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PasscodeScreen from '../../src/screens/PasscodeScreen';
import { getPasscode, savePasscode, getLockoutTimestamp, saveLockoutTimestamp, clearLockoutTimestamp } from '../../src/storage/passcode';
import { useAuth } from '../../src/context/AuthContext';

jest.mock('../../src/storage/passcode');
jest.mock('../../src/context/AuthContext');

describe('PasscodeScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly in SET_NEW state', async () => {
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(null);
    (getPasscode as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Set a New Passcode');
    });
  });

  it('navigates through SET_NEW -> CONFIRM_NEW -> saves and logins on match', async () => {
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(null);
    (getPasscode as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Set a New Passcode');
    });

    const hiddenInput = getByTestId('hidden-pin-input');
    
    // Set 1st pass
    act(() => {
      fireEvent.changeText(hiddenInput, '1234');
    });
    
    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Confirm Passcode');
    });

    // Set 2nd pass
    act(() => {
      fireEvent.changeText(hiddenInput, '1234');
    });

    await waitFor(() => {
      expect(savePasscode).toHaveBeenCalledWith('1234');
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('navigates through VERIFY -> logins on match', async () => {
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(null);
    (getPasscode as jest.Mock).mockResolvedValue('5678');

    const { getByTestId } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Enter Passcode');
    });

    const hiddenInput = getByTestId('hidden-pin-input');
    
    act(() => {
      fireEvent.changeText(hiddenInput, '5678');
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles incorrect passcode and increments attempts', async () => {
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(null);
    (getPasscode as jest.Mock).mockResolvedValue('5678');

    const { getByTestId, getByText } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Enter Passcode');
    });

    const hiddenInput = getByTestId('hidden-pin-input');
    
    act(() => {
      fireEvent.changeText(hiddenInput, '1111');
    });
    
    await waitFor(() => {
      expect(getByText('Incorrect passcode. 2 attempts remaining.')).toBeTruthy();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('locks the app after 3 failed attempts', async () => {
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(null);
    (getPasscode as jest.Mock).mockResolvedValue('5678');

    const { getByTestId, getByText } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('Enter Passcode');
    });

    const hiddenInput = getByTestId('hidden-pin-input');
    
    // Attempt 1
    act(() => {
      fireEvent.changeText(hiddenInput, '1111');
    });
    
    // Attempt 2
    act(() => {
      fireEvent.changeText(hiddenInput, '2222');
    });

    // Attempt 3
    act(() => {
      fireEvent.changeText(hiddenInput, '3333');
    });

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('App Locked');
      expect(getByText('Too many failed attempts.')).toBeTruthy();
      expect(saveLockoutTimestamp).toHaveBeenCalled();
    });
  });

  it('resumes lockout state if timestamp is in the future', async () => {
    const futureTimestamp = Date.now() + 60000; // 1 minute in the future
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(futureTimestamp);
    (getPasscode as jest.Mock).mockResolvedValue('5678');

    const { getByTestId } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(getByTestId('passcode-title').props.children).toBe('App Locked');
    });
  });

  it('clears lockout state if timestamp is in the past', async () => {
    const pastTimestamp = Date.now() - 60000; // 1 minute in the past
    (getLockoutTimestamp as jest.Mock).mockResolvedValue(pastTimestamp);
    (getPasscode as jest.Mock).mockResolvedValue('5678');

    const { getByTestId } = render(<PasscodeScreen />);

    await waitFor(() => {
      expect(clearLockoutTimestamp).toHaveBeenCalled();
      expect(getByTestId('passcode-title').props.children).toBe('Enter Passcode');
    });
  });
});
