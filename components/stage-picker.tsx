import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FEEDING_STAGES } from '@/constants/feeding';
import { FeedingStageId } from '@/types/plant';

interface StagePickerProps {
  value: FeedingStageId;
  onChange: (stageId: FeedingStageId) => void;
}

export const StagePicker: React.FC<StagePickerProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selectedStage = useMemo(() => FEEDING_STAGES.find(stage => stage.id === value), [value]);

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">Current feeding stage</ThemedText>
      <Pressable style={styles.button} onPress={() => setVisible(true)} accessibilityRole="button">
        <View>
          <ThemedText type="subtitle" style={styles.buttonLabel}>
            {selectedStage?.name ?? 'Select stage'}
          </ThemedText>
          {selectedStage?.description ? (
            <ThemedText style={styles.buttonDescription}>{selectedStage.description}</ThemedText>
          ) : null}
        </View>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Choose stage
            </ThemedText>
            {FEEDING_STAGES.map(stage => {
              const isSelected = stage.id === value;
              return (
                <Pressable
                  key={stage.id}
                  onPress={() => {
                    onChange(stage.id);
                    setVisible(false);
                  }}
                  style={[styles.option, isSelected && styles.optionSelected]}>
                  <ThemedText type="defaultSemiBold">{stage.name}</ThemedText>
                  <ThemedText style={styles.optionDescription}>{stage.description}</ThemedText>
                </Pressable>
              );
            })}
            <Pressable style={[styles.option, styles.closeButton]} onPress={() => setVisible(false)}>
              <ThemedText style={styles.closeLabel}>Cancel</ThemedText>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
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
  },
  modalTitle: {
    textAlign: 'center',
  },
  option: {
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.8,
  },
  closeButton: {
    alignItems: 'center',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  closeLabel: {
    fontSize: 16,
  },
});
