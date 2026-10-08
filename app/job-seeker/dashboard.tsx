import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { DashboardHeader, DashboardBottomNav, LocationPickerModal } from '../../src/components';
import { Job, JobSeekerProfile, Location } from '../../src/types';
import { fetchNearbyJobs, getAppliedJobIds } from '../../src/services/jobService';
import { submitApplication } from '../../src/services/applicationService';
import { getSavedIds, toggleSavedItem } from '../../src/services/savedService';
import { t } from '../../src/i18n';

const JOB_CATEGORIES = [
  { id: 'all', label: 'सभी जॉब', icon: '💼' },
  { id: 'labour', label: 'मजदूरी', icon: '👷' },
  { id: 'electrician', label: 'इलेक्ट्रिशियन', icon: '⚡' },
  { id: 'plumber', label: 'प्लंबर', icon: '🚰' },
  { id: 'carpenter', label: 'कारपेंटर', icon: '🪚' },
  { id: 'driver', label: 'ड्राइवर', icon: '🚗' },
  { id: 'cook', label: 'होटल/रेस्टोरेंट', icon: '👨‍🍳' },
  { id: 'more', label: 'और भी', icon: '🎛️' },
];

export default function JobSeekerDashboardScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();
  const lang = state.language;
  const { width } = useWindowDimensions();
  const categoryCardWidth = width < 620 ? 84 : 74;
  const bannerWidth = Math.min(width - 32, 1168);
  const bannerHeight = bannerWidth / 2;

  const profile = state.userProfile as JobSeekerProfile | null;
  const userName = profile?.fullName || 'मोहन कुमार';
  const userLoc = profile?.location
    ? `${profile.location.city || profile.location.district}, Bihar`
    : 'Katihar, Bihar';

  const [selectedCat, setSelectedCat] = useState('all');
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applyModalJob, setApplyModalJob] = useState<Job | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(!profile?.location);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextBanner = (activeBanner + 1) % 3;
      bannerScrollRef.current?.scrollTo({ x: nextBanner * bannerWidth, animated: true });
      setActiveBanner(nextBanner);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBanner, bannerWidth]);

  const saveLocation = async (location: Location) => {
    if (!profile) {
      Alert.alert(t('ui.messages.incompleteProfile', lang), t('ui.messages.completeProfile', lang));
      return;
    }
    await updateProfile({ ...profile, location, updatedAt: new Date().toISOString() });
  };

  useEffect(() => {
    const ownerId = profile?.id || state.phoneNumber || 'local-seeker';
    Promise.all([fetchNearbyJobs(), getAppliedJobIds(), getSavedIds(ownerId, 'jobs')])
      .then(([availableJobs, appliedIds, savedIds]) => {
        setJobs(availableJobs);
        setAppliedJobs(Object.fromEntries(appliedIds.map((id) => [id, true])));
        setBookmarkedJobs(Object.fromEntries(savedIds.map((id) => [id, true])));
      })
      .catch((error: unknown) => {
        console.error('Unable to load jobs and applications:', error);
        Alert.alert(t('ui.messages.loadError', lang), t('ui.messages.jobsLoadError', lang));
      });
  }, [profile?.id, state.phoneNumber]);

  const toggleBookmark = async (id: string) => {
    const ownerId = profile?.id || state.phoneNumber || 'local-seeker';
    try {
      const isSaved = await toggleSavedItem(ownerId, 'jobs', id);
      setBookmarkedJobs((prev) => ({ ...prev, [id]: isSaved }));
    } catch (error) {
      console.error('Unable to update saved job:', error);
      Alert.alert(t('ui.messages.saveError', lang), t('ui.messages.jobSaveError', lang));
    }
  };

  const handleApply = (job: Job) => {
    setApplyModalJob(job);
  };

  const confirmApply = async (jobId: string) => {
    try {
      await submitApplication(
        jobId,
        profile?.id || state.phoneNumber || 'local-seeker',
        profile?.fullName || userName
      );
    } catch (error) {
      console.error('Unable to save job application:', error);
      Alert.alert(t('ui.messages.applicationError', lang), t('ui.messages.applicationSaveError', lang));
      return;
    }
    setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    setApplyModalJob(null);
    Alert.alert(
      t('ui.messages.applicationSent', lang),
      t('ui.messages.applicationSentMessage', lang)
    );
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'home') return;
    if (tab === 'jobs') router.push('/job-seeker/jobs');
    if (tab === 'saved') router.push('/job-seeker/saved' as Href);
    if (tab === 'update_profile') router.push('/profile');
    if (tab === 'applications') {
      router.push('/job-seeker/applications');
    }
    if (tab === 'profile') router.push('/profile');
  };

  const filteredJobs = jobs.filter((j) => {
    return selectedCat === 'all' || selectedCat === 'more' ||
      j.category.toLowerCase().replace(/\s+/g, '-') === selectedCat;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Top Header matching language screen style */}
      <DashboardHeader
        location={userLoc}
        notificationCount={jobs.filter((job) => job.isNew).length}
        avatarSource={require('../../assets/avatar-mohan.png')}
        onLocationPress={() => setLocationPickerVisible(true)}
        onNotificationPress={() => setNotificationsVisible(true)}
        onProfilePress={() => router.push('/profile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerCarouselWrap}>
          <ScrollView
            ref={bannerScrollRef}
            style={{ width: bannerWidth }}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const page = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
              setActiveBanner(page);
            }}
          >
            {[
              require('../../assets/worker-campaign-1.png'),
              require('../../assets/worker-campaign-2.png'),
              require('../../assets/worker-campaign-3.png'),
            ].map((source, index) => (
              <View key={index} style={[styles.bannerPage, { width: bannerWidth }]}>
                <Image
                  source={source}
                  style={[styles.bannerImage, { height: bannerHeight }]}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel={`KaamSetu job seeker banner ${index + 1} of 3`}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.bannerPagination}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.bannerDot,
                  index === activeBanner && styles.bannerDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Horizontal Category Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {JOB_CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                  { width: categoryCardWidth },
                ]}
                onPress={() => {
                  if (cat.id === 'more') {
                    router.push('/job-seeker/jobs');
                  } else {
                    setSelectedCat(cat.id);
                  }
                }}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.catIconWrap,
                    isSelected && styles.catIconWrapSelected,
                  ]}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.catLabel,
                    isSelected && styles.catLabelSelected,
                  ]}
                  numberOfLines={2}
                >
                  {t(`categories.${cat.id}`, lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Vertical Job Cards Stack */}
        <View style={styles.jobsList}>
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedJobs[job.id];
            const isApplied = appliedJobs[job.id];

            return (
              <View key={job.id} style={styles.jobCard}>
                {/* Thumbnail & Main Content Row */}
                <View style={styles.jobTopRow}>
                  {/* Thumbnail Image with NEW Badge */}
                  <View style={styles.thumbnailWrap}>
                    {job.photoAsset ? (
                      <Image
                        source={job.photoAsset}
                        style={styles.jobThumbnail}
                      />
                    ) : (
                      <View style={styles.jobThumbFallback}>
                        <Text style={styles.thumbEmoji}>{job.categoryIcon}</Text>
                      </View>
                    )}
                    {job.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>{t('ui.jobs.new', lang)}</Text>
                      </View>
                    )}
                  </View>

                  {/* Job Details */}
                  <View style={styles.jobInfo}>
                    <View style={styles.titleWageRow}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <View style={styles.wageBookmarkRow}>
                        <Text style={styles.wageText}>
                          {job.wageText || `₹${job.salaryMin} / दिन`}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleBookmark(job.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.bookmarkIcon}>
                            {isBookmarked ? '🔖' : '📑'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.employerName} numberOfLines={1}>
                      {job.hirerBusinessName || job.hirerName}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaLocation} numberOfLines={1}>
                        📍 {job.district}, {job.area} ({job.distanceKm} km)
                      </Text>
                      <Text style={styles.metaBullet}>•</Text>
                      <Text style={styles.metaTime}>📅 {job.postedAt}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Tags and Apply Button Row */}
                <View style={styles.jobBottomRow}>
                  <View style={styles.jobTagsRow}>
                    {(job.tags || [job.jobType, 'तुरंत चाहिए']).map(
                      (tag, idx) => (
                        <View key={idx} style={styles.jobTagPill}>
                          <Text style={styles.jobTagText}>{tag}</Text>
                        </View>
                      )
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      isApplied && styles.appliedBtn,
                    ]}
                    onPress={() =>
                      isApplied
                        ? Alert.alert(t('ui.jobs.applied', lang), t('ui.jobs.alreadyApplied', lang))
                        : handleApply(job)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.applyBtnText}>
                      {isApplied ? `${t('ui.jobs.applied', lang)} ✓` : `${t('ui.jobs.apply', lang)} ➔`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Bottom 5-Tab Navigation Bar */}
      <DashboardBottomNav
        userType="job_seeker"
        activeTab="home"
        onTabPress={handleTabPress}
      />

      <LocationPickerModal
        visible={locationPickerVisible}
        initial={profile?.location}
        onClose={() => setLocationPickerVisible(false)}
        onSelect={saveLocation}
      />

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.notificationsBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setNotificationsVisible(false)}
            accessibilityLabel="सूचनाएं बंद करें"
          />
          <View style={styles.notificationsCard}>
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsTitleRow}>
                <View style={styles.notificationsIconWrap}>
                  <MaterialCommunityIcons name="bell-outline" size={21} color={Colors.primary} />
                </View>
                <View style={styles.notificationsTitleCol}>
                  <Text style={styles.notificationsTitle}>{t('ui.notifications.title', lang)}</Text>
                  <Text style={styles.notificationsSubtitle}>{t('ui.notifications.jobsSubtitle', lang)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.notificationsClose}
                onPress={() => setNotificationsVisible(false)}
                activeOpacity={0.75}
                accessibilityLabel="बंद करें"
              >
                <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {jobs.some((job) => job.isNew) ? (
              <View style={styles.notificationsList}>
                {jobs.filter((job) => job.isNew).slice(0, 3).map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.notificationItem}
                    activeOpacity={0.75}
                    onPress={() => {
                      setNotificationsVisible(false);
                      router.push({ pathname: '/job-seeker/job/[id]', params: { id: job.id } });
                    }}
                  >
                    <View style={styles.notificationItemIcon}>
                      <MaterialCommunityIcons name="briefcase-plus-outline" size={19} color={Colors.primary} />
                    </View>
                    <View style={styles.notificationItemText}>
                      <Text style={styles.notificationItemTitle} numberOfLines={1}>{job.title}</Text>
                      <Text style={styles.notificationItemMessage} numberOfLines={2}>
                        {job.district}, {job.area}: {t('ui.notifications.newJobIn', lang)}
                      </Text>
                      <Text style={styles.notificationItemTime}>{job.postedAt}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={21} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.notificationsEmpty}>
                <MaterialCommunityIcons name="bell-check-outline" size={34} color={Colors.textLight} />
                <Text style={styles.notificationsEmptyTitle}>{t('ui.notifications.none', lang)}</Text>
                <Text style={styles.notificationsEmptyText}>{t('ui.notifications.jobEmpty', lang)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.notificationsAction}
              onPress={() => {
                setNotificationsVisible(false);
                router.push('/job-seeker/jobs');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.notificationsActionText}>{t('ui.notifications.allJobs', lang)}</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Apply Job Confirmation Modal */}
      <Modal visible={Boolean(applyModalJob)} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setApplyModalJob(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('ui.messages.applyTitle', lang)}</Text>
            <Text style={styles.modalSub}>
              {applyModalJob?.title} • {applyModalJob?.hirerBusinessName || applyModalJob?.hirerName}
            </Text>

            <View style={styles.applySummaryCard}>
              <Text style={styles.applyWage}>
                {applyModalJob?.wageText || `₹${applyModalJob?.salaryMin} / दिन`}
              </Text>
              <Text style={styles.applyLoc}>
                📍 {applyModalJob?.district}, {applyModalJob?.area} ({applyModalJob?.distanceKm} km दूर)
              </Text>
              <Text style={styles.applyNote}>
                ✓ आपकी सत्यापित प्रोफाइल और अनुभव सीधे नियोक्ता को दिखाया जाएगा।
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmApplyBtn}
              onPress={() => applyModalJob && confirmApply(applyModalJob.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmApplyText}>{t('ui.messages.confirmApply', lang)}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingBottom: 20,
  },
  bannerCarouselWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  bannerPage: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  bannerDotActive: {
    width: 18,
    backgroundColor: '#EA580C',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 14,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 84,
    minHeight: 94,
    justifyContent: 'center',
  },
  categoryCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catIconWrapSelected: {
    backgroundColor: '#FFEDD5',
  },
  catEmoji: {
    fontSize: 22,
  },
  catLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  catLabelSelected: {
    color: '#EA580C',
    fontWeight: '800',
  },
  bannerImage: {
    width: '100%',
    height: 145,
  },
  jobsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  thumbnailWrap: {
    position: 'relative',
    marginRight: 10,
  },
  jobThumbnail: {
    width: 68,
    height: 52,
    borderRadius: 10,
  },
  jobThumbFallback: {
    width: 68,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 24,
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  jobInfo: {
    flex: 1,
  },
  titleWageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    paddingRight: 6,
  },
  wageBookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wageText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  employerName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaLocation: {
    fontSize: 11,
    color: '#64748B',
    maxWidth: 150,
  },
  metaBullet: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  metaTime: {
    fontSize: 11,
    color: '#64748B',
  },
  jobBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 2,
  },
  jobTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    paddingRight: 8,
  },
  jobTagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  appliedBtn: {
    backgroundColor: '#16A34A',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  applySummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  applyWage: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803D',
    marginBottom: 4,
  },
  applyLoc: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 8,
  },
  applyNote: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  confirmApplyBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmApplyText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  notificationsBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  notificationsCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    padding: 20,
    borderRadius: 22,
    backgroundColor: Colors.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  notificationsIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  notificationsTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  notificationsTitle: {
    color: Colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
  },
  notificationsSubtitle: {
    marginTop: 2,
    color: Colors.textMuted,
    fontSize: 12,
  },
  notificationsClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationsList: {
    gap: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  notificationItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notificationItemText: {
    flex: 1,
    minWidth: 0,
  },
  notificationItemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  notificationItemMessage: {
    marginTop: 2,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  notificationItemTime: {
    marginTop: 4,
    color: Colors.textMuted,
    fontSize: 10,
  },
  notificationsEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  notificationsEmptyTitle: {
    marginTop: 8,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  notificationsEmptyText: {
    marginTop: 4,
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  notificationsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  notificationsActionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
