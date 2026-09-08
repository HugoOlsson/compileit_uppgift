import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
const WINDOWS_PER_LOAD = 6;
const FIRST_DATE = startOfDay(new Date());

function createDateWindows(firstDate: Date) {
  return Array.from({ length: WINDOWS_PER_LOAD }, (_, index) =>
    getDateRange(addDays(firstDate, index * VISIBLE_DAYS), VISIBLE_DAYS),
  );
}

const INITIAL_DATE_WINDOWS = createDateWindows(FIRST_DATE);

export default function BookingScreen() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [calendarReady, setCalendarReady] = useState(false);
  const [calendarOpacity] = useState(() => new Animated.Value(0));
  const calendarAnimationStarted = useRef(false);
  const loadingMoreWindows = useRef(false);

  const slots = calendarData
    ? createAvailableSlots(
        calendarData.dateWindows.flat(),
        calendarData.rooms,
        calendarData.bookings,
      )
    : [];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const spinnerOpacity = calendarOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  useFocusEffect(
    useCallback(() => {
      setCalendarData(null);
      setCalendarReady(false);
      calendarOpacity.stopAnimation();
      calendarOpacity.setValue(0);
      calendarAnimationStarted.current = false;
      loadingMoreWindows.current = false;

      Promise.all([
        getRooms(),
        getBookings({
          startsAt: FIRST_DATE.toISOString(),
          endsAt: addDays(INITIAL_DATE_WINDOWS.at(-1)!.at(-1)!, 1).toISOString(),
        }),
      ])
        .then(([rooms, bookings]) => {
          setCalendarData({ bookings, dateWindows: INITIAL_DATE_WINDOWS, rooms });
          setSelectedRoomIds(['margret']);
          setSelectedSlotId(null);
        })
        .catch(() => {
          Alert.alert('Kunde inte hämta tider', 'Kontrollera att backenden är igång.');
        });
    }, [calendarOpacity]),
  );

  function showCalendar() {
    if (calendarAnimationStarted.current) {
      return;
    }

    calendarAnimationStarted.current = true;
    Animated.timing(calendarOpacity, {
      duration: 150,
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCalendarReady(true);
      }
    });
  }

  async function changeCalendarWindow(windowIndex: number) {
    setSelectedSlotId(null);

    if (
      !calendarData ||
      windowIndex < calendarData.dateWindows.length - 4 ||
      loadingMoreWindows.current
    ) {
      return;
    }

    loadingMoreWindows.current = true;
    const lastDate = calendarData.dateWindows.at(-1)!.at(-1)!;
    const nextDateWindows = createDateWindows(addDays(lastDate, 1));

    try {
      const bookings = await getBookings({
        startsAt: nextDateWindows[0][0].toISOString(),
        endsAt: addDays(nextDateWindows.at(-1)!.at(-1)!, 1).toISOString(),
      });

      setCalendarData((currentData) => {
        if (!currentData || currentData.dateWindows.length !== calendarData.dateWindows.length) {
          return currentData;
        }

        return {
          bookings: [...currentData.bookings, ...bookings],
          dateWindows: [...currentData.dateWindows, ...nextDateWindows],
          rooms: currentData.rooms,
        };
      });
    } catch {
      Alert.alert('Kunde inte hämta fler tider', 'Försök igen om en liten stund.');
    } finally {
      loadingMoreWindows.current = false;
    }
  }

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
            <RoomFilter
              onChange={changeRoomFilter}
              rooms={calendarData.rooms}
              selectedRoomIds={selectedRoomIds}
            />

            <View style={styles.calendarContainer}>
              {!calendarReady && (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.spinnerOverlay, { opacity: spinnerOpacity }]}
                >
                  <ActivityIndicator color={palette.ink} size="large" />
                </Animated.View>
              )}

              <Animated.View
                pointerEvents={calendarReady ? 'auto' : 'none'}
                style={[styles.calendarContent, { opacity: calendarOpacity }]}
              >
                <BookingCalendar
                  dateWindows={calendarData.dateWindows}
                  onReady={showCalendar}
                  onSelectSlot={setSelectedSlotId}
                  onWindowChange={changeCalendarWindow}
                  rooms={calendarData.rooms}
                  selectedRoomIds={selectedRoomIds}
                  selectedSlotId={selectedSlotId}
                  slots={slots}
                />
              </Animated.View>
            </View>
          </>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.ink} size="large" />
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
  calendarContainer: {
    flex: 1,
  },
  calendarContent: {
    flex: 1,
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
  spinnerOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
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
