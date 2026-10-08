import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../src/constants/colors';
import { Button, ScreenHeader, DashboardBottomNav } from '../../../src/components';
import { WorkerCard as WorkerCardType } from '../../../src/types';
import { fetchWorkerById, getUnlockedWorkerIds, saveUnlockedWorker } from '../../../src/services/workerService';
import { getSavedIds, toggleSavedItem } from '../../../src/services/savedService';
import { useApp } from '../../../src/context/AppContext';

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useApp();

  const [worker, setWorker] = useState<WorkerCardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkerById(id).then((data) => {
        setWorker(data);
      }).catch((error: unknown) => {
        console.error('Unable to load worker profile:', error);
        Alert.alert('प्रोफ़ाइल लोड नहीं हुई', 'कृपया वापस जाकर फिर से कोशिश करें।');
      }).finally(() => setLoading(false));
      const ownerId = state.userProfile?.id || state.phoneNumber || 'local-hirer';
      getSavedIds(ownerId, 'workers')
        .then((savedIds) => setIsSaved(savedIds.includes(id)))
        .catch((error: unknown) => console.error('Unable to load saved worker state:', error));
      getUnlockedWorkerIds()
        .then((workerIds) => setContactUnlocked(workerIds.includes(id)))
        .catch((error: unknown) => console.error('Unable to load contact entitlement:', error));
    }
  }, [id, state.phoneNumber, state.userProfile?.id]);

  const toggleWorkerSaved = async () => {
    if (!id) return;
    const ownerId = state.userProfile?.id || state.phoneNumber || 'local-hirer';
    try {
      setIsSaved(await toggleSavedItem(ownerId, 'workers', id));
    } catch (error) {
      console.error('Unable to update saved worker:', error);
      alert('कारीगर सेव नहीं हुए। कृपया फिर से कोशिश करें।');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Worker Profile" onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!worker) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Profile Not Found" onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.notFoundText}>वर्कर प्रोफाइल नहीं मिली।</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={worker.name}
        subtitle={`${worker.category} • ${worker.district}`}
        onBack={() => router.back()}
        rightAction={
          <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleWorkerSaved}
            style={styles.moreBtn}
            accessibilityLabel={isSaved ? 'Remove saved worker' : 'Save worker'}
          >
            <MaterialCommunityIcons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={21} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setReportModalVisible(true)}
            style={styles.moreBtn}
            accessibilityLabel="Report or Block"
          >
            <Text style={styles.moreIcon}>⚠️</Text>
          </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card Header */}
        <View style={styles.profileHeader}>
          <View style={styles.bigAvatar}>
            <Text style={styles.avatarLetter}>{worker.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <Text style={styles.workerCategory}>
              {worker.categoryIcon} {worker.category}
            </Text>
            <Text style={styles.workerLocation}>
              📍 {worker.area}, {worker.district} ({worker.distanceKm} KM दूर)
            </Text>
            <View style={styles.badgesRow}>
              {worker.isVerified && (
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>🟢 Verified Identity</Text>
                </View>
              )}
              <View style={styles.ratingTag}>
                <Text style={styles.ratingTagText}>
                  ⭐ {worker.rating} ({worker.totalRatings} Reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Locked Contact Feature Box */}
        <View style={styles.lockBox}>
          <View style={styles.lockIconWrap}>
            <MaterialCommunityIcons
              name={contactUnlocked ? 'check-circle-outline' : 'lock-outline'}
              size={27}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.lockTitle}>{contactUnlocked ? 'Contact access unlocked' : 'Contact Locked'}</Text>
          <Text style={styles.lockSub}>
            {contactUnlocked
              ? 'यह demo फोन नंबर साझा नहीं करता। अनलॉक किया संपर्क आपके संपर्क पेज पर सेव है।'
              : 'संपर्क की जानकारी निजी रहती है। डेमो में नंबर दिखाए बिना एक्सेस अनलॉक होता है।'}
          </Text>
          <Button
            title={contactUnlocked ? 'मेरे संपर्क देखें' : 'डेमो संपर्क एक्सेस अनलॉक करें'}
            size="lg"
            variant="secondary"
            onPress={() => contactUnlocked ? router.push('/hirer/contacts') : setUnlockModalVisible(true)}
            style={styles.unlockBtn}
          />
          <Text style={styles.securePaymentTag}>
            केवल डेमो एक्सेस — कोई वास्तविक भुगतान नहीं
          </Text>
        </View>

        {/* Details Sections */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>कौशल व विशेषज्ञता (Key Skills)</Text>
          <Text style={styles.skillsContent}>
            {worker.skills || 'General Work, Experienced in Field'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>उपलब्धता एवं अनुभव</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>कुल अनुभव:</Text>
            <Text style={styles.infoVal}>
              {worker.experience === 'fresher' ? 'Fresher' : `${worker.experience} साल`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>वर्तमान स्थिति:</Text>
            <Text
              style={[
                styles.infoVal,
                {
                  color:
                    worker.availability === 'available_now'
                      ? Colors.available
                      : Colors.warning,
                },
              ]}
            >
              {worker.availability === 'available_now'
                ? '🟢 अभी काम के लिए उपलब्ध'
                : '🟡 कल से उपलब्ध'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>केवाईसी सत्यापन:</Text>
            <Text style={[styles.infoVal, { color: worker.isVerified ? Colors.success : Colors.textMuted }]}>
              {worker.isVerified ? '✓ डेमो में सत्यापित प्रोफ़ाइल' : 'अभी सत्यापित नहीं'}
            </Text>
          </View>
        </View>

        {/* Safety & Hiring Guarantee */}
        <View style={styles.safetyBox}>
          <Text style={styles.safetyTitle}>🛡️ KaamSetu सुरक्षा भरोसा</Text>
          <Text style={styles.safetyText}>
            यह काल्पनिक डेमो प्रोफ़ाइल है। वास्तविक पहचान या फोन नंबर सत्यापित अथवा साझा नहीं किया जाता।
          </Text>
        </View>
      </ScrollView>

      {/* Unlock Contact Demo Modal */}
      <Modal visible={unlockModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Contact Access (Demo)</Text>
            <Text style={styles.modalSub}>
              यह केवल स्थानीय डेमो एक्सेस है। कोई भुगतान या फोन नंबर साझा नहीं होगा।
            </Text>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>डेमो संपर्क एक्सेस</Text>
              <Text style={styles.priceVal}>मुफ़्त</Text>
            </View>
            <Text style={styles.modalNote}>
              एक्सेस अनलॉक होने पर संपर्क आपके स्थानीय संपर्क पेज में सेव होगा।
            </Text>

            <Button
              title="डेमो में अनलॉक करें"
              size="md"
              onPress={async () => {
                try {
                  await saveUnlockedWorker(worker.id);
                  setContactUnlocked(true);
                  setUnlockModalVisible(false);
                  Alert.alert('एक्सेस अनलॉक', 'संपर्क सेव किया गया है। इस डेमो में फोन नंबर साझा नहीं होता।');
                } catch (error) {
                  console.error('Unable to unlock worker contact:', error);
                  Alert.alert('एक्सेस सेव नहीं हुआ', 'कृपया फिर से कोशिश करें।');
                }
              }}
              style={{ marginTop: 16 }}
            />
            <Button
              title="रद्द करें (Cancel)"
              variant="outline"
              size="md"
              onPress={() => setUnlockModalVisible(false)}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Report / Block Modal */}
      <Modal visible={reportModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Report or Block Worker</Text>
            <Text style={styles.modalSub}>
              क्या इस प्रोफाइल में कोई गलत जानकारी या अनुचित व्यवहार है?
            </Text>
            {!reported ? (
              <>
                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => setReported(true)}
                >
                  <Text style={styles.reportOptionText}>⚠️ गलत फोन नंबर या पता</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => setReported(true)}
                >
                  <Text style={styles.reportOptionText}>🚫 अनुचित व्यवहार / फ्रॉड</Text>
                </TouchableOpacity>
                <Button
                  title="Close / बंद करें"
                  variant="outline"
                  onPress={() => setReportModalVisible(false)}
                  style={{ marginTop: 12 }}
                />
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.success }}>
                  ✓ रिपोर्ट दर्ज कर ली गई है।
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6 }}>
                  हमारी सपोर्ट टीम 24 घंटे में समीक्षा करेगी।
                </Text>
                <Button
                  title="Done"
                  onPress={() => {
                    setReportModalVisible(false);
                    setReported(false);
                  }}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Pinned Bottom Navigation Bar */}
      <DashboardBottomNav
        userType="hirer"
        activeTab="search"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') router.push('/hirer/workers');
          if (tab === 'post') router.push('/hirer/post');
          if (tab === 'contacts') router.push('/hirer/contacts');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  moreBtn: {
    padding: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bigAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  workerCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  workerLocation: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  verifiedTag: {
    backgroundColor: Colors.success + '1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '700',
  },
  ratingTag: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingTagText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  lockBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FCD34D',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  lockIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockEmoji: {
    fontSize: 26,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  lockSub: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  unlockBtn: {
    width: '100%',
  },
  securePaymentTag: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 8,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  skillsContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoKey: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  safetyBox: {
    backgroundColor: Colors.primary + '0A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  priceVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  modalNote: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  reportOption: {
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  reportOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
