import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { Button, Input, OtpInput, BottomActionBar } from '../../src/components';
import { sendOtp, verifyOtp } from '../../src/services/authService';
import { t } from '../../src/i18n';

const loginSchema = z.object({
  mobile: z
    .string()
    .min(1, 'मोबाइल नंबर दर्ज करना जरूरी है (Mobile required)')
    .regex(
      /^[6-9]\d{9}$/,
      'कृपया सही 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (Starts with 6-9)'
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, state } = useApp();
  const router = useRouter();
  const lang = state.language;

  const [otpVisible, setOtpVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentPhone, setCurrentPhone] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSending(true);
    setOtpError('');
    try {
      const res = await sendOtp(data.mobile);
      if (res.success) {
        setCurrentPhone(data.mobile);
        setOtpVisible(true);
        setEnteredOtp('');
      }
    } catch {
      // fallback
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length < 4) return;
    setIsVerifying(true);
    setOtpError('');

    try {
      const res = await verifyOtp(currentPhone, enteredOtp);
      if (res.success) {
        setOtpVisible(false);
        await login(currentPhone);
        router.replace('/onboarding/user-type');
      } else {
        setOtpError(t('auth.wrongOtp', lang));
      }
    } catch {
      setOtpError('Verification error. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsSending(true);
    setOtpError('');
    try {
      await sendOtp(currentPhone);
      setEnteredOtp('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/kaamsetu-logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <View style={styles.stepTag}>
              <Text style={styles.stepText}>{lang === 'hi' ? 'लॉगिन' : 'Login'}</Text>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.title}>{t('auth.loginTitle', lang)}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle', lang)}</Text>
          </View>

          <View style={styles.formCard}>
            <Controller
              control={control}
              name="mobile"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label={t('auth.mobileLabel', lang)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder={t('auth.mobilePlaceholder', lang)}
                  error={errors.mobile?.message}
                  leftIcon={<Text style={styles.countryCode}>🇮🇳 +91</Text>}
                />
              )}
            />
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              {t('auth.securityNote', lang)}
            </Text>
          </View>

          {/* Spacer for fixed bottom bar */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <BottomActionBar
          onBack={() => router.back()}
          backTitle={`← ${t('onboarding.back', lang)}`}
          onNext={handleSubmit(onSubmit)}
          nextTitle={`${t('auth.continue', lang)} ➔`}
          nextLoading={isSending}
        />
      </KeyboardAvoidingView>

      {/* OTP Bottom-Sheet Modal */}
      <Modal
        visible={otpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOtpVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />

            <Text style={styles.otpTitle}>{t('auth.otpTitle', lang)}</Text>
            <Text style={styles.otpSubtitle}>
              {t('auth.otpSubtitle', lang)}: +91 {currentPhone}
            </Text>

            <OtpInput
              value={enteredOtp}
              onChange={(val) => {
                setEnteredOtp(val);
                if (otpError) setOtpError('');
              }}
              length={4}
            />

            {Boolean(otpError) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {otpError}</Text>
              </View>
            )}

            <Button
              title={t('auth.verifyOtp', lang)}
              size="lg"
              onPress={handleVerifyOtp}
              loading={isVerifying}
              disabled={enteredOtp.length < 4}
              style={styles.verifyBtn}
            />

            <TouchableOpacity
              onPress={handleResend}
              style={styles.resendBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>{t('auth.resend', lang)}</Text>
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
    backgroundColor: Colors.white,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brandLogo: {
    width: 140,
    height: 48,
  },
  stepTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  heroSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  formCard: {
    marginBottom: 20,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: Colors.error + '14',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: 10,
    backgroundColor: '#F95A00',
    borderRadius: 26,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
