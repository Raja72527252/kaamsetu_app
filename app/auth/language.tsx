import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Language } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { OtpInput } from '../../src/components';
import { sendOtp, verifyOtp } from '../../src/services/authService';

interface LangOption {
  code: Language;
  title: string;
  subtitle: string;
}

const LANGUAGES: LangOption[] = [
  {
    code: 'hi',
    title: 'हिन्दी',
    subtitle: 'Hindi',
  },
  {
    code: 'en',
    title: 'English',
    subtitle: 'English',
  },
  {
    code: 'hinglish',
    title: 'Hinglish',
    subtitle: 'Hindi + English',
  },
];

// Comprehensive translations for this screen & OTP modal
const PAGE_TEXTS = {
  hi: {
    langSectionTitle: 'अपनी भाषा चुनें',
    langSectionSub: 'अपनी पसंदीदा भाषा चुनें',
    mobileSectionTitle: 'मोबाइल नंबर दर्ज करें',
    mobileSectionSub: 'अपना 10 अंकों का मोबाइल नंबर डालें',
    mobilePlaceholder: 'जैसे 98765 43210',
    proceedBtn: 'आगे बढ़ें',
    settingsNote: 'आप बाद में Settings से भाषा बदल सकते हैं',
    otpModalTitle: 'OTP दर्ज करें',
    otpModalSub: (mobile: string) => `+91 ${mobile} पर भेजा गया कोड दर्ज करें`,
    verifyBtn: 'OTP सत्यापित करें',
    resendPrompt: 'कोड नहीं मिला?',
    resendLink: 'OTP दोबारा भेजें',
    mobileErrorEmpty: 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें',
    mobileErrorLength: 'मोबाइल नंबर पूरे 10 अंकों का होना चाहिए',
    mobileErrorInvalid: 'कृपया सही भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8, 9 से शुरू)',
    otpErrorIncomplete: 'कृपया 4 अंकों का OTP दर्ज करें',
    otpErrorWrong: 'गलत OTP. कृपया फिर से प्रयास करें।',
    otpErrorGeneric: 'सत्यापन में समस्या आई। पुनः प्रयास करें।',
  },
  en: {
    langSectionTitle: 'Choose Your Language',
    langSectionSub: 'Select your preferred language',
    mobileSectionTitle: 'Enter Mobile Number',
    mobileSectionSub: 'Enter your 10-digit mobile number',
    mobilePlaceholder: 'e.g. 98765 43210',
    proceedBtn: 'Continue',
    settingsNote: 'You can change language later from Settings',
    otpModalTitle: 'Enter OTP',
    otpModalSub: (mobile: string) => `Enter code sent to +91 ${mobile}`,
    verifyBtn: 'Verify OTP',
    resendPrompt: "Didn't receive code?",
    resendLink: 'Resend OTP',
    mobileErrorEmpty: 'Please enter a 10-digit mobile number',
    mobileErrorLength: 'Mobile number must be exactly 10 digits',
    mobileErrorInvalid: 'Please enter a valid Indian mobile number (starts with 6, 7, 8, 9)',
    otpErrorIncomplete: 'Please enter 4-digit OTP',
    otpErrorWrong: 'Invalid OTP. Please try again.',
    otpErrorGeneric: 'Verification failed. Please try again.',
  },
  hinglish: {
    langSectionTitle: 'Apni Bhasha Chunein',
    langSectionSub: 'Apni pasand ki language select karein',
    mobileSectionTitle: 'Mobile Number Enter Karein',
    mobileSectionSub: 'Apna 10 digit ka mobile number daalein',
    mobilePlaceholder: 'Jaise 98765 43210',
    proceedBtn: 'Aage Badhein',
    settingsNote: 'Aap baad mein Settings se language change kar sakte hain',
    otpModalTitle: 'OTP Enter Karein',
    otpModalSub: (mobile: string) => `+91 ${mobile} par bheja gaya code enter karein`,
    verifyBtn: 'OTP Verify Karein',
    resendPrompt: 'Code nahi mila?',
    resendLink: 'OTP Dobara Bhejein',
    mobileErrorEmpty: 'Kripya 10 digit ka mobile number enter karein',
    mobileErrorLength: 'Mobile number poore 10 digits ka hona chahiye',
    mobileErrorInvalid: 'Sahi Indian mobile number enter karein (6, 7, 8, 9 se start hone wala)',
    otpErrorIncomplete: 'Kripya 4 digit ka OTP enter karein',
    otpErrorWrong: 'गलत OTP. कृपया फिर से प्रयास करें।',
    otpErrorGeneric: 'Verification fail ho gaya. Phir se try karein.',
  },
};

