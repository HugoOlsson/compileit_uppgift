import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookingCalendar from '@/components/booking/booking-calendar';
import RoomFilter from '@/components/booking/room-filter';
import { getBookings, getRooms } from '@/services/booking-service';
import { fontFamily, palette, radius } from '@/theme/tokens';
import type { CalendarData } from '@/types/booking';
import { createAvailableSlots } from '@/utils/availability';
import { addDays, getDateRange, startOfDay } from '@/utils/date';

const VISIBLE_DAYS = 4;
// 23 complete four-day pages, approximately three months.
const BOOKING_HORIZON_DAYS = 92;

function createDateWindows(firstDate: Date) {
  return Array.from({ length: BOOKING_HORIZON_DAYS / VISIBLE_DAYS }, (_, index) =>
    getDateRange(addDays(firstDate, index * VISIBLE_DAYS), VISIBLE_DAYS),
  );
}

export default function BookingScreen() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(['margret']);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const slots = useMemo(() => calendarData
    ? createAvailableSlots(
        calendarData.dateWindows.flat(),
        calendarData.rooms,
        calendarData.bookings,
      )
    : [], [calendarData]);
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstDate = startOfDay(new Date());
      const dateWindows = createDateWindows(firstDate);

      setLoadError(false);
      setSelectedSlotId(null);

      Promise.all([
        getRooms(),
        getBookings({
          startsAt: firstDate.toISOString(),
          endsAt: addDays(firstDate, BOOKING_HORIZON_DAYS).toISOString(),
        }),
      ])
        .then(([rooms, bookings]) => {
          if (active) {
            setCalendarData({ bookings, dateWindows, rooms });
          }
        })
        .catch(() => {
          if (active) {
            setLoadError(true);
          }
        });

      return () => {
        active = false;
      };
    // Changing retryCount deliberately restarts the focused screen's request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryCount]),
  );

  function changeRoomFilter(roomIds: string[]) {
    setSelectedRoomIds(roomIds);

    if (selectedSlot && !roomIds.includes(selectedSlot.roomId)) {
      setSelectedSlotId(null);
    }
  }

  function continueBooking() {
    if (!calendarData || !selectedSlot) {
      return;
    }

    if (new Date(selectedSlot.startsAt).getTime() < Date.now()) {
      setSelectedSlotId(null);
      setCalendarData({ ...calendarData });
      Alert.alert('Tiden har passerat', 'Välj en ny tid i kalendern.');
      return;
    }

    const room = calendarData.rooms.find((room) => room.id === selectedSlot.roomId);

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

        {calendarData ? (
          <>
            {loadError && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setRetryCount((count) => count + 1)}
              >
                <Text style={styles.errorText}>
                  Kunde inte uppdatera tider. Tryck för att försöka igen.
                </Text>
              </Pressable>
            )}

            <RoomFilter
              onChange={changeRoomFilter}
              rooms={calendarData.rooms}
              selectedRoomIds={selectedRoomIds}
            />

            <BookingCalendar
              dateWindows={calendarData.dateWindows}
              onSelectSlot={setSelectedSlotId}
              onWindowChange={() => setSelectedSlotId(null)}
              rooms={calendarData.rooms}
              selectedRoomIds={selectedRoomIds}
              selectedSlotId={selectedSlotId}
              slots={slots}
            />
          </>
        ) : (
          <View style={styles.loading}>
            {loadError ? (
              <>
                <Text style={styles.errorText}>Kunde inte hämta tider.</Text>
                <Pressable
                  onPress={() => setRetryCount((count) => count + 1)}
                  style={styles.nextButton}
                >
                  <Text style={styles.nextButtonLabel}>Försök igen</Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator color={palette.ink} size="large" />
            )}
          </View>
        )}

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
  errorText: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    marginBottom: 16,
  },
  disabledNextButton: {
    borderColor: '#DDDDDD',
  },
  disabledNextButtonLabel: {
    color: '#B7B7B7',
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
