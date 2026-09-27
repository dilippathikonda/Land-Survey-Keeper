import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SurveyRecord } from '@/context/SurveyContext';

export function RecordCard({ record, onPress }: { record: SurveyRecord; onPress: () => void }) {
  const colors = useColors();
  const location = [record.village, record.ownerName].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      testID={`survey-record-${record.id}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.plotIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="map" size={18} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
            {record.plotNumber || 'Untitled plot'}
          </Text>
          <Text numberOfLines={1} style={[styles.location, { color: colors.mutedForeground }]}>
            {location || 'No owner or village added'}
          </Text>
        </View>
        <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
      </View>
      <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.foreground }]}>
          {record.area ? `${record.area} ${record.areaUnit}` : 'Area not set'}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {record.latitude !== null ? 'GPS saved' : 'GPS not saved'}
        </Text>
        {record.photoUris.length > 0 ? (
          <View style={styles.photoMeta}>
            <Feather name="image" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{record.photoUris.length}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  plotIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, gap: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  location: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 13, borderTopWidth: 1 },
  meta: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  photoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});