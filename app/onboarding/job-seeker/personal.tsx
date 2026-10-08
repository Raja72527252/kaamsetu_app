import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../../src/context/AppContext';
import { Gender, JobSeekerProfile } from '../../../src/types';
import { t } from '../../../src/i18n';

const seekerPersonalSchema = z.object({
  fullName: z
    .string()
    .min(2, 'कृपया कम से कम 2 अक्षर का नाम दर्ज करें')
    .max(50, 'नाम बहुत लंबा है'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'कृपया अपना लिंग चुनें',
  }),
  age: z
    .string()
    .min(1, 'आयु दर्ज करना जरूरी है')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 18 && num <= 70;
    }, 'आयु 18 से 70 वर्ष के बीच होनी चाहिए'),
});

type SeekerPersonalFormData = z.infer<typeof seekerPersonalSchema>;

export default function JobSeekerPersonalScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();
  const lang = state.language;

  const existingProfile = state.userProfile as JobSeekerProfile | null;
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    existingProfile?.profilePhotoUri
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeekerPersonalFormData>({
    resolver: zodResolver(seekerPersonalSchema),
    defaultValues: {
      fullName: existingProfile?.fullName || '',
      gender: (existingProfile?.gender as 'male' | 'female' | 'other') || 'male',
      age: existingProfile?.age ? String(existingProfile.age) : '25',
    },
  });

  const selectedGender = watch('gender');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('फोटो जोड़ने के लिए गैलरी परमिशन आवश्यक है।');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: SeekerPersonalFormData) => {
    const updated: JobSeekerProfile = {
      id: state.userProfile?.id || 'seeker_' + Date.now(),
      phoneNumber: state.phoneNumber || '9876543210',
      userType: 'job_seeker',
      fullName: data.fullName.trim(),
      gender: data.gender as Gender,
      age: parseInt(data.age, 10),
      profilePhotoUri: photoUri,
      jobCategories: existingProfile?.jobCategories || [],
      location: existingProfile?.location,
      verificationStatus: existingProfile?.verificationStatus || {
        aadhaarVerified: false,
        phoneVerified: true,
        photoVerified: Boolean(photoUri),
      },
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateProfile(updated);
    router.push('/onboarding/job-seeker/location');
  };

  const GENDER_OPTIONS = [
    { code: 'male', label: t('common.male', lang), sub: t('common.male', lang), emoji: '👨' },
    { code: 'female', label: t('common.female', lang), sub: t('common.female', lang), emoji: '👩' },
    { code: 'other', label: t('common.other', lang), sub: t('common.other', lang), emoji: '⚧' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Header Bar with Step Badge */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backCircleBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require('../../../assets/app-logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{t('onboarding.step', lang)} 1 / 5</Text>
        </View>
      </View>

      {/* Thin Step Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '20%' }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircleGreen}>
              <Text style={styles.iconEmoji}>👷</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>{t('onboarding.seeker.personal.title', lang)}</Text>
              <Text style={styles.sectionSubtitle}>
                {lang === 'en' ? 'Enter your personal information' : lang === 'hinglish' ? 'Apni personal details darj karein' : 'अपने बारे में व्यक्तिगत जानकारी दें'}
              </Text>
            </View>
          </View>

          {/* Profile Photo Picker */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarTouchable}
              onPress={pickImage}
              activeOpacity={0.85}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderEmoji}>👷</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHintText}>
              {photoUri ? (lang === 'en' ? 'Tap to change photo' : lang === 'hinglish' ? 'Photo badalne ke liye tap karein' : 'फोटो बदलने के लिए टैप करें') : t('onboarding.hirer.personal.photo', lang)}
            </Text>
          </View>

          {/* Full Name Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{t('onboarding.hirer.personal.fullName', lang)} *</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.fullName) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={lang === 'en' ? 'e.g. Rameshwar Yadav' : lang === 'hinglish' ? 'Jaise: Rameshwar Yadav' : 'जैसे: रामेश्वर यादव'}
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {Boolean(errors.fullName) && (
              <Text style={styles.errorText}>{errors.fullName?.message}</Text>
            )}
          </View>

          {/* Gender Selection Cards */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{t('onboarding.hirer.personal.gender', lang)} *</Text>
            <View style={styles.genderCardsRow}>
              {GENDER_OPTIONS.map((g) => {
                const isSelected = selectedGender === g.code;
                return (
                  <TouchableOpacity
                    key={g.code}
                    style={[
                      styles.genderCard,
                      isSelected && styles.genderCardSelected,
                    ]}
                    onPress={() => setValue('gender', g.code as 'male' | 'female' | 'other')}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <View style={styles.selectedTick}>
                        <Text style={styles.selectedTickText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.genderEmoji}>{g.emoji}</Text>
                    <Text
                      style={[
                        styles.genderLabel,
                        isSelected && styles.genderLabelSelected,
                      ]}
                    >
                      {g.label}
                    </Text>
                    <Text style={styles.genderSub}>{g.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {Boolean(errors.gender) && (
              <Text style={styles.errorText}>{errors.gender?.message}</Text>
            )}
          </View>

          {/* Age Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{t('onboarding.hirer.personal.age', lang)} *</Text>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.age) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>🎂</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: 26"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <Text style={styles.inputRightTag}>{t('common.years', lang)}</Text>
                </View>
              )}
            />
            {Boolean(errors.age) && (
              <Text style={styles.errorText}>{errors.age?.message}</Text>
            )}
          </View>

          {/* Mobile Number Locked Field */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{t('onboarding.hirer.personal.mobile', lang)}</Text>
            <View style={[styles.inputContainer, styles.lockedInputContainer]}>
              <View style={styles.countryWrap}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <View style={styles.verticalDivider} />
              <TextInput
                style={[styles.textInput, styles.lockedTextInput]}
                value={state.phoneNumber || '9876543210'}
                editable={false}
              />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ {lang === 'en' ? 'OTP Verified' : lang === 'hinglish' ? 'OTP Verified' : 'OTP सत्यापित'}</Text>
              </View>
            </View>
            <Text style={styles.helperText}>
              यह नंबर आपके कामसेतु प्रोफाइल से लिंक रहेगा।
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              आपकी जानकारी 100% सुरक्षित और गोपनीय है
            </Text>
          </View>

          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={styles.bottomBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomBackBtnText}>← {t('onboarding.back', lang)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNextBtn}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.88}
            >
              <Text style={styles.bottomNextBtnText}>{t('onboarding.next', lang)}</Text>
              <Text style={styles.bottomNextArrow}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  stepBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F95A00',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  sectionHeaderTexts: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#F95A00',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderEmoji: {
    fontSize: 40,
    color: '#94A3B8',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F95A00',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cameraBadgeIcon: {
    fontSize: 13,
  },
  avatarHintText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  inputLeftIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputRightTag: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  genderCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
  },
  genderCardSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  selectedTick: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: '#F95A00',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  selectedTickText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  genderEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  genderLabelSelected: {
    color: '#F95A00',
  },
  genderSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  lockedInputContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  lockedTextInput: {
    color: '#475569',
  },
  countryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 4,
  },
  fixedBottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  securityNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  securityIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  securityNoteText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomBackBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBackBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  bottomNextBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F95A00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F95A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomNextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginRight: 6,
  },
  bottomNextArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
