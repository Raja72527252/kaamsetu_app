import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { ScreenHeader, JobCard, CategoryChip, DashboardBottomNav } from '../../src/components';
import { Job } from '../../src/types';
import { fetchNearbyJobs } from '../../src/services/jobService';
import { JOB_CATEGORIES } from '../../src/constants';
import { t } from '../../src/i18n';

export default function AllJobsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const lang = state.language;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'nearest' | 'salary'>('nearest');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = async (cat: string, q: string) => {
    try {
      const data = await fetchNearbyJobs({
        category: cat !== 'all' ? cat : undefined,
        searchQuery: q,
      });
      setJobs(data);
      setLoadError('');
    } catch (error) {
      console.error('Unable to load jobs:', error);
      setLoadError('जॉब लोड नहीं हो सकीं। कृपया फिर से कोशिश करें।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchNearbyJobs({
      category: selectedCat !== 'all' ? selectedCat : undefined,
      searchQuery: search,
    })
      .then((data) => {
        if (!active) return;
        setJobs(data);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Unable to load jobs:', error);
        setLoadError('जॉब लोड नहीं हो सकीं। कृपया फिर से कोशिश करें।');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [selectedCat, search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedCat, search);
  };

  const selectCategory = (category: string) => {
    if (category !== selectedCat) {
      setLoading(true);
      setSelectedCat(category);
    }
  };

  const clearFilters = () => {
    selectCategory('all');
    setRadiusKm(null);
    setSortBy('nearest');
  };

  const handleViewJob = (job: Job) => {
    router.push({ pathname: '/job-seeker/job/[id]', params: { id: job.id } });
  };

  const visibleJobs = jobs
    .filter((job) => radiusKm === null || (job.distanceKm !== undefined && job.distanceKm <= radiusKm))
    .sort((a, b) => sortBy === 'nearest'
      ? (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      : (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
  const activeFilterCount =
    Number(selectedCat !== 'all') + Number(radiusKm !== null) + Number(sortBy !== 'nearest');

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t('ui.search.jobTitle', lang)}
        subtitle={t('ui.search.jobSubtitle', lang)}
        onBack={() => router.back()}
      />

      <View style={styles.searchControls}>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={23} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('ui.search.jobPlaceholder', lang)}
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={(value) => {
              setLoading(true);
              setSearch(value);
            }}
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
                <Text style={styles.filterModalTitle}>{t('ui.search.jobFilters', lang)}</Text>
                <Text style={styles.filterModalSubtitle}>{t('ui.search.filterSubtitle', lang)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  clearFilters();
                }}
                activeOpacity={0.7}
              >
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
                  label={t('ui.search.allJobs', lang)}
                  selected={selectedCat === 'all'}
                  onPress={() => selectCategory('all')}
                />
                {JOB_CATEGORIES.map((category) => {
                  const categoryValue = category.label.toLowerCase();
                  return (
                    <CategoryChip
                      key={category.id}
                      label={t(`categories.${category.id}`, lang)}
                      icon={category.icon}
                      selected={selectedCat === categoryValue}
                      onPress={() => selectCategory(categoryValue)}
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

              <Text style={styles.filterSectionTitle}>{t('ui.search.order', lang)}</Text>
              <View style={styles.filterOptionsWrap}>
                <CategoryChip
                  label={t('ui.search.nearest', lang)}
                  selected={sortBy === 'nearest'}
                  onPress={() => setSortBy('nearest')}
                />
                <CategoryChip
                  label={t('ui.search.highestSalary', lang)}
                  selected={sortBy === 'salary'}
                  onPress={() => setSortBy('salary')}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFiltersVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.applyFiltersText}>{t('ui.search.show', lang)} ({visibleJobs.length} {t('ui.search.jobResults', lang)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.container, { width: '100%', maxWidth: 1024, alignSelf: 'center' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.resultsCountRow}>
          <Text style={styles.resultCount}>{t('ui.search.jobsFound', lang)}: {visibleJobs.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : loadError ? (
          <Text style={styles.emptyText}>{loadError}</Text>
        ) : (
          visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewJob={handleViewJob}
              viewJobLabel={t('dashboard.viewJob', lang)}
              postedLabel={t('ui.jobs.posted', lang)}
            />
          ))
        )}
        {!loading && visibleJobs.length === 0 && <Text style={styles.emptyText}>{t('ui.search.noJobs', lang)}</Text>}
      </ScrollView>

      {/* Pinned Bottom Navigation Bar */}
      <DashboardBottomNav
        userType="job_seeker"
        activeTab="jobs"
        onTabPress={(tab) => {
          if (tab === 'home') router.push('/job-seeker/dashboard');
          if (tab === 'jobs') return;
          if (tab === 'saved') router.push('/job-seeker/saved' as Href);
          if (tab === 'update_profile') router.push('/profile');
          if (tab === 'applications') router.push('/job-seeker/applications');
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
  searchControls: {
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
  searchWrap: {
    flex: 1,
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
    paddingHorizontal: 4,
    height: '100%',
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
  resultsCountRow: {
    marginBottom: 10,
  },
  emptyText: { color: '#64748B', textAlign: 'center', padding: 24, fontSize: 14 },
  resultCount: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 0,
  },
});
