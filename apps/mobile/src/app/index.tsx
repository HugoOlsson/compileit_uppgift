import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoomsIllustration from '@/assets/illustrations/rooms.svg';
import { fontFamily, palette, radius, spacing } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      
        <View style={styles.intro}>
          <Text style={styles.title}>
            BOKA ETT{`\n`}
            <Text style={styles.titleEmphasis}>RUM</Text>
          </Text>

          <Text style={styles.description}>
            Välj bland <Text style={styles.descriptionEmphasis}>5 olika rum</Text> och boka en
            tid som passar dig och din grupp
          </Text>
        </View>

        <View style={styles.illustrationContainer}>
          <RoomsIllustration
            accessibilityLabel="Planritning över fem bokningsbara rum"
            height={216}
            width={215}
          />
        </View>

        <View style={styles.actions}>
          <Link href="/booking" asChild>
            <Pressable
              accessibilityRole="button"
              style={primaryButtonStyle}
            >
              <Text style={[styles.buttonLabel, styles.primaryButtonLabel]}>Gå till bokningen</Text>
            </Pressable>
          </Link>

          <Link href="/bookings" asChild>
            <Pressable
              accessibilityRole="button"
              style={secondaryButtonStyle}
            >
              <Text style={[styles.buttonLabel, styles.secondaryButtonLabel]}>Mina bokningar</Text>
            </Pressable>
          </Link>
        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  page: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl - spacing.sm,
  },
  intro: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    maxWidth: 300,
    width: '100%',
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.regular,
    fontSize: 40,
    letterSpacing: -1.5,
    lineHeight: 47,
  },
  titleEmphasis: {
    fontFamily: fontFamily.bold,
  },
  description: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 17,
    letterSpacing: -0.4,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  descriptionEmphasis: {
    fontFamily: fontFamily.bold,
  },
  illustrationContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 250,
    transform: [{ translateY: -spacing.md }],
  },
  actions: {
    alignSelf: 'center',
    gap: 12,
    maxWidth: 262,
    paddingBottom: 12,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: palette.ink,
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1.5,
  },
  buttonLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    letterSpacing: -0.3,
  },
  primaryButtonLabel: {
    color: palette.surface,
  },
  secondaryButtonLabel: {
    color: palette.ink,
  },
});

// Expo Router's `asChild` expects one flattened style object on web.
const primaryButtonStyle = StyleSheet.flatten([styles.button, styles.primaryButton]);
const secondaryButtonStyle = StyleSheet.flatten([styles.button, styles.secondaryButton]);
