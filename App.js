import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import LoginScreen from './Login';
import HomeScreen from './Home';
import Deudor from './Deudor';

const Stack = createStackNavigator();

export default function App() {
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const checkUserExists = async () => {
      const user = await AsyncStorage.getItem('yo');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.flag) {
          setUserExists(true);
        }
      }
    };
    checkUserExists();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!userExists ? (
          <>
          <Stack.Screen
            name="Inicio de Sesion"
            component={LoginScreen}
          />
          <Stack.Screen
              name="Inicio"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Deudor" component={Deudor} />
            </>
        ) : (
          <>
            <Stack.Screen
              name="Inicio"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Deudor" component={Deudor} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}