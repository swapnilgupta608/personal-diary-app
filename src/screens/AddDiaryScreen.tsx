
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { saveDiaryEntry, getDiaryEntries, deleteDiaryEntry, DiaryEntry } from '../storage/diary';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Header from '../components/Header';
import { colors, typography, spacing } from '../theme/theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export type RootStackParamList = {
  DiaryList: undefined;
  AddDiary: { id?: string };
};

type AddDiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddDiary'>;
type AddDiaryScreenRouteProp = RouteProp<RootStackParamList, 'AddDiary'>;

const MOODS = ['☀️', '☁️', '🌧️', '⚡', '😌', '😔', '😤', '❤️'];
const MICRO_PROMPT = "What's one small thing that went well today?";
const IDLE_TIMEOUT_MS = 30000; // 30 seconds

const AddDiaryScreen = ({ navigation, route }: { navigation: AddDiaryScreenNavigationProp, route: AddDiaryScreenRouteProp }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('☀️');
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const uiOpacity = useRef(new Animated.Value(1)).current;
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      const { id } = route.params || {};
      if (id) {
        const entries = await getDiaryEntries();
        const existingEntry = entries.find((e) => e.id === id);
        if (existingEntry) {
          setEntry(existingEntry);
          setContent(existingEntry.content);
          if (existingEntry.mood) setMood(existingEntry.mood);
        }
      }
    };
    loadEntry();
  }, [route.params]);

  // Handle Distraction Free Mode
  useEffect(() => {
    Animated.timing(uiOpacity, {
      toValue: isFocused ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  // Handle Idle Timer for Micro-Prompt
  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!content && !isFocused) {
      idleTimer.current = setTimeout(() => {
        setShowPrompt(true);
      }, IDLE_TIMEOUT_MS);
    } else {
      setShowPrompt(false);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [content, isFocused]);


  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty', 'Please write something before saving.');
      return;
    }

    // Trigger soft haptic feedback on save
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    const now = new Date().toISOString();
    const newEntry: DiaryEntry = {
      id: entry ? entry.id : Date.now().toString(),
      title: mood, // We use mood as title internally for backward compatibility with old entries lacking mood
      content,
      mood,
      createdAt: entry ? entry.createdAt : now,
      updatedAt: now,
    };

    await saveDiaryEntry(newEntry);
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (entry) {
      Alert.alert(
        'Delete Entry',
        'Are you sure you want to delete this entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteDiaryEntry(entry.id, entry.createdAt);
              navigation.goBack();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animated.View style={{ opacity: uiOpacity }} pointerEvents={isFocused ? 'none' : 'auto'}>
           <Header title={entry ? 'Edit Entry' : 'New Entry'} />
        </Animated.View>

        <View style={styles.formContainer}>
          <Animated.View style={[styles.moodContainer, { opacity: uiOpacity }]} pointerEvents={isFocused ? 'none' : 'auto'}>
             {MOODS.map((m) => (
                <TouchableOpacity 
                   key={m} 
                   onPress={() => setMood(m)}
                   style={[styles.moodItem, mood === m && styles.moodItemSelected]}
                >
                  <Text style={styles.moodText}>{m}</Text>
                </TouchableOpacity>
             ))}
          </Animated.View>

          <View style={styles.inputWrapper}>
             {showPrompt && !content && !isFocused && (
               <Text style={styles.promptText}>{MICRO_PROMPT}</Text>
             )}
            <TextInput
              style={styles.contentInput}
              placeholder={showPrompt ? '' : "Start writing..."}
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={(text) => {
                 setContent(text);
                 resetIdleTimer();
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowPrompt(false);
              }}
              onBlur={() => setIsFocused(false)}
              multiline
            />
          </View>
        </View>

        <Animated.View style={[styles.buttonContainer, { opacity: uiOpacity }]} pointerEvents={isFocused ? 'none' : 'auto'}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Done</Text>
          </TouchableOpacity>
          {entry && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  moodItem: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  moodItemSelected: {
    backgroundColor: colors.border,
  },
  moodText: {
    fontSize: 24,
  },
  inputWrapper: {
     flex: 1,
     position: 'relative',
  },
  promptText: {
     position: 'absolute',
     top: 0,
     left: 0,
     fontFamily: typography.fontFamilySerif,
     fontSize: 18,
     color: colors.textSecondary,
     fontStyle: 'italic',
     zIndex: -1,
     paddingTop: 4, 
  },
  contentInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: typography.fontFamilySerif,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    lineHeight: 28, // Better readability
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl * 1.5,
  },
  saveButton: {
    backgroundColor: colors.accentSage,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 30,
    marginHorizontal: spacing.sm,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.accentTerracotta,
    marginHorizontal: spacing.sm,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: typography.fontFamilySans,
  },
  deleteButtonText: {
    color: colors.accentTerracotta,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: typography.fontFamilySans,
  },
});

export default AddDiaryScreen;
