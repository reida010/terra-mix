import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PlantState } from '@/types/plant';

interface PlantSelectorProps {
  plants: PlantState[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAddPlant: () => void;
}

export const PlantSelector: React.FC<PlantSelectorProps> = ({ plants, selectedId, onSelect, onAddPlant }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const itemWidth = Math.min(Math.max(width * 0.45, 136), 200);
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {plants.map(plant => {
        const isSelected = plant.id === selectedId;
        return (
          <Pressable
            key={plant.id}
            onPress={() => onSelect(plant.id)}
            style={[
              styles.item,
              {
                width: isCompact ? itemWidth : 184,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
              isCompact && styles.itemCompact,
              isSelected && {
                borderColor: palette.accent,
                shadowColor: palette.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: colorScheme === 'light' ? 0.22 : 0.35,
                shadowRadius: 10,
                elevation: 3,
              },
            ]}>
            <View style={[styles.itemContent, isCompact && styles.itemContentCompact]}>
              <ThemedText type={isCompact ? 'defaultSemiBold' : 'subtitle'} style={[styles.name, isCompact && styles.nameCompact]}>
                {plant.name}
              </ThemedText>
              <ThemedText type="default" style={[styles.meta, isCompact && styles.metaCompact]}>
                {plant.stageId}
              </ThemedText>
              <ThemedText type="default" style={[styles.meta, isCompact && styles.metaCompact]}>
                {plant.strength}% strength
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onAddPlant}
        style={[
          styles.item,
          styles.addButton,
          {
            width: isCompact ? itemWidth : 184,
            backgroundColor: palette.accentSoft,
            borderColor: palette.accent,
          },
          isCompact && styles.itemCompact,
        ]}
        accessibilityRole="button">
        <View style={styles.addContent}>
          <ThemedText
            type={isCompact ? 'subtitle' : 'title'}
            style={[styles.plus, { color: palette.accent }, isCompact && styles.plusCompact]}>
            +
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[{ color: palette.accent }, isCompact ? styles.addLabelCompact : undefined]}>
            New Plant
          </ThemedText>
        </View>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  item: {
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  itemCompact: {
    borderRadius: 14,
  },
  itemContent: {
    padding: 14,
    height: '100%',
    justifyContent: 'space-between',
  },
  itemContentCompact: {
    padding: 12,
  },
  name: {
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  nameCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  metaCompact: {
    fontSize: 11,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  addContent: {
    alignItems: 'center',
    gap: 4,
  },
  plus: {
    fontSize: 32,
    lineHeight: 34,
  },
  plusCompact: {
    fontSize: 24,
    lineHeight: 26,
  },
  addLabelCompact: {
    fontSize: 14,
  },
});
