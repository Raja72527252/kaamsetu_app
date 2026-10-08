import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { Button, OtpInput, ScreenHeader } from '../../src/components';
import { verifyOtp, sendOtp } from '../../src/services/authService';
import { t } from '../../src/i18n';

export default function OtpScreen() {
  const { login, state } = useApp();
  const router = useRouter();
  const lang = state.language;

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const phone = state.phoneNumber || '9876543210';

  const handleVerify = async () => {
    if (enteredOtp.length < 4) return;
    setIsVerifying(true);
    setOtpError('');

    try {
      const res = await verifyOtp(phone, enteredOtp);
      if (res.success) {
        await login(phone);
        router.replace('/onboarding/user-type');
      } else {
        setOtpError(t('auth.wrongOtp', lang));
      }
    } catch {
      setOtpError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setOtpError('');
    try {
      await sendOtp(phone);
      setEnteredOtp('');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t('auth.otpTitle', lang)}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('auth.otpTitle', lang)}</Text>
        <Text style={styles.subtitle}>
          {t('auth.otpSubtitle', lang)}: +91 {phone}
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
          onPress={handleVerify}
          loading={isVerifying}
          disabled={enteredOtp.length < 4}
          style={styles.verifyBtn}
        />

        <TouchableOpacity
          onPress={handleResend}
          disabled={isResending}
          style={styles.resendBtn}
        >
          <Text style={styles.resendText}>
            {isResending ? 'Sending...' : t('auth.resend', lang)}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: Colors.error + '14',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: 20,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
