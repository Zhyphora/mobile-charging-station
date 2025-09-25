import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChargingScreen from "../screens/ChargingScreen";

const Tab = createBottomTabNavigator();

function CustomTabBarButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fabButton}>
        {children}
        {/* Cutout effect */}
        <View style={styles.fabCutout} />
      </View>
    </TouchableOpacity>
  );
}

export default function BottomTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#fb923c",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarIcon: ({ color, size }) => {
            let name: any = "home-outline";
            if (route.name === "Home") name = "home-outline";
            if (route.name === "Profile") name = "person-outline";
            return <Ionicons name={name as any} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Charge"
          component={ChargingScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name={"flash" as any} size={30} color="#fff" />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 18,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    // Add notch for FAB
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  fabContainer: {
    top: -20, // lower the FAB so icon centers vertically in the tab bar
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fb923c",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // Enhanced shadow for floating effect
    ...Platform.select({
      ios: {
        shadowColor: "#fb923c",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
    // Add border for separation
    borderWidth: 4,
    borderColor: "#fff",
  },

  // Cutout effect to make it look like it's floating above the tab bar
  fabCutout: {
    position: "absolute",
    bottom: -4,
    width: 72,
    height: 18,
    backgroundColor: "transparent",
    borderRadius: 38,
    // Create the cutout shadow effect
    ...Platform.select({
      ios: {
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: -1,
      },
    }),
  },
});
