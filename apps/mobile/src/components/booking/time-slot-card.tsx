import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { fontFamily, palette } from '@/theme/tokens';
import type { AvailabilitySlot, Room } from '@/types/booking';
import { formatTimeRange } from '@/utils/date';

interface TimeSlotCardProps {
  room: Room;
  slot: AvailabilitySlot;
  selected: boolean;
  onSelect: (slotId: string) => void;
}

export default function TimeSlotCard({
  room,
  slot,
  selected,
  onSelect,
}: TimeSlotCardProps) {
  const time = formatTimeRange(slot.startsAt, slot.endsAt);

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      accessibilityState={{ selected }}
      onPress={() => onSelect(slot.id)}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <Text numberOfLines={1} style={[styles.name, selected && styles.selectedText]}>
        <Text style={styles.roomName}>{room.name}</Text> ({room.capacity})
      </Text>
      <Text numberOfLines={1} style={[styles.time, selected && styles.selectedText]}>
        {time}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    marginBottom: 7,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  name: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
  },
  roomName: {
    fontFamily: fontFamily.semibold,
  },
  selectedCard: {
    backgroundColor: palette.ink,
  },
  selectedText: {
    color: palette.surface,
  },
  time: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
  },
});
