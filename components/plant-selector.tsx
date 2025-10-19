import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { PlantState } from '@/types/plant';

interface PlantSelectorProps {
  plants: PlantState[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAddPlant: () => void;
}

export const PlantSelector: React.FC<PlantSelectorProps> = ({ plants, selectedId, onSelect, onAddPlant }) => {
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
            style={[styles.item, isSelected && styles.itemSelected]}>
            <View style={styles.itemContent}>
              <ThemedText type="subtitle" style={styles.name}>
                {plant.name}
              </ThemedText>
              <ThemedText type="default" style={styles.meta}>
                {plant.stageId}
              </ThemedText>
              <ThemedText type="default" style={styles.meta}>
                {plant.strength}% strength
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
      <Pressable onPress={onAddPlant} style={[styles.item, styles.addButton]} accessibilityRole="button">
        <View style={styles.addContent}>
          <ThemedText type="title" style={styles.plus}>
            +
          </ThemedText>
          <ThemedText type="defaultSemiBold">New Plant</ThemedText>
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
    width: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemSelected: {
    borderColor: '#34d399',
    borderWidth: 2,
  },
  itemContent: {
    padding: 16,
    height: '100%',
    justifyContent: 'space-between',
  },
  name: {
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  meta: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  addContent: {
    alignItems: 'center',
    gap: 4,
  },
  plus: {
    fontSize: 32,
    lineHeight: 34,
  },
});
