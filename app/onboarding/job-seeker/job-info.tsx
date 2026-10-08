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
import {
  JOB_CATEGORIES,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
} from '../../../src/constants';
import {
  Availability,
  ExperienceLevel,
  JobSeekerProfile,
  SalaryType,
} from '../../../src/types';

const jobInfoSchema = z.object({
  expectedSalary: z
    .string()
    .min(1, 'कृपया अपेक्षित वेतन दर्ज करें')
    .regex(/^\d+$/, 'केवल अंक (Digits) दर्ज करें'),
});

type JobInfoFormData = z.infer<typeof jobInfoSchema>;

// Top 8 fast-pick categories for workers
const POPULAR_WORK_CATEGORIES = [
  { id: 'labour', labelHi: 'मजदूर', labelEn: 'Labour', icon: '👷' },
  { id: 'electrician', labelHi: 'इलेक्ट्रिशियन', labelEn: 'Electrician', icon: '⚡' },
  { id: 'plumber', labelHi: 'प्लम्बर', labelEn: 'Plumber', icon: '🔧' },
  { id: 'painter', labelHi: 'पेंटर', labelEn: 'Painter', icon: '🎨' },
  { id: 'driver', labelHi: 'ड्राइवर', labelEn: 'Driver', icon: '🚗' },
  { id: 'cook', labelHi: 'रसोइया', labelEn: 'Cook', icon: '🍳' },
  { id: 'carpenter', labelHi: 'बढ़ई', labelEn: 'Carpenter', icon: '🪚' },
  { id: 'salesman', labelHi: 'सेल्समैन', labelEn: 'Salesman', icon: '💼' },
];

