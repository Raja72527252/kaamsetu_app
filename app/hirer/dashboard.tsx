import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { DashboardHeader, DashboardBottomNav, LocationPickerModal } from '../../src/components';
import { HirerProfile, Location } from '../../src/types';
import { DEMO_WORKERS } from '../../src/services/workerService';
import { getSavedIds, toggleSavedItem } from '../../src/services/savedService';
import { t } from '../../src/i18n';

const CATEGORIES = [
  { id: 'all', label: 'सभी जॉब', icon: '💼' },
  { id: 'labour', label: 'मजदूर', icon: '👷' },
  { id: 'electrician', label: 'इलेक्ट्रिशियन', icon: '⚡' },
  { id: 'plumber', label: 'प्लंबर', icon: '🚰' },
  { id: 'carpenter', label: 'कारपेंटर', icon: '🪚' },
  { id: 'driver', label: 'ड्राइवर', icon: '🚗' },
  { id: 'cook', label: 'रसोइया', icon: '👨‍🍳' },
  { id: 'more', label: 'और भी', icon: '🎛️' },
];

export default function HirerDashboardScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();
  const lang = state.language;
  const { width } = useWindowDimensions();
  const workerCardWidth = width < 360 ? width - 44 : width < 620 ? 276 : 258;
  const categoryCardWidth = width < 620 ? 84 : 74;
  const bannerWidth = Math.min(width - 32, 1168);
  const bannerHeight = bannerWidth / 2;

  const profile = state.userProfile as HirerProfile | null;
  const userLoc = profile?.location
    ? `${profile.location.city || profile.location.district}, Bihar`
    : 'Katihar, Bihar';

  const [selectedCat, setSelectedCat] = useState('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeBanner, setActiveBanner] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
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

  useEffect(() => {
    const ownerId = profile?.id || state.phoneNumber || 'local-hirer';
    getSavedIds(ownerId, 'workers')
      .then((ids) => setFavorites(Object.fromEntries(ids.map((id) => [id, true]))))
      .catch((error: unknown) => console.error('Unable to load saved worker state:', error));
  }, [profile?.id, state.phoneNumber]);

  const saveLocation = async (location: Location) => {
    const now = new Date().toISOString();
    const nextProfile: HirerProfile = profile ?? {
      id: state.phoneNumber || 'local-hirer',
      phoneNumber: state.phoneNumber || '',
      userType: 'hirer',
      fullName: 'स्थानीय नियोक्ता',
      verificationStatus: { aadhaarVerified: false, phoneVerified: Boolean(state.phoneNumber), photoVerified: false },
      createdAt: now,
      updatedAt: now,
      hiringCategories: [],
    };
    await updateProfile({ ...nextProfile, location, updatedAt: now });
  };

  const toggleFavorite = async (id: string) => {
    const ownerId = profile?.id || state.phoneNumber || 'local-hirer';
    try {
      const isSaved = await toggleSavedItem(ownerId, 'workers', id);
      setFavorites((prev) => ({ ...prev, [id]: isSaved }));
    } catch (error) {
      console.error('Unable to update saved worker:', error);
      Alert.alert(
        lang === 'en' ? 'Could not save' : lang === 'hinglish' ? 'Save nahi hua' : 'सेव नहीं हुआ',
        lang === 'en' ? 'Workers could not be saved. Please try again.' : lang === 'hinglish' ? 'Workers save nahi hue. Dobara try karein.' : 'कारीगर सेव नहीं हुए। कृपया फिर से कोशिश करें।'
      );
    }
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'home') return;
    if (tab === 'search') router.push('/hirer/workers');
    if (tab === 'post') router.push('/hirer/post');
    if (tab === 'contacts') router.push('/hirer/contacts');
    if (tab === 'profile') router.push('/profile');
  };

  const filteredWorkers = DEMO_WORKERS.filter(
    (worker) =>
      selectedCat === 'all' ||
      selectedCat === 'more' ||
      worker.category.toLowerCase().replace(/\s+/g, '-') === selectedCat
  );
  const notificationWorkers = DEMO_WORKERS
    .filter((worker) => worker.availability === 'available_now')
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Top Header matching language screen style */}
      <DashboardHeader
        location={userLoc}
        notificationCount={notificationWorkers.length}
        avatarSource={require('../../assets/avatar-rahul.png')}
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
              require('../../assets/hirer-campaign-1.png'),
              require('../../assets/hirer-campaign-2.png'),
              require('../../assets/hirer-campaign-3.png'),
            ].map((source, index) => (
              <View key={index} style={[styles.bannerPage, { width: bannerWidth }]}>
                <Image
                  source={source}
                  style={[styles.bannerImage, { height: bannerHeight }]}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel={`KaamSetu employer banner ${index + 1} of 3`}
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
          {CATEGORIES.map((cat) => {
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
                    router.push('/hirer/workers');
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

        {/* Section Header: आपके आसपास उपलब्ध लोग */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('dashboard.nearbyWorkers', lang)}</Text>
          <TouchableOpacity
            onPress={() => router.push('/hirer/workers')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>{lang === 'en' ? 'View all ➔' : lang === 'hinglish' ? 'Sab dekhein ➔' : 'सभी देखें ➔'}</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Worker Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.workersScroll}
        >
          {filteredWorkers.map((worker) => {
            const isFav = favorites[worker.id];
            return (
              <View key={worker.id} style={[styles.workerCard, { width: workerCardWidth }]}>
                {/* Top Badge & Heart */}
                <View style={styles.cardTopRow}>
                  <View style={styles.availabilityPill}>
                    <View style={styles.availDot} />
                    <Text style={styles.availText}>
                      {lang === 'en' ? 'Available Now' : lang === 'hinglish' ? 'Abhi available' : 'अभी उपलब्ध'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(worker.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heartIcon}>{isFav ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Worker Avatar & Info */}
                <View style={styles.workerMainRow}>
                  {worker.photoAsset ? (
                    <Image
                      source={worker.photoAsset}
                      style={styles.workerAvatar}
                    />
                  ) : (
                    <View style={styles.workerAvatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {worker.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName} numberOfLines={1}>
                      {worker.name}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.starIcon}>⭐</Text>
                      <Text style={styles.ratingText}>{worker.rating}</Text>
                      <Text style={styles.reviewsText}>
                        ({worker.reviewsCount || worker.totalRatings} {lang === 'hi' ? 'रिव्यू' : 'reviews'})
                      </Text>
                    </View>
                    <Text style={styles.distanceText}>
                      📍 {worker.distanceKm} km • {worker.district}
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.tagsRow}>
                  {(worker.tags || [worker.category, 'अनुभवी', 'सत्यापित']).map(
                    (tag, idx) => (
                      <View key={idx} style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{tag}</Text>
                      </View>
                    )
                  )}
                </View>

                {/* Experience */}
                <View style={styles.expRow}>
                  <Text style={styles.expIcon}>💼</Text>
                  <Text style={styles.expText}>
                    {worker.experienceText || `${worker.experience} ${lang === 'en' ? 'years experience' : lang === 'hinglish' ? 'saal ka experience' : 'साल अनुभव'}`}
                  </Text>
                </View>

                {/* Daily Rate */}
                <Text style={styles.rateText}>
                  {worker.dailyRate || '₹500–₹800 / दिन'}
                </Text>

                {/* Verification Badge */}
                <View style={styles.verifiedRow}>
                  <Text style={styles.checkIcon}>✅</Text>
                  <Text style={styles.verifiedText}>
                    {worker.isVerified
                      ? (lang === 'en' ? 'Demo verified profile' : lang === 'hinglish' ? 'Demo verified profile' : 'डेमो में सत्यापित प्रोफ़ाइल')
                      : (lang === 'en' ? 'Not verified yet' : lang === 'hinglish' ? 'Abhi verified nahi' : 'अभी सत्यापित नहीं')}
                  </Text>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/hirer/worker/[id]',
                        params: { id: worker.id },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewProfileText}>{t('dashboard.viewProfile', lang)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.unlockBtn}
                    onPress={() => router.push({
                      pathname: '/hirer/worker/[id]',
                      params: { id: worker.id },
                    })}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.unlockBtnText}>{lang === 'en' ? 'Contact options' : lang === 'hinglish' ? 'Contact options' : 'संपर्क विकल्प'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Bottom 5-Tab Navigation Bar */}
      <DashboardBottomNav
        userType="hirer"
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
                  <Text style={styles.notificationsSubtitle}>{t('ui.notifications.workersSubtitle', lang)}</Text>
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

            {notificationWorkers.length > 0 ? (
              <View style={styles.notificationsList}>
                {notificationWorkers.map((worker) => (
                  <TouchableOpacity
                    key={worker.id}
                    style={styles.notificationItem}
                    activeOpacity={0.75}
                    onPress={() => {
                      setNotificationsVisible(false);
                      router.push({ pathname: '/hirer/worker/[id]', params: { id: worker.id } });
                    }}
                  >
                    <View style={styles.notificationItemIcon}>
                      <Text style={styles.notificationWorkerEmoji}>{worker.categoryIcon}</Text>
                    </View>
                    <View style={styles.notificationItemText}>
                      <Text style={styles.notificationItemTitle} numberOfLines={1}>{worker.name}</Text>
                      <Text style={styles.notificationItemMessage} numberOfLines={2}>
                        {worker.category} • {worker.district} {t('ui.notifications.availableIn', lang)}
                      </Text>
                      <Text style={styles.notificationItemTime}>
                        ⭐ {worker.rating} {t('ui.notifications.rating', lang)}{worker.isVerified ? ` • ${t('ui.notifications.verified', lang)}` : ''}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={21} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.notificationsEmpty}>
                <MaterialCommunityIcons name="bell-check-outline" size={34} color={Colors.textLight} />
                <Text style={styles.notificationsEmptyTitle}>{t('ui.notifications.none', lang)}</Text>
                <Text style={styles.notificationsEmptyText}>{t('ui.notifications.workerEmpty', lang)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.notificationsAction}
              onPress={() => {
                setNotificationsVisible(false);
                router.push('/hirer/workers');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.notificationsActionText}>{t('ui.notifications.allWorkers', lang)}</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: Colors.white,
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
  notificationWorkerEmoji: {
    fontSize: 20,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
  },
  viewAllText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    color: '#EA580C',
  },
  workersScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  heartIcon: {
    fontSize: 16,
  },
  workerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  workerAvatar: {
    width: 58,
    height: 64,
    borderRadius: 12,
    marginRight: 10,
  },
  workerAvatarPlaceholder: {
    width: 58,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  starIcon: {
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 10,
    color: '#64748B',
  },
  distanceText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  expText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  rateText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  checkIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  viewProfileBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  viewProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  unlockBtn: {
    flex: 1.3,
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBtn: {
    backgroundColor: '#16A34A',
  },
  unlockBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
});
