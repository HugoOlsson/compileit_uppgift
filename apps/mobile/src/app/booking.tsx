import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookingCalendar from '@/components/booking/booking-calendar';
import RoomFilter from '@/components/booking/room-filter';
import { getMockAvailability } from '@/data/mock-booking-data';
import { fontFamily, palette, radius } from '@/theme/tokens';
import { addDays, getDateRange, startOfDay } from '@/utils/date';

const VISIBLE_DAYS = 4;
const DATE_WINDOW_COUNT = 26;
const FIRST_DATE = startOfDay(new Date());
const DATE_WINDOWS = Array.from({ length: DATE_WINDOW_COUNT }, (_, index) =>
  getDateRange(addDays(FIRST_DATE, index * VISIBLE_DAYS), VISIBLE_DAYS),
);
const INITIAL_AVAILABILITY = getMockAvailability(DATE_WINDOWS.flat());

export default function BookingScreen() {
  const [availability] = useState(INITIAL_AVAILABILITY);
  const [selectedRoomIds, setSelectedRoomIds] = useState(
    availability.rooms.map((room) => room.id),
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const selectedSlot = availability.slots.find((slot) => slot.id === selectedSlotId);

  function changeRoomFilter(roomIds: string[]) {
    setSelectedRoomIds(roomIds);

    if (selectedSlot && !roomIds.includes(selectedSlot.roomId)) {
      setSelectedSlotId(null);
    }
  }

  function continueBooking() {
    if (!selectedSlot) {
      return;
    }

    const room = availability.rooms.find((room) => room.id === selectedSlot.roomId);

    if (!room) {
      return;
    }

    router.push({
      pathname: '/confirm-booking',
      params: {
        endsAt: selectedSlot.endsAt,
        roomId: room.id,
        roomName: room.name,
        startsAt: selectedSlot.startsAt,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>
          VÄLJ EN <Text style={styles.titleEmphasis}>TID</Text>
        </Text>

        <RoomFilter
          onChange={changeRoomFilter}
          rooms={availability.rooms}
          selectedRoomIds={selectedRoomIds}
        />

        <BookingCalendar
          dateWindows={DATE_WINDOWS}
          onSelectSlot={setSelectedSlotId}
          onWindowChange={() => setSelectedSlotId(null)}
          rooms={availability.rooms}
          selectedRoomIds={selectedRoomIds}
          selectedSlotId={selectedSlotId}
          slots={availability.slots}
        />

        <Pressable
          accessibilityState={{ disabled: !selectedSlot }}
          disabled={!selectedSlot}
          onPress={continueBooking}
          style={[styles.nextButton, !selectedSlot && styles.disabledNextButton]}
        >
          <Text style={[styles.nextButtonLabel, !selectedSlot && styles.disabledNextButtonLabel]}>
            {selectedSlot ? 'Gå vidare' : 'Välj ett rum'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
    width: 44,
  },
  backIcon: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 28,
    lineHeight: 30,
  },
  disabledNextButton: {
    borderColor: '#DDDDDD',
  },
  disabledNextButtonLabel: {
    color: '#B7B7B7',
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: '78%',
  },
  nextButtonLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 17,
  },
  page: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 430,
    paddingHorizontal: 26,
    width: '100%',
  },
  safeArea: {
    backgroundColor: palette.canvas,
    flex: 1,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 28,
    letterSpacing: -0.7,
    marginTop: 20,
  },
  titleEmphasis: {
    fontFamily: fontFamily.bold,
  },
});
