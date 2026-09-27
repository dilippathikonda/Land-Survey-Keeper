import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RecordCard } from '@/components/RecordCard';
import { useColors } from '@/hooks/useColors';
import { useSurveyRecords } from '@/context/SurveyContext';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records, isLoading } = useSurveyRecords();
  const [query, setQuery] = useState('');
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((record) =>
      [record.plotNumber, record.ownerName, record.village, record.surveyNumber]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, records]);

  const goToNew = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/new');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecordCard record={item} onPress={() => router.push(`/record/${item.id}`)} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: Math.max(insets.top, 18) + 8, paddingBottom: insets.bottom + 104 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View>
                <Text style={[styles.heading, { color: colors.foreground }]}>Land survey</Text>
              </View>
              <View style={[styles.countPill, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.countNumber, { color: colors.primary }]}>{records.length}</Text>
                <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>plots</Text>
              </View>
            </View>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>READY FOR THE NEXT SITE VISIT?</Text>
                <Text style={styles.heroTitle}>Keep every boundary detail close.</Text>
                <Text style={styles.heroBody}>Save plot notes, measurements, location, and evidence while you are on the ground.</Text>
              </View>
              <Feather name="compass" size={70} color="rgba(255,255,255,0.22)" style={styles.heroIcon} />
            </LinearGradient>
            <View style={styles.searchWrap}>
              <Feather name="search" size={18} color={colors.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search plot, owner, village…"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.searchInput, { color: colors.foreground }]}
                testID="survey-search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={12} testID="clear-search">
                  <Feather name="x-circle" size={18} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {query ? 'Matching plots' : 'Saved plots'}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.emptyState, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={query ? 'search' : 'map-pin'} size={23} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {query ? 'No matching plots' : 'Your field notebook is empty'}
              </Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                {query ? 'Try a different plot number, owner, or village.' : 'Create your first record to keep the survey details in one place.'}
              </Text>
            </View>
          )
        }
      />
      <Pressable
        onPress={goToNew}
        testID="add-survey"
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 20, opacity: pressed ? 0.82 : 1 },
        ]}
      >
        <Feather name="plus" size={22} color={colors.primaryForeground} />
        <Text style={[styles.fabText, { color: colors.primaryForeground }]}>New survey</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingHorizontal: 18 },
  header: { gap: 18, marginBottom: 18 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6, marginBottom: 6 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.7 },
  countPill: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 66 },
  countNumber: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 22 },
  countLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  hero: { borderRadius: 24, padding: 20, minHeight: 153, overflow: 'hidden' },
  heroCopy: { width: '77%', gap: 8 },
  heroKicker: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { color: '#FFFDF8', fontFamily: 'Inter_700Bold', fontSize: 23, lineHeight: 28, letterSpacing: -0.4 },
  heroBody: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  heroIcon: { position: 'absolute', right: -4, bottom: -7 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 15, paddingHorizontal: 14, minHeight: 50, borderWidth: 1, borderColor: '#D9D8CC', backgroundColor: '#FFFDF8' },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  sectionMeta: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  emptyState: { borderRadius: 20, borderWidth: 1, padding: 27, alignItems: 'center', gap: 10 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, textAlign: 'center' },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 285 },
  fab: { position: 'absolute', right: 18, borderRadius: 18, paddingHorizontal: 17, height: 54, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 5, shadowColor: '#17352A', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  fabText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});