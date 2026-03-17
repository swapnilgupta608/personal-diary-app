import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { getPasscode, savePasscode, getLockoutTimestamp, saveLockoutTimestamp, clearLockoutTimestamp } from '../storage/passcode';
import { useAuth } from '../context/AuthContext';
import PinInput from '../components/PinInput';

type PasscodeState = 'LOADING' | 'VERIFY' | 'SET_NEW' | 'CONFIRM_NEW' | 'LOCKED';

const PASSCODE_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const PasscodeScreen = () => {
  const { login } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [tempPasscode, setTempPasscode] = useState('');
  const [screenState, setScreenState] = useState<PasscodeState>('LOADING');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const attemptsRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const lockoutTimestamp = await getLockoutTimestamp();
      if (lockoutTimestamp && lockoutTimestamp > Date.now()) {
        const remainingTime = lockoutTimestamp - Date.now();
        setLockoutTimer(remainingTime);
        setScreenState('LOCKED');
      } else {
        await clearLockoutTimestamp();
        const storedPasscode = await getPasscode();
        if (storedPasscode) {
          setScreenState('VERIFY');
        } else {
          setScreenState('SET_NEW');
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lockoutTimer !== null && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev && prev <= 1000) {
            clearInterval(interval);
            handleLockoutEnd();
            return null;
          }
          return prev ? prev - 1000 : null;
        });
      }, 1000);
    }
    return () => {
        if(interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  const handleLockoutEnd = async () => {
    await clearLockoutTimestamp();
    attemptsRef.current = 0;
    setFailedAttempts(0);
    const storedPasscode = await getPasscode();
    setScreenState(storedPasscode ? 'VERIFY' : 'SET_NEW');
  };

  const triggerError = (message: string) => {
    setError(true);
    setErrorMessage(message);
    setTimeout(() => {
      setError(false);
      setPasscode('');
    }, 500);
  };

  const handlePasscodeChange = async (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPasscode(numericValue);
    setError(false);
    setErrorMessage('');

    if (numericValue.length === PASSCODE_LENGTH) {
      processCompletedPasscode(numericValue);
    }
  };

  const processCompletedPasscode = async (enteredPasscode: string) => {
    switch (screenState) {
      case 'VERIFY':
        const storedPasscode = await getPasscode();
        if (enteredPasscode === storedPasscode) {
          setPasscode('');
          attemptsRef.current = 0;
          setFailedAttempts(0);
          login();
        } else {
          attemptsRef.current += 1;
          const newFailedAttempts = attemptsRef.current;
          setFailedAttempts(newFailedAttempts);
          
          if (newFailedAttempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
            await saveLockoutTimestamp(lockoutUntil);
            setLockoutTimer(LOCKOUT_DURATION_MS);
            setScreenState('LOCKED');
            triggerError(''); // Trigger shake but don't show generic error message
          } else {
            triggerError(`Incorrect passcode. ${MAX_ATTEMPTS - newFailedAttempts} attempts remaining.`);
          }
        }
        break;
      
      case 'SET_NEW':
        setTempPasscode(enteredPasscode);
        setPasscode('');
        setScreenState('CONFIRM_NEW');
        break;

      case 'CONFIRM_NEW':
        if (enteredPasscode === tempPasscode) {
          await savePasscode(enteredPasscode);
          setPasscode('');
          login();
        } else {
          triggerError('Passcodes do not match. Try again.');
          setTimeout(() => {
             setPasscode('');
             setTempPasscode('');
             setScreenState('SET_NEW');
          }, 500);
        }
        break;
      default:
        break;
    }
  };

  const getTitleText = () => {
    switch (screenState) {
      case 'LOADING': return 'Loading...';
      case 'VERIFY': return 'Enter Passcode';
      case 'SET_NEW': return 'Set a New Passcode';
      case 'CONFIRM_NEW': return 'Confirm Passcode';
      case 'LOCKED': return 'App Locked';
    }
  };

  if (screenState === 'LOADING') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (screenState === 'LOCKED') {
    const minutesRemaining = Math.ceil((lockoutTimer || 0) / (60 * 1000));
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title} testID="passcode-title">{getTitleText()}</Text>
          <Text style={styles.subtitle} testID="lockout-message">
            Too many failed attempts.
          </Text>
          <Text style={styles.lockoutTimer}>
             Try again in {minutesRemaining} min{minutesRemaining > 1 ? 's' : ''}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} testID="passcode-title">{getTitleText()}</Text>
        <Text style={styles.subtitle}>
          {screenState === 'VERIFY' 
            ? 'Please enter your passcode to continue' 
            : 'Enter a 4-digit PIN for your diary'}
        </Text>

        <PinInput 
          length={PASSCODE_LENGTH}
          value={passcode} 
          onTextChange={handlePasscodeChange}
          error={error}
        />
        
        {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
        ) : <View style={styles.errorPlaceholder} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 20,
    fontSize: 14,
  },
  errorPlaceholder: {
    height: 14,
    marginTop: 20,
  },
  lockoutTimer: {
      fontSize: 18,
      fontWeight: '500',
      color: '#FF3B30',
      marginTop: 20
  }
});

export default PasscodeScreen;
