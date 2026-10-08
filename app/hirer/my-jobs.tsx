import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardBottomNav, ScreenHeader } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { deleteJobPost, getJobPosts, updateJobPost } from '../../src/services/jobService';
import { HirerProfile, Job } from '../../src/types';

type JobTab = 'active' | 'completed' | 'drafts' | 'expired';

export default function MyJobsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const profile = state.userProfile as HirerProfile | null;
  const ownerId = profile?.id || state.phoneNumber || 'local-hirer';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<JobTab>('active');
  const [error, setError] = useState('');

  const loadPosts = useCallback(() => {
    getJobPosts()
      .then((posts) => setJobs(posts.filter((job) => job.hirerId === ownerId)))
      .catch((loadError: unknown) => {
        console.error('Unable to load employer job posts:', loadError);
        setError('आपकी पोस्ट लोड नहीं हो सकीं। कृपया फिर से कोशिश करें।');
      });
  }, [ownerId]);

  useFocusEffect(useCallback(() => { loadPosts(); }, [loadPosts]));

  const toggleJobStatus = async (job: Job) => {
    try {
      await updateJobPost(job.id, { isActive: !job.isActive });
      setJobs((current) => current.map((item) => item.id === job.id ? { ...item, isActive: !job.isActive } : item));
    } catch (updateError) {
      console.error('Unable to update job post:', updateError);
      setError('जॉब की स्थिति अपडेट नहीं हुई। कृपया फिर से कोशिश करें।');
    }
  };

  const removeJob = async (jobId: string) => {
    try {
      await deleteJobPost(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (deleteError) {
      console.error('Unable to delete job post:', deleteError);
      setError('जॉब पोस्ट नहीं हटाई जा सकी। कृपया फिर से कोशिश करें।');
    }
  };
  const visibleJobs = jobs.filter((job) => activeTab === 'active'
    ? job.isActive
    : activeTab === 'completed'
      ? !job.isActive
      : false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="मेरी जॉब पोस्ट्स" subtitle="अपनी पोस्ट देखें और भर्ती पूरी होने पर बंद करें" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/hirer/post')}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.createText}>नई जॉब पोस्ट करें</Text>
        </TouchableOpacity>
        <View style={styles.tabs}>
          {([
            ['active', 'Active'],
            ['completed', 'Completed'],
            ['drafts', 'Drafts'],
            ['expired', 'Expired'],
          ] as const).map(([key, label]) => (
            <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.activeTab]} onPress={() => setActiveTab(key)}>
              <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : visibleJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="briefcase-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>इस सूची में कोई जॉब नहीं</Text>
            <Text style={styles.emptyText}>नई जॉब पोस्ट करें या दूसरी सूची चुनें।</Text>
          </View>
        ) : visibleJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHead}>
              <View style={styles.categoryIcon}><Text style={styles.categoryEmoji}>{job.categoryIcon}</Text></View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMeta}>{job.area}, {job.district} · {job.wageText}</Text>
              </View>
            </View>
            <View style={styles.jobActions}>
              <TouchableOpacity
                style={styles.statusButton}
                onPress={() => router.push(`/hirer/job/${job.id}/applicants` as Href)}
              >
                <Text style={styles.statusButtonText}>आवेदक देखें</Text>
              </TouchableOpacity>
              <View style={[styles.statusPill, job.isActive ? styles.activePill : styles.closedPill]}>
                <Text style={[styles.statusText, job.isActive ? styles.activeText : styles.closedText]}>{job.isActive ? 'सक्रिय' : 'बंद'}</Text>
              </View>
              <TouchableOpacity style={styles.statusButton} onPress={() => toggleJobStatus(job)}>
                <Text style={styles.statusButtonText}>{job.isActive ? 'भर्ती पूरी · पोस्ट बंद करें' : 'पोस्ट फिर से चालू करें'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => removeJob(job.id)} accessibilityRole="button" accessibilityLabel={`${job.title} पोस्ट हटाएं`}>
                <MaterialCommunityIcons name="trash-can-outline" size={17} color="#B91C1C" />
                <Text style={styles.deleteText}>हटाएं</Text>
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
          if (tab === 'post') router.push('/hirer/post');
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
  createButton: { minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 13, marginBottom: 14 },
  createText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  activeTab: { backgroundColor: '#FFF7ED', borderColor: Colors.primary },
  tabText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  activeTabText: { color: Colors.primary },
  error: { color: '#B91C1C', fontSize: 13, textAlign: 'center', marginTop: 24 },
  emptyCard: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  jobCard: { padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, marginBottom: 11 },
  jobHead: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 22 },
  jobInfo: { flex: 1, minWidth: 0, marginLeft: 12 },
  jobTitle: { color: '#0F172A', fontSize: 14, lineHeight: 20, fontWeight: '800' },
  jobMeta: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 4 },
  jobActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 13 },
  statusPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  activePill: { backgroundColor: '#ECFDF5' },
  closedPill: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 11, fontWeight: '800' },
  activeText: { color: '#047857' },
  closedText: { color: '#64748B' },
  statusButton: { paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10 },
  statusButtonText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 8 },
  deleteText: { fontSize: 11, fontWeight: '700', color: '#B91C1C' },
});
