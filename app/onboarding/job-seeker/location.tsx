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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../../src/context/AppContext';
import { Colors } from '../../../src/constants/colors';
import { SelectPicker } from '../../../src/components';
import { BIHAR_DISTRICTS, WORK_RADIUS_OPTIONS } from '../../../src/constants';
import { getCurrentCoordinates, reverseGeocodeCoordinates } from '../../../src/services/locationService';
import { JobSeekerProfile, Location as AppLocation } from '../../../src/types';

const seekerLocSchema = z.object({
  state: z.string().min(1, 'राज्य आवश्यक है'),
  district: z.string().min(1, 'कृपया अपना जिला चुनें'),
  city: z.string().min(2, 'शहर / कस्बा का नाम दर्ज करें'),
  area: z.string().min(2, 'क्षेत्र / मोहल्ला दर्ज करें'),
  pinCode: z
    .string()
    .min(6, 'पिन कोड 6 अंकों का होना चाहिए')
    .max(6, 'पिन कोड 6 अंकों का होना चाहिए')
    .regex(/^\d{6}$/, 'कृपया सही 6 अंकों का पिन कोड दर्ज करें'),
});

type SeekerLocFormData = z.infer<typeof seekerLocSchema>;

export default function JobSeekerLocationScreen() {
  const { state, updateProfile } = useApp();
  const router = useRouter();

  const existingProfile = state.userProfile as JobSeekerProfile | null;
  const existingLoc = existingProfile?.location;

  const [radiusKm, setRadiusKm] = useState<number>(existingProfile?.workRadiusKm || 10);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SeekerLocFormData>({
    resolver: zodResolver(seekerLocSchema),
    defaultValues: {
      state: existingLoc?.state || 'Bihar',
      district: existingLoc?.district || 'Katihar',
      city: existingLoc?.city || 'Katihar',
      area: existingLoc?.area || 'Bara Bazar',
      pinCode: existingLoc?.pinCode || '854105',
    },
  });

  const handleUseGps = async () => {
    setIsDetecting(true);
    setGpsMsg(null);
    try {
      const coords = await getCurrentCoordinates();
      if (coords) {
        setGpsCoords(coords);
        const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
        if (geo) {
          if (geo.state) setValue('state', geo.state);
          if (geo.district) setValue('district', geo.district);
          if (geo.city) setValue('city', geo.city);
          if (geo.area) setValue('area', geo.area);
          if (geo.pinCode) setValue('pinCode', geo.pinCode);
          setGpsMsg('✓ लोकेशन सफलतापूर्वक ऑटो-डिटेक्ट हो गई!');
        } else {
          setGpsMsg('✓ GPS कोऑर्डिनेट्स सुरक्षित कर लिए गए हैं।');
        }
      } else {
        setGpsMsg('GPS परमिशन नहीं मिली। कृपया नीचे विवरण भरें।');
      }
    } catch {
      setGpsMsg('GPS प्राप्त करने में समस्या आई। नीचे विवरण दर्ज करें।');
    } finally {
      setIsDetecting(false);
    }
  };

  const onSubmit = async (data: SeekerLocFormData) => {
    const loc: AppLocation = {
      state: data.state,
      district: data.district,
      city: data.city,
      area: data.area,
      pinCode: data.pinCode,
      latitude: gpsCoords.latitude || existingLoc?.latitude,
      longitude: gpsCoords.longitude || existingLoc?.longitude,
    };

    if (existingProfile) {
      await updateProfile({
        ...existingProfile,
        location: loc,
        workRadiusKm: radiusKm,
        updatedAt: new Date().toISOString(),
      });
    }

    router.push('/onboarding/job-seeker/job-info');
  };

  const districtOptions = BIHAR_DISTRICTS.map((d) => ({ label: d, value: d }));

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
          <Text style={styles.stepBadgeText}>चरण 2 / 5</Text>
        </View>
      </View>

      {/* Step Progress Track (40% filled) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '40%' }]} />
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
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={styles.sectionTitle}>कार्य क्षेत्र (Work Location)</Text>
              <Text style={styles.sectionSubtitle}>आप कहाँ काम ढूँढना और करना चाहते हैं?</Text>
            </View>
          </View>

          {/* GPS Quick Detect Card */}
          <View style={styles.gpsCard}>
            <View style={styles.gpsCardTop}>
              <View style={styles.gpsIconCircle}>
                <Text style={styles.gpsIconEmoji}>🎯</Text>
              </View>
              <View style={styles.gpsTextsWrap}>
                <Text style={styles.gpsCardTitle}>Current Location का उपयोग करें</Text>
                <Text style={styles.gpsCardSub}>
                  GPS से आपका जिला, शहर और पिन कोड तुरंत भर जाएगा।
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.gpsActionBtn}
              onPress={handleUseGps}
              disabled={isDetecting}
              activeOpacity={0.85}
            >
              {isDetecting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.gpsBtnIcon}>📍</Text>
                  <Text style={styles.gpsActionBtnText}>Auto-Detect GPS Location</Text>
                </>
              )}
            </TouchableOpacity>

            {Boolean(gpsMsg) && (
              <View
                style={[
                  styles.gpsStatusPill,
                  gpsMsg?.startsWith('✓') ? styles.gpsSuccessPill : styles.gpsNoticePill,
                ]}
              >
                <Text
                  style={[
                    styles.gpsStatusText,
                    gpsMsg?.startsWith('✓') ? styles.gpsSuccessText : styles.gpsNoticeText,
                  ]}
                >
                  {gpsMsg}
                </Text>
              </View>
            )}
          </View>

          {/* State Field (Pre-filled Bihar) */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>राज्य (State)</Text>
            <View style={[styles.inputContainer, styles.lockedInputContainer]}>
              <Text style={styles.inputLeftIcon}>🇮🇳</Text>
              <TextInput
                style={[styles.textInput, styles.lockedTextInput]}
                value="Bihar (बिहार)"
                editable={false}
              />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Active</Text>
              </View>
            </View>
          </View>

          {/* District Selector */}
          <View style={styles.fieldBlock}>
            <Controller
              control={control}
              name="district"
              render={({ field: { value } }) => (
                <SelectPicker
                  label="जिला (District) *"
                  value={value}
                  options={districtOptions}
                  onChange={(val) => setValue('district', val)}
                  error={errors.district?.message}
                />
              )}
            />
          </View>

          {/* City / Town Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>शहर / कस्बा (City or Town) *</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.city) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>🏙️</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: कटिहार / Katihar"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {Boolean(errors.city) && (
              <Text style={styles.errorText}>{errors.city?.message}</Text>
            )}
          </View>

          {/* Area / Landmark Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>क्षेत्र / मोहल्ला (Area or Landmark) *</Text>
            <Controller
              control={control}
              name="area"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.area) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>📍</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: बड़ा बाज़ार / स्टेशन रोड"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {Boolean(errors.area) && (
              <Text style={styles.errorText}>{errors.area?.message}</Text>
            )}
          </View>

          {/* PIN Code Input */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>पिन कोड (PIN Code) *</Text>
            <Controller
              control={control}
              name="pinCode"
              render={({ field: { onChange, value, onBlur } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.pinCode) && styles.inputErrorBorder,
                  ]}
                >
                  <Text style={styles.inputLeftIcon}>📮</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="जैसे: 854105"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {Boolean(errors.pinCode) && (
              <Text style={styles.errorText}>{errors.pinCode?.message}</Text>
            )}
          </View>

          {/* Work Radius Selection */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              आप कितने किलोमीटर के अंदर काम करना चाहते हैं? *
            </Text>
            <View style={styles.radiusRow}>
              {WORK_RADIUS_OPTIONS.map((opt) => {
                const isSelected = radiusKm === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.radiusChip,
                      isSelected && styles.radiusChipSelected,
                    ]}
                    onPress={() => setRadiusKm(opt.value)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={styles.chipCheck}>
                        <Text style={styles.chipCheckText}>✓</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.radiusChipText,
                        isSelected && styles.radiusChipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.radiusHint}>
              💡 अपने घर या शहर से जितनी दूरी तक आप काम के लिए जा सकते हैं।
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.securityNoteRow}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              आपके क्षेत्र के आधार पर आपको पास की नौकरियाँ दिखेंगी
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
  gpsCard: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  gpsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsIconEmoji: {
    fontSize: 20,
  },
  gpsTextsWrap: {
    flex: 1,
  },
  gpsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  gpsCardSub: {
    fontSize: 11,
    color: '#7C2D12',
    marginTop: 2,
  },
  gpsActionBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  gpsBtnIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  gpsActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  gpsStatusPill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  gpsSuccessPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  gpsNoticePill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gpsSuccessText: {
    color: '#15803D',
  },
  gpsNoticeText: {
    color: '#B45309',
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
  lockedInputContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  lockedTextInput: {
    color: '#475569',
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
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
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
  radiusChipSelected: {
    borderColor: '#F95A00',
    backgroundColor: '#FFF8F3',
  },
  chipCheck: {
    marginRight: 4,
  },
  chipCheckText: {
    color: '#F95A00',
    fontWeight: '900',
    fontSize: 12,
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  radiusChipTextSelected: {
    color: '#F95A00',
  },
  radiusHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
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
