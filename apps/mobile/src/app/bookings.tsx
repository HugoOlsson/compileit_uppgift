import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelBooking } from '@/services/booking-service';
import { getSavedBookings, removeSavedBooking } from '@/services/booking-storage';
import { fontFamily, palette, radius } from '@/theme/tokens';
import type { SavedBooking } from '@/types/booking';
import { formatLongDate, formatTimeRange } from '@/utils/date';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    getSavedBookings()
      .then((savedBookings) => {
        if (active) {
          const now = Date.now();
          setBookings(savedBookings.filter((booking) => new Date(booking.endsAt).getTime() > now));
        }
      })
      .catch(() => {
        if (active) Alert.alert('Kunde inte läsa dina bokningar.');
      });
    return () => { active = false; };
  }, []));

  function confirmCancellation(booking: SavedBooking) {
    Alert.alert(
      'Avboka bokningen?',
      `${booking.roomName}, ${formatLongDate(new Date(booking.startsAt))}`,
      [
        { text: 'Behåll', style: 'cancel' },
        {
          text: 'Avboka',
          style: 'destructive',
          onPress: () => void cancelSavedBooking(booking),
        },
      ],
    );
  }

  async function cancelSavedBooking(booking: SavedBooking) {
    setCancellingId(booking.id);

    try {
      await cancelBooking({
        bookingId: booking.id,
        cancellationToken: booking.cancellationToken,
      });
      await removeSavedBooking(booking.id);
      setBookings((currentBookings) =>
        currentBookings.filter((item) => item.id !== booking.id),
      );
    } catch {
      Alert.alert('Kunde inte avboka', 'Försök igen om en liten stund.');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>
          MINA <Text style={styles.titleEmphasis}>BOKNINGAR</Text>
        </Text>

        <ScrollView contentContainerStyle={styles.list}>
          {bookings.length === 0 ? (
            <Text style={styles.emptyText}>Du har inga pågående eller kommande bokningar.</Text>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View>
                  <Text style={styles.roomName}>{booking.roomName}</Text>
                  <Text style={styles.id}>ID: {booking.id}</Text>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.time}>
                    {formatTimeRange(booking.startsAt, booking.endsAt)},{' '}
                    {formatLongDate(new Date(booking.startsAt))}
                  </Text>
                  <Pressable
                    disabled={cancellingId === booking.id}
                    onPress={() => confirmCancellation(booking)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonLabel}>
                      {cancellingId === booking.id ? 'Avbokar…' : 'Avboka'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
  },
  cancelButtonLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 12,
  },
  card: {
    backgroundColor: '#F3F3F3',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 18,
  },
  cardRight: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 16,
  },
  emptyText: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    marginTop: 60,
    textAlign: 'center',
  },
  id: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginTop: 16,
  },
  list: {
    paddingBottom: 24,
    paddingTop: 28,
  },
  page: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 430,
    paddingHorizontal: 26,
    width: '100%',
  },
  roomName: {
    color: palette.ink,
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  safeArea: {
    backgroundColor: palette.canvas,
    flex: 1,
  },
  time: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
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
