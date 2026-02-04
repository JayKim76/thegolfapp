import "./global.css";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, History, User, Calendar, Plus, Grid } from 'lucide-react-native';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MemberListScreen from './screens/MemberListScreen';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import CourseSelectScreen from './screens/CourseSelectScreen';
import GroupFormationScreen from './screens/GroupFormationScreen';
import AddMemberScreen from './screens/AddMemberScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ScoreInputScreen from './screens/ScoreInputScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import ScoreListScreen from './screens/ScoreListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Button Component
const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#00FF00',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 5,
    }}
    onPress={onPress}
  >
    <View className="w-16 h-16 rounded-full bg-[#00FF00] items-center justify-center border-4 border-[#0B120B]">
      {children}
    </View>
  </TouchableOpacity>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#142314', // Card Background Color
          borderRadius: 25,
          height: 80,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          paddingBottom: 0, // Reset default padding
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF00',
        tabBarInactiveTintColor: '#4B5563',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-[#1C2A1C] p-2 rounded-xl' : ''}`}>
              <Grid color={color} size={24} />
              {focused && <Text className="text-[#00FF00] text-[10px] font-bold mt-1">홈</Text>}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-[#1C2A1C] p-2 rounded-xl' : ''}`}>
              <History color={color} size={24} />
              {focused && <Text className="text-[#00FF00] text-[10px] font-bold mt-1">기록</Text>}
            </View>
          ),
        }}
      />

      {/* Central Plus Button (Mapped to CourseSelect for now) */}
      <Tab.Screen
        name="NewRound"
        component={CourseSelectScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Plus size={30} color="black" strokeWidth={3} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          ),
          tabBarStyle: { display: 'none' } // Hide tab bar on the modal/screen if needed
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CourseSelect');
          },
        })}
      />

      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-[#1C2A1C] p-2 rounded-xl' : ''}`}>
              <Calendar color={color} size={24} />
              {focused && <Text className="text-[#00FF00] text-[10px] font-bold mt-1">예약</Text>}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-[#1C2A1C] p-2 rounded-xl' : ''}`}>
              <User color={color} size={24} />
              {focused && <Text className="text-[#00FF00] text-[10px] font-bold mt-1">MY</Text>}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding" // Changed to Onboarding to restart flow
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />

          <Stack.Screen name="CourseSelect" component={CourseSelectScreen} />
          <Stack.Screen name="GroupFormation" component={GroupFormationScreen} />
          <Stack.Screen name="MemberList" component={MemberListScreen} />
          <Stack.Screen name="AddMember" component={AddMemberScreen} />
          <Stack.Screen name="ScoreInput" component={ScoreInputScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="ScoreList" component={ScoreListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}