import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../HomeScreen";
import ProfileScreen from "../ProfileScreen";
import ChargingScreen from "../screens/ChargingScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let name: any = "home-outline";
            if (route.name === "Home") name = "home-outline";
            if (route.name === "Promos") name = "pricetags-outline";
            if (route.name === "Activity") name = "time-outline";
            if (route.name === "Chat") name = "chatbubble-ellipses-outline";
            if (route.name === "Profile") name = "person-outline";
            return <Ionicons name={name} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2e7d32",
          tabBarInactiveTintColor: "#6b6b6b",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Charge" component={ChargingScreen} />
        <Tab.Screen name="Promos" component={ProfileScreen} />
        <Tab.Screen name="Activity" component={ProfileScreen} />
        <Tab.Screen name="Chat" component={ProfileScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
