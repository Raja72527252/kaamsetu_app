import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardBottomNav, ScreenHeader } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { DEMO_JOBS, getJobPosts } from '../../src/services/jobService';
import { ApplicationRecord, ApplicationStatus, getApplications } from '../../src/services/applicationService';
import { Job } from '../../src/types';
import { useApp } from '../../src/context/AppContext';

export default function JobApplicationsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [activeStatus, setActiveStatus] = useState<'all' | ApplicationStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getApplications(state.userProfile?.id || state.phoneNumber || 'local-seeker'), getJobPosts()])
      .then(([applications, savedJobs]) => {
        setApplications(applications);
        const appliedIds = new Set(applications.map((application) => application.jobId));
        setJobs([...savedJobs, ...DEMO_JOBS].filter((job) => appliedIds.has(job.id)));
      })
      .catch((loadError: unknown) => {
        console.error('Unable to load job applications:', loadError);
        setError('आवेदन लोड नहीं हो सके। कृपया फिर से कोशिश करें।');
      })
      .finally(() => setLoading(false));
  }, [state.phoneNumber, state.userProfile?.id]);

  const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'भेजा गया',
    shortlisted: 'शॉर्टलिस्ट',
    selected: 'चयनित',
    rejected: 'अस्वीकृत',
  };
  const visibleApplications = applications.filter((application) =>
    activeStatus === 'all' || application.status === activeStatus
  );
  const visibleJobs = visibleApplications.flatMap((application) => {
    const job = jobs.find((item) => item.id === application.jobId);
    return job ? [{ application, job }] : [];
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="मेरे आवेदन" subtitle="जिन जॉब्स के लिए आपने आवेदन किया" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : applications.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="file-document-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>अभी कोई आवेदन नहीं</Text>
            <Text style={styles.emptyText}>जॉब खोजें और आवेदन करें। आपके आवेदन यहां दिखाई देंगे।</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/job-seeker/jobs')}>
              <Text style={styles.primaryText}>जॉब खोजें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabs}>
              {(['all', 'applied', 'shortlisted', 'selected', 'rejected'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setActiveStatus(status)}
                  style={[styles.statusTab, activeStatus === status && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, activeStatus === status && styles.statusTabTextActive]}>
                    {status === 'all' ? 'सभी' : statusLabels[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {visibleJobs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>इस स्थिति में अभी कोई आवेदन नहीं है।</Text>
              </View>
            ) : visibleJobs.map(({ application, job }) => (
              <TouchableOpacity
                key={application.id}
                style={styles.jobCard}
                onPress={() => router.push({ pathname: '/job-seeker/job/[id]', params: { id: job.id } })}
                activeOpacity={0.8}
              >
                <View style={styles.icon}>
                  <Text style={styles.iconText}>{job.categoryIcon}</Text>
                </View>
                <View style={styles.jobDetails}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.employer}>{job.hirerBusinessName || job.hirerName}</Text>
                  <Text style={styles.meta}>{job.area}, {job.district} · {job.wageText || `₹${job.salaryMin ?? ''}`}</Text>
                </View>
                <View style={[styles.appliedPill, application.status === 'selected' && styles.selectedPill]}>
                  <Text style={[styles.appliedText, application.status === 'selected' && styles.selectedText]}>
                    {statusLabels[application.status]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
      <DashboardBottomNav
        userType="job_seeker"
        activeTab="applications"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/job-seeker/dashboard');
          if (tab === 'jobs') router.push('/job-seeker/jobs');
          if (tab === 'saved') router.push('/job-seeker/saved' as Href);
          if (tab === 'update_profile' || tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 28 },
  loader: { marginTop: 48 },
  emptyCard: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  jobCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  jobDetails: { flex: 1, minWidth: 0, marginLeft: 12 },
  jobTitle: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  employer: { color: '#475569', fontSize: 12, marginTop: 4 },
  meta: { color: '#64748B', fontSize: 11, marginTop: 4, lineHeight: 16 },
  appliedPill: { borderRadius: 12, backgroundColor: '#ECFDF5', paddingHorizontal: 9, paddingVertical: 5, marginLeft: 7 },
  appliedText: { color: '#047857', fontSize: 11, fontWeight: '800' },
  statusTabs: { gap: 8, paddingBottom: 14 },
  statusTab: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  statusTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusTabText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  statusTabTextActive: { color: '#FFFFFF' },
  selectedPill: { backgroundColor: '#DBEAFE' },
  selectedText: { color: '#1D4ED8' },
});
