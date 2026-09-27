import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSurveyRecords } from '@/context/SurveyContext';

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  const colors = useColors();
  if (!value) return null;
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function RecordDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecord, deleteRecord } = useSurveyRecords();
  const record = getRecord(id);

  if (!record) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
        <Feather name="map" size={32} color={colors.mutedForeground} />
        <Text style={[styles.missingTitle, { color: colors.foreground }]}>Record not found</Text>
        <Pressable onPress={() => router.replace('/')} style={[styles.backHome, { backgroundColor: colors.primary }]}>
          <Text style={[styles.backHomeText, { color: colors.primaryForeground }]}>Back to surveys</Text>
        </Pressable>
      </View>
    );
  }

  const location = record.latitude !== null && record.longitude !== null
    ? `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`
    : null;
  const boundaries = [
    ['North boundary', record.boundaryNorth],
    ['East boundary', record.boundaryEast],
    ['South boundary', record.boundarySouth],
    ['West boundary', record.boundaryWest],
  ].filter(([, value]) => value);
  const updated = new Date(record.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  const confirmDelete = () => {
    Alert.alert('Delete this survey?', 'This record and its saved details will be removed from this device.', [
      { text: 'Keep record', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(record.id);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton} testID="back-detail">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={[styles.kicker, { color: colors.accent }]}>SURVEY RECORD</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]} numberOfLines={1}>{record.plotNumber}</Text>
        </View>
        <Pressable onPress={() => router.push(`/new?id=${record.id}`)} hitSlop={10} style={styles.iconButton} testID="edit-survey">
          <Feather name="edit-3" size={19} color={colors.primary} />
        </Pressable>
        <Pressable onPress={confirmDelete} hitSlop={10} style={styles.iconButton} testID="delete-survey">
          <Feather name="trash-2" size={19} color={colors.destructive} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.titleCard, { backgroundColor: colors.primary }]}>
          <View style={styles.titleCardCopy}>
            <Text style={styles.titleEyebrow}>PLOT</Text>
            <Text style={styles.plotTitle}>{record.plotNumber}</Text>
            <Text style={styles.plotLocation}>{[record.village, record.ownerName].filter(Boolean).join(' · ') || 'Location not added'}</Text>
          </View>
          <Feather name="map-pin" size={66} color="rgba(255,255,255,0.2)" />
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardHeading, { color: colors.foreground }]}>Identity</Text>
          <DetailRow label="Owner" value={record.ownerName} />
          <DetailRow label="Village / locality" value={record.village} />
          <DetailRow label="Survey number" value={record.surveyNumber} />
          <DetailRow label="Deed / document ref." value={record.deedReference} />
          {!record.ownerName && !record.village && !record.surveyNumber && !record.deedReference ? (
            <Text style={[styles.emptyDetail, { color: colors.mutedForeground }]}>No identity references added.</Text>
          ) : null}
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardHeading, { color: colors.foreground }]}>Measurements</Text>
          <DetailRow label="Area" value={record.area ? `${record.area} ${record.areaUnit}` : null} />
          {boundaries.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}
          {!record.area && boundaries.length === 0 ? <Text style={[styles.emptyDetail, { color: colors.mutedForeground }]}>No measurements added.</Text> : null}
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardHeading, { color: colors.foreground }]}>Site position</Text>
            <Feather name={location ? 'check-circle' : 'minus-circle'} size={17} color={location ? colors.primary : colors.mutedForeground} />
          </View>
          <Text style={[styles.locationText, { color: colors.foreground }]}>{location || 'No GPS position saved'}</Text>
          <Text style={[styles.smallText, { color: colors.mutedForeground }]}>{location ? 'Captured from the survey device' : 'You can edit this record to capture it.'}</Text>
        </View>
        {record.photoUris.length > 0 ? (
          <View style={styles.evidenceSection}>
            <Text style={[styles.cardHeading, { color: colors.foreground }]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {record.photoUris.map((uri) => <Image key={uri} source={{ uri }} style={styles.photo} />)}
            </ScrollView>
          </View>
        ) : null}
        {record.documentReference || record.notes ? (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardHeading, { color: colors.foreground }]}>Notes & references</Text>
            <DetailRow label="Document reference" value={record.documentReference} />
            {record.notes ? <Text style={[styles.notes, { color: colors.foreground }]}>{record.notes}</Text> : null}
          </View>
        ) : null}
        <Text style={[styles.updated, { color: colors.mutedForeground }]}>Updated {updated}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { minHeight: 74, paddingHorizontal: 18, paddingBottom: 11, flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topCopy: { flex: 1, paddingHorizontal: 6, gap: 3 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  topTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  content: { paddingHorizontal: 18, gap: 14 },
  titleCard: { borderRadius: 23, padding: 20, minHeight: 145, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  titleCardCopy: { gap: 6, flex: 1 },
  titleEyebrow: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  plotTitle: { color: '#FFFDF8', fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.8 },
  plotLocation: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_400Regular', fontSize: 13 },
  infoCard: { borderWidth: 1, borderRadius: 20, padding: 17, gap: 3 },
  cardHeading: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 5 },
  detailRow: { minHeight: 39, paddingVertical: 9, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textAlign: 'right', flex: 1.2 },
  emptyDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, paddingVertical: 7 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 3 },
  smallText: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  evidenceSection: { gap: 9 },
  photoRow: { gap: 10 },
  photo: { width: 142, height: 142, borderRadius: 17 },
  notes: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, paddingTop: 8 },
  updated: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', paddingVertical: 5 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  missingTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  backHome: { borderRadius: 13, paddingHorizontal: 17, paddingVertical: 12 },
  backHomeText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});