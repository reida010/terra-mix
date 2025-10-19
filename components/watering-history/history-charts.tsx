import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { WateringLogEntry } from '@/types/plant';

const CHART_HEIGHT = 140;
const MAX_POINTS = 8;

type HistoryPalette = typeof Colors.light;

type ChartSeries = {
  key: string;
  label: string;
  color: string;
  unit?: string;
};

type ChartPoint = {
  id: string;
  label: string;
  values: Record<string, number | null>;
};

interface HistoryChartsProps {
  logs: WateringLogEntry[];
  palette: HistoryPalette;
}

const formatNumber = (value: number) => {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

const formatDateLabel = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const ensureRange = (values: number[]) => {
  if (!values.length) {
    return { min: 0, max: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { min: min === 0 ? 0 : min - 1, max: max + 1 };
  }
  return { min, max };
};

const normalizeHeight = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (max === min) {
    return CHART_HEIGHT * 0.6;
  }
  const ratio = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.max(6, clamped * CHART_HEIGHT);
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  series: ChartSeries[];
  points: ChartPoint[];
  palette: HistoryPalette;
  emptyMessage: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, series, points, palette, emptyMessage }) => {
  const availableValues = series.flatMap(def =>
    points
      .map(point => point.values[def.key])
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
  );

  const hasData = availableValues.length > 0;

  const { min, max } = ensureRange(availableValues);

  return (
    <ThemedView style={[styles.card, { borderColor: palette.border, backgroundColor: palette.surface }]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</ThemedText>
      ) : null}
      <View style={styles.legend} accessibilityRole="text">
        {series.map(item => (
          <View key={item.key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
            <ThemedText style={[styles.legendLabel, { color: palette.muted }]}>
              {item.label}
              {item.unit ? ` (${item.unit})` : ''}
            </ThemedText>
          </View>
        ))}
      </View>
      {hasData ? (
        <View style={styles.chartArea}>
          <View style={[styles.axis, { backgroundColor: palette.border }]} />
          <View style={styles.bars}>
            {points.map(point => (
              <View key={point.id} style={styles.barGroup}>
                <View style={styles.barCluster}>
                  {series.map(item => {
                    const rawValue = point.values[item.key];
                    const isNumber = typeof rawValue === 'number' && !Number.isNaN(rawValue);
                    const height = isNumber ? normalizeHeight(rawValue, min, max) : 0;
                    return (
                      <View key={item.key} style={styles.barItem}>
                        {isNumber ? (
                          <ThemedText style={[styles.valueLabel, { color: palette.muted }]}>
                            {formatNumber(rawValue)}
                          </ThemedText>
                        ) : (
                          <ThemedText style={[styles.valueLabel, { color: palette.border }]}>—</ThemedText>
                        )}
                        <View
                          style={[
                            styles.bar,
                            {
                              height,
                              backgroundColor: isNumber ? item.color : 'transparent',
                              borderColor: isNumber ? 'transparent' : palette.border,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
                <ThemedText style={[styles.barLabel, { color: palette.muted }]}>{point.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ThemedText style={[styles.emptyCopy, { color: palette.muted }]}>{emptyMessage}</ThemedText>
      )}
    </ThemedView>
  );
};

export const HistoryCharts: React.FC<HistoryChartsProps> = ({ logs, palette }) => {
  const points = useMemo(() => {
    const sorted = [...logs]
      .filter(log => Boolean(log))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const recent = sorted.slice(-MAX_POINTS);
    return recent.map(log => {
      const growDose = log.fertilizers.find(dose => dose.fertilizer === 'grow');
      const microDose = log.fertilizers.find(dose => dose.fertilizer === 'micro');
      const bloomDose = log.fertilizers.find(dose => dose.fertilizer === 'bloom');
      const rootAdditive = log.additives?.rootStimulant;
      const fulvicAdditive = log.additives?.fulvicAcid;
      const bloomBoosterAdditive = log.additives?.bloomBooster;

      return {
        id: log.id,
        label: formatDateLabel(log.createdAt),
        values: {
          ph: typeof log.ph === 'number' ? log.ph : null,
          ec: typeof log.ec === 'number' ? log.ec : null,
          grow: growDose ? growDose.mlPerLiter : null,
          micro: microDose ? microDose.mlPerLiter : null,
          bloom: bloomDose ? bloomDose.mlPerLiter : null,
          rootStimulant: rootAdditive ? rootAdditive.mlPerLiter : null,
          fulvicAcid: fulvicAdditive ? fulvicAdditive.mlPerLiter : null,
          bloomBooster: bloomBoosterAdditive ? bloomBoosterAdditive.mlPerLiter : null,
        },
      };
    });
  }, [logs]);

  if (!points.length) {
    return (
      <ThemedView style={[styles.emptyCard, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}>
        <ThemedText type="title" style={{ color: palette.muted }}>
          No data yet
        </ThemedText>
        <ThemedText style={{ color: palette.muted }}>
          Log a watering to start generating charts for this plant.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <ChartCard
        title="EC levels"
        subtitle="Latest electrical conductivity readings"
        series={[{ key: 'ec', label: 'EC', color: palette.accent, unit: 'mS/cm' }]}
        points={points}
        palette={palette}
        emptyMessage="Add EC measurements to see this chart."
      />
      <ChartCard
        title="pH levels"
        subtitle="Latest acidity readings"
        series={[{ key: 'ph', label: 'pH', color: palette.primary }]}
        points={points}
        palette={palette}
        emptyMessage="Add pH measurements to see this chart."
      />
      <ChartCard
        title="Base nutrients"
        subtitle="ml per liter applied in each log"
        series={[
          { key: 'grow', label: 'Grow', color: palette.primary },
          { key: 'micro', label: 'Micro', color: palette.accent },
          { key: 'bloom', label: 'Bloom', color: palette.success },
        ]}
        points={points}
        palette={palette}
        emptyMessage="Log nutrients to compare Grow, Micro, and Bloom doses."
      />
      <ChartCard
        title="Additives"
        subtitle="ml per liter for supplements"
        series={[
          { key: 'rootStimulant', label: 'Root stimulant', color: palette.primary },
          { key: 'fulvicAcid', label: 'Fulvic acid', color: palette.accent },
          { key: 'bloomBooster', label: 'Bloom booster', color: palette.success },
        ]}
        points={points}
        palette={palette}
        emptyMessage="Log additives to track supplement usage over time."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 16,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 13,
  },
  chartArea: {
    position: 'relative',
    height: CHART_HEIGHT + 32,
  },
  axis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    height: 1,
    opacity: 0.5,
  },
  bars: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    paddingBottom: 32,
    gap: 12,
    justifyContent: 'space-between',
  },
  barGroup: {
    flex: 1,
    minWidth: 40,
    alignItems: 'center',
    gap: 8,
  },
  barCluster: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    height: '100%',
  },
  barItem: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  valueLabel: {
    fontSize: 11,
  },
  barLabel: {
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 12,
    borderRadius: 18,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyCopy: {
    fontSize: 13,
    textAlign: 'center',
  },
});

