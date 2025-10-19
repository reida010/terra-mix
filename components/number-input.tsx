import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NumberInputProps {
  label: string;
  value: number;
  unit?: string;
  minimum?: number;
  maximum?: number;
  step?: number;
  onChange: (next: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  unit,
  minimum,
  maximum,
  step = 1,
  onChange,
}) => {
  const formattedValue = useMemo(() => (Number.isFinite(value) ? String(value) : '0'), [value]);
  const [textValue, setTextValue] = useState(formattedValue);
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const applyChange = (next: number) => {
    let candidate = Number.isFinite(next) ? next : 0;
    if (typeof minimum === 'number') {
      candidate = Math.max(minimum, candidate);
    }
    if (typeof maximum === 'number') {
      candidate = Math.min(maximum, candidate);
    }
    onChange(Number(candidate.toFixed(2)));
  };

  useEffect(() => {
    if (!isFocused) {
      setTextValue(formattedValue);
    }
  }, [formattedValue, isFocused]);

  const handleTextChange = (text: string) => {
    const sanitized = text.replace(/,/g, '.');
    if (!/^\d*(?:\.\d*)?$/.test(sanitized)) {
      return;
    }
    setTextValue(text);
    if (sanitized === '' || sanitized === '.') {
      return;
    }
    const numeric = parseFloat(sanitized);
    if (!Number.isNaN(numeric)) {
      applyChange(numeric);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const sanitized = textValue.replace(/,/g, '.');
    const numeric = parseFloat(sanitized);
    if (!Number.isNaN(numeric)) {
      applyChange(numeric);
    } else {
      setTextValue(formattedValue);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <View style={styles.controls}>
          <Pressable
            style={[styles.button, styles.stepButton, { backgroundColor: palette.accentSoft }]}
            onPress={() => applyChange(value - step)}
            accessibilityLabel={`Decrease ${label}`}>
            <ThemedText type="default" lightColor={palette.primary} darkColor={palette.accent}>
              -
            </ThemedText>
          </Pressable>
          <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <TextInput
              style={[styles.input, { color: palette.text }]}
              keyboardType="decimal-pad"
              value={textValue}
              onChangeText={handleTextChange}
              selectTextOnFocus
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
            />
            {unit ? (
              <ThemedText style={[styles.unit, { color: palette.muted }]}>{unit}</ThemedText>
            ) : null}
          </View>
          <Pressable
            style={[styles.button, styles.stepButton, { backgroundColor: palette.accentSoft }]}
            onPress={() => applyChange(value + step)}
            accessibilityLabel={`Increase ${label}`}>
            <ThemedText type="default" lightColor={palette.primary} darkColor={palette.accent}>
              +
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stepButton: {
    minWidth: 36,
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    width: 112,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
  },
  unit: {
    marginLeft: 8,
    fontSize: 12,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
});
