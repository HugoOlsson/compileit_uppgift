import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from '@expo/ui/community/bottom-sheet';
import { useRef } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { fontFamily, palette, radius } from '@/theme/tokens';
import type { Room } from '@/types/booking';

interface RoomFilterProps {
  rooms: Room[];
  selectedRoomIds: string[];
  onChange: (roomIds: string[]) => void;
}

export default function RoomFilter({
  rooms,
  selectedRoomIds,
  onChange,
}: RoomFilterProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const selectedSummary =
    selectedRoomIds.length === rooms.length
      ? 'Alla'
      : `${selectedRoomIds.length} av ${rooms.length}`;

  function openFilter() {
    sheetRef.current?.present();
  }

  function toggleRoom(roomId: string) {
    const nextRoomIds = selectedRoomIds.includes(roomId)
      ? selectedRoomIds.filter((id) => id !== roomId)
      : [...selectedRoomIds, roomId];

    onChange(nextRoomIds);
  }

  return (
    <>
      <Pressable
        onPress={openFilter}
        style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
      >
        <Text style={styles.pickerLabel}>Mötesrum</Text>
        <Text style={styles.pickerSummary}>{selectedSummary}</Text>
        <View style={styles.chevron} />
      </Pressable>

      <BottomSheetModal
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
        ref={sheetRef}
      >
        <BottomSheetView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.heading}>
              <Text style={styles.title}>Filtrera rum</Text>
              <Text style={styles.description}>
                Välj vilka mötesrum som ska visas i kalendern.
              </Text>
            </View>

            <Pressable
              hitSlop={12}
              onPress={() => sheetRef.current?.dismiss()}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeLabel}>×</Text>
            </Pressable>
          </View>

          <View style={styles.filterActions}>
            <Text style={styles.selectionCount}>
              {selectedRoomIds.length} av {rooms.length} valda
            </Text>

            <View style={styles.quickActions}>
              <Pressable
                onPress={() => onChange(rooms.map((room) => room.id))}
              >
                <Text style={styles.quickActionLabel}>Välj alla</Text>
              </Pressable>
              <Pressable onPress={() => onChange([])}>
                <Text style={styles.quickActionLabel}>Rensa</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.roomList}>
            {rooms.map((room) => {
              const isSelected = selectedRoomIds.includes(room.id);

              return (
                <View key={room.id} style={styles.roomRow}>
                  <Pressable
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => toggleRoom(room.id)}
                    style={({ pressed }) => [styles.roomDetails, pressed && styles.pressed]}
                  >
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.capacity}>{room.capacity} personer</Text>
                  </Pressable>

                  <Switch
                    ios_backgroundColor="#D5D5D5"
                    onValueChange={() => toggleRoom(room.id)}
                    style={styles.switch}
                    trackColor={{ false: '#D5D5D5', true: palette.ink }}
                    value={isSelected}
                  />
                </View>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  capacity: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    borderBottomColor: palette.ink,
    borderBottomWidth: 1.5,
    borderRightColor: palette.ink,
    borderRightWidth: 1.5,
    height: 9,
    marginBottom: 4,
    marginLeft: 8,
    transform: [{ rotate: '45deg' }],
    width: 9,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  closeLabel: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
  },
  description: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  filterActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  heading: {
    flex: 1,
    paddingRight: 16,
  },
  picker: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'flex-start',
    marginTop: 28,
    paddingHorizontal: 12,
    width: 156,
  },
  pickerLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
  },
  pickerSummary: {
    color: palette.muted,
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.6,
  },
  quickActionLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 18,
  },
  roomDetails: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 60,
  },
  roomList: {
    marginTop: 12,
  },
  roomName: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 15,
  },
  roomRow: {
    borderTopColor: '#E4E4E4',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 65,
  },
  selectionCount: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  sheet: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sheetBackground: {
    backgroundColor: palette.canvas,
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  switch: {
    alignSelf: 'center',
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
});
