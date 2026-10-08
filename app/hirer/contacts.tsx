import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardBottomNav, ScreenHeader } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { DEMO_WORKERS, getUnlockedWorkerIds } from '../../src/services/workerService';
import { WorkerCard } from '../../src/types';

export default function HirerContactsScreen() {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUnlockedWorkerIds()
      .then((ids) => setWorkers(DEMO_WORKERS.filter((worker) => ids.includes(worker.id))))
      .catch((loadError: unknown) => {
        console.error('Unable to load unlocked contacts:', loadError);
        setError('संपर्क लोड नहीं हो सके। कृपया फिर से खोलें।');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="मेरे संपर्क" subtitle="अनलॉक किए गए कारीगर" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <MaterialCommunityIcons name="account-check-outline" size={23} color={Colors.primary} />
          <Text style={styles.summaryText}>संपर्क अनलॉक होने के बाद यहां सेव रहते हैं।</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : workers.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-multiple-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>अभी कोई सेव किया हुआ संपर्क नहीं</Text>
            <Text style={styles.emptyText}>कारीगर खोजें और उनकी प्रोफ़ाइल से संपर्क अनलॉक करें।</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/hirer/workers')}>
              <Text style={styles.primaryText}>कारीगर खोजें</Text>
            </TouchableOpacity>
          </View>
        ) : workers.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={styles.workerCard}
            onPress={() => router.push({ pathname: '/hirer/worker/[id]', params: { id: worker.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
            </View>
            <View style={styles.workerDetails}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerMeta}>{worker.category} · {worker.district}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#64748B" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <DashboardBottomNav
        userType="hirer"
        activeTab="contacts"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') router.push('/hirer/workers');
          if (tab === 'post') router.push('/hirer/post');
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 28 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF7ED', borderRadius: 14, padding: 14, marginBottom: 16 },
  summaryText: { flex: 1, color: '#7C2D12', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  loader: { marginTop: 48 },
  emptyCard: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  workerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { height: 46, width: 46, borderRadius: 23, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 19, fontWeight: '800', color: Colors.primary },
  workerDetails: { flex: 1, marginLeft: 12 },
  workerName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  workerMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
});
