import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { WorkerCard as WorkerCardType } from '../types';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

interface WorkerCardProps {
  worker: WorkerCardType;
  onViewProfile: (worker: WorkerCardType) => void;
  viewProfileLabel?: string;
  verifiedLabel?: string;
  distanceLabel?: string;
  ratingLabel?: string;
  experienceLabel?: string;
  lockedLabel?: string;
  distanceUnitLabel?: string;
}

export function WorkerCard({
  worker,
  onViewProfile,
  viewProfileLabel,
  verifiedLabel,
  distanceUnitLabel,
  ratingLabel,
  experienceLabel,
  lockedLabel,
}: WorkerCardProps) {
  const { state } = useApp();
  const lang = state.language;
  const resolvedDistanceLabel = distanceUnitLabel || t('ui.workerCard.distanceUnit', lang);
  const isAvailableNow = worker.availability === 'available_now';
  const isAvailableTomorrow = worker.availability === 'available_tomorrow';

  const availabilityColor = isAvailableNow
    ? Colors.available
    : isAvailableTomorrow
    ? Colors.warning
    : Colors.notAvailable;

  const availabilityText = isAvailableNow
    ? t('ui.workerCard.availableNow', lang)
    : isAvailableTomorrow
    ? t('ui.workerCard.availableTomorrow', lang)
    : t('ui.workerCard.unavailable', lang);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {worker.photoAsset || worker.profilePhotoUri ? (
            <Image
              source={worker.photoAsset || { uri: worker.profilePhotoUri }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: availabilityColor }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {worker.name}
            </Text>
            {worker.isVerified && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🟢 {verifiedLabel || t('ui.search.verified', lang)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.category}>
            {worker.categoryIcon} {worker.category}
          </Text>

          <Text style={styles.location} numberOfLines={1}>
            📍 {worker.area}, {worker.district}
          </Text>
        </View>
      </View>

      <View style={styles.availabilityRow}>
        <View style={[styles.availBadge, { backgroundColor: availabilityColor + '18' }]}>
          <Text style={[styles.availText, { color: availabilityColor }]}>
            ● {availabilityText}
          </Text>
        </View>
        <Text style={styles.distanceText}>
          {worker.distanceKm} {resolvedDistanceLabel}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{experienceLabel || t('ui.workerCard.experience', lang)}</Text>
          <Text style={styles.statValue}>
            {worker.experience === 'fresher'
              ? (lang === 'hi' ? 'फ्रेशर' : 'Fresher')
              : `${worker.experience} ${lang === 'en' ? 'years' : lang === 'hinglish' ? 'saal' : 'साल'}`}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{ratingLabel || t('ui.workerCard.rating', lang)}</Text>
          <Text style={styles.statValue}>
            ⭐ {worker.rating} ({worker.totalRatings})
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('ui.workerCard.profile', lang)}</Text>
          <Text style={styles.statValue}>
            {worker.isVerified ? t('ui.workerCard.demoVerified', lang) : t('ui.workerCard.notVerified', lang)}
          </Text>
        </View>
      </View>

      {/* Blurred / Locked contact indicator */}
      <View style={styles.lockedContactBox}>
        <Text style={styles.lockedContactText}>{lockedLabel || `🔒 ${t('ui.workerCard.privateContact', lang)}`}</Text>
      </View>

      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => onViewProfile(worker)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewBtnText}>{viewProfileLabel || t('ui.workerCard.viewProfile', lang)}</Text>
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
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    minWidth: 0,
    marginRight: 2,
  },
  badge: {
    backgroundColor: Colors.success + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '700',
  },
  category: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 10,
    paddingHorizontal: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lockedContactBox: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  lockedContactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8D6E63',
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
