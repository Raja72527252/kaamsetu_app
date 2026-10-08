import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardBottomNav, ScreenHeader } from '../../../../src/components';
import { Colors } from '../../../../src/constants/colors';
import { getApplications, updateApplicationStatus } from '../../../../src/services/applicationService';
import { fetchJobById } from '../../../../src/services/jobService';
import { ApplicationRecord } from '../../../../src/services/applicationService';
import { Job } from '../../../../src/types';

export default function ApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<ApplicationRecord[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [selectedJob, allApplications] = await Promise.all([fetchJobById(id), getApplications()]);
      setJob(selectedJob);
      setApplicants(allApplications.filter((application) => application.jobId === id));
      setError('');
    } catch (loadError) {
      console.error('Unable to load job applicants:', loadError);
      setError('आवेदन लोड नहीं हो सके। फिर से कोशिश करें।');
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const setStatus = async (applicationId: string, status: ApplicationRecord['status']) => {
    try {
      await updateApplicationStatus(applicationId, status);
      setApplicants((current) => current.map((item) => item.id === applicationId ? { ...item, status } : item));
    } catch (updateError) {
      console.error('Unable to update applicant status:', updateError);
      setError('आवेदन की स्थिति अपडेट नहीं हुई। फिर से कोशिश करें।');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="उम्मीदवार"
        subtitle={job?.title || 'आपकी जॉब के लिए आवेदन'}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : applicants.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-search-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>अभी आवेदन नहीं आए</Text>
            <Text style={styles.emptyText}>इस जॉब के आवेदन यहां दिखाई देंगे।</Text>
          </View>
        ) : applicants.map((applicant) => (
          <View key={applicant.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{applicant.applicantName.slice(0, 1)}</Text></View>
              <View style={styles.person}>
                <Text style={styles.name}>{applicant.applicantName}</Text>
                <Text style={styles.meta}>आवेदन: {new Date(applicant.appliedAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.status}><Text style={styles.statusText}>{applicant.status}</Text></View>
            </View>
            <Text style={styles.privacyNote}>संपर्क विवरण साझा नहीं किया गया है। संपर्क के लिए entitlement लागू होता है।</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/profile')}>
                <Text style={styles.outlineText}>प्रोफ़ाइल</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setStatus(applicant.id, 'shortlisted')}>
                <Text style={styles.outlineText}>Shortlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => setStatus(applicant.id, 'rejected')}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <DashboardBottomNav
        userType="hirer"
        activeTab="post"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') router.push('/hirer/workers');
          if (tab === 'post') router.push('/hirer/my-jobs');
          if (tab === 'contacts') router.push('/hirer/contacts');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 28 },
  error: { color: '#B91C1C', fontSize: 13, textAlign: 'center', marginTop: 20 },
  emptyCard: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 10 },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  head: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#166534', fontSize: 18, fontWeight: '800' },
  person: { flex: 1, minWidth: 0, marginLeft: 11 },
  name: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  meta: { color: '#64748B', fontSize: 11, marginTop: 4 },
  status: { backgroundColor: '#FEF3C7', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  statusText: { color: '#92400E', fontSize: 10, fontWeight: '800' },
  privacyNote: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 7, marginTop: 12, flexWrap: 'wrap' },
  outlineButton: { borderRadius: 9, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 10, paddingVertical: 8 },
  outlineText: { color: '#334155', fontSize: 11, fontWeight: '700' },
  rejectButton: { borderRadius: 9, borderWidth: 1, borderColor: '#FECACA', paddingHorizontal: 10, paddingVertical: 8 },
  rejectText: { color: '#B91C1C', fontSize: 11, fontWeight: '700' },
});
