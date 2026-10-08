import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const progress = Math.min(Math.max((current / total) * 100, 0), 100);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>{label || `Step ${current} of ${total}`}</Text>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});
