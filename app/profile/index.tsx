import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { DashboardBottomNav } from '../../src/components';
import { HirerProfile, JobSeekerProfile, Language, Availability } from '../../src/types';
import { t } from '../../src/i18n';

const LANG_OPTIONS: { code: Language; label: string }[] = [
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'en', label: 'English' },
  { code: 'hinglish', label: 'Hinglish' },
];

export default function ProfileScreen() {
  const { state, logout, setLanguage, updateProfile } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 430;

  const isHirer = state.userType === 'hirer';

  // Active Tab per role
  const [hirerTab, setHirerTab] = useState<'details' | 'hiring' | 'location' | 'settings'>('details');
  const [seekerTab, setSeekerTab] = useState<'details' | 'skills' | 'availability' | 'settings'>('details');

  // Modals
  const [langModal, setLangModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [availModal, setAvailModal] = useState(false);
  const profile = state.userProfile;
  const hirerProfile = profile as HirerProfile | null;
  const seekerProfile = profile as JobSeekerProfile | null;

  // Availability state
  const currentAvailability: Availability = seekerProfile?.availability || 'available_now';

  const handleUpdateAvailability = async (avail: Availability) => {
    if (seekerProfile) {
      await updateProfile({
        ...seekerProfile,
        availability: avail,
        updatedAt: new Date().toISOString(),
      });
    }
    setAvailModal(false);
    Alert.alert('Status Updated', 'आपकी कार्य उपलब्धता अपडेट हो गई है।');
  };

  const handleLogout = () => {
    Alert.alert(
      'लॉगआउट / Logout',
      'क्या आप वाकई अपने खाते से लॉगआउट करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'लॉगआउट करें',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/language');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Top Header matching mockup */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('profile.title', state.language)}</Text>

        <TouchableOpacity
          style={styles.settingsHeaderBtn}
          onPress={() => {
            if (isHirer) setHirerTab('settings');
            else setSeekerTab('settings');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsHeaderIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { width: '100%', maxWidth: 1024, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {isHirer ? (
          /* ========================================================== */
          /* ================== HIRER PROFILE (LEFT MOCKUP) =========== */
          /* ========================================================== */
          <View style={styles.profileSection}>
            {/* User Info Card */}
            <View style={[styles.userCard, compact && styles.userCardCompact]}>
              <View style={styles.avatarWrap}>
                <Image
                  source={require('../../assets/avatar-rahul.png')}
                  style={styles.avatarImage}
                />
              </View>

              <View style={styles.userInfoCol}>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, compact && styles.userNameCompact]} numberOfLines={1} ellipsizeMode="tail">
                    {hirerProfile?.fullName || 'Rahul Kumar'}
                  </Text>
                  <View style={styles.verifiedBadgeGreen}>
                    <Text style={styles.verifiedCheckIcon}>✓</Text>
                    <Text style={styles.verifiedBadgeText} numberOfLines={1}>
                      {state.language === 'hi' ? 'सत्यापित उपयोगकर्ता' : 'Verified User'}
                    </Text>
                  </View>
                </View>
                <View style={styles.phoneRow}>
                  <Text style={styles.phoneIcon}>📞</Text>
                  <Text style={[styles.phoneText, compact && styles.phoneTextCompact]} numberOfLines={1} ellipsizeMode="middle">
                    {hirerProfile?.phoneNumber || state.phoneNumber
                      ? `+91 ${hirerProfile?.phoneNumber || state.phoneNumber}`
                      : 'फोन नंबर उपलब्ध नहीं'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.editProfileBtnOrange, compact && styles.editProfileBtnCompact]}
                onPress={() => router.push('/onboarding/hirer/personal')}
                activeOpacity={0.8}
              >
                <Text style={styles.editPencilOrange}>✏️</Text>
                <Text style={styles.editProfileTextOrange}>{t('profile.editProfile', state.language)}</Text>
              </TouchableOpacity>
            </View>

            {/* Plan / Account Tier Card */}
            <View style={styles.planCardOrange}>
              <View style={styles.crownCircleOrange}>
                <Text style={styles.crownEmoji}>👑</Text>
              </View>
              <View style={styles.planTextsCol}>
                <Text style={styles.planTitle}>Hirer Account</Text>
                <Text style={styles.planSub}>10 Contacts Left (Monthly Plan)</Text>
              </View>
              <TouchableOpacity
                style={styles.upgradePlanBtn}
                onPress={() => setUpgradeModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradePlanText}>Upgrade Plan</Text>
              </TouchableOpacity>
            </View>

            {/* 4 Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.statEmoji}>👥</Text>
                </View>
                <Text style={styles.statCount}>12</Text>
                <Text style={styles.statLabel}>Workers Contacted</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={styles.statEmoji}>💼</Text>
                </View>
                <Text style={styles.statCount}>4</Text>
                <Text style={styles.statLabel}>Active Hires</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={styles.statEmoji}>📋</Text>
                </View>
                <Text style={styles.statCount}>3</Text>
                <Text style={styles.statLabel}>Ongoing Projects</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FCE7F3' }]}>
                  <Text style={styles.statEmoji}>❤️</Text>
                </View>
                <Text style={styles.statCount}>18</Text>
                <Text style={styles.statLabel}>Saved Profiles</Text>
              </View>
            </View>

            {/* 4 Tabs Bar */}
            <View style={styles.tabsBar}>
              <TouchableOpacity
                style={[styles.tabItem, hirerTab === 'details' && styles.tabItemActiveOrange]}
                onPress={() => setHirerTab('details')}
              >
                <Text style={styles.tabIcon}>👤</Text>
                <Text style={[styles.tabLabel, hirerTab === 'details' && styles.tabLabelActiveOrange]}>
                  My Details
                </Text>
                {hirerTab === 'details' && <View style={styles.tabIndicatorOrange} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, hirerTab === 'hiring' && styles.tabItemActiveOrange]}
                onPress={() => setHirerTab('hiring')}
              >
                <Text style={styles.tabIcon}>💼</Text>
                <Text style={[styles.tabLabel, hirerTab === 'hiring' && styles.tabLabelActiveOrange]}>
                  Hiring Info
                </Text>
                {hirerTab === 'hiring' && <View style={styles.tabIndicatorOrange} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, hirerTab === 'location' && styles.tabItemActiveOrange]}
                onPress={() => setHirerTab('location')}
              >
                <Text style={styles.tabIcon}>📍</Text>
                <Text style={[styles.tabLabel, hirerTab === 'location' && styles.tabLabelActiveOrange]}>
                  Location
                </Text>
                {hirerTab === 'location' && <View style={styles.tabIndicatorOrange} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, hirerTab === 'settings' && styles.tabItemActiveOrange]}
                onPress={() => setHirerTab('settings')}
              >
                <Text style={styles.tabIcon}>⚙️</Text>
                <Text style={[styles.tabLabel, hirerTab === 'settings' && styles.tabLabelActiveOrange]}>
                  Settings
                </Text>
                {hirerTab === 'settings' && <View style={styles.tabIndicatorOrange} />}
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            {hirerTab === 'details' && (
              <View style={styles.tabContentWrap}>
                {/* 1. Personal Details Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconOrange}>👤</Text>
                      <Text style={styles.detailHeaderTitle}>Personal Details</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/hirer/personal')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <Text style={styles.fieldValue}>{hirerProfile?.fullName || 'Rahul Kumar'}</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Mobile Number</Text>
                    <Text style={styles.fieldValue}>
                      {hirerProfile?.phoneNumber || state.phoneNumber
                        ? `+91 ${hirerProfile?.phoneNumber || state.phoneNumber}`
                        : 'फोन नंबर उपलब्ध नहीं'}
                    </Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gender</Text>
                    <Text style={styles.fieldValue}>Male</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Age</Text>
                    <Text style={styles.fieldValue}>28 Years</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Profile Type</Text>
                    <Text style={styles.fieldValue}>Individual / Business</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Business Name</Text>
                    <Text style={styles.fieldValue}>
                      {hirerProfile?.businessName || 'Rahul Construction & Services'}
                    </Text>
                  </View>

                  <View style={[styles.fieldRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.fieldLabel}>About</Text>
                    <Text style={styles.fieldValueMultiline}>
                      {hirerProfile?.aboutWork ||
                        'हम घर, दुकान, ऑफिस और कंस्ट्रक्शन से जुड़े काम के लिए कुशल लोगों की टीम खोजते हैं।'}
                    </Text>
                  </View>
                </View>

                {/* 2. Preferred Hiring Categories */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconOrange}>🛡️</Text>
                      <Text style={styles.detailHeaderTitle}>Preferred Hiring Categories</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/hirer/hiring-info')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.categoryChipsGrid}>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>👷</Text>
                      <Text style={styles.catChipLabel}>मजदूर</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>⚡</Text>
                      <Text style={styles.catChipLabel}>इलेक्ट्रिशियन</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>🚰</Text>
                      <Text style={styles.catChipLabel}>प्लंबर</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>🖌️</Text>
                      <Text style={styles.catChipLabel}>पेंटर</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>🪚</Text>
                      <Text style={styles.catChipLabel}>कारपेंटर</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>👨‍🍳</Text>
                      <Text style={styles.catChipLabel}>रसोइया</Text>
                    </View>
                    <View style={styles.catChipItem}>
                      <Text style={styles.catChipEmoji}>🚗</Text>
                      <Text style={styles.catChipLabel}>ड्राइवर</Text>
                    </View>
                    <View style={[styles.catChipItem, styles.catChipMore]}>
                      <Text style={styles.catChipMoreText}>+3 और</Text>
                    </View>
                  </View>
                </View>

                {/* 3. Location Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconOrange}>📍</Text>
                      <Text style={styles.detailHeaderTitle}>Location</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/hirer/location')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.locationBodyRow}>
                    <View style={styles.locationTextCol}>
                      <Text style={styles.locationTitleCity}>Katihar, Bihar</Text>
                      <Text style={styles.locationSubAddress}>Falka, Katihar - 854105</Text>
                    </View>

                    <Image
                      source={require('../../assets/mini-map.png')}
                      style={styles.miniMapImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </View>
            )}

            {hirerTab === 'hiring' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.detailCard}>
                  <Text style={styles.cardInnerHeading}>🏢 कंपनी एवं व्यवसाय विवरण</Text>
                  <Text style={styles.cardInnerSub}>
                    कंपनी नाम: {hirerProfile?.businessName || 'Rahul Construction & Services'}
                  </Text>
                  <Text style={styles.cardInnerSub}>
                    प्राथमिकता: कुशल मिस्त्री व दैनिक मजदूर (Daily & Monthly Hires)
                  </Text>
                  <TouchableOpacity
                    style={styles.orangeActionBtn}
                    onPress={() => router.push('/onboarding/hirer/hiring-info')}
                  >
                    <Text style={styles.orangeActionBtnText}>हायरिंग जानकारी अपडेट करें</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {hirerTab === 'location' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.detailCard}>
                  <Text style={styles.cardInnerHeading}>📍 आपकी कार्य लोकेशन</Text>
                  <Text style={styles.cardInnerSub}>
                    कटिहार, पूर्णिया और भागलपुर के 25 KM दायरे में कारीगर खोजें
                  </Text>
                  <TouchableOpacity
                    style={styles.orangeActionBtn}
                    onPress={() => router.push('/onboarding/hirer/location')}
                  >
                    <Text style={styles.orangeActionBtnText}>स्थान बदलें (Change GPS Location)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {hirerTab === 'settings' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.settingsMenuCard}>
                  <TouchableOpacity style={styles.settingsRow} onPress={() => setLangModal(true)}>
                    <Text style={styles.settingsRowIcon}>🌐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingsRowTitle}>भाषा बदलें / Change Language</Text>
                      <Text style={styles.settingsRowSub}>वर्तमान: {state.language.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsRow}
                    onPress={() => Alert.alert('Notifications', 'SMS और इन-ऐप अलर्ट चालू हैं।')}
                  >
                    <Text style={styles.settingsRowIcon}>🔔</Text>
                    <Text style={styles.settingsRowTitle}>Notification Preferences</Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsRow}
                    onPress={() => Alert.alert('Privacy', 'KaamSetu पर आपका डेटा 100% सुरक्षित है।')}
                  >
                    <Text style={styles.settingsRowIcon}>🔒</Text>
                    <Text style={styles.settingsRowTitle}>Privacy & Security</Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.settingsRow, { borderBottomWidth: 0 }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.settingsRowIcon}>🚪</Text>
                    <Text style={[styles.settingsRowTitle, { color: '#EF4444' }]}>
                      Logout / लॉगआउट
                    </Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* ========================================================== */
          /* ============= JOB SEEKER PROFILE (RIGHT MOCKUP) ========== */
          /* ========================================================== */
          <View style={styles.profileSection}>
            {/* User Info Card */}
            <View style={[styles.userCard, compact && styles.userCardCompact]}>
              <View style={styles.avatarWrap}>
                <Image
                  source={require('../../assets/avatar-mohan.png')}
                  style={styles.avatarImage}
                />
              </View>

              <View style={styles.userInfoCol}>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, compact && styles.userNameCompact]} numberOfLines={1} ellipsizeMode="tail">
                    {seekerProfile?.fullName || 'Mohan Kumar'}
                  </Text>
                  <View style={styles.verifiedBadgeGreen}>
                    <Text style={styles.verifiedCheckIcon}>✓</Text>
                    <Text style={styles.verifiedBadgeText} numberOfLines={1}>
                      {state.language === 'hi' ? 'सत्यापित उपयोगकर्ता' : 'Verified User'}
                    </Text>
                  </View>
                </View>
                <View style={styles.phoneRow}>
                  <Text style={styles.phoneIcon}>📞</Text>
                  <Text style={[styles.phoneText, compact && styles.phoneTextCompact]} numberOfLines={1} ellipsizeMode="middle">
                    {seekerProfile?.phoneNumber || state.phoneNumber
                      ? `+91 ${seekerProfile?.phoneNumber || state.phoneNumber}`
                      : 'फोन नंबर उपलब्ध नहीं'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.editProfileBtnGreen, compact && styles.editProfileBtnCompact]}
                onPress={() => router.push('/onboarding/job-seeker/personal')}
                activeOpacity={0.8}
              >
                <Text style={styles.editPencilGreen}>✏️</Text>
                <Text style={styles.editProfileTextGreen}>{t('profile.editProfile', state.language)}</Text>
              </TouchableOpacity>
            </View>

            {/* Availability Banner Card */}
            <View style={styles.planCardGreen}>
              <View style={styles.crownCircleGreen}>
                <Text style={styles.crownEmoji}>💼</Text>
              </View>
              <View style={styles.planTextsCol}>
                <Text style={styles.planTitle}>Job Seeker Profile</Text>
                <TouchableOpacity
                  style={styles.availDropdownRow}
                  onPress={() => setAvailModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.availStatusTextGreen}>
                    {currentAvailability === 'available_now'
                      ? 'Available for Work'
                      : currentAvailability === 'available_tomorrow'
                      ? 'Available Tomorrow'
                      : 'Not Available'}
                  </Text>
                  <Text style={styles.availChevronGreen}>⌵</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.changeAvailBtnGreen}
                onPress={() => setAvailModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.changeAvailText}>Availability बदलें</Text>
              </TouchableOpacity>
            </View>

            {/* 4 Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.statEmoji}>🚀</Text>
                </View>
                <Text style={styles.statCount}>24</Text>
                <Text style={styles.statLabel}>Job Applied</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#CCFBF1' }]}>
                  <Text style={styles.statEmoji}>👤</Text>
                </View>
                <Text style={styles.statCount}>5</Text>
                <Text style={styles.statLabel}>Interview</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.statEmoji}>✓</Text>
                </View>
                <Text style={styles.statCount}>3</Text>
                <Text style={styles.statLabel}>Selected</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.statEmoji}>❤️</Text>
                </View>
                <Text style={styles.statCount}>12</Text>
                <Text style={styles.statLabel}>Saved Jobs</Text>
              </View>
            </View>

            {/* 4 Tabs Bar */}
            <View style={styles.tabsBar}>
              <TouchableOpacity
                style={[styles.tabItem, seekerTab === 'details' && styles.tabItemActiveGreen]}
                onPress={() => setSeekerTab('details')}
              >
                <Text style={styles.tabIcon}>👤</Text>
                <Text style={[styles.tabLabel, seekerTab === 'details' && styles.tabLabelActiveGreen]}>
                  My Details
                </Text>
                {seekerTab === 'details' && <View style={styles.tabIndicatorGreen} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, seekerTab === 'skills' && styles.tabItemActiveGreen]}
                onPress={() => setSeekerTab('skills')}
              >
                <Text style={styles.tabIcon}>🧰</Text>
                <Text style={[styles.tabLabel, seekerTab === 'skills' && styles.tabLabelActiveGreen]}>
                  Skills & Experience
                </Text>
                {seekerTab === 'skills' && <View style={styles.tabIndicatorGreen} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, seekerTab === 'availability' && styles.tabItemActiveGreen]}
                onPress={() => setSeekerTab('availability')}
              >
                <Text style={styles.tabIcon}>🕒</Text>
                <Text style={[styles.tabLabel, seekerTab === 'availability' && styles.tabLabelActiveGreen]}>
                  Availability
                </Text>
                {seekerTab === 'availability' && <View style={styles.tabIndicatorGreen} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, seekerTab === 'settings' && styles.tabItemActiveGreen]}
                onPress={() => setSeekerTab('settings')}
              >
                <Text style={styles.tabIcon}>⚙️</Text>
                <Text style={[styles.tabLabel, seekerTab === 'settings' && styles.tabLabelActiveGreen]}>
                  Settings
                </Text>
                {seekerTab === 'settings' && <View style={styles.tabIndicatorGreen} />}
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            {seekerTab === 'details' && (
              <View style={styles.tabContentWrap}>
                {/* 1. Personal Details Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconGreen}>👤</Text>
                      <Text style={styles.detailHeaderTitle}>Personal Details</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/job-seeker/personal')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <Text style={styles.fieldValue}>{seekerProfile?.fullName || 'Mohan Kumar'}</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Mobile Number</Text>
                    <Text style={styles.fieldValue}>
                      {seekerProfile?.phoneNumber || state.phoneNumber
                        ? `+91 ${seekerProfile?.phoneNumber || state.phoneNumber}`
                        : 'फोन नंबर उपलब्ध नहीं'}
                    </Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gender</Text>
                    <Text style={styles.fieldValue}>Male</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Age</Text>
                    <Text style={styles.fieldValue}>25 Years</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Address</Text>
                    <Text style={styles.fieldValue}>Ward No. 12, Falka, Katihar, Bihar</Text>
                  </View>

                  <View style={[styles.fieldRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.fieldLabel}>About Me</Text>
                    <Text style={styles.fieldValueMultiline}>
                      {seekerProfile?.workExperienceDescription ||
                        'मैं एक अनुभवी इलेक्ट्रिशियन हूँ। घर, दुकान और ऑफिस का सारा वायरिंग काम करता हूँ।'}
                    </Text>
                  </View>
                </View>

                {/* 2. Job Category & Skills Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconGreen}>💼</Text>
                      <Text style={styles.detailHeaderTitle}>Job Category & Skills</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/job-seeker/skills')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.skillBadgesRow}>
                    <View style={styles.skillBadgeGreen}>
                      <Text style={styles.skillCheck}>✓</Text>
                      <Text style={styles.skillBadgeTextGreen}>इलेक्ट्रिशियन</Text>
                    </View>
                    <View style={styles.skillBadgeLight}>
                      <Text style={styles.skillBadgeTextLight}>AC Technician</Text>
                    </View>
                    <View style={styles.skillBadgeGreen}>
                      <Text style={styles.skillCheck}>✓</Text>
                      <Text style={styles.skillBadgeTextGreen}>इलेक्ट्रॉनिक रिपेयर</Text>
                    </View>
                    <View style={styles.skillBadgeGreen}>
                      <Text style={styles.skillCheck}>✓</Text>
                      <Text style={styles.skillBadgeTextGreen}>वायरिंग</Text>
                    </View>
                  </View>

                  <View style={styles.experienceAndWageRow}>
                    <View style={styles.expWageChip}>
                      <Text style={styles.expWageIcon}>🧰</Text>
                      <Text style={styles.expWageText}>5+ Years Experience</Text>
                    </View>
                    <View style={styles.expWageChip}>
                      <Text style={styles.expWageIcon}>₹</Text>
                      <Text style={styles.expWageText}>Daily Wage: ₹600 - ₹1,000</Text>
                    </View>
                  </View>
                </View>

                {/* 3. Work Photos Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconGreen}>📷</Text>
                      <Text style={styles.detailHeaderTitle}>Work Photos</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => Alert.alert('Upload Photo', 'कैमरा या गैलरी से काम की फोटो जोड़ें।')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.workPhotosRow}>
                    <Image
                      source={require('../../assets/work-photo-1.png')}
                      style={styles.workPhotoThumb}
                    />
                    <Image
                      source={require('../../assets/work-photo-2.png')}
                      style={styles.workPhotoThumb}
                    />
                    <Image
                      source={require('../../assets/work-photo-3.png')}
                      style={styles.workPhotoThumb}
                    />
                    <Image
                      source={require('../../assets/work-photo-4.png')}
                      style={styles.workPhotoThumb}
                    />
                    <View style={styles.workPhotoMoreBox}>
                      <Text style={styles.workPhotoMoreCount}>+3</Text>
                      <Text style={styles.workPhotoMoreSub}>और फोटो</Text>
                    </View>
                  </View>
                </View>

                {/* 4. Languages Known Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailHeaderLeft}>
                      <Text style={styles.detailHeaderIconGreen}>🗣️</Text>
                      <Text style={styles.detailHeaderTitle}>Languages Known</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardEditPill}
                      onPress={() => router.push('/onboarding/job-seeker/personal')}
                    >
                      <Text style={styles.cardEditPencil}>✏️</Text>
                      <Text style={styles.cardEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.languagesRow}>
                    <View style={styles.langPill}>
                      <Text style={styles.langPillText}>हिंदी</Text>
                    </View>
                    <View style={styles.langPill}>
                      <Text style={styles.langPillText}>बंगाली</Text>
                    </View>
                    <View style={styles.langPill}>
                      <Text style={styles.langPillText}>English</Text>
                    </View>
                    <View style={styles.langPill}>
                      <Text style={styles.langPillText}>Hinglish</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {seekerTab === 'skills' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.detailCard}>
                  <Text style={styles.cardInnerHeading}>⚡ कौशल एवं कार्य अनुभव</Text>
                  <Text style={styles.cardInnerSub}>
                    प्राथमिकता: हाउस वायरिंग, इन्वर्टर फिटिंग, सबमर्सिबल मोटर कनेक्शन
                  </Text>
                  <TouchableOpacity
                    style={styles.greenActionBtn}
                    onPress={() => router.push('/onboarding/job-seeker/skills')}
                  >
                    <Text style={styles.greenActionBtnText}>कौशल अपडेट करें (Update Skills)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {seekerTab === 'availability' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.detailCard}>
                  <Text style={styles.cardInnerHeading}>🕒 आपकी उपलब्धता स्थिति</Text>
                  <Text style={styles.cardInnerSub}>
                    वर्तमान स्थिति: Available for Work (काम के लिए तैयार)
                  </Text>
                  <TouchableOpacity
                    style={styles.greenActionBtn}
                    onPress={() => setAvailModal(true)}
                  >
                    <Text style={styles.greenActionBtnText}>उपलब्धता बदलें</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {seekerTab === 'settings' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.settingsMenuCard}>
                  <TouchableOpacity style={styles.settingsRow} onPress={() => setLangModal(true)}>
                    <Text style={styles.settingsRowIcon}>🌐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingsRowTitle}>भाषा बदलें / Change Language</Text>
                      <Text style={styles.settingsRowSub}>वर्तमान: {state.language.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsRow}
                    onPress={() => Alert.alert('Notifications', 'SMS और इन-ऐप अलर्ट चालू हैं।')}
                  >
                    <Text style={styles.settingsRowIcon}>🔔</Text>
                    <Text style={styles.settingsRowTitle}>Notification Preferences</Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsRow}
                    onPress={() => Alert.alert('Privacy', 'KaamSetu पर आपका डेटा 100% सुरक्षित है।')}
                  >
                    <Text style={styles.settingsRowIcon}>🔒</Text>
                    <Text style={styles.settingsRowTitle}>Privacy & Security</Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.settingsRow, { borderBottomWidth: 0 }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.settingsRowIcon}>🚪</Text>
                    <Text style={[styles.settingsRowTitle, { color: '#EF4444' }]}>
                      Logout / लॉगआउट
                    </Text>
                    <Text style={styles.settingsRowArrow}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Pinned Bottom Navigation Bar so bottom buttons never disappear */}
      <DashboardBottomNav
        userType={isHirer ? 'hirer' : 'job_seeker'}
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'home') {
            router.push(isHirer ? '/hirer/dashboard' : '/job-seeker/dashboard');
          } else if (tab === 'search') {
            router.push('/hirer/workers');
          } else if (tab === 'jobs') {
            router.push('/job-seeker/jobs');
          } else if (tab === 'post') {
            router.push('/hirer/post');
          } else if (tab === 'update_profile') {
            // Already on profile
          } else if (tab === 'contacts') {
            router.push('/hirer/contacts');
          } else if (tab === 'applications') {
            router.push('/job-seeker/applications');
          }
        }}
      />

      {/* Language Switch Modal */}
      <Modal visible={langModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>भाषा चुनें (Select Language)</Text>
            {LANG_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langOption,
                  state.language === item.code && styles.langOptionActive,
                ]}
                onPress={async () => {
                  await setLanguage(item.code);
                  setLangModal(false);
                }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    state.language === item.code && styles.langOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {state.language === item.code && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Upgrade Plan Modal for Hirer */}
      <Modal visible={upgradeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>👑 Upgrade Hirer Plan</Text>
            <Text style={styles.modalDesc}>
              अनलिमिटेड कारीगरों के संपर्क नंबर और डायरेक्ट कॉलिंग की सुविधा प्राप्त करें।
            </Text>
            <View style={styles.planOptionCard}>
              <Text style={styles.planOptionTitle}>Monthly Unlimited</Text>
              <Text style={styles.planOptionPrice}>₹499 / महीना</Text>
              <Text style={styles.planOptionFeature}>✓ 100 Contacts Unlocked</Text>
              <Text style={styles.planOptionFeature}>✓ Direct Phone & WhatsApp Call</Text>
              <Text style={styles.planOptionFeature}>✓ Priority Customer Support</Text>
            </View>
            <TouchableOpacity
              style={styles.modalPrimaryBtnOrange}
              onPress={() => {
                setUpgradeModal(false);
                Alert.alert('Plan Upgraded', 'आपका मंथली प्लान सक्रिय हो गया है!');
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>₹499 में अपग्रेड करें</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setUpgradeModal(false)}
            >
              <Text style={styles.modalCancelText}>रद्द करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Availability Modal for Worker */}
      <Modal visible={availModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvailModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>कार्य उपलब्धता बदलें</Text>
            <TouchableOpacity
              style={[
                styles.availSelectCard,
                currentAvailability === 'available_now' && styles.availSelectActive,
              ]}
              onPress={() => handleUpdateAvailability('available_now')}
            >
              <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.availSelectTitle}>Available Now (अभी उपलब्ध)</Text>
                <Text style={styles.availSelectDesc}>
                  नियोक्ता तुरंत काम के लिए कॉल कर सकते हैं
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.availSelectCard,
                currentAvailability === 'available_tomorrow' && styles.availSelectActive,
              ]}
              onPress={() => handleUpdateAvailability('available_tomorrow')}
            >
              <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.availSelectTitle}>Available Tomorrow (कल से)</Text>
                <Text style={styles.availSelectDesc}>कल के काम के लिए संपर्क करें</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.availSelectCard,
                currentAvailability === 'not_available' && styles.availSelectActive,
              ]}
              onPress={() => handleUpdateAvailability('not_available')}
            >
              <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.availSelectTitle}>Not Available (उपलब्ध नहीं)</Text>
                <Text style={styles.availSelectDesc}>अभी कोई नया काम नहीं चाहिए</Text>
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingsHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  settingsHeaderIcon: {
    fontSize: 18,
  },
  roleToggleWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roleToggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  roleToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  roleToggleBtnActiveHirer: {
    backgroundColor: '#FF6B00',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  roleToggleBtnActiveSeeker: {
    backgroundColor: '#10B981',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  roleToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleToggleTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 48,
  },
  profileSection: {},
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userCardCompact: {
    flexWrap: 'wrap',
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  userInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    marginBottom: 3,
  },
  userName: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  userNameCompact: {
    fontSize: 15,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginBottom: 6,
  },
  phoneIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  phoneText: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  phoneTextCompact: {
    fontSize: 12,
  },
  verifiedBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexShrink: 0,
  },
  verifiedCheckIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
    marginRight: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    flexShrink: 0,
  },
  editProfileBtnOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
  },
  editPencilOrange: {
    fontSize: 11,
    marginRight: 4,
  },
  editProfileTextOrange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  editProfileBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
  },
  editProfileBtnCompact: {
    marginTop: 10,
    marginLeft: 80,
    alignSelf: 'flex-start',
  },
  editPencilGreen: {
    fontSize: 11,
    marginRight: 4,
  },
  editProfileTextGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  planCardOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  crownCircleOrange: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  crownEmoji: {
    fontSize: 18,
  },
  planTextsCol: {
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  planSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  upgradePlanBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  upgradePlanText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  planCardGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  crownCircleGreen: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  availDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availStatusTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginRight: 3,
  },
  availChevronGreen: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '800',
  },
  changeAvailBtnGreen: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  changeAvailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 15,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActiveOrange: {},
  tabItemActiveGreen: {},
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabLabelActiveOrange: {
    color: '#FF6B00',
  },
  tabLabelActiveGreen: {
    color: '#10B981',
  },
  tabIndicatorOrange: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: '#FF6B00',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabIndicatorGreen: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: '#10B981',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabContentWrap: {},
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailHeaderIconOrange: {
    fontSize: 16,
    marginRight: 6,
  },
  detailHeaderIconGreen: {
    fontSize: 16,
    marginRight: 6,
  },
  detailHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardEditPencil: {
    fontSize: 10,
    marginRight: 3,
  },
  cardEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flexBasis: '34%',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
    flexShrink: 1,
  },
  fieldValueMultiline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
    paddingLeft: 12,
  },
  categoryChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  catChipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  catChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  catChipMore: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  catChipMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  locationBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationTextCol: {
    flex: 1,
  },
  locationTitleCity: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationSubAddress: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  miniMapImage: {
    width: 110,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillCheck: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginRight: 4,
  },
  skillBadgeTextGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  skillBadgeLight: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillBadgeTextLight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  experienceAndWageRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  expWageChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expWageIcon: {
    fontSize: 13,
    marginRight: 5,
    fontWeight: '800',
    color: '#059669',
  },
  expWageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  workPhotosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  workPhotoThumb: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workPhotoMoreBox: {
    width: 60,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workPhotoMoreCount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  workPhotoMoreSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  languagesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cardInnerHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardInnerSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 14,
  },
  orangeActionBtn: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  orangeActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  greenActionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  greenActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  settingsMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  settingsRowIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingsRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingsRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingsRowArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  planOptionCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  planOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
    marginBottom: 4,
  },
  planOptionPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  planOptionFeature: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  modalPrimaryBtnOrange: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  availSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  availSelectActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  availSelectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  availSelectDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 10,
  },
  langOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  langOptionTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  check: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '800',
  },
});
