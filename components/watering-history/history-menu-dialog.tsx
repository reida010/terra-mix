import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { PlantState } from '@/types/plant';

interface HistoryMenuDialogProps {
  visible: boolean;
  palette: typeof Colors.light;
  plant: PlantState;
  onClose: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function HistoryMenuDialog({
  visible,
  palette,
  plant,
  onClose,
  onRename,
  onArchive,
  onDelete,
}: HistoryMenuDialogProps) {
  return (
    <ConfirmationDialog
      visible={visible}
      title={`${plant.name} options`}
      confirmLabel="Close"
      onCancel={onClose}
      onConfirm={onClose}>
      <View style={styles.menuList}>
        <Pressable
          style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
          onPress={onRename}
          accessibilityRole="button"
          accessibilityLabel={`Rename ${plant.name}`}>
          <ThemedText type="defaultSemiBold" style={styles.menuLabel}>
            Rename plant
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
          onPress={onArchive}
          accessibilityRole="button"
          accessibilityLabel={`Archive ${plant.name}`}>
          <ThemedText type="defaultSemiBold" style={styles.menuLabel}>
            Archive plant
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${plant.name}`}>
          <ThemedText type="defaultSemiBold" style={[styles.menuLabel, { color: palette.danger }]}>
            Delete plant
          </ThemedText>
        </Pressable>
      </View>
    </ConfirmationDialog>
  );
}

const styles = StyleSheet.create({
  menuList: {
    gap: 12,
  },
  menuItem: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuLabel: {
    textAlign: 'center',
  },
});
