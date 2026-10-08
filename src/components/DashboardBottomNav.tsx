import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';

export type HirerTab = 'home' | 'search' | 'post' | 'contacts' | 'profile';
export type JobSeekerTab = 'home' | 'jobs' | 'applications' | 'saved' | 'profile';

interface DashboardBottomNavProps {
  userType: 'hirer' | 'job_seeker';
  activeTab?: string;
  onTabPress: (tabKey: string) => void;
}

export function DashboardBottomNav({
  userType,
  activeTab = 'home',
  onTabPress,
}: DashboardBottomNavProps) {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const lang = state.language;

  const isHirer = userType === 'hirer';
  const labels = {
    home: lang === 'en' ? 'Home' : lang === 'hinglish' ? 'Home' : 'होम',
    search: isHirer
      ? (lang === 'en' ? 'Find workers' : lang === 'hinglish' ? 'Workers dhundhein' : 'खोजें')
      : (lang === 'en' ? 'Find jobs' : lang === 'hinglish' ? 'Jobs dhundhein' : 'जॉब खोजें'),
    center: isHirer
      ? (lang === 'en' ? 'Create post' : lang === 'hinglish' ? 'Nayi post' : 'नया पोस्ट करें')
      : (lang === 'en' ? 'Applications' : lang === 'hinglish' ? 'Mere applications' : 'मेरे आवेदन'),
    saved: isHirer
      ? (lang === 'en' ? 'Contacts' : lang === 'hinglish' ? 'Mere contacts' : 'मेरे संपर्क')
      : (lang === 'en' ? 'Saved jobs' : lang === 'hinglish' ? 'Saved jobs' : 'सेव्ड जॉब'),
    profile: lang === 'en' ? 'Profile' : lang === 'hinglish' ? 'Profile' : 'प्रोफ़ाइल',
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Tab 1: Home */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabPress('home')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={labels.home}
      >
        <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={23} color={activeTab === 'home' ? '#F4511E' : '#64748B'} />
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
          {labels.home}
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Search / Jobs */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabPress(isHirer ? 'search' : 'jobs')}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Ionicons name="search-outline" size={24} color={(activeTab === 'search' || activeTab === 'jobs') ? '#F4511E' : '#64748B'} />
        <Text style={[styles.tabLabel, (activeTab === 'search' || activeTab === 'jobs') && styles.tabLabelActive]}>
          {labels.search}
        </Text>
      </TouchableOpacity>

      {/* Center Floating Plus Button */}
      <View style={styles.centerBtnWrap}>
        <TouchableOpacity
          style={styles.floatingCenterBtn}
          onPress={() => onTabPress(isHirer ? 'post' : 'applications')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={labels.center}
        >
          <Ionicons name={isHirer ? 'add' : 'document-text-outline'} size={isHirer ? 32 : 22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.centerBtnLabel} numberOfLines={2}>
          {labels.center}
        </Text>
      </View>

      {/* Tab 4: Contacts / Saved Jobs */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabPress(isHirer ? 'contacts' : 'saved')}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <View style={styles.iconWrap}>
          <Ionicons name={isHirer ? 'briefcase-outline' : 'bookmark-outline'} size={23} color={(activeTab === 'contacts' || activeTab === 'saved') ? '#F4511E' : '#64748B'} />
        </View>
        <Text style={[styles.tabLabel, (activeTab === 'contacts' || activeTab === 'saved') && styles.tabLabelActive]}>
          {labels.saved}
        </Text>
      </TouchableOpacity>

      {/* Tab 5: Profile */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabPress('profile')}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={23} color={activeTab === 'profile' ? '#F4511E' : '#64748B'} />
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
          {labels.profile}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    minHeight: 48,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  tabLabelActive: {
    color: '#FF5722',
    fontWeight: '800',
  },
  centerBtnWrap: {
    alignItems: 'center',
    marginTop: -23,
    width: 84,
    flexShrink: 1,
  },
  floatingCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  plusIcon: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 32,
  },
  centerBtnLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 84,
    minHeight: 24,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
