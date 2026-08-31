import { useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TimeSlotCard from '@/components/booking/time-slot-card';
import { fontFamily, palette, radius } from '@/theme/tokens';
import type { AvailabilitySlot, Room } from '@/types/booking';
import { formatShortDate, getDateKey } from '@/utils/date';

interface BookingCalendarProps {
  dateWindows: Date[][];
  rooms: Room[];
  slots: AvailabilitySlot[];
  selectedRoomIds: string[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  onWindowChange: () => void;
}

export default function BookingCalendar({
  dateWindows,
  rooms,
  slots,
  selectedRoomIds,
  selectedSlotId,
  onSelectSlot,
  onWindowChange,
}: BookingCalendarProps) {
  const listRef = useRef<FlatList<Date[]>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [windowIndex, setWindowIndex] = useState(0);

  const activeDates = dateWindows[windowIndex];
  const dateRangeLabel = activeDates
    ? `${formatShortDate(activeDates[0])} - ${formatShortDate(activeDates.at(-1)!)}`
    : '';

  function setActiveWindow(nextIndex: number) {
    if (nextIndex === windowIndex) {
      return;
    }

    setWindowIndex(nextIndex);
    onWindowChange();
  }

  function moveToWindow(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= dateWindows.length) {
      return;
    }

    setActiveWindow(nextIndex);
    listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const width = event.nativeEvent.layoutMeasurement.width;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveWindow(nextIndex);
  }

  return (
    <View style={styles.calendar}>
      <View onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)} style={styles.pager}>
        {pageWidth > 0 && (
          <FlatList
            data={dateWindows}
            decelerationRate="fast"
            disableIntervalMomentum
            extraData={`${selectedRoomIds.join(',')}:${selectedSlotId ?? ''}`}
            getItemLayout={(_, index) => ({
              index,
              length: pageWidth,
              offset: pageWidth * index,
            })}
            horizontal
            keyExtractor={(dates) => getDateKey(dates[0])}
            onMomentumScrollEnd={handleScrollEnd}
            pagingEnabled
            ref={listRef}
            renderItem={({ item: dates }) => (
              <View style={[styles.schedule, { width: pageWidth }]}>
                {dates.map((date, dayIndex) => {
                  const dateKey = getDateKey(date);
                  const slotsForDate = slots.filter(
                    (slot) =>
                      selectedRoomIds.includes(slot.roomId) &&
                      getDateKey(new Date(slot.startsAt)) === dateKey,
                  );

                  return (
                    <View
                      key={dateKey}
                      style={[styles.dayColumn, dayIndex > 0 && styles.dayColumnBorder]}
                    >
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>{formatShortDate(date)}</Text>
                      </View>

                      <View style={styles.slots}>
                        {slotsForDate.map((slot) => {
                          const room = rooms.find((room) => room.id === slot.roomId);

                          return room ? (
                            <TimeSlotCard
                              key={slot.id}
                              onSelect={onSelectSlot}
                              room={room}
                              selected={slot.id === selectedSlotId}
                              slot={slot}
                            />
                          ) : null;
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </View>

      <View style={styles.calendarNavigation}>
        <Pressable
          disabled={windowIndex === 0}
          hitSlop={8}
          onPress={() => moveToWindow(windowIndex - 1)}
          style={[styles.calendarArrow, windowIndex === 0 && styles.disabledArrow]}
        >
          <Text style={styles.calendarArrowLabel}>←</Text>
        </Pressable>

        <Text style={styles.dateRange}>{dateRangeLabel}</Text>

        <Pressable
          disabled={windowIndex === dateWindows.length - 1}
          hitSlop={8}
          onPress={() => moveToWindow(windowIndex + 1)}
          style={[
            styles.calendarArrow,
            windowIndex === dateWindows.length - 1 && styles.disabledArrow,
          ]}
        >
          <Text style={styles.calendarArrowLabel}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    flex: 1,
    marginBottom: 28,
    marginHorizontal: -8,
    marginTop: 31,
  },
  calendarArrow: {
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  calendarArrowLabel: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 25,
    lineHeight: 28,
  },
  calendarNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  dateRange: {
    color: palette.muted,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    minWidth: 150,
    textAlign: 'center',
  },
  dayColumn: {
    flex: 1,
  },
  dayColumnBorder: {
    borderLeftColor: '#DDDDDD',
    borderLeftWidth: 2,
  },
  dayHeader: {
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 2,
    height: 42,
    justifyContent: 'center',
  },
  dayTitle: {
    color: palette.ink,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  disabledArrow: {
    opacity: 0.35,
  },
  list: {
    flex: 1,
  },
  pager: {
    flex: 1,
    overflow: 'hidden',
  },
  schedule: {
    flex: 1,
    flexDirection: 'row',
  },
  slots: {
    paddingTop: 7,
  },
});
