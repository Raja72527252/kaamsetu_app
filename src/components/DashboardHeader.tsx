import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DashboardHeaderProps {
  location?: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
  avatarSource?: ImageSourcePropType;
}

export function DashboardHeader({
  location = 'Katihar, Bihar',
  onLocationPress,
  onNotificationPress,
  onProfilePress,
  notificationCount = 3,
  avatarSource,
}: DashboardHeaderProps) {
  const { width } = useWindowDimensions();
  const compact = width < 420;

  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.brand}>
        <Text style={[styles.brandText, compact && styles.brandTextCompact]}>
          Kaam<Text style={styles.brandOrange}>Setu</Text>
        </Text>
      </View>

      {/* Right: Location + Notification Bell + Avatar */}
      <View style={[styles.rightGroup, compact && styles.rightGroupCompact]}>
        {/* Location Dropdown Pill */}
        <TouchableOpacity
          style={[styles.locationPill, compact && styles.locationPillCompact]}
          onPress={onLocationPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker" size={18} color="#F97316" />
          <Text style={styles.locText} numberOfLines={1}>
            {location.split(',')[0]}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={17} color="#64748B" />
        </TouchableOpacity>

        {/* Bell Notification with Count Badge */}
        <TouchableOpacity
          style={[styles.bellBtn, compact && styles.iconBtnCompact]}
          onPress={onNotificationPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bell-outline" size={20} color="#334155" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar with Online Status Dot */}
        <TouchableOpacity
          style={[styles.avatarWrap, compact && styles.avatarWrapCompact]}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <Image
            source={avatarSource || require('../../assets/user-avatar.png')}
            style={[styles.avatar, compact && styles.avatarCompact]}
          />
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCompact: {
    paddingHorizontal: 10,
  },
  brand: {
    flexShrink: 0,
    minWidth: 0,
  },
  brandText: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -1.2,
    color: '#166534',
  },
  brandTextCompact: {
    fontSize: 20,
  },
  brandOrange: {
    color: '#F97316',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  rightGroupCompact: {
    gap: 6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 160,
  },
  locationPillCompact: {
    maxWidth: 104,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  locText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 3,
    flexShrink: 1,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnCompact: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarWrapCompact: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  avatarCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
