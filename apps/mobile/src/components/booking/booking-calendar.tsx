import PagerView, {
  type PagerViewOnPageSelectedEvent,
  type PagerViewRef,
} from '@expo/ui/community/pager-view';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import TimeSlotCard from '@/components/booking/time-slot-card';
import CalendarBottomFade from '@/components/booking/calendar-bottom-fade';
import { fontFamily, palette, radius } from '@/theme/tokens';
import type { AvailabilitySlot, Room } from '@/types/booking';
import { formatShortDate, getDateKey } from '@/utils/date';

const BOTTOM_OVERLAY_HEIGHT = 92;

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
  const pagerRef = useRef<PagerViewRef>(null);
  const [windowIndex, setWindowIndex] = useState(0);

  // Group once when availability or the room filter changes, not on each tap.
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      if (!selectedRoomIds.includes(slot.roomId)) continue;
      const key = getDateKey(new Date(slot.startsAt));
      const daySlots = grouped.get(key);
      if (daySlots) daySlots.push(slot);
      else grouped.set(key, [slot]);
    }
    return grouped;
  }, [slots, selectedRoomIds]);

  const roomsById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const activeDates = dateWindows[windowIndex];
  const dateRangeLabel = activeDates
    ? `${formatShortDate(activeDates[0])} - ${formatShortDate(activeDates.at(-1)!)}`
    : '';

  function changeWindow(event: PagerViewOnPageSelectedEvent) {
    const nextIndex = event.nativeEvent.position;
    setWindowIndex(nextIndex);
    onWindowChange();
  }

  function moveToWindow(nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < dateWindows.length) {
      pagerRef.current?.setPage(nextIndex);
    }
  }

  return (
    <View style={styles.calendar}>
      <PagerView
        initialPage={0}
        offscreenPageLimit={3}
        onPageSelected={changeWindow}
        ref={pagerRef}
        style={styles.pager}
      >
        {dateWindows.map((dates, pageIndex) => (
          <View key={getDateKey(dates[0])} style={styles.calendarPage} collapsable={false}>
            {/* Keep the current page and its neighbors ready for native swiping. */}
            {Math.abs(pageIndex - windowIndex) <= 1 && (
              <>
                <View style={styles.headerRow}>
                  {dates.map((date, dayIndex) => {
                    const isToday = pageIndex === 0 && dayIndex === 0;
                    return (
                      <View key={getDateKey(date)} style={styles.dayColumn}>
                        <Text style={styles.dayLabel}>
                          {isToday ? '(idag)' : date.toLocaleDateString('sv-SE', { weekday: 'short' }).replace('.', '')}
                        </Text>
                        <Text style={styles.dayTitle}>
                          {formatShortDate(date)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <ScrollView
                  contentContainerStyle={styles.schedule}
                  directionalLockEnabled
                  showsVerticalScrollIndicator={false}
                  style={styles.scheduleScroll}
                >
                  {dates.map((date) => {
                    const dateKey = getDateKey(date);
                    const slotsForDate = slotsByDate.get(dateKey) ?? [];
                    return (
                      <View key={dateKey} style={styles.dayColumn}>
                        {slotsForDate.length === 0 && (
                          <Text style={styles.emptyDay}>{'Inga\ntider'}</Text>
                        )}
                        {slotsForDate.map((slot) => {
                          const room = roomsById.get(slot.roomId);
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
                    );
                  })}
                </ScrollView>
              </>
            )}
          </View>
        ))}
      </PagerView>

      <View pointerEvents="none" style={styles.bottomFade}>
        <CalendarBottomFade />
      </View>
      <View pointerEvents="box-none" style={styles.calendarNavigation}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Föregående fyra dagar"
          disabled={windowIndex === 0}
          hitSlop={8}
          onPress={() => moveToWindow(windowIndex - 1)}
          style={[styles.calendarArrow, windowIndex === 0 && styles.disabledArrow]}
        >
          <Text style={styles.calendarArrowLabel}>←</Text>
        </Pressable>

        <Text pointerEvents="none" style={styles.dateRange}>{dateRangeLabel}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nästa fyra dagar"
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
    marginBottom: 16,
    marginHorizontal: -8,
    marginTop: 14,
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
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_OVERLAY_HEIGHT,
  },
  dateRange: {
    color: palette.muted,
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    minWidth: 168,
    textAlign: 'center',
  },
  calendarPage: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
  },
  dayLabel: {
    color: palette.muted,
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 2,
  },
  dayTitle: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  disabledArrow: {
    opacity: 0.35,
  },
  pager: {
    flex: 1,
  },
  schedule: {
    flexDirection: 'row',
    gap: 8,
    flexGrow: 1,
    paddingTop: 6,
    paddingBottom: BOTTOM_OVERLAY_HEIGHT + 12,
  },
  scheduleScroll: {
    flex: 1,
  },
  emptyDay: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 16,
    textAlign: 'center',
  },
});
