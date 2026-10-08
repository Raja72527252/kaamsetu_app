import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../../src/context/AppContext';
import { Colors } from '../../../src/constants/colors';
import { JobSeekerProfile } from '../../../src/types';

const skillsSchema = z.object({
  skills: z.string().min(2, 'कम से कम एक मुख्य कौशल दर्ज करें'),
  workExperienceDescription: z.string().optional(),
  previousWork: z.string().optional(),
});

type SkillsFormData = z.infer<typeof skillsSchema>;

const AVAILABLE_LANGUAGES = ['हिन्दी', 'भोजपुरी', 'मैथिली', 'अंगिका', 'मगही', 'English'];

export default function JobSeekerSkillsScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();

  const existingProfile = state.userProfile as JobSeekerProfile | null;

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    existingProfile?.languagesKnown || ['हिन्दी', 'भोजपुरी']
  );
  const [workPhotos, setWorkPhotos] = useState<string[]>(
    existingProfile?.workPhotos || []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: existingProfile?.skills || 'House Wiring, Inverter Fitting, MCB Repair',
      workExperienceDescription: existingProfile?.workExperienceDescription || '',
      previousWork: existingProfile?.previousWork || '',
    },
  });

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const pickWorkPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('काम की फोटो जोड़ने के लिए गैलरी परमिशन आवश्यक है।');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].uri) {
      setWorkPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setWorkPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SkillsFormData) => {
    if (existingProfile) {
      await updateProfile({
        ...existingProfile,
        skills: data.skills.trim(),
        workExperienceDescription: data.workExperienceDescription?.trim() || undefined,
        previousWork: data.previousWork?.trim() || undefined,
        languagesKnown: selectedLanguages,
        workPhotos,
        updatedAt: new Date().toISOString(),
      });
    }

    router.push('/onboarding/job-seeker/aadhaar');
  };

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
          <Text style={styles.stepBadgeText}>चरण 4 / 5</Text>
        </View>
      </View>

      {/* Step Progress Track (80% filled) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '80%' }]} />
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
              <Text style={styles.iconEmoji}>⚡</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>हुनर एवं कौशल (Skills & Work)</Text>
              <Text style={styles.sectionSubtitle}>अपने काम और अनुभवों का विवरण दें</Text>
            </View>
          </View>

          {/* Key Skills Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>मुख्य स्किल्स (Key Skills) *</Text>
            <Controller
              control={control}
              name="skills"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.skills) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>⚡</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: हाउस वायरिंग, इन्वर्टर, एमसीबी, मोटर"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {Boolean(errors.skills) && (
              <Text style={styles.errorText}>{errors.skills?.message}</Text>
            )}
            <Text style={styles.helperText}>
              कॉमा लगाकर अपने उन सभी कामों को लिखें जिनमें आप माहिर हैं।
            </Text>
          </View>

          {/* Work Experience Description */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>कार्य अनुभव का विवरण (Work Experience) - वैकल्पिक</Text>
            <Controller
              control={control}
              name="workExperienceDescription"
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="जैसे: पिछले 4 साल से कटिहार, पूर्णिया और भागलपुर में विभिन्न ठेकेदारों और घरों में वायरिंग का काम किया है..."
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            />
          </View>

          {/* Previous Work / Employers */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>पिछला काम या ठेकेदार का नाम (Previous Work) - वैकल्पिक</Text>
            <Controller
              control={control}
              name="previousWork"
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLeftIcon}>🏢</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: मिथिला कंस्ट्रक्शन / आरके इलेक्ट्रॉनिक्स"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
          </View>

          {/* Regional Languages Known */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>जानने वाली भाषाएं (Languages Known)</Text>
            <View style={styles.langChipsRow}>
              {AVAILABLE_LANGUAGES.map((l) => {
                const isSelected = selectedLanguages.includes(l);
                return (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.langChip,
                      isSelected && styles.langChipSelected,
                    ]}
                    onPress={() => toggleLanguage(l)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={styles.chipTick}>
                        <Text style={styles.chipTickText}>✓</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.langChipText,
                        isSelected && styles.langChipTextSelected,
                      ]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Work Photos Upload */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>काम की फोटो अपलोड करें (Work Photos) - वैकल्पिक</Text>
            <Text style={styles.helperText}>
              आपके किए गए काम की फोटो देखकर ग्राहक जल्दी काम देते हैं।
            </Text>

            <View style={styles.photosGrid}>
              {workPhotos.map((uri, index) => (
                <View key={index} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => removePhoto(index)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addPhotoCard}
                onPress={pickWorkPhoto}
                activeOpacity={0.8}
              >
                <View style={styles.addPhotoCircle}>
                  <Text style={styles.plusIcon}>📷</Text>
                </View>
                <Text style={styles.addPhotoText}>फोटो जोड़ें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              आपकी प्रोफाइल सत्यापित होकर ग्राहकों को दिखेगी
            </Text>
          </View>

          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={styles.bottomBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomBackBtnText}>← वापस</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNextBtn}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.88}
            >
              <Text style={styles.bottomNextBtnText}>आगे बढ़ें</Text>
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
    marginBottom: 16,
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
  fieldBlock: {
    marginBottom: 16,
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
  textAreaContainer: {
    height: 84,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textAreaInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  langChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  langChipSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  chipTick: {
    marginRight: 4,
  },
  chipTickText: {
    color: '#F95A00',
    fontSize: 11,
    fontWeight: '900',
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  langChipTextSelected: {
    color: '#F95A00',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  photoRemoveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  addPhotoCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  plusIcon: {
    fontSize: 16,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
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
