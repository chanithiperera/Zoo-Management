import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';

export default function TicketPaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const totalLkr = route.params?.totalLkr ?? 0;

  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Payment successful</Text>
          <Text style={styles.body}>
            Your payment of {formatLkr(totalLkr)} has been received. Your booking is now confirmed.
          </Text>
          <PrimaryButton
            title="Back to tickets"
            onPress={() => navigation.navigate('TicketShow')}
            style={styles.button}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    color: theme.colors.accentGreen,
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
});
