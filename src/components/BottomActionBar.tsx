import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Button } from './Button';

interface BottomActionBarProps {
  onNext: () => void;
  nextTitle?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  onBack?: () => void;
  backTitle?: string;
  backDisabled?: boolean;
}

export function BottomActionBar({
  onNext,
  nextTitle = 'Continue ➔',
  nextDisabled = false,
  nextLoading = false,
  onBack,
  backTitle = '← Back',
  backDisabled = false,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.inner}>
        {onBack && (
          <TouchableOpacity
            style={[styles.backBtn, backDisabled && styles.btnDisabled]}
            onPress={onBack}
            disabled={backDisabled || nextLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>{backTitle}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.nextWrap}>
          <Button
            title={nextTitle}
            onPress={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
            style={styles.nextBtn}
            textStyle={styles.nextBtnText}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  nextWrap: {
    flex: 1,
  },
  nextBtn: {
    backgroundColor: '#F95A00', // Saffron / Orange as in image
    borderRadius: 26,
    minHeight: 52,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
});
