import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

type FieldProps = TextInputProps & {
  label: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Field({ label, hint, containerStyle, ...inputProps }: FieldProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
          inputProps.multiline && styles.multiline,
          inputProps.style,
        ]}
      />
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.3, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  multiline: { minHeight: 106, textAlignVertical: 'top' },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
});