import EncryptedStorage from 'react-native-encrypted-storage';

const PASSCODE_KEY = 'PASSCODE';
const LOCKOUT_KEY = 'LOCKOUT_UNTIL';

export const getPasscode = async (): Promise<string | null> => {
  try {
    return await EncryptedStorage.getItem(PASSCODE_KEY);
  } catch (e) {
    console.error('Error reading passcode', e);
    return null;
  }
};

export const savePasscode = async (passcode: string): Promise<void> => {
  try {
    await EncryptedStorage.setItem(PASSCODE_KEY, passcode);
  } catch (e) {
    console.error('Error saving passcode', e);
  }
};

export const getLockoutTimestamp = async (): Promise<number | null> => {
  try {
    const timestampStr = await EncryptedStorage.getItem(LOCKOUT_KEY);
    return timestampStr ? parseInt(timestampStr, 10) : null;
  } catch (e) {
    console.error('Error reading lockout timestamp', e);
    return null;
  }
};

export const saveLockoutTimestamp = async (timestamp: number): Promise<void> => {
  try {
    await EncryptedStorage.setItem(LOCKOUT_KEY, timestamp.toString());
  } catch (e) {
    console.error('Error saving lockout timestamp', e);
  }
};

export const clearLockoutTimestamp = async (): Promise<void> => {
  try {
    await EncryptedStorage.removeItem(LOCKOUT_KEY);
  } catch (e) {
    console.error('Error clearing lockout timestamp', e);
  }
};
