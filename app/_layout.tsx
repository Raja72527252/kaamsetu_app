import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';

function NavigationManager() {
  const { state, isLoading } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0] as string | undefined;
    const inAuth = rootSegment === 'auth';
    const inOnboarding = rootSegment === 'onboarding';
    const inHirer = rootSegment === 'hirer';
    const inJobSeeker = rootSegment === 'job-seeker';
    const inProfile = rootSegment === 'profile';
    const inMarketplaceFeature =
      rootSegment === 'subscription' ||
      rootSegment === 'chat' ||
      rootSegment === 'notifications';

    // 1. Not authenticated -> direct to language selection only if not previewing dashboards or profile
    if (!state.isAuthenticated) {
      if (!inAuth && !inHirer && !inJobSeeker && !inProfile && !inMarketplaceFeature) {
        router.replace('/auth/language');
      }
      return;
    }

    // 2. Authenticated but user type not yet chosen -> direct to user-type
    if (state.isAuthenticated && !state.userType) {
      if (!inOnboarding && !inAuth && !inHirer && !inJobSeeker && !inProfile && !inMarketplaceFeature) {
        router.replace('/onboarding/user-type');
      }
      return;
    }

    // 3. Authenticated & user type chosen, but onboarding incomplete -> direct to onboarding
    if (state.isAuthenticated && state.userType && !state.onboardingCompleted) {
      if (!inOnboarding && !inHirer && !inJobSeeker && !inProfile) {
        if (state.userType === 'hirer') {
          router.replace('/onboarding/hirer/personal');
        } else {
          router.replace('/onboarding/job-seeker/personal');
        }
      }
      return;
    }

    // 4. Authenticated & onboarding complete -> direct to user's dashboard
    if (state.isAuthenticated && state.onboardingCompleted) {
      if (!inHirer && !inJobSeeker && !inProfile && !inMarketplaceFeature) {
        if (state.userType === 'hirer') {
          router.replace('/hirer/dashboard');
        } else {
          router.replace('/job-seeker/dashboard');
        }
      }
    }
  }, [
    state.isAuthenticated,
    state.userType,
    state.onboardingCompleted,
    isLoading,
    segments,
  ]);

  return (
    <View style={styles.container}>
      {/* Navigator is ALWAYS mounted so Expo Router never crashes */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Loading overlay during initial session restoration */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <NavigationManager />
        <StatusBar style="dark" />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});
