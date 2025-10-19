import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AdditiveCard } from '@/components/additive-card';
import { FertilizerSummary } from '@/components/fertilizer-summary';
import { NumberInput } from '@/components/number-input';
import { PlantSelector } from '@/components/plant-selector';
import { StagePicker } from '@/components/stage-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WateringHistory } from '@/components/watering-history';
import { BLOOM_BOOSTER_RECOMMENDATIONS } from '@/constants/feeding';
import { usePlants } from '@/context/PlantContext';
import { FeedingStageId, WateringLogEntry } from '@/types/plant';
import { AdditiveDoseSummary, calculateAdditiveDoses, calculateFertilizerDoses, formatMl } from '@/utils/feeding';

export default function HomeScreen() {
  const { plants, loading, addPlant, updatePlant, deletePlant, logWatering } = usePlants();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!selectedId && plants.length > 0) {
      setSelectedId(plants[0].id);
    }
  }, [selectedId, plants]);

  useEffect(() => {
    if (selectedId && !plants.find(plant => plant.id === selectedId) && plants[0]) {
      setSelectedId(plants[0].id);
    }
  }, [selectedId, plants]);

  useEffect(() => {
    setIsLogging(false);
  }, [selectedId]);

  const plant = useMemo(() => plants.find(p => p.id === selectedId), [plants, selectedId]);

  const doses = useMemo(() => {
    if (!plant) return [];
    const liters = plant.preferredWaterLiters > 0 ? plant.preferredWaterLiters : 1;
    return calculateFertilizerDoses(plant, liters);
  }, [plant]);

  const additiveDoses = useMemo<AdditiveDoseSummary>(() => {
    if (!plant) return {} as AdditiveDoseSummary;
    const liters = plant.preferredWaterLiters > 0 ? plant.preferredWaterLiters : 1;
    return calculateAdditiveDoses(plant, liters);
  }, [plant]);

  const handleStageChange = (stageId: FeedingStageId) => {
    if (!plant) return;
    updatePlant(plant.id, prev => ({
      ...prev,
      stageId,
    }));
  };

  const handleStrengthChange = (value: number) => {
    if (!plant) return;
    updatePlant(plant.id, prev => ({
      ...prev,
      strength: Math.round(value),
    }));
  };

  const handleWaterChange = (value: number) => {
    if (!plant) return;
    updatePlant(plant.id, prev => ({
      ...prev,
      preferredWaterLiters: Math.max(0, value),
    }));
  };

  const handleDeletePlant = (id: string) => {
    deletePlant(id);
    if (id === selectedId) {
      setSelectedId(undefined);
    }
  };

  const handleLogWatering = () => {
    if (!plant) return;
    const liters = plant.preferredWaterLiters > 0 ? plant.preferredWaterLiters : 1;
    const logEntry: WateringLogEntry = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      waterLiters: liters,
      strength: plant.strength,
      stageId: plant.stageId,
      fertilizers: doses,
      additives: additiveDoses,
    };
    logWatering(plant.id, logEntry);
    setIsLogging(false);
  };

  if (loading || !plant) {
    return (
      <ThemedView style={styles.loadingContainer}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <ThemedText>No plants yet. Add one to begin.</ThemedText>
        )}
      </ThemedView>
    );
  }

  const liters = plant.preferredWaterLiters > 0 ? plant.preferredWaterLiters : 1;

  return (
    <ThemedView style={styles.container}>
      <PlantSelector
        plants={plants}
        selectedId={plant.id}
        onSelect={setSelectedId}
        onAddPlant={() => addPlant()}
        onDelete={handleDeletePlant}
      />
      {isLogging ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.section}>
            <StagePicker value={plant.stageId} onChange={handleStageChange} />
            <NumberInput
              label="Strength"
              unit="%"
              value={plant.strength}
              minimum={40}
              maximum={110}
              step={5}
              onChange={handleStrengthChange}
            />
            <NumberInput
              label="Water volume"
              unit="L"
              value={plant.preferredWaterLiters}
              minimum={0.5}
              step={0.5}
              onChange={handleWaterChange}
            />
            <ThemedText style={styles.helperCopy}>
              The strength slider multiplies the base feeding chart. 100% equals the published Terra Aquatica schedule.
            </ThemedText>
          </View>

          <FertilizerSummary doses={doses} waterLiters={liters} />

          <AdditiveCard
            plant={plant}
            doses={additiveDoses}
            waterLiters={liters}
            onToggleRoot={next =>
              updatePlant(plant.id, prev => ({
                ...prev,
                additives: {
                  ...prev.additives,
                  rootStimulant: {
                    ...prev.additives.rootStimulant,
                    active: next,
                    startDate: next ? new Date().toISOString() : undefined,
                  },
                },
              }))
            }
            onToggleFulvic={next =>
              updatePlant(plant.id, prev => ({
                ...prev,
                additives: {
                  ...prev.additives,
                  fulvicAcid: {
                    ...prev.additives.fulvicAcid,
                    active: next,
                    startedAt: next ? new Date().toISOString() : undefined,
                  },
                },
              }))
            }
            onAdjustBloom={intensity =>
              updatePlant(plant.id, prev => ({
                ...prev,
                additives: {
                  ...prev.additives,
                  bloomBooster: {
                    ...prev.additives.bloomBooster,
                    active: intensity > 0,
                    intensity,
                    lastAdjustedAt: new Date().toISOString(),
                  },
                },
              }))
            }
          />

          <ThemedView style={styles.tipCard}>
            <ThemedText type="subtitle">Bloom game plan</ThemedText>
            <ThemedText style={styles.tipCopy}>
              Suggested bloom stimulant intensity for {plant.stageId} is{' '}
              {BLOOM_BOOSTER_RECOMMENDATIONS[plant.stageId]}%. Keep an eye on leaf tips—dial back 5% if you see light burn, or add 5%
              when plants are hungry.
            </ThemedText>
          </ThemedView>

          <Pressable style={styles.logButton} onPress={handleLogWatering} accessibilityRole="button">
            <ThemedText type="title" style={styles.logButtonLabel}>
              Log watering ({liters} L · {plant.strength}% · {formatMl(doses.reduce((sum, dose) => sum + dose.ml, 0))} nutrients)
            </ThemedText>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.historyScroll}>
          <View style={styles.historyHeader}>
            <ThemedText type="title">Watering history</ThemedText>
            <Pressable style={styles.addLogButton} onPress={() => setIsLogging(true)} accessibilityRole="button">
              <ThemedText type="defaultSemiBold" style={styles.addLogLabel}>
                + Log watering
              </ThemedText>
            </Pressable>
          </View>
          <WateringHistory logs={plant.logs} />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  historyScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 12,
  },
  section: {
    marginTop: 12,
    gap: 8,
  },
  helperCopy: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 12,
  },
  tipCard: {
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  tipCopy: {
    opacity: 0.85,
    fontSize: 13,
  },
  logButton: {
    marginTop: 24,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  logButtonLabel: {
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addLogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  addLogLabel: {
    fontSize: 14,
  },
});
