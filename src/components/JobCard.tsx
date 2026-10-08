import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Job } from '../types';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

interface JobCardProps {
  job: Job;
  onViewJob: (job: Job) => void;
  viewJobLabel?: string;
  salaryLabel?: string;
  distanceLabel?: string;
  postedLabel?: string;
}

export function JobCard({
  job,
  onViewJob,
  viewJobLabel,
  postedLabel,
}: JobCardProps) {
  const { state } = useApp();
  const lang = state.language;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {job.photoAsset ? (
          <Image source={job.photoAsset} style={styles.jobPhoto} />
        ) : (
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{job.categoryIcon}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.employer} numberOfLines={1}>
            🏢 {job.hirerBusinessName || job.hirerName}
          </Text>
          <Text style={styles.location}>
            📍 {job.area}, {job.district}
          </Text>
        </View>

        {Boolean(job.distanceKm) && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{job.distanceKm} KM</Text>
          </View>
        )}
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{job.jobType}</Text>
        </View>

        {Boolean(job.salaryMin) && (
          <View style={[styles.tag, styles.salaryTag]}>
            <Text style={[styles.tagText, styles.salaryTagText]}>
              ₹{job.salaryMin}
              {job.salaryMax ? ` - ₹${job.salaryMax}` : '+'} /{' '}
              {job.salaryType === 'daily'
                ? t('ui.jobCard.daily', lang)
                : t('ui.jobCard.monthly', lang)}
            </Text>
          </View>
        )}

        <Text style={styles.posted}>
          {postedLabel || t('ui.jobs.posted', lang)}: {job.postedAt}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => onViewJob(job)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewBtnText}>{viewJobLabel || t('ui.jobCard.viewJob', lang)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobPhoto: {
    width: 72,
    height: 68,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.background,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 23,
  },
  employer: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  distanceBadge: {
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    minHeight: 28,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  salaryTag: {
    backgroundColor: Colors.success + '18',
  },
  salaryTagText: {
    color: Colors.success,
    fontWeight: '700',
  },
  posted: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  viewBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  viewBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
