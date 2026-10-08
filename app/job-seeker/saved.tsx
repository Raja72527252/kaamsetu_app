import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { DashboardBottomNav, JobCard, ScreenHeader } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { fetchNearbyJobs } from '../../src/services/jobService';
import { getSavedIds } from '../../src/services/savedService';
import { Job } from '../../src/types';

export default function SavedJobsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const ownerId = state.userProfile?.id || state.phoneNumber || 'local-seeker';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');

  const loadSaved = useCallback(async () => {
    try {
      const [ids, availableJobs] = await Promise.all([getSavedIds(ownerId, 'jobs'), fetchNearbyJobs()]);
      setJobs(availableJobs.filter((job) => ids.includes(job.id)));
      setError('');
    } catch (loadError) {
      console.error('Unable to load saved jobs:', loadError);
      setError('Saved jobs could not be loaded. Please try again.');
    }
  }, [ownerId]);

  useFocusEffect(useCallback(() => { void loadSaved(); }, [loadSaved]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="सेव्ड जॉब्स" subtitle="बाद में देखने के लिए रखी गई जॉब्स" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.empty}>{error}</Text> : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>अभी कोई जॉब सेव नहीं है</Text>
            <Text style={styles.empty}>जॉब खोजें और बुकमार्क से सेव करें।</Text>
          </View>
        ) : jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onViewJob={() => router.push({ pathname: '/job-seeker/job/[id]', params: { id: job.id } })}
          />
        ))}
      </ScrollView>
      <DashboardBottomNav
        userType="job_seeker"
        activeTab="saved"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/job-seeker/dashboard');
          if (tab === 'jobs') router.push('/job-seeker/jobs');
          if (tab === 'applications') router.push('/job-seeker/applications');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 30 },
  emptyCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 18, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  empty: { fontSize: 13, lineHeight: 19, color: '#64748B', textAlign: 'center', marginTop: 8 },
});
