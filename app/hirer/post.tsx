import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryChip, DashboardBottomNav, ScreenHeader } from '../../src/components';
import { JOB_CATEGORIES } from '../../src/constants';
import { Colors } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { createJobPost } from '../../src/services/jobService';
import { HirerProfile, Job, SalaryType } from '../../src/types';

export default function CreateJobPostScreen() {
  const router = useRouter();
  const { state } = useApp();
  const profile = state.userProfile as HirerProfile | null;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [area, setArea] = useState(profile?.location?.area || profile?.location?.city || '');
  const [district, setDistrict] = useState(profile?.location?.district || '');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryType, setSalaryType] = useState<SalaryType>('daily');
  const [description, setDescription] = useState('');
  const [workerCount, setWorkerCount] = useState('1');
  const [duration, setDuration] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [startDate, setStartDate] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [contactPreference, setContactPreference] = useState('app');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const categoryName = category.label;

  const submitPost = async () => {
    const min = Number(salaryMin);
    const max = salaryMax ? Number(salaryMax) : undefined;
    const nextErrors: Record<string, string> = {};
    if (title.trim().length < 4) nextErrors.title = 'काम का नाम कम से कम 4 अक्षर का लिखें।';
    if (!area.trim()) nextErrors.area = 'काम का क्षेत्र भरें।';
    if (!district.trim()) nextErrors.district = 'जिला भरें।';
    if (!salaryMin || !Number.isFinite(min) || min <= 0) nextErrors.salaryMin = 'सही शुरुआती वेतन लिखें।';
    if (salaryMax && (!Number.isFinite(max) || (max !== undefined && max < min))) nextErrors.salaryMax = 'अधिकतम वेतन शुरुआती वेतन से कम नहीं हो सकता।';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length) {
      setStep(nextErrors.title ? 2 : nextErrors.area || nextErrors.district ? 3 : 4);
      return;
    }

    const job: Job = {
      id: `job-${Date.now()}`,
      hirerId: profile?.id || state.phoneNumber || 'local-hirer',
      hirerName: profile?.fullName || 'स्थानीय नियोक्ता',
      hirerBusinessName: profile?.businessName || undefined,
      title: title.trim(),
      category: categoryName,
      categoryIcon: category.icon,
      area: area.trim(),
      district: district.trim(),
      salaryMin: min,
      salaryMax: max,
      salaryType,
      wageText: max
        ? `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')} / ${salaryType === 'daily' ? 'दिन' : 'महीना'}`
        : `₹${min.toLocaleString('en-IN')} / ${salaryType === 'daily' ? 'दिन' : 'महीना'}`,
      jobType: 'तुरंत भर्ती',
      postedAt: 'अभी',
      isNew: true,
      tags: ['नई जॉब', salaryType === 'daily' ? 'दैनिक वेतन' : 'मासिक वेतन'],
      description: description.trim(),
      isActive: true,
      ...{
        workerCount: Math.max(1, Number.parseInt(workerCount, 10) || 1),
        durationText: duration.trim(),
        requiredExperience: experience.trim(),
        requiredSkills: skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        startDate: startDate.trim(),
        workingHours: workingHours.trim(),
        contactPreference,
      },
    };

    setSubmitting(true);
    try {
      await createJobPost(job);
      setStep(7);
    } catch (error) {
      console.error('Unable to publish job:', error);
      setSubmitError('जॉब सेव नहीं हो सकी। कृपया फिर से कोशिश करें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="नई जॉब पोस्ट करें"
        subtitle="अपने काम के लिए सही लोगों तक पहुंचें"
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.myPostsLink} onPress={() => router.push('/hirer/my-jobs')}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={17} color={Colors.primary} />
            <Text style={styles.myPostsText}>मेरी जॉब पोस्ट्स देखें</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>{step === 7 ? 'प्रकाशित' : `चरण ${step} / 7`}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(Math.min(step, 6) / 6) * 100}%` }]} /></View>
          </View>
          {step === 7 ? (
            <View style={styles.successCard}>
              <MaterialCommunityIcons name="check-circle" size={56} color="#059669" />
              <Text style={styles.successTitle}>आपकी जॉब पोस्ट हो गई!</Text>
              <Text style={styles.introText}>यह पोस्ट उम्मीदवारों की जॉब सूची में दिखाई देगी।</Text>
              <TouchableOpacity style={styles.submitButton} onPress={() => router.replace('/hirer/my-jobs')}>
                <Text style={styles.submitText}>मेरी पोस्ट देखें</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <>
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons name="briefcase-plus-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.introCopy}>
              <Text style={styles.introTitle}>काम की जानकारी भरें</Text>
              <Text style={styles.introText}>साफ जानकारी से योग्य उम्मीदवार जल्दी मिलेंगे।</Text>
            </View>
          </View>

          {step === 2 && <Field label="काम का नाम *" error={errors.title}>
            <TextInput
              style={styles.input}
              placeholder="जैसे: घर की वायरिंग के लिए इलेक्ट्रिशियन"
              placeholderTextColor={Colors.textLight}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
          </Field>}

          {step === 1 && <><Text style={styles.label}>काम की श्रेणी *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {JOB_CATEGORIES.map((item) => (
              <CategoryChip
                key={item.id}
                label={item.labelHi}
                icon={item.icon}
                selected={category.id === item.id}
                onPress={() => setCategory(item)}
              />
            ))}
          </ScrollView></>}

          {step === 2 && <><Field label="कितने वर्कर चाहिए?">
            <TextInput style={styles.input} placeholder="1" value={workerCount} onChangeText={setWorkerCount} keyboardType="number-pad" />
          </Field>
          <Field label="काम का विवरण">
            <TextInput style={[styles.input, styles.textArea]} placeholder="काम और जिम्मेदारियों के बारे में बताएं..." value={description} onChangeText={setDescription} multiline textAlignVertical="top" />
          </Field></>}

          {step === 3 && <View style={styles.row}>
            <View style={styles.half}>
              <Field label="क्षेत्र / मोहल्ला *" error={errors.area}>
                <TextInput
                  style={styles.input}
                  placeholder="जैसे: कोर्ट रोड"
                  placeholderTextColor={Colors.textLight}
                  value={area}
                  onChangeText={setArea}
                />
              </Field>
            </View>
            <View style={styles.half}>
              <Field label="जिला *" error={errors.district}>
                <TextInput
                  style={styles.input}
                  placeholder="जैसे: Katihar"
                  placeholderTextColor={Colors.textLight}
                  value={district}
                  onChangeText={setDistrict}
                />
              </Field>
            </View>
          </View>}

          {step === 4 && <><Text style={styles.label}>वेतन का प्रकार *</Text>
          <View style={styles.choiceRow}>
            {(['daily', 'monthly'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.choice, salaryType === type && styles.choiceActive]}
                onPress={() => setSalaryType(type)}
                accessibilityRole="radio"
                accessibilityState={{ selected: salaryType === type }}
              >
                <MaterialCommunityIcons
                  name={type === 'daily' ? 'calendar-today' : 'calendar-month'}
                  size={18}
                  color={salaryType === type ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.choiceText, salaryType === type && styles.choiceTextActive]}>
                  {type === 'daily' ? 'प्रतिदिन' : 'प्रतिमाह'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="शुरुआती वेतन (₹) *" error={errors.salaryMin}>
                <TextInput
                  style={styles.input}
                  placeholder="700"
                  placeholderTextColor={Colors.textLight}
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
            <View style={styles.half}>
              <Field label="अधिकतम (वैकल्पिक)" error={errors.salaryMax}>
                <TextInput
                  style={styles.input}
                  placeholder="1000"
                  placeholderTextColor={Colors.textLight}
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
          </View></>}

          {step === 5 && <>
            <Field label="काम की अवधि"><TextInput style={styles.input} placeholder="जैसे: 5–7 दिन" value={duration} onChangeText={setDuration} /></Field>
            <Field label="ज़रूरी अनुभव"><TextInput style={styles.input} placeholder="जैसे: 2 साल" value={experience} onChangeText={setExperience} /></Field>
            <Field label="ज़रूरी कौशल (कॉमा लगाकर लिखें)"><TextInput style={styles.input} placeholder="जैसे: वायरिंग, फैन फिटिंग" value={skills} onChangeText={setSkills} /></Field>
            <Field label="काम शुरू करने की तारीख"><TextInput style={styles.input} placeholder="जैसे: 15/10/2026" value={startDate} onChangeText={setStartDate} /></Field>
            <Field label="काम का समय"><TextInput style={styles.input} placeholder="जैसे: सुबह 9 से शाम 6" value={workingHours} onChangeText={setWorkingHours} /></Field>
            <Text style={styles.label}>संपर्क प्राथमिकता</Text>
            <View style={styles.choiceRow}>
              {['app', 'call'].map((mode) => <TouchableOpacity key={mode} style={[styles.choice, contactPreference === mode && styles.choiceActive]} onPress={() => setContactPreference(mode)}><Text style={[styles.choiceText, contactPreference === mode && styles.choiceTextActive]}>{mode === 'app' ? 'ऐप चैट' : 'कॉल अनुरोध'}</Text></TouchableOpacity>)}
            </View>
          </>}

          {step === 6 && <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>क्या यह Job सही है?</Text>
            <Text style={styles.previewJobTitle}>{title || 'काम का नाम'}</Text>
            <Text style={styles.previewText}>{category.labelHi} · {workerCount} वर्कर</Text>
            <Text style={styles.previewText}>{area || 'क्षेत्र'}, {district || 'जिला'}</Text>
            <Text style={styles.previewWage}>₹{salaryMin || '—'}{salaryMax ? ` – ₹${salaryMax}` : ''} / {salaryType === 'daily' ? 'दिन' : 'महीना'}</Text>
            {duration ? <Text style={styles.previewText}>अवधि: {duration}</Text> : null}
            {description ? <Text style={styles.previewDescription}>{description}</Text> : null}
          </View>}

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          <View style={styles.stepActions}>
            {step > 1 && <TouchableOpacity style={styles.previousButton} onPress={() => setStep(step - 1)}><Text style={styles.previousText}>वापस</Text></TouchableOpacity>}
            {step < 6 ? (
              <TouchableOpacity style={[styles.submitButton, styles.stepNext]} onPress={() => {
                const stepErrors: Record<string, string> = {};
                if (step === 2 && title.trim().length < 4) {
                  stepErrors.title = 'काम का नाम कम से कम 4 अक्षर का लिखें।';
                }
                if (step === 3) {
                  if (!area.trim()) stepErrors.area = 'काम का क्षेत्र भरें।';
                  if (!district.trim()) stepErrors.district = 'जिला भरें।';
                }
                if (step === 4) {
                  const min = Number(salaryMin);
                  const max = Number(salaryMax);
                  if (!salaryMin || !Number.isFinite(min) || min <= 0) {
                    stepErrors.salaryMin = 'सही शुरुआती वेतन लिखें।';
                  }
                  if (salaryMax && (!Number.isFinite(max) || max < min)) {
                    stepErrors.salaryMax = 'अधिकतम वेतन शुरुआती वेतन से कम नहीं हो सकता।';
                  }
                }
                setErrors(stepErrors);
                if (Object.keys(stepErrors).length === 0) setStep(step + 1);
              }}><Text style={styles.submitText}>आगे बढ़ें</Text></TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.submitButton, styles.stepNext, submitting && styles.submitDisabled]} onPress={submitPost} disabled={submitting}>
                <MaterialCommunityIcons name="send" size={19} color="#FFFFFF" />
                <Text style={styles.submitText}>{submitting ? 'पोस्ट हो रही है…' : 'Publish Job'}</Text>
              </TouchableOpacity>
            )}
          </View>
          </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <DashboardBottomNav
        userType="hirer"
        activeTab="post"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') router.push('/hirer/workers');
          if (tab === 'contacts') router.push('/hirer/contacts');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>{children}</View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 32 },
  myPostsLink: { minHeight: 42, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6, marginBottom: 10 },
  myPostsText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  introCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFF7ED', borderRadius: 16, marginBottom: 20 },
  introIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, marginLeft: 12 },
  introTitle: { color: '#7C2D12', fontSize: 15, fontWeight: '800' },
  introText: { color: '#9A3412', fontSize: 12, marginTop: 3, lineHeight: 17 },
  field: { flex: 1, marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 7 },
  inputWrap: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#DC2626', fontSize: 11, marginTop: 4 },
  categories: { marginBottom: 16, flexGrow: 0 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, minWidth: 0 },
  choiceRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  choice: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  choiceActive: { borderColor: Colors.primary, backgroundColor: '#FFF7ED' },
  choiceText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  choiceTextActive: { color: Colors.primary },
  textArea: { minHeight: 110 },
  submitButton: { minHeight: 52, borderRadius: 14, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 4 },
  submitDisabled: { opacity: 0.65 },
  submitError: { color: '#B91C1C', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  disclaimer: { textAlign: 'center', color: '#64748B', fontSize: 11, marginTop: 10, lineHeight: 16 },
  progressHeader: { marginBottom: 16 },
  progressText: { color: '#64748B', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  successCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 24, alignItems: 'center', marginTop: 30 },
  successTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A', marginTop: 12, marginBottom: 6 },
  stepActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  previousButton: { minHeight: 50, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  previousText: { color: '#334155', fontSize: 14, fontWeight: '700' },
  stepNext: { flex: 1, marginTop: 0 },
  previewCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, marginTop: 8 },
  previewTitle: { color: '#166534', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  previewJobTitle: { color: '#0F172A', fontSize: 18, lineHeight: 25, fontWeight: '900' },
  previewText: { color: '#475569', fontSize: 13, marginTop: 7 },
  previewWage: { color: '#047857', fontSize: 16, fontWeight: '900', marginTop: 11 },
  previewDescription: { color: '#64748B', fontSize: 13, lineHeight: 19, marginTop: 10 },
});
