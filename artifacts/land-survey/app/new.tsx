import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field } from '@/components/Field';
import { SectionLabel } from '@/components/SectionLabel';
import { SurveyDraft, useSurveyRecords } from '@/context/SurveyContext';
import { useColors } from '@/hooks/useColors';

const blankDraft: SurveyDraft = {
  plotNumber: '',
  ownerName: '',
  village: '',
  surveyNumber: '',
  deedReference: '',
  area: '',
  areaUnit: 'acres',
  boundaryNorth: '',
  boundaryEast: '',
  boundarySouth: '',
  boundaryWest: '',
  latitude: null,
  longitude: null,
  photoUris: [],
  documentReference: '',
  notes: '',
};

export default function NewSurveyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { records, addRecord, updateRecord } = useSurveyRecords();
  const existing = params.id ? records.find((record) => record.id === params.id) : undefined;
  const [draft, setDraft] = useState<SurveyDraft>(blankDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const isEditing = Boolean(params.id);

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...existingDraft } = existing;
      setDraft(existingDraft);
    }
  }, [existing]);

  const update = (key: keyof SurveyDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const captureLocation = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Location permission needed', 'Allow location access to save the current survey position.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setDraft((current) => ({
        ...current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Could not capture location', 'Check that location services are enabled and try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const addPhoto = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
        if (!permission.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to attach a site photo.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.82 });
        if (!result.canceled && result.assets[0]?.uri) {
          setDraft((current) => ({ ...current, photoUris: [...current.photoUris, result.assets[0].uri] }));
        }
      } else {
        const permission = libraryPermission?.granted ? libraryPermission : await requestLibraryPermission();
        if (!permission.granted) {
          Alert.alert('Photo access needed', 'Allow photo access to choose an existing site image.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.82,
        });
        if (!result.canceled) {
          setDraft((current) => ({
            ...current,
            photoUris: [...current.photoUris, ...result.assets.map((asset) => asset.uri)],
          }));
        }
      }
    } catch {
      Alert.alert('Could not add photo', 'Please try again.');
    }
  };

  const removePhoto = (uri: string) => {
    setDraft((current) => ({ ...current, photoUris: current.photoUris.filter((item) => item !== uri) }));
  };

  const save = async () => {
    if (!draft.plotNumber.trim()) {
      Alert.alert('Plot number required', 'Add a plot number before saving this survey.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing && params.id) {
        await updateRecord(params.id, draft);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/record/${params.id}`);
      } else {
        const record = await addRecord(draft);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/record/${record.id}`);
      }
    } catch {
      Alert.alert('Could not save survey', 'Your changes were not saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const locationLabel = useMemo(() => {
    if (draft.latitude === null || draft.longitude === null) return 'No position captured yet';
    return `${draft.latitude.toFixed(6)}, ${draft.longitude.toFixed(6)}`;
  }, [draft.latitude, draft.longitude]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton} testID="back-button">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={[styles.topKicker, { color: colors.accent }]}>{isEditing ? 'EDIT RECORD' : 'NEW RECORD'}</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{isEditing ? 'Update survey' : 'Record a survey'}</Text>
        </View>
        <Pressable
          onPress={save}
          disabled={isSaving}
          style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed || isSaving ? 0.65 : 1 }]}
          testID="save-survey"
        >
          <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>
            {isSaving ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>
      <KeyboardAwareScrollViewCompat
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 34 }]}
      >
        <SectionLabel title="Plot identity" subtitle="Start with the details you will use to find this record later." />
        <Field label="Plot number *" value={draft.plotNumber} onChangeText={(value) => update('plotNumber', value)} placeholder="e.g. 42/3B" autoCapitalize="characters" testID="plot-number" />
        <View style={styles.twoColumn}>
          <Field label="Owner" value={draft.ownerName} onChangeText={(value) => update('ownerName', value)} placeholder="Full name" containerStyle={styles.flexField} />
          <Field label="Village / locality" value={draft.village} onChangeText={(value) => update('village', value)} placeholder="Location" containerStyle={styles.flexField} />
        </View>
        <View style={styles.twoColumn}>
          <Field label="Survey number" value={draft.surveyNumber} onChangeText={(value) => update('surveyNumber', value)} placeholder="Reference" containerStyle={styles.flexField} />
          <Field label="Deed / document ref." value={draft.deedReference} onChangeText={(value) => update('deedReference', value)} placeholder="Optional" containerStyle={styles.flexField} />
        </View>

        <SectionLabel title="Measurements" subtitle="Use the units you use on site." />
        <View style={styles.twoColumn}>
          <Field label="Area" value={draft.area} onChangeText={(value) => update('area', value)} placeholder="0.00" keyboardType="decimal-pad" containerStyle={styles.flexField} />
          <Field label="Unit" value={draft.areaUnit} onChangeText={(value) => update('areaUnit', value)} placeholder="acres" containerStyle={styles.flexField} />
        </View>
        <Text style={[styles.boundaryTitle, { color: colors.foreground }]}>Boundary lengths</Text>
        <View style={styles.boundaryGrid}>
          <Field label="North" value={draft.boundaryNorth} onChangeText={(value) => update('boundaryNorth', value)} placeholder="e.g. 120 m" containerStyle={styles.boundaryField} />
          <Field label="East" value={draft.boundaryEast} onChangeText={(value) => update('boundaryEast', value)} placeholder="e.g. 85 m" containerStyle={styles.boundaryField} />
          <Field label="South" value={draft.boundarySouth} onChangeText={(value) => update('boundarySouth', value)} placeholder="e.g. 120 m" containerStyle={styles.boundaryField} />
          <Field label="West" value={draft.boundaryWest} onChangeText={(value) => update('boundaryWest', value)} placeholder="e.g. 85 m" containerStyle={styles.boundaryField} />
        </View>

        <SectionLabel title="Site position" subtitle="Save the current phone position while standing on the plot." />
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.locationIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="crosshair" size={21} color={colors.primary} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={[styles.locationValue, { color: colors.foreground }]}>{locationLabel}</Text>
            <Text style={[styles.locationHint, { color: colors.mutedForeground }]}>
              {draft.latitude === null ? 'GPS is optional' : 'Captured from this device'}
            </Text>
          </View>
          <Pressable onPress={captureLocation} disabled={isLocating} style={[styles.captureButton, { backgroundColor: colors.primary }]} testID="capture-location">
            <Feather name="navigation" size={15} color={colors.primaryForeground} />
            <Text style={[styles.captureText, { color: colors.primaryForeground }]}>{isLocating ? '…' : 'Capture'}</Text>
          </Pressable>
        </View>

        <SectionLabel title="Evidence & notes" subtitle="Bring the story of the site along with the measurements." />
        <View style={styles.photoActions}>
          <Pressable onPress={() => addPhoto('camera')} style={[styles.photoButton, { borderColor: colors.primary, backgroundColor: colors.secondary }]} testID="take-photo">
            <Feather name="camera" size={17} color={colors.primary} />
            <Text style={[styles.photoButtonText, { color: colors.primary }]}>Take photo</Text>
          </Pressable>
          <Pressable onPress={() => addPhoto('library')} style={[styles.photoButton, { borderColor: colors.border, backgroundColor: colors.card }]} testID="choose-photo">
            <Feather name="image" size={17} color={colors.foreground} />
            <Text style={[styles.photoButtonText, { color: colors.foreground }]}>Choose photo</Text>
          </Pressable>
        </View>
        {draft.photoUris.length > 0 ? (
          <View style={styles.photoList}>
            {draft.photoUris.map((uri) => (
              <View key={uri} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} />
                <Pressable onPress={() => removePhoto(uri)} style={styles.removePhoto} hitSlop={6}>
                  <Feather name="x" size={14} color="#FFFDF8" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <Field label="Document reference" value={draft.documentReference} onChangeText={(value) => update('documentReference', value)} placeholder="File name, registry number, or storage reference" />
        <Field label="Notes" value={draft.notes} onChangeText={(value) => update('notes', value)} placeholder="Add observations, access notes, landmarks, or follow-ups…" multiline />
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { minHeight: 74, paddingHorizontal: 18, paddingBottom: 11, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topCopy: { flex: 1, gap: 3 },
  topKicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  topTitle: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  saveButton: { borderRadius: 13, paddingHorizontal: 17, minHeight: 40, justifyContent: 'center' },
  content: { paddingHorizontal: 18, gap: 17 },
  twoColumn: { flexDirection: 'row', gap: 11 },
  flexField: { flex: 1 },
  boundaryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: -3 },
  boundaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  boundaryField: { width: '48%', minWidth: 130 },
  locationCard: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 3 },
  locationValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  locationHint: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  captureButton: { borderRadius: 12, minHeight: 38, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  captureText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoButton: { flex: 1, minHeight: 47, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  photoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  photoList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoWrap: { width: 82, height: 82, borderRadius: 15, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(23,53,42,0.82)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});