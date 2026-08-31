import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from '@expo/ui/community/bottom-sheet';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette, radius } from '@/theme/tokens';
import type { CreateBookingResponse } from '@/types/booking';
import { formatLongDate, formatTimeRange } from '@/utils/date';

interface BookingConfirmationModalProps {
  confirmation: CreateBookingResponse | null;
  roomName: string;
  onShowBookings: () => void;
}

export default function BookingConfirmationModal({
  confirmation,
  roomName,
  onShowBookings,
}: BookingConfirmationModalProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const booking = confirmation?.booking;

  useEffect(() => {
    if (booking) {
      sheetRef.current?.present();
    }
  }, [booking]);

  function showBookings() {
    sheetRef.current?.dismiss();
  }

  return (
    <BottomSheetModal
      backgroundStyle={styles.sheetBackground}
      enablePanDownToClose
      onDismiss={onShowBookings}
      ref={sheetRef}
    >
      {booking && (
        <BottomSheetView style={styles.sheet}>
          <View style={styles.checkCircle}>
            <SymbolView
              name={{ android: 'check', ios: 'checkmark', web: 'check' }}
              size={32}
              tintColor="#00639A"
            />
          </View>

          <Text style={styles.title}>Bokningsbekräftelse</Text>
          <Text style={styles.id}>ID: {booking.id}</Text>

          <View style={styles.details}>
            <Text style={styles.roomName}>{roomName}</Text>
            <Text style={styles.detailText}>
              {formatTimeRange(booking.startsAt, booking.endsAt)}
            </Text>
            <Text style={styles.detailText}>{formatLongDate(new Date(booking.startsAt))}</Text>
          </View>

          <Pressable onPress={showBookings} style={styles.button}>
            <Text style={styles.buttonLabel}>Mina bokningar</Text>
          </Pressable>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    marginTop: 48,
    width: '78%',
  },
  buttonLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 16,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: '#CDEEFF',
    borderRadius: radius.pill,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  detailText: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  details: {
    alignItems: 'center',
    marginTop: 44,
  },
  id: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    marginTop: 4,
  },
  roomName: {
    color: palette.ink,
    fontFamily: fontFamily.bold,
    fontSize: 19,
    lineHeight: 25,
  },
  sheet: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sheetBackground: {
    backgroundColor: palette.surface,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    marginTop: 18,
  },
});
