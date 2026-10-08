import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { UserType } from '../../src/types';
import { t } from '../../src/i18n';
import { BottomActionBar } from '../../src/components';

export default function UserTypeScreen() {
  const { state, setUserType } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<UserType | null>(state.userType || 'hirer');
  const lang = state.language;

  const handleNext = async () => {
    if (!selected) return;
    await setUserType(selected);
    if (selected === 'hirer') {
      router.push('/onboarding/hirer/personal');
    } else {
      router.push('/onboarding/job-seeker/personal');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Centered Logo (Protected with Safe Inset) */}
        <View style={styles.topBar}>
          <Image
            source={require('../../assets/app-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Heading Section */}
        <View style={styles.headingWrap}>
          <Text style={styles.title}>{t('userType.title', lang)}</Text>
          <Text style={styles.subtitle}>{t('userType.subtitle', lang)}</Text>
        </View>

        {/* Compact User Type Option Cards */}
        <View style={styles.cardsWrap}>
          {/* Hirer / Employer Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selected === 'hirer' && styles.optionCardSelected,
            ]}
            onPress={() => setSelected('hirer')}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardEmoji}>🏢</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>
                  {lang === 'en' ? 'EMPLOYER / HIRER' : lang === 'hinglish' ? 'EMPLOYER / HIRER' : 'नियोक्ता'}
                </Text>
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  selected === 'hirer' && styles.titleSelected,
                ]}
                numberOfLines={1}
              >
                {t('userType.hirerTitle', lang)}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {t('userType.hirerSubtitle', lang)}
              </Text>
            </View>

            <View style={[styles.radioCircle, selected === 'hirer' && styles.radioActive]}>
              {selected === 'hirer' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Job Seeker / Worker Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selected === 'job_seeker' && styles.optionCardSelected,
            ]}
            onPress={() => setSelected('job_seeker')}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
              <Text style={styles.cardEmoji}>👷</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={[styles.badgeWrap, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.badgeText, { color: '#EA580C' }]}>
                  {lang === 'en' ? 'WORKER / JOB SEEKER' : lang === 'hinglish' ? 'WORKER / JOB SEEKER' : 'काम खोजने वाले'}
                </Text>
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  selected === 'job_seeker' && styles.titleSelected,
                ]}
                numberOfLines={1}
              >
                {t('userType.seekerTitle', lang)}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {t('userType.seekerSubtitle', lang)}
              </Text>
            </View>

            <View style={[styles.radioCircle, selected === 'job_seeker' && styles.radioActive]}>
              {selected === 'job_seeker' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

      </View>

      {/* Fixed Bottom Action Bar */}
      <BottomActionBar
        onBack={() => router.back()}
        backTitle={`← ${t('onboarding.back', lang)}`}
        onNext={handleNext}
        nextTitle={`${t('onboarding.next', lang)} ➔`}
        nextDisabled={!selected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 132,
    height: 132,
    borderRadius: 18,
  },
  headingWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  cardsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.8,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFFBF5',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  titleSelected: {
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioActive: {
    borderColor: '#F95A00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F95A00',
  },
});
