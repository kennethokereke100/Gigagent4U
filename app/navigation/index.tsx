import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Screens
import Gig from '../screen/gigagent/gig'; // Main gig screen
import Groups from '../screen/gigagent/groups'; // Groups screen
import Notifications from '../screen/gigagent/notifications'; // Notifications screen
import Profile from '../screen/gigagent/profile'; // Profile screen
import Message from '../screen/message'; // Chat thread
import PrivateMessages from '../screen/privatemessages'; // Inbox

export type GigsStackParamList = {
  EventList: undefined;
  PrivateMessages: undefined;
  Message: { name?: string; initials?: string } | undefined;
};

export type RootTabParamList = {
  GigsTab: undefined;
  GroupsTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const GigsStack = createNativeStackNavigator<GigsStackParamList>();

function GigsNavigator() {
  return (
    <GigsStack.Navigator screenOptions={{ headerShown: false }}>
      <GigsStack.Screen name="EventList" component={Gig} />
      <GigsStack.Screen name="PrivateMessages" component={PrivateMessages} />
      <GigsStack.Screen name="Message" component={Message} />
    </GigsStack.Navigator>
  );
}

export default function RootNav() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 88,
            paddingBottom: 18,
            paddingTop: 6,
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 12,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -2 },
            zIndex: 999,
          },
          tabBarItemStyle: { paddingVertical: 4 },
          tabBarLabelStyle: { fontSize: 12, marginTop: 2 },
        }}
      >
        <Tab.Screen 
          name="GigsTab" 
          component={GigsNavigator}
          options={{
            title: 'Gigs',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={28} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="GroupsTab" 
          component={Groups}
          options={{
            title: 'Groups',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'people' : 'people-outline'} 
                size={28} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="NotificationsTab" 
          component={Notifications}
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'notifications' : 'notifications-outline'} 
                size={28} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="ProfileTab" 
          component={Profile}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={28} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
