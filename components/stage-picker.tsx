import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FEEDING_STAGES } from '@/constants/feeding';
import { FeedingStageId } from '@/types/plant';

interface StagePickerProps {
  value: FeedingStageId;
  onChange: (stageId: FeedingStageId) => void;
}

export const StagePicker: React.FC<StagePickerProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selectedStage = useMemo(() => FEEDING_STAGES.find(stage => stage.id === value), [value]);
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">Current feeding stage</ThemedText>
      <Pressable
        style={[styles.button, { borderColor: palette.border, backgroundColor: palette.surface }]}
        onPress={() => setVisible(true)}
        accessibilityRole="button">
        <View style={styles.buttonContent}>
          <View style={styles.buttonTextContainer}>
            <ThemedText type="subtitle" style={styles.buttonLabel}>
              {selectedStage?.name ?? 'Select stage'}
            </ThemedText>
            {selectedStage?.description ? (
              <ThemedText style={[styles.buttonDescription, { color: palette.muted }]}>{selectedStage.description}</ThemedText>
            ) : null}
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color={palette.muted} accessible={false} />
        </View>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={[styles.modalContent, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Choose stage
            </ThemedText>
            <ScrollView
              style={styles.optionList}
              contentContainerStyle={styles.optionListContent}
              showsVerticalScrollIndicator={false}>
              {FEEDING_STAGES.map(stage => {
                const isSelected = stage.id === value;
                return (
                  <Pressable
                    key={stage.id}
                    onPress={() => {
                      onChange(stage.id);
                      setVisible(false);
                    }}
                    style={[
                      styles.option,
                      {
                        borderColor: isSelected ? palette.accent : 'transparent',
                        backgroundColor: isSelected ? palette.accentSoft : palette.surfaceMuted,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold">{stage.name}</ThemedText>
                    <ThemedText style={[styles.optionDescription, { color: palette.muted }]}>{stage.description}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              style={[styles.option, styles.closeButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
              onPress={() => setVisible(false)}>
              <ThemedText style={[styles.closeLabel, { color: palette.accent }]}>Cancel</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonLabel: {
    textTransform: 'capitalize',
  },
  buttonDescription: {
    marginTop: 4,
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
  },
  optionList: {
    maxHeight: 360,
  },
  optionListContent: {
    gap: 12,
  },
  option: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.8,
  },
  closeButton: {
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: 16,
  },
});
