import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { DashboardBottomNav, ScreenHeader, WorkerCard as WorkerCardComponent } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { fetchNearbyWorkers } from '../../src/services/workerService';
import { getSavedIds } from '../../src/services/savedService';
import { WorkerCard } from '../../src/types';

export default function SavedWorkersScreen() {
  const router = useRouter();
  const { state } = useApp();
  const ownerId = state.userProfile?.id || state.phoneNumber || 'local-hirer';
  const [workers, setWorkers] = useState<WorkerCard[]>([]);
  const [error, setError] = useState('');

  const loadSaved = useCallback(async () => {
    try {
      const [ids, availableWorkers] = await Promise.all([getSavedIds(ownerId, 'workers'), fetchNearbyWorkers()]);
      setWorkers(availableWorkers.filter((worker) => ids.includes(worker.id)));
      setError('');
    } catch (loadError) {
      console.error('Unable to load saved workers:', loadError);
      setError('सेव किए गए वर्कर लोड नहीं हो सके। फिर से कोशिश करें।');
    }
  }, [ownerId]);

  useFocusEffect(useCallback(() => { void loadSaved(); }, [loadSaved]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="सेव किए गए वर्कर" subtitle="आपके बुकमार्क किए हुए लोग" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.empty}>{error}</Text> : workers.length === 0 ? (
          <Text style={styles.empty}>अभी कोई वर्कर सेव नहीं है।</Text>
        ) : workers.map((worker) => (
          <WorkerCardComponent
            key={worker.id}
            worker={worker}
            onViewProfile={() => router.push({ pathname: '/hirer/worker/[id]', params: { id: worker.id } })}
          />
        ))}
      </ScrollView>
      <DashboardBottomNav
        userType="hirer"
        activeTab="search"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') router.push('/hirer/workers');
          if (tab === 'post') router.push('/hirer/post');
          if (tab === 'contacts') router.push('/hirer/contacts');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 30 },
  empty: { color: '#64748B', fontSize: 14, lineHeight: 20, textAlign: 'center', padding: 24 },
});
