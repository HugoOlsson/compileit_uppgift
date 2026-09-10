import { memo, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { fontFamily, palette } from '@/theme/tokens';
import type { AvailabilitySlot, Room } from '@/types/booking';
import { formatTimeRange } from '@/utils/date';

interface TimeSlotCardProps {
  room: Room;
  slot: AvailabilitySlot;
  selected: boolean;
  onSelect: (slotId: string) => void;
}

function TimeSlotCard({
  room,
  slot,
  selected,
  onSelect,
}: TimeSlotCardProps) {
  const [selection] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    const animation = Animated.timing(selection, {
      toValue: selected ? 1 : 0,
      duration: 120,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, selection]);

  const backgroundColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F5F5F5', palette.ink],
  });
  const color = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.ink, palette.surface],
  });
  const endTimeColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.muted, palette.surface],
  });

  const time = formatTimeRange(slot.startsAt, slot.endsAt);
  const [startTime, endTime] = time.split('-');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${time}`}
      accessibilityState={{ selected }}
      onPress={() => onSelect(slot.id)}
      style={({ pressed }) => [styles.touchTarget, pressed && styles.pressedCard]}
    >
      <Animated.View style={[styles.card, { backgroundColor }]}>
        <Animated.Text numberOfLines={1} style={[styles.startTime, { color }]}>
          {startTime}
        </Animated.Text>
        <Animated.Text numberOfLines={1} style={[styles.endTime, { color: endTimeColor }]}>
          –{endTime}
        </Animated.Text>
        <Animated.Text numberOfLines={1} style={[styles.roomName, { color }]}>
          {room.name}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export default memo(TimeSlotCard);

const styles = StyleSheet.create({
  touchTarget: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 64,
    alignItems: 'center',
  },
  startTime: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  endTime: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
  roomName: {
    color: palette.ink,
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  pressedCard: {
    transform: [{ scale: 0.98 }],
  },
});