export default function JobSeekerJobInfoScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();

  const existingProfile = state.userProfile as JobSeekerProfile | null;

  const [selectedCat, setSelectedCat] = useState<string>(
    existingProfile?.jobCategories?.[0] || 'electrician'
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    existingProfile?.experienceLevel || '3-5'
  );
  const [salaryType, setSalaryType] = useState<SalaryType>(
    existingProfile?.salaryType || 'daily'
  );
  const [availability, setAvailability] = useState<Availability>(
    existingProfile?.availability || 'available_now'
  );
  const [catError, setCatError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobInfoFormData>({
    resolver: zodResolver(jobInfoSchema),
    defaultValues: {
      expectedSalary: existingProfile?.expectedSalaryMin
        ? String(existingProfile.expectedSalaryMin)
        : '600',
    },
  });

  const categoryOptions = JOB_CATEGORIES.map((c) => ({
    label: `${c.icon} ${c.labelHi} (${c.label})`,
    value: c.id,
  }));

  const activeCategory = JOB_CATEGORIES.find((c) => c.id === selectedCat);

  const onSubmit = async (data: JobInfoFormData) => {
    if (!selectedCat) {
      setCatError('कृपया अपना कार्य चुनें (Select job category)');
      return;
    }

    if (existingProfile) {
      await updateProfile({
        ...existingProfile,
        jobCategories: [selectedCat],
        experienceLevel: experience,
        salaryType,
        expectedSalaryMin: parseInt(data.expectedSalary, 10),
        availability,
        updatedAt: new Date().toISOString(),
      });
    }

    router.push('/onboarding/job-seeker/skills');
  };

  const AVAIL_CARDS = [
    { code: 'available_now', label: 'अभी उपलब्ध', sub: 'Available Now', dotColor: '#22C55E' },
    { code: 'available_tomorrow', label: 'कल से उपलब्ध', sub: 'Tomorrow', dotColor: '#F59E0B' },
    { code: 'not_available', label: 'उपलब्ध नहीं', sub: 'Not Available', dotColor: '#EF4444' },
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
          <Text style={styles.stepBadgeText}>चरण 3 / 5</Text>
        </View>
      </View>

      {/* Step Progress Track (60% filled) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '60%' }]} />
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
              <Text style={styles.iconEmoji}>🛠️</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>कार्य एवं अनुभव (Job & Skills)</Text>
              <Text style={styles.sectionSubtitle}>आप कौन सा काम करते हैं और अनुभव कितना है?</Text>
            </View>
          </View>

          {/* Quick 1-Tap Category Grid */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>आपका मुख्य काम (Select Job) *</Text>
            <View style={styles.categoryGrid}>
              {POPULAR_WORK_CATEGORIES.map((cat) => {
                const isSelected = selectedCat === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedCat(cat.id);
                      setCatError(null);
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
              value={selectedCat}
              options={categoryOptions}
              onChange={(val) => {
                setSelectedCat(val);
                setCatError(null);
              }}
              placeholder="कार्य श्रेणी चुनें (Select Category)"
              error={catError || undefined}
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
                  चयनित काम: {activeCategory.labelHi} ({activeCategory.label})
                </Text>
                <Text style={styles.activeSub}>
                  इस काम के लिए मालिक सीधे आपको कॉल कर सकेंगे।
                </Text>
              </View>
              <Text style={styles.activeCheckmark}>✓</Text>
            </View>
          )}

          {/* Experience Chips Selection */}
          <View style={[styles.fieldBlock, { marginTop: 8 }]}>
            <Text style={styles.fieldLabel}>कार्य अनुभव (Experience Level) *</Text>
            <View style={styles.chipsRow}>
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experience === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.choiceChip,
                      isSelected && styles.choiceChipSelected,
                    ]}
                    onPress={() => setExperience(opt.value as ExperienceLevel)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={styles.chipTick}>
                        <Text style={styles.chipTickText}>✓</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.choiceChipText,
                        isSelected && styles.choiceChipTextSelected,
                      ]}
                    >
                      {opt.labelHi}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Salary Type Selection Cards */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>वेतन प्रकार (Salary Type) *</Text>
            <View style={styles.salaryTypeRow}>
              <TouchableOpacity
                style={[
                  styles.salaryTypeCard,
                  salaryType === 'daily' && styles.salaryTypeCardSelected,
                ]}
                onPress={() => setSalaryType('daily')}
                activeOpacity={0.85}
              >
                {salaryType === 'daily' && (
                  <View style={styles.cardTick}>
                    <Text style={styles.cardTickText}>✓</Text>
                  </View>
                )}
                <Text style={styles.salaryEmoji}>📅</Text>
                <Text
                  style={[
                    styles.salaryTitle,
                    salaryType === 'daily' && styles.salaryTitleSelected,
                  ]}
                >
                  प्रतिदिन (दिहाड़ी)
                </Text>
                <Text style={styles.salarySub}>Daily Wage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.salaryTypeCard,
                  salaryType === 'monthly' && styles.salaryTypeCardSelected,
                ]}
                onPress={() => setSalaryType('monthly')}
                activeOpacity={0.85}
              >
                {salaryType === 'monthly' && (
                  <View style={styles.cardTick}>
                    <Text style={styles.cardTickText}>✓</Text>
                  </View>
                )}
                <Text style={styles.salaryEmoji}>📆</Text>
                <Text
                  style={[
                    styles.salaryTitle,
                    salaryType === 'monthly' && styles.salaryTitleSelected,
                  ]}
                >
                  प्रतिमाह (महीना)
                </Text>
                <Text style={styles.salarySub}>Monthly Salary</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expected Salary Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              अपेक्षित वेतन (Expected Salary) - {salaryType === 'daily' ? 'रुपये प्रतिदिन' : 'रुपये प्रतिमाह'} *
            </Text>
            <Controller
              control={control}
              name="expectedSalary"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.expectedSalary) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={salaryType === 'daily' ? 'जैसे: 600' : 'जैसे: 15000'}
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <Text style={styles.salaryUnitTag}>
                    /{salaryType === 'daily' ? 'दिन' : 'माह'}
                  </Text>
                </View>
              )}
            />
            {Boolean(errors.expectedSalary) && (
              <Text style={styles.errorText}>{errors.expectedSalary?.message}</Text>
            )}
          </View>

          {/* Availability Status Cards */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>उपलब्धता स्थिति (Availability) *</Text>
            <View style={styles.availRow}>
              {AVAIL_CARDS.map((item) => {
                const isSelected = availability === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.availCard,
                      isSelected && styles.availCardSelected,
                    ]}
                    onPress={() => setAvailability(item.code as Availability)}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <View style={styles.availTick}>
                        <Text style={styles.availTickText}>✓</Text>
                      </View>
                    )}
                    <View style={[styles.statusDot, { backgroundColor: item.dotColor }]} />
                    <Text
                      style={[
                        styles.availLabel,
                        isSelected && styles.availLabelSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.availSub} numberOfLines={1}>
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              आपके काम और वेतन के अनुसार आपको सही काम मिलेंगे
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  choiceChipSelected: {
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
  choiceChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  choiceChipTextSelected: {
    color: '#F95A00',
  },
  salaryTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  salaryTypeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: 'relative',
  },
  salaryTypeCardSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  cardTick: {
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
  cardTickText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  salaryEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  salaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  salaryTitleSelected: {
    color: '#F95A00',
  },
  salarySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  salaryUnitTag: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  availRow: {
    flexDirection: 'row',
    gap: 8,
  },
  availCard: {
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
  availCardSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  availTick: {
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
  availTickText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  availLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  availLabelSelected: {
    color: '#F95A00',
  },
  availSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
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
