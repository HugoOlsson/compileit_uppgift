import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookingConfirmationModal from '@/components/booking/booking-confirmation-modal';
import { createBooking } from '@/services/booking-service';
import { fontFamily, palette, radius } from '@/theme/tokens';
import type { CreateBookingResponse } from '@/types/booking';

type ConfirmBookingParams = {
  roomId: string;
  roomName: string;
  startsAt: string;
  endsAt: string;
};

export default function ConfirmBookingScreen() {
  const { roomId, roomName, startsAt, endsAt } =
    useLocalSearchParams<ConfirmBookingParams>();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<CreateBookingResponse | null>(null);

  const hasFullName = name.trim().split(/\s+/).length >= 2;

  async function submitBooking() {
    if (!hasFullName || submitting) {
      return;
    }

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      const result = await createBooking({
        bookerName: name.trim(),
        endsAt,
        roomId,
        startsAt,
      });

      setConfirmation(result);
    } catch {
      Alert.alert('Bokningen misslyckades', 'Försök igen om en liten stund.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>
          VEM <Text style={styles.titleEmphasis}>BOKAR?</Text>
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Förnamn och efternamn</Text>
          <TextInput
            autoCapitalize="words"
            autoComplete="name"
            onChangeText={setName}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder="Skriv ditt fullständiga namn här"
            placeholderTextColor="#ACACAC"
            returnKeyType="done"
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>Varför behövs denna information?</Text>
            <Text style={styles.explanationText}>
              Eftersom du inte behöver skapa ett konto sparas ditt namn tillsammans med
              bokningen, så att det går att se vem som har reserverat rummet. Uppgiften används
              endast för att hantera bokningen.
            </Text>
          </View>

          <Pressable
            disabled={!hasFullName || submitting}
            onPress={submitBooking}
            style={[styles.bookButton, (!hasFullName || submitting) && styles.disabledButton]}
          >
            <Text
              style={[
                styles.bookButtonLabel,
                (!hasFullName || submitting) && styles.disabledButtonLabel,
              ]}
            >
              {submitting ? 'Bokar…' : 'Boka'}
            </Text>
          </Pressable>
        </View>
      </View>

      <BookingConfirmationModal
        confirmation={confirmation}
        onShowBookings={() => router.replace('/bookings')}
        roomName={roomName}
      />
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
  bookButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginTop: 40,
  },
  bookButtonLabel: {
    color: palette.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 17,
  },
  bottomContent: {
    marginBottom: 12,
    marginTop: 'auto',
    paddingHorizontal: 26,
  },
  disabledButton: {
    borderColor: '#DDDDDD',
  },
  disabledButtonLabel: {
    color: '#B7B7B7',
  },
  explanation: {
    paddingHorizontal: 6,
  },
  explanationText: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },
  explanationTitle: {
    color: '#666666',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  form: {
    marginTop: 52,
  },
  input: {
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    height: 45,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  label: {
    color: palette.ink,
    fontFamily: fontFamily.bold,
    fontSize: 16,
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
