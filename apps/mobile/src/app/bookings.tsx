import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette, spacing } from '@/theme/tokens';

export default function BookingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitleStyle: styles.headerTitle,
          title: 'Mina bokningar',
        }}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Visa sparade bokningar här.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.canvas,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
  },
  text: {
    color: palette.muted,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
});
