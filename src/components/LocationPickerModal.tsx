import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BIHAR_DISTRICTS } from '../constants';
import { getCurrentCoordinates, reverseGeocodeCoordinates } from '../services/locationService';
import { Location } from '../types';

interface LocationPickerModalProps {
  visible: boolean;
  initial?: Partial<Location>;
  onClose: () => void;
  onSelect: (location: Location) => Promise<void> | void;
}

export function LocationPickerModal({
  visible,
  initial,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const [area, setArea] = useState(initial?.area || '');
  const [city, setCity] = useState(initial?.city || '');
  const [district, setDistrict] = useState(initial?.district || 'Katihar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setArea(initial?.area || '');
      setCity(initial?.city || '');
      setDistrict(initial?.district || 'Katihar');
      setError('');
    }
  }, [visible, initial?.area, initial?.city, initial?.district]);

  const useCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const coordinates = await getCurrentCoordinates();
      if (!coordinates) {
        setError('लोकेशन उपलब्ध नहीं हुई। अनुमति दें या नीचे मैन्युअल लोकेशन चुनें।');
        return;
      }
      const result = await reverseGeocodeCoordinates(coordinates.latitude, coordinates.longitude);
      if (!result) {
        setError('लोकेशन का पता नहीं मिल सका। मैन्युअल रूप से चुनें।');
        return;
      }
      await onSelect({
        state: result.state || 'Bihar',
        district: result.district || district,
        city: result.city || result.district || city || district,
        area: result.area || area || result.city || district,
        pinCode: result.pinCode || '',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      onClose();
    } catch (locationError) {
      console.error('Unable to resolve current location:', locationError);
      setError('लोकेशन नहीं मिल सकी। मैन्युअल रूप से चुनें।');
    } finally {
      setLoading(false);
    }
  };

  const saveManualLocation = async () => {
    if (!district.trim() || !city.trim()) {
      setError('कृपया जिला और शहर भरें।');
      return;
    }
    try {
      await onSelect({
        state: 'Bihar',
        district: district.trim(),
        city: city.trim(),
        area: area.trim() || city.trim(),
        pinCode: '',
      });
      setError('');
      onClose();
    } catch (saveError) {
      console.error('Unable to save manual location:', saveError);
      setError('लोकेशन सेव नहीं हुई। कृपया फिर कोशिश करें।');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>अपनी लोकेशन चुनें</Text>
          <Text style={styles.subtitle}>आपकी अनुमति के बिना current location इस्तेमाल नहीं होगी।</Text>
          <TouchableOpacity style={styles.gpsButton} onPress={useCurrentLocation} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.gpsText}>वर्तमान लोकेशन इस्तेमाल करें</Text>}
          </TouchableOpacity>
          <Text style={styles.orText}>या लोकेशन मैन्युअल भरें</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districts}>
            {BIHAR_DISTRICTS.map((item) => (
              <TouchableOpacity key={item} style={[styles.districtChip, district === item && styles.districtChipActive]} onPress={() => setDistrict(item)}>
                <Text style={[styles.districtText, district === item && styles.districtTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="शहर / Town" />
          <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="इलाका / Area (वैकल्पिक)" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelText}>रद्द करें</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveManualLocation}><Text style={styles.saveText}>लोकेशन सेव करें</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.48)' },
  sheet: { maxHeight: '86%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 },
  title: { color: '#0F172A', fontSize: 19, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 14 },
  gpsButton: { minHeight: 46, backgroundColor: '#166534', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gpsText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  orText: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 14, marginBottom: 8 },
  districts: { gap: 7, paddingBottom: 10 },
  districtChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  districtChipActive: { backgroundColor: '#FFF7ED', borderColor: '#EA580C' },
  districtText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  districtTextActive: { color: '#C2410C', fontWeight: '800' },
  input: { height: 46, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 11, paddingHorizontal: 12, marginTop: 8, color: '#0F172A' },
  error: { color: '#B91C1C', fontSize: 12, lineHeight: 17, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  cancelText: { color: '#334155', fontWeight: '700' },
  saveButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4511E', borderRadius: 12 },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
});
