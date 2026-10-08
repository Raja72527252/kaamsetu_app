import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { ScreenHeader, WorkerCard, CategoryChip, DashboardBottomNav } from '../../src/components';
import { WorkerCard as WorkerCardType } from '../../src/types';
import { fetchNearbyWorkers } from '../../src/services/workerService';
import { JOB_CATEGORIES } from '../../src/constants';
import { t } from '../../src/i18n';

export default function AllWorkersScreen() {
  const router = useRouter();
  const { state } = useApp();
  const lang = state.language;

  const [workers, setWorkers] = useState<WorkerCardType[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'rating'>('nearest');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (cat: string, q: string) => {
    try {
      const data = await fetchNearbyWorkers({
        category: cat !== 'all' ? cat : undefined,
        searchQuery: q,
      });
      setWorkers(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedCat, search);
  }, [selectedCat, search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedCat, search);
  };

  const visibleWorkers = workers
    .filter((worker) => radiusKm === null || worker.distanceKm <= radiusKm)
    .filter((worker) => !verifiedOnly || worker.isVerified)
    .filter((worker) => !availableOnly || worker.availability === 'available_now')
    .sort((a, b) => sortBy === 'nearest' ? a.distanceKm - b.distanceKm : b.rating - a.rating);
  const activeFilterCount =
    Number(selectedCat !== 'all') +
    Number(radiusKm !== null) +
    Number(verifiedOnly) +
    Number(availableOnly) +
    Number(sortBy !== 'nearest');

  const clearFilters = () => {
    setSelectedCat('all');
    setRadiusKm(null);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy('nearest');
  };

  const handleViewProfile = (w: WorkerCardType) => {
    router.push({
      pathname: '/hirer/worker/[id]',
      params: { id: w.id },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t('ui.search.workerTitle', lang)}
        subtitle={t('ui.search.workerSubtitle', lang)}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.savedWorkersButton}
            onPress={() => router.push('/hirer/saved-workers' as Href)}
            accessibilityLabel="सेव किए गए वर्कर"
          >
            <MaterialCommunityIcons name="bookmark-outline" size={21} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchBarWrap}>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={23} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('ui.search.workerPlaceholder', lang)}
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFiltersVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${t('ui.search.filter', lang)}${activeFilterCount ? `, ${activeFilterCount}` : ''}`}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={21}
            color={activeFilterCount > 0 ? Colors.white : Colors.primary}
          />
          <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
            {t('ui.search.filter', lang)}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.filterModalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setFiltersVisible(false)}
            accessibilityLabel="फ़िल्टर बंद करें"
          />
          <View style={styles.filterModal}>
            <View style={styles.filterModalHandle} />
            <View style={styles.filterModalHeader}>
              <View>
                <Text style={styles.filterModalTitle}>{t('ui.search.workerFilters', lang)}</Text>
                <Text style={styles.filterModalSubtitle}>{t('ui.search.filterSubtitle', lang)}</Text>
              </View>
              <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                <Text style={styles.clearFiltersText}>{t('ui.search.clear', lang)}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.filterOptionsScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.filterSectionTitle}>{t('ui.search.category', lang)}</Text>
              <View style={styles.filterOptionsWrap}>
                <CategoryChip
                  label={t('ui.search.allWorkers', lang)}
                  selected={selectedCat === 'all'}
                  onPress={() => setSelectedCat('all')}
                />
                {JOB_CATEGORIES.map((category) => {
                  const categoryValue = category.label.toLowerCase();
                  return (
                    <CategoryChip
                      key={category.id}
                      label={t(`categories.${category.id}`, lang)}
                      icon={category.icon}
                      selected={selectedCat === categoryValue}
                      onPress={() => setSelectedCat(categoryValue)}
                    />
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>{t('ui.search.distance', lang)}</Text>
              <View style={styles.filterOptionsWrap}>
                <CategoryChip
                  label={t('ui.search.anyDistance', lang)}
                  selected={radiusKm === null}
                  onPress={() => setRadiusKm(null)}
                />
                {[2, 5, 10, 25].map((distance) => (
                  <CategoryChip
                    key={distance}
                    label={`${distance} KM`}
                    selected={radiusKm === distance}
                    onPress={() => setRadiusKm(distance)}
                  />
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>{t('ui.search.profile', lang)}</Text>
              <View style={styles.filterOptionsWrap}>
                <CategoryChip
                  label={t('ui.search.verified', lang)}
                  selected={verifiedOnly}
                  onPress={() => setVerifiedOnly((value) => !value)}
                />
                <CategoryChip
                  label={t('ui.search.availableNow', lang)}
                  selected={availableOnly}
                  onPress={() => setAvailableOnly((value) => !value)}
                />
              </View>

              <Text style={styles.filterSectionTitle}>{t('ui.search.order', lang)}</Text>
              <View style={styles.filterOptionsWrap}>
                <CategoryChip
                  label={t('ui.search.nearest', lang)}
                  selected={sortBy === 'nearest'}
                  onPress={() => setSortBy('nearest')}
                />
                <CategoryChip
                  label={t('ui.search.topRated', lang)}
                  selected={sortBy === 'rating'}
                  onPress={() => setSortBy('rating')}
                />
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFiltersVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.applyFiltersText}>{t('ui.search.show', lang)} ({visibleWorkers.length} {t('ui.search.workerResults', lang)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.container, { width: '100%', maxWidth: 1024, alignSelf: 'center' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.countText}>{t('ui.search.workersFound', lang)}: {visibleWorkers.length} {t('ui.search.workerResults', lang)}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          visibleWorkers.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              onViewProfile={handleViewProfile}
            />
          ))
        )}
        {!loading && visibleWorkers.length === 0 && <Text style={styles.emptyText}>{t('ui.search.noWorkers', lang)}</Text>}
      </ScrollView>

      {/* Pinned Bottom Navigation Bar */}
      <DashboardBottomNav
        userType="hirer"
        activeTab="search"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/hirer/dashboard');
          if (tab === 'search') return;
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
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  savedWorkersButton: { padding: 8 },
  searchWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 15,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingHorizontal: 4,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filterModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  filterModal: {
    maxHeight: '82%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  filterModalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 18,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterModalSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textMuted,
  },
  clearFiltersText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  filterOptionsScroll: {
    flexShrink: 1,
  },
  filterSectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  applyFiltersButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    marginTop: 12,
  },
  applyFiltersText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 112,
  },
  countText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: { color: '#64748B', textAlign: 'center', padding: 24, fontSize: 14 },
});
