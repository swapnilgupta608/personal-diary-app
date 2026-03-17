
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PasscodeScreen from '../screens/PasscodeScreen';
import DiaryListScreen from '../screens/DiaryListScreen';
import AddDiaryScreen from '../screens/AddDiaryScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Passcode: undefined;
  DiaryList: undefined;
  AddDiary: { id?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Passcode" component={PasscodeScreen} />
        ) : (
          <>
            <Stack.Screen name="DiaryList" component={DiaryListScreen} />
            <Stack.Screen name="AddDiary" component={AddDiaryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
