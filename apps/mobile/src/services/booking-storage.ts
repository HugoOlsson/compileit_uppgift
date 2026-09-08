import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CreateBookingResponse, SavedBooking } from '@/types/booking';

const STORAGE_KEY = 'bookings';

export async function getSavedBookings() {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ? (JSON.parse(value) as SavedBooking[]) : [];
}

export async function saveBooking(
  confirmation: CreateBookingResponse,
  roomName: string,
) {
  const bookings = await getSavedBookings();
  const savedBooking: SavedBooking = {
    ...confirmation.booking,
    cancellationToken: confirmation.cancellationToken,
    roomName,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([savedBooking, ...bookings]));
}

export async function removeSavedBooking(bookingId: string) {
  const bookings = await getSavedBookings();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookings.filter((booking) => booking.id !== bookingId)),
  );
}
