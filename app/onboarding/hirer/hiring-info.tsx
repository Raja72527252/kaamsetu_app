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
import { useApp } from '../../../src/context/AppContext';
import { Colors } from '../../../src/constants/colors';
import { SelectPicker } from '../../../src/components';
import { JOB_CATEGORIES } from '../../../src/constants';
import { HirerProfile } from '../../../src/types';

const hiringInfoSchema = z.object({
  businessName: z.string().optional(),
  aboutWork: z.string().optional(),
});

type HiringInfoFormData = z.infer<typeof hiringInfoSchema>;

// Top 8 fast-pick categories for 1-tap selection
const POPULAR_CATEGORIES = [
  { id: 'labour', labelHi: 'मजदूर', labelEn: 'Labour', icon: '👷' },
  { id: 'electrician', labelHi: 'इलेक्ट्रिशियन', labelEn: 'Electrician', icon: '⚡' },
  { id: 'plumber', labelHi: 'प्लम्बर', labelEn: 'Plumber', icon: '🔧' },
  { id: 'painter', labelHi: 'पेंटर', labelEn: 'Painter', icon: '🎨' },
  { id: 'driver', labelHi: 'ड्राइवर', labelEn: 'Driver', icon: '🚗' },
  { id: 'cook', labelHi: 'रसोइया', labelEn: 'Cook', icon: '🍳' },
  { id: 'helper', labelHi: 'हेल्पर', labelEn: 'Helper', icon: '🤝' },
  { id: 'salesman', labelHi: 'सेल्समैन', labelEn: 'Salesman', icon: '💼' },
];

export default function HirerHiringInfoScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();

  const existingProfile = state.userProfile as HirerProfile | null;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    existingProfile?.hiringCategories?.[0] || 'labour'
  );
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
  } = useForm<HiringInfoFormData>({
    resolver: zodResolver(hiringInfoSchema),
    defaultValues: {
      businessName: existingProfile?.businessName || '',
      aboutWork: existingProfile?.aboutWork || '',
    },
  });

  const categoryOptions = JOB_CATEGORIES.map((c) => ({
    label: `${c.icon} ${c.labelHi} (${c.label})`,
    value: c.id,
  }));

  const activeCategory = JOB_CATEGORIES.find((c) => c.id === selectedCategory);

  const onSubmit = async (data: HiringInfoFormData) => {
    if (!selectedCategory) {
      setCategoryError('कृपया कार्य श्रेणी चुनें (Select job category)');
      return;
    }

    if (existingProfile) {
      await updateProfile({
        ...existingProfile,
        hiringCategories: [selectedCategory],
        businessName: data.businessName?.trim() || undefined,
        aboutWork: data.aboutWork?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    }

    router.push('/onboarding/hirer/aadhaar');
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
          <Text style={styles.stepBadgeText}>चरण 3 / 4</Text>
        </View>
      </View>

      {/* Step Progress Track (75% filled) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '75%' }]} />
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
              <Text style={styles.iconEmoji}>💼</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>हायरिंग आवश्यकता (Hiring Info)</Text>
              <Text style={styles.sectionSubtitle}>आप किस तरह के वर्कर को Hire करना चाहते हैं?</Text>
            </View>
          </View>

          {/* Quick 1-Tap Category Grid */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>लोकप्रिय श्रेणियां (Popular Categories) *</Text>
            <View style={styles.categoryGrid}>
              {POPULAR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setCategoryError(null);
                    }}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <View style={styles.categoryTick}>
                        <Text style={styles.categoryTickText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryTitle,
                        isSelected && styles.categoryTitleSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.labelHi}
                    </Text>
                    <Text style={styles.categorySub} numberOfLines={1}>
                      {cat.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* All Categories Dropdown Selector */}
          <View style={styles.fieldBlock}>
            <SelectPicker
              label="या अन्य सभी 20 श्रेणियों में से चुनें *"
              value={selectedCategory}
              options={categoryOptions}
              onChange={(val) => {
                setSelectedCategory(val);
                setCategoryError(null);
              }}
              placeholder="कार्य श्रेणी चुनें (Select Category)"
              error={categoryError || undefined}
            />
          </View>

          {/* Active Category Display Banner */}
          {activeCategory && (
            <View style={styles.activeCategoryBanner}>
              <View style={styles.activeIconCircle}>
                <Text style={styles.activeIconEmoji}>{activeCategory.icon}</Text>
              </View>
              <View style={styles.activeTexts}>
                <Text style={styles.activeTitle}>
                  चयनित: {activeCategory.labelHi} ({activeCategory.label})
                </Text>
                <Text style={styles.activeSub}>
                  इस श्रेणी के उपलब्ध वर्कर्स आपको सबसे ऊपर दिखाए जाएंगे।
                </Text>
              </View>
              <Text style={styles.activeCheckmark}>✓</Text>
            </View>
          )}

          {/* Business / Company Name (Optional) */}
          <View style={[styles.fieldBlock, { marginTop: 8 }]}>
            <Text style={styles.fieldLabel}>दुकान / कंपनी का नाम (Business Name) - वैकल्पिक</Text>
            <Controller
              control={control}
              name="businessName"
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLeftIcon}>🏪</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: मिथिला ट्रेडर्स / शर्मा कंस्ट्रक्शन"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            <Text style={styles.helperText}>
              यदि आपकी कोई दुकान, ठेका, या फर्म है तो नाम दर्ज करें।
            </Text>
          </View>

          {/* About Work / Job Requirements */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>काम का विवरण (About Your Work) - वैकल्पिक</Text>
            <Controller
              control={control}
              name="aboutWork"
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="जैसे: हमें मकान निर्माण के लिए 3 अनुभवी राजमिस्त्री और 4 मजदूर चाहिए..."
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
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              आपकी हायरिंग आवश्यकता के अनुसार सही वर्कर्स से संपर्क होगा
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
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  categoryTick: {
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
  categoryTickText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  categoryTitleSelected: {
    color: '#F95A00',
  },
  categorySub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },
  activeCategoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  activeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activeIconEmoji: {
    fontSize: 20,
  },
  activeTexts: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  activeSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
  },
  activeCheckmark: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
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
