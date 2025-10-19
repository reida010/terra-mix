import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: 'default' | 'destructive';
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'default',
  confirmDisabled = false,
  onCancel,
  onConfirm,
  children,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <ThemedView style={[styles.dialog, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
          {children ? <View style={styles.content}>{children}</View> : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[styles.actionButton, styles.cancelButton, { borderColor: palette.border }]}
              accessibilityRole="button"
              accessibilityLabel={`Cancel ${title.toLowerCase()}`}>
              <ThemedText type="defaultSemiBold" style={styles.cancelLabel}>
                {cancelLabel}
              </ThemedText>
            </Pressable>
            <Pressable
              disabled={confirmDisabled}
              onPress={onConfirm}
              style={[
                styles.actionButton,
                {
                  borderColor: confirmTone === 'destructive' ? palette.danger : palette.accent,
                  backgroundColor:
                    confirmTone === 'destructive'
                      ? colorScheme === 'light'
                        ? 'rgba(199, 86, 96, 0.12)'
                        : 'rgba(240, 149, 154, 0.18)'
                      : palette.accentSoft,
                },
                confirmDisabled && styles.disabledButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${confirmLabel} ${title.toLowerCase()}`}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  confirmTone === 'destructive'
                    ? [styles.destructiveLabel, { color: palette.danger }]
                    : [styles.confirmLabel, { color: palette.primary }],
                  confirmDisabled && styles.disabledLabel,
                ]}>
                {confirmLabel}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    marginTop: 4,
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelLabel: {
    fontSize: 14,
  },
  confirmLabel: {
    fontSize: 14,
  },
  destructiveLabel: {
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.6,
  },
});
