import React, { useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { WateringLogEntry } from '@/types/plant';

const CHART_HEIGHT = 140;
const MAX_POINTS = 8;
const POINT_SIZE = 10;

type HistoryPalette = typeof Colors.light;

type ChartRange = {
  min: number;
  max: number;
};

type ChartSeries = {
  key: string;
  label: string;
  color: string;
  unit?: string;
  range?: ChartRange;
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

const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6 || hex.length === 8) {
      const rgb = hex.slice(-6);
      const alphaHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${alphaHex}${rgb}`;
    }
  }
  return color;
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
  const [chartWidth, setChartWidth] = React.useState(0);

  const allValues = useMemo(() => {
    return series.flatMap(def =>
      points
        .map(point => point.values[def.key])
        .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
    );
  }, [series, points]);

  const hasData = allValues.length > 0;

  const manualMins = series
    .map(def => def.range?.min)
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
  const manualMaxs = series
    .map(def => def.range?.max)
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

  const dataRange = ensureRange(allValues);

  let min = manualMins.length ? Math.min(...manualMins) : dataRange.min;
  let max = manualMaxs.length ? Math.max(...manualMaxs) : dataRange.max;

  if (!Number.isFinite(min)) {
    min = 0;
  }
  if (!Number.isFinite(max)) {
    max = min + 1;
  }
  if (max === min) {
    max = min + 1;
  }

  const handleChartLayout = (event: LayoutChangeEvent) => {
    const width = event?.nativeEvent?.layout?.width;
    if (typeof width === 'number') {
      setChartWidth(width);
    }
  };

  const chartPoints = useMemo(() => {
    if (!hasData || chartWidth <= 0) {
      return [];
    }

    const count = points.length;
    const singlePointOffset = chartWidth / 2;
    const step = count > 1 ? chartWidth / (count - 1) : 0;

    return points.map((point, index) => {
      const x = count === 1 ? singlePointOffset : index * step;
      return { ...point, x };
    });
  }, [chartWidth, hasData, points]);

  const getY = (value: number) => {
    const ratio = (value - min) / (max - min);
    const clamped = Math.max(0, Math.min(1, ratio));
    return CHART_HEIGHT - clamped * CHART_HEIGHT;
  };

  const seriesContent = chartPoints.length
    ? series.map(item => {
        const seriesPoints = chartPoints.map(point => {
          const rawValue = point.values[item.key];
          if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) {
            return null;
          }
          return {
            id: `${item.key}-${point.id}`,
            x: point.x,
            y: getY(rawValue),
            value: rawValue,
          };
        });

        const segments: { from: NonNullable<(typeof seriesPoints)[number]>; to: NonNullable<(typeof seriesPoints)[number]> }[] = [];
        let previous: NonNullable<(typeof seriesPoints)[number]> | null = null;

        seriesPoints.forEach(point => {
          if (!point) {
            previous = null;
            return;
          }
          if (previous) {
            segments.push({ from: previous, to: point });
          }
          previous = point;
        });

        return (
          <React.Fragment key={item.key}>
            {segments.map(segment => {
              const deltaX = segment.to.x - segment.from.x;
              const deltaY = segment.to.y - segment.from.y;
              const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
              const midX = (segment.from.x + segment.to.x) / 2;
              const midY = (segment.from.y + segment.to.y) / 2;
              return (
                <View
                  key={`${segment.from.id}-to-${segment.to.id}`}
                  style={[
                    styles.lineSegment,
                    {
                      width: length,
                      backgroundColor: item.color,
                      left: midX - length / 2,
                      top: midY - 1,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
            {seriesPoints.map(point =>
              point ? (
                <React.Fragment key={point.id}>
                  <View
                    style={[
                      styles.point,
                      {
                        borderColor: item.color,
                        left: point.x - POINT_SIZE / 2,
                        top: point.y - POINT_SIZE / 2,
                      },
                    ]}
                  >
                    <View style={[styles.pointInner, { backgroundColor: item.color }]} />
                  </View>
                  <ThemedText
                    style={[
                      styles.pointValue,
                      {
                        left: point.x,
                        top: Math.max(point.y - 22, 0),
                        color: palette.muted,
                      },
                    ]}
                  >
                    {formatNumber(point.value)}
                    {item.unit ? ` ${item.unit}` : ''}
                  </ThemedText>
                </React.Fragment>
              ) : null
            )}
          </React.Fragment>
        );
      })
    : null;

  const rangeBands = chartPoints.length
    ? series
        .filter(item => item.range)
        .map(item => {
          const range = item.range!;
          const upper = getY(range.max);
          const lower = getY(range.min);
          const top = Math.min(upper, lower);
          const height = Math.max(0, Math.abs(lower - upper));
          return (
            <View
              key={`${item.key}-range`}
              style={[
                styles.rangeBand,
                {
                  top,
                  height,
                  backgroundColor: withAlpha(item.color, 0.12),
                },
              ]}
            />
          );
        })
    : null;

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
          <View style={styles.chartSurface} onLayout={handleChartLayout}>
            {rangeBands}
            <View style={[styles.axis, { backgroundColor: palette.border }]} />
            {seriesContent}
          </View>
          <View
            style={[
              styles.labelsRow,
              { justifyContent: points.length === 1 ? 'center' : 'space-between' },
            ]}
          >
            {points.map(point => (
              <ThemedText key={point.id} style={[styles.axisLabel, { color: palette.muted }]}>{point.label}</ThemedText>
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
        series={[{ key: 'ph', label: 'pH', color: palette.primary, range: { min: 5, max: 7 } }]}
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
    gap: 12,
  },
  chartSurface: {
    height: CHART_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  axis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    opacity: 0.5,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 4,
  },
  axisLabel: {
    fontSize: 12,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  point: {
    position: 'absolute',
    width: POINT_SIZE,
    height: POINT_SIZE,
    borderRadius: POINT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pointInner: {
    width: POINT_SIZE - 4,
    height: POINT_SIZE - 4,
    borderRadius: (POINT_SIZE - 4) / 2,
  },
  pointValue: {
    position: 'absolute',
    fontSize: 11,
    textAlign: 'center',
    width: 64,
    marginLeft: -32,
  },
  rangeBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 12,
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

