import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, Animated } from 'react-native';

interface PinInputProps {
  length?: number;
  value: string;
  onTextChange: (text: string) => void;
  error?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ length = 4, value, onTextChange, error }) => {
  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
    }
  }, [error, shakeAnimation]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const isFilled = i < value.length;
      const isFocused = i === value.length;

      cells.push(
        <View
          key={i}
          testID={`pin-cell-${i}`}
          style={[
            styles.cell,
            isFocused && styles.cellFocused,
            isFilled && styles.cellFilled,
            error && styles.cellError,
          ]}
        >
          <Text style={styles.cellText}>
            {isFilled ? '•' : ''}
          </Text>
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
        <Pressable onPress={handlePress} style={styles.cellsContainer} testID="pin-cells-container">
          {renderCells()}
        </Pressable>
      </Animated.View>
      <TextInput
        ref={inputRef}
        testID="hidden-pin-input"
        style={styles.hiddenInput}
        value={value}
        onChangeText={onTextChange}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        autoFocus
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cellsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  cell: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  cellFocused: {
    borderColor: '#007AFF',
  },
  cellFilled: {
    borderColor: '#333',
  },
  cellError: {
    borderColor: '#FF3B30',
  },
  cellText: {
    fontSize: 32,
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

export default PinInput;
