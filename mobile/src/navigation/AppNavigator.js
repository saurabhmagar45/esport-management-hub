import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { MainTabNavigator } from './MainTabNavigator';

import { TournamentDetailScreen } from '../screens/tournaments/TournamentDetailScreen';
import { RoomCredentialsScreen } from '../screens/tournaments/RoomCredentialsScreen';
import { CreateTeamScreen } from '../screens/teams/CreateTeamScreen';
import { TeamDetailScreen } from '../screens/teams/TeamDetailScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { HelpSupportScreen } from '../screens/support/HelpSupportScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0a0c14' },
      }}
    >
      {/* Auth Stacks */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Detail & Action Screens */}
      <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
      <Stack.Screen name="RoomCredentials" component={RoomCredentialsScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
};
