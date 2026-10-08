import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../../src/context/AppContext';
import { HirerProfile } from '../../../src/types';
import { verifyAadhaarDemo } from '../../../src/services/userService';

const aadhaarSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(12, 'आधार नंबर 12 अंकों का होना चाहिए')
    .max(14, 'आधार नंबर 12 अंकों का होना चाहिए')
    .refine((val) => {
      const clean = val.replace(/\s+/g, '');
      return /^\d{12}$/.test(clean);
    }, 'कृपया सही 12 अंकों का आधार नंबर दर्ज करें'),
  nameAsPerAadhaar: z
    .string()
    .min(2, 'आधार के अनुसार नाम कम से कम 2 अक्षर का होना चाहिए')
    .max(50, 'नाम बहुत लंबा है'),
});

type AadhaarFormData = z.infer<typeof aadhaarSchema>;

export default function HirerAadhaarScreen() {
  const { state, updateProfile, setOnboardingDone } = useApp();
  const router = useRouter();

  const [confirmed, setConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const existingProfile = state.userProfile as HirerProfile | null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AadhaarFormData>({
    resolver: zodResolver(aadhaarSchema),
    defaultValues: {
      aadhaarNumber: '',
      nameAsPerAadhaar: existingProfile?.fullName || '',
    },
  });

  const onVerify = async (data: AadhaarFormData) => {
    if (!confirmed) {
      alert('कृपया पुष्टि करें कि दी गई जानकारी सही है।');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyAadhaarDemo(data.aadhaarNumber, data.nameAsPerAadhaar);
      if (res.success) {
        const nextProfile = existingProfile
          ? {
              ...existingProfile,
              verificationStatus: {
                ...existingProfile.verificationStatus,
                aadhaarVerified: true,
              },
              updatedAt: new Date().toISOString(),
            }
          : undefined;

        if (nextProfile) {
          await updateProfile(nextProfile);
        }

        setIsVerified(true);
        await setOnboardingDone();
        router.replace('/hirer/dashboard');
      }
    } finally {
      setIsVerifying(false);
    }
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
          <Text style={styles.stepBadgeText}>चरण 4 / 4</Text>
        </View>
      </View>

      {/* Step Progress Track (100% filled) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '100%' }]} />
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
              <Text style={styles.iconEmoji}>🛡️</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>पहचान सत्यापन (Identity Verification)</Text>
              <Text style={styles.sectionSubtitle}>विश्वसनीय हायरिंग के लिए आधार सत्यापन</Text>
            </View>
          </View>

          {!isVerified ? (
            <View style={styles.formSection}>
              {/* Aadhaar Number Input */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>आधार कार्ड नंबर (12 Digits) *</Text>
                <Controller
                  control={control}
                  name="aadhaarNumber"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        Boolean(errors.aadhaarNumber) && styles.inputErrorBorder,
                      ]}
                    >
                      <Text style={styles.inputLeftIcon}>🆔</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="XXXX XXXX 1234"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        maxLength={14}
                        value={value}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, '').slice(0, 12);
                          const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
                          onChange(formatted);
                        }}
                        onBlur={onBlur}
                      />
                    </View>
                  )}
                />
                {Boolean(errors.aadhaarNumber) && (
                  <Text style={styles.errorText}>{errors.aadhaarNumber?.message}</Text>
                )}
                <Text style={styles.helperText}>
                  गोपनीयता सुरक्षित: आपका आधार नंबर सुरक्षित रूप से सत्यापित होगा।
                </Text>
              </View>

              {/* Name as per Aadhaar */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>आधार कार्ड पर दर्ज नाम *</Text>
                <Controller
                  control={control}
                  name="nameAsPerAadhaar"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        Boolean(errors.nameAsPerAadhaar) && styles.inputErrorBorder,
                      ]}
                    >
                      <Text style={styles.inputLeftIcon}>👤</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="जैसे: राजेश कुमार"
                        placeholderTextColor="#94A3B8"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </View>
                  )}
                />
                {Boolean(errors.nameAsPerAadhaar) && (
                  <Text style={styles.errorText}>{errors.nameAsPerAadhaar?.message}</Text>
                )}
              </View>

              {/* Confirmation Checkbox Card */}
              <TouchableOpacity
                style={[
                  styles.checkboxCard,
                  confirmed && styles.checkboxCardActive,
                ]}
                onPress={() => setConfirmed(!confirmed)}
                activeOpacity={0.85}
              >
                <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
                  {confirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  मैं पुष्टि करता/करती हूँ कि दी गई आधार जानकारी सही और वैध है।
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Verification Success Celebration Card */
            <View style={styles.successCard}>
              <View style={styles.successCircle}>
                <Text style={styles.successEmoji}>✓</Text>
              </View>
              <Text style={styles.successTitle}>सत्यापन सफल हुआ!</Text>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillText}>🟢 Aadhaar Verified Account</Text>
              </View>
              <Text style={styles.successSub}>
                बधाई हो! आपका कामसेतु Hirer खाता सत्यापित हो चुका है। अब आप सीधे कारीगरों और मजदूरों से संपर्क कर सकते हैं।
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              UIDAI सुरक्षा नियमों के तहत आपका डेटा 100% एन्क्रिप्टेड है
            </Text>
          </View>

          {!isVerified && (
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity
                style={styles.bottomBackBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.bottomBackBtnText}>← वापस</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomNextBtn,
                  !confirmed && styles.bottomBtnDisabled,
                ]}
                onPress={handleSubmit(onVerify)}
                disabled={!confirmed || isVerifying}
                activeOpacity={0.88}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.bottomNextBtnText}>Aadhaar Verify करें</Text>
                    <Text style={styles.bottomNextArrow}>➔</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  formSection: {
    marginBottom: 10,
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
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  checkboxCardActive: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#F95A00',
    borderColor: '#F95A00',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successEmoji: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 8,
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  successSub: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
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
  bottomBtnDisabled: {
    opacity: 0.5,
  },
  bottomNextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 6,
  },
  bottomNextArrow: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
