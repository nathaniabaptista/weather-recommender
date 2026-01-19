import { useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";

// 1. Prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  // 2. Load the font from your assets folder
  const [fontsLoaded, fontError] = useFonts({
    'Nothing': require('./assets/fonts/nothing-font-5x7.ttf'),
    'Roboto': require('./assets/fonts/Roboto-VariableFont_wdth,wght.ttf'),
  });

  // 3. Callback to hide the splash screen once fonts are ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 4. Return null (stay on splash screen) while fonts are loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}