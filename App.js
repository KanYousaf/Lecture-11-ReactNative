import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CameraScreen from "./screens/CameraScreen";
import ImageScreen from "./screens/ImageScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ title: "Camera" }}
        />
        <Stack.Screen
          name="ImageScreen"
          component={ImageScreen}
          options={{ title: "Image" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
