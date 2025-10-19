import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Colors } from '@/constants/theme';
import { PlantState } from '@/types/plant';

interface RenameDialogProps {
  visible: boolean;
  palette: typeof Colors.light;
  colorScheme: 'light' | 'dark';
  pendingRename: PlantState | null;
  renameValue: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RenameDialog({
  visible,
  palette,
  colorScheme,
  pendingRename,
  renameValue,
  onChange,
  onCancel,
  onConfirm,
}: RenameDialogProps) {
  return (
    <ConfirmationDialog
      visible={visible}
      title="Rename plant"
      message={pendingRename ? `Give ${pendingRename.name} a new name.` : 'Rename this plant.'}
      confirmLabel="Save"
      confirmDisabled={!renameValue.trim()}
      onCancel={onCancel}
      onConfirm={onConfirm}>
      <TextInput
        style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surface, color: palette.text }]}
        value={renameValue}
        onChangeText={onChange}
        placeholder="New plant name"
        placeholderTextColor={colorScheme === 'light' ? 'rgba(15, 52, 69, 0.35)' : 'rgba(228, 243, 250, 0.45)'}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onConfirm}
      />
    </ConfirmationDialog>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
