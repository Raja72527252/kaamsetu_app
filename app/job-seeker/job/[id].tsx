import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardBottomNav, ScreenHeader } from '../../../src/components';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';
import { fetchJobById, getAppliedJobIds } from '../../../src/services/jobService';
import { submitApplication as persistApplication } from '../../../src/services/applicationService';
import { getSavedIds, toggleSavedItem } from '../../../src/services/savedService';
import { Job } from '../../../src/types';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useApp();
  const profile = state.userProfile;
  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const ownerId = profile?.id || state.phoneNumber || 'local-seeker';
    Promise.all([fetchJobById(id), getAppliedJobIds(), getSavedIds(ownerId, 'jobs')])
      .then(([found, appliedIds, savedIds]) => {
        setJob(found);
        setApplied(appliedIds.includes(id));
        setIsSaved(savedIds.includes(id));
      })
      .catch((error: unknown) => {
        console.error('Unable to load job details:', error);
        Alert.alert('जॉब लोड नहीं हुई', 'कृपया वापस जाकर फिर से कोशिश करें।');
      })
      .finally(() => setLoading(false));
  }, [id, profile?.id, state.phoneNumber]);

  const toggleJobSaved = async () => {
    const ownerId = profile?.id || state.phoneNumber || 'local-seeker';
    try {
      setIsSaved(await toggleSavedItem(ownerId, 'jobs', id));
    } catch (error) {
      console.error('Unable to update saved job:', error);
      Alert.alert('सेव नहीं हुआ', 'जॉब सेव नहीं हो सकी। कृपया फिर से कोशिश करें।');
    }
  };

  const submitApplication = async () => {
    if (!job || applied || submitting) return;
    setSubmitting(true);
    try {
      await persistApplication(
        job.id,
        profile?.id || state.phoneNumber || 'local-seeker',
        profile?.fullName || 'Job seeker'
      );
      setApplied(true);
      Alert.alert('आवेदन भेजा गया', 'नियोक्ता को आपका आवेदन मिल गया है।');
    } catch (error) {
      console.error('Unable to submit job application:', error);
      Alert.alert('आवेदन नहीं भेजा गया', 'कृपया फिर से कोशिश करें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="जॉब की जानकारी"
        subtitle="काम की पूरी जानकारी और आवेदन"
        onBack={() => router.back()}
        rightAction={job ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={toggleJobSaved}
            accessibilityLabel={isSaved ? 'Remove saved job' : 'Save job'}
          >
            <MaterialCommunityIcons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={Colors.primary} />
          </TouchableOpacity>
        ) : undefined}
      />
      {loading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
      ) : !job ? (
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>यह जॉब उपलब्ध नहीं है</Text>
          <TouchableOpacity onPress={() => router.replace('/job-seeker/jobs')}><Text style={styles.link}>दूसरी जॉब खोजें</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.categoryIcon}><Text style={styles.categoryEmoji}>{job.categoryIcon}</Text></View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.company}>{job.hirerBusinessName || job.hirerName}</Text>
            <View style={styles.wagePill}><Text style={styles.wage}>{job.wageText || `₹${job.salaryMin ?? ''}`}</Text></View>
          </View>
          <View style={styles.infoCard}>
            <InfoRow icon="map-marker-outline" label="काम की जगह" value={`${job.area}, ${job.district}`} />
            <InfoRow icon="briefcase-outline" label="काम का प्रकार" value={job.jobType} />
            <InfoRow icon="tag-outline" label="श्रेणी" value={job.category} />
            <InfoRow icon="clock-outline" label="पोस्ट किया" value={job.postedAt} />
          </View>
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>काम का विवरण</Text>
            <Text style={styles.description}>{job.description || 'नियोक्ता ने अतिरिक्त विवरण नहीं दिया है। अधिक जानकारी के लिए आवेदन के बाद संपर्क की प्रतीक्षा करें।'}</Text>
          </View>
          {job.tags && job.tags.length > 0 && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>ज़रूरी जानकारी</Text>
              <View style={styles.tags}>
                {job.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
              </View>
            </View>
          )}
        </ScrollView>
      )}
      {job && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.applyButton, (applied || submitting) && styles.appliedButton]}
            onPress={submitApplication}
            disabled={applied || submitting || state.userType !== 'job_seeker'}
          >
            <Text style={styles.applyText}>
              {state.userType !== 'job_seeker' ? 'आवेदन के लिए उम्मीदवार खाते से लॉगिन करें' : applied ? 'आवेदन भेज दिया गया ✓' : submitting ? 'भेजा जा रहा है…' : 'इस जॉब के लिए आवेदन करें'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <DashboardBottomNav
        userType="job_seeker"
        activeTab="jobs"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/job-seeker/dashboard');
          if (tab === 'jobs') router.push('/job-seeker/jobs');
          if (tab === 'saved') router.push('/job-seeker/saved' as Href);
          if (tab === 'update_profile' || tab === 'profile') router.push('/profile');
          if (tab === 'applications') router.push('/job-seeker/applications');
        }}
      />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={Colors.primary} />
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  saveButton: { padding: 8 },
  loader: { marginTop: 48 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 28 },
  hero: { alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 20 },
  categoryIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  categoryEmoji: { fontSize: 32 },
  jobTitle: { textAlign: 'center', fontSize: 20, lineHeight: 27, fontWeight: '900', color: '#0F172A', marginTop: 14 },
  company: { fontSize: 14, color: '#475569', marginTop: 6, textAlign: 'center' },
  wagePill: { backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7, marginTop: 12 },
  wage: { color: '#047857', fontSize: 15, fontWeight: '800' },
  infoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, paddingHorizontal: 16, marginTop: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 58, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoCopy: { marginLeft: 12, flex: 1 },
  infoLabel: { color: '#64748B', fontSize: 11 },
  infoValue: { color: '#0F172A', fontSize: 13, fontWeight: '700', marginTop: 3 },
  descriptionCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, marginTop: 14 },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  description: { color: '#475569', fontSize: 13, lineHeight: 20, marginTop: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  tag: { color: '#475569', backgroundColor: '#F1F5F9', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, fontSize: 11, fontWeight: '600' },
  footer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', padding: 14 },
  applyButton: { minHeight: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 13, paddingHorizontal: 12 },
  appliedButton: { backgroundColor: '#059669' },
  applyText: { color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontWeight: '800' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: '#334155', fontSize: 16, fontWeight: '700' },
  link: { color: Colors.primary, fontWeight: '800', marginTop: 12 },
});