export default function LanguageAndLoginScreen() {
  const { state, setLanguage, login } = useApp();
  const router = useRouter();

  const selectedLang = state.language;
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');

  // OTP Popup State
  const [otpVisible, setOtpVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Dynamic texts for currently active language
  const texts = PAGE_TEXTS[selectedLang] || PAGE_TEXTS.hi;

  const handleLangSelect = async (code: Language) => {
    await setLanguage(code);
    // Clear any previous language-specific errors so fresh error in new language appears if needed
    if (mobileError) {
      setMobileError('');
    }
  };

  const handleProceed = async () => {
    // Validate mobile number
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (!cleaned) {
      setMobileError(texts.mobileErrorEmpty);
      return;
    }
    if (cleaned.length !== 10) {
      setMobileError(texts.mobileErrorLength);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setMobileError(texts.mobileErrorInvalid);
      return;
    }

    setMobileError('');
    setIsSending(true);
    try {
      await setLanguage(selectedLang);
      const res = await sendOtp(cleaned);
      if (res.success) {
        setOtpVisible(true);
        setEnteredOtp('');
        setOtpError('');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length < 4) {
      setOtpError(texts.otpErrorIncomplete);
      return;
    }

    setIsVerifying(true);
    setOtpError('');
    try {
      const res = await verifyOtp(mobileNumber, enteredOtp);
      if (res.success) {
        setOtpVisible(false);
        await login(mobileNumber);
        router.replace('/onboarding/user-type');
      } else {
        setOtpError(texts.otpErrorWrong);
      }
    } catch {
      setOtpError(texts.otpErrorGeneric);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSending(true);
    setOtpError('');
    try {
      await sendOtp(mobileNumber);
      setEnteredOtp('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Official Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/app-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Section 1: Language Selection */}
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconEmoji}>🌐</Text>
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionTitle}>{texts.langSectionTitle}</Text>
                <Text style={styles.sectionSubtitle}>{texts.langSectionSub}</Text>
              </View>
            </View>

            {/* 3 Horizontal Language Cards with Custom Flag Icons */}
            <View style={styles.langCardsRow}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langCard,
                      isSelected && styles.langCardSelected,
                    ]}
                    onPress={() => handleLangSelect(lang.code)}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}

                    {/* Flag Icons: 3D Glossy Badges */}
                    <View style={styles.flagWrap}>
                      <Image
                        source={
                          lang.code === 'hi'
                            ? require('../../assets/flag-hindi.png')
                            : lang.code === 'en'
                            ? require('../../assets/flag-english.png')
                            : require('../../assets/flag-hinglish.png')
                        }
                        style={styles.flagBadgeImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.langTextsWrap}>
                      <Text
                        style={[
                          styles.langCardTitle,
                          isSelected && styles.langCardTitleSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {lang.title}
                      </Text>
                      <Text style={styles.langCardSub} numberOfLines={1}>
                        {lang.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 2: Mobile Number Input */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconEmoji}>📞</Text>
              </View>
              <View style={styles.sectionHeaderTexts}>
                <Text style={styles.sectionTitle}>{texts.mobileSectionTitle}</Text>
                <Text style={styles.sectionSubtitle}>{texts.mobileSectionSub}</Text>
              </View>
            </View>

            {/* Mobile Input Field */}
            <View
              style={[
                styles.mobileInputContainer,
                Boolean(mobileError) && styles.inputErrorBorder,
              ]}
            >
              <View style={styles.countryWrap}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                <Text style={styles.countryChevron}>⌵</Text>
              </View>
              <View style={styles.verticalDivider} />
              <TextInput
                style={styles.mobileInput}
                placeholder={texts.mobilePlaceholder}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={(text) => {
                  setMobileNumber(text.replace(/\D/g, ''));
                  setMobileError('');
                }}
              />
            </View>

            {Boolean(mobileError) && (
              <Text style={styles.errorText}>{mobileError}</Text>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.settingsNoteRow}>
            <Text style={styles.shieldIcon}>✅</Text>
            <Text style={styles.settingsNoteText}>{texts.settingsNote}</Text>
          </View>

          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={handleProceed}
            activeOpacity={0.88}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.proceedBtnText}>{texts.proceedBtn}</Text>
                <Text style={styles.proceedArrow}>➔</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* OTP Popup Modal / Bottom Sheet */}
      <Modal
        visible={otpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Backdrop: Tapping outside dismisses */}
          <TouchableWithoutFeedback onPress={() => setOtpVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          {/* Modal Sheet: Independent child, touches will NOT bubble to backdrop */}
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {/* Close Button at Top Right */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOtpVisible(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.otpHeaderRow}>
              <View style={styles.otpIconCircle}>
                <Text style={styles.otpIconText}>✉️</Text>
              </View>
              <View style={styles.otpTitlesWrap}>
                <Text style={styles.otpModalTitle}>{texts.otpModalTitle}</Text>
                <Text style={styles.otpModalSubtitle}>
                  {texts.otpModalSub(mobileNumber)}
                </Text>
              </View>
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpInputWrap}>
              <OtpInput
                value={enteredOtp}
                onChange={(val) => {
                  setEnteredOtp(val);
                  setOtpError('');
                }}
                length={4}
              />
            </View>

            {Boolean(otpError) && (
              <Text style={styles.otpErrorText}>{otpError}</Text>
            )}

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.verifyOtpBtn}
              onPress={handleVerifyOtp}
              activeOpacity={0.88}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.verifyOtpBtnText}>
                  {texts.verifyBtn} ➔
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend Link */}
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>{texts.resendPrompt}</Text>
              <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                <Text style={styles.resendLink}>{texts.resendLink}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 14 : 18,
    paddingBottom: 12,
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 24,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircleGreen: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 18,
  },
  sectionHeaderTexts: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  langCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 12,
    position: 'relative',
  },
  langCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF8F3',
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#EA580C',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  flagWrap: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBadgeImage: {
    width: 32,
    height: 32,
  },
  langTextsWrap: {
    flex: 1,
  },
  langCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  langCardTitleSelected: {
    color: '#EA580C',
  },
  langCardSub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 54,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  countryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 4,
  },
  countryChevron: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginRight: 12,
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  fixedBottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 14 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shieldIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  settingsNoteText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  proceedBtn: {
    backgroundColor: '#F95A00',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    shadowColor: '#F95A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  proceedArrow: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 18,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  otpIconText: {
    fontSize: 22,
  },
  otpTitlesWrap: {
    flex: 1,
  },
  otpModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  otpInputWrap: {
    marginBottom: 14,
  },
  otpErrorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  verifyOtpBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  verifyOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 13,
    color: '#EA580C',
    fontWeight: '700',
  },
});
