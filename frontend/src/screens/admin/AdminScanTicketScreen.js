import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { getAdminDrawerMenuItems } from './adminNavigation';
import { checkInBooking } from '../../api/admin.api';
import { formatLkr } from '../../constants/entryTickets';
import { theme } from '../../constants/theme';

const RESULT_META = {
  success: {
    label: 'Check-in successful',
    textColor: theme.colors.accentGreen,
    borderColor: '#8BC28F',
    backgroundColor: '#E8F5E9',
  },
  warning: {
    label: 'Already checked in',
    textColor: '#8A5A00',
    borderColor: '#E8C15A',
    backgroundColor: '#FFF4D6',
  },
  error: {
    label: 'Verification failed',
    textColor: theme.colors.error,
    borderColor: '#E3A9A9',
    backgroundColor: '#FDECEC',
  },
};

function extractCodeFromScan(rawValue) {
  const trimmed = String(rawValue || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const code = parsed?.confirmationCode || parsed?.code;
      if (code) return String(code).trim();
    } catch (_e) {
      // fall through
    }
  }
  return trimmed;
}

export default function AdminScanTicketScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const [mode, setMode] = useState('manual');
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const lastScanRef = useRef({ code: '', at: 0 });

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const verify = useCallback(async (rawCode) => {
    const code = extractCodeFromScan(rawCode);
    if (!code) {
      setResult({
        kind: 'error',
        message: 'Please enter or scan a confirmation code.',
      });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await checkInBooking(code);
      setResult({
        kind: 'success',
        message: res?.message || 'Check-in successful',
        booking: res?.data?.booking,
        dateMatchesToday: res?.data?.dateMatchesToday,
      });
      setManualCode('');
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (status === 409 && data?.data?.alreadyCheckedIn) {
        setResult({
          kind: 'warning',
          message: data?.message || 'This ticket has already been checked in',
          booking: data?.data?.booking,
          checkedInAt: data?.data?.checkedInAt,
        });
      } else {
        setResult({
          kind: 'error',
          message: data?.message || 'Unable to verify this ticket right now.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, []);

  const onBarcodeScanned = useCallback(
    ({ data }) => {
      if (!data) return;
      const now = Date.now();
      // Debounce repeated scans of the same code within 2.5 seconds.
      if (lastScanRef.current.code === data && now - lastScanRef.current.at < 2500) {
        return;
      }
      lastScanRef.current = { code: data, at: now };
      verify(data);
    },
    [verify]
  );

  const reset = useCallback(() => {
    setResult(null);
    setManualCode('');
    lastScanRef.current = { code: '', at: 0 };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Reset when leaving so the next visit starts clean.
        setResult(null);
        setManualCode('');
        lastScanRef.current = { code: '', at: 0 };
      };
    }, [])
  );

  const renderResultCard = () => {
    if (!result) return null;
    const meta = RESULT_META[result.kind] || RESULT_META.error;
    const booking = result.booking;
    const user = booking?.userId;
    return (
      <View
        style={[
          styles.resultCard,
          { borderColor: meta.borderColor, backgroundColor: meta.backgroundColor },
        ]}
      >
        <Text style={[styles.resultTitle, { color: meta.textColor }]}>{meta.label}</Text>
        <Text style={[styles.resultMessage, { color: meta.textColor }]}>{result.message}</Text>
        {booking ? (
          <View style={styles.resultDetails}>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Visitor: </Text>
              {user?.fullName || '-'}
            </Text>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Email: </Text>
              {user?.email || '-'}
            </Text>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Phone: </Text>
              {user?.phone || '-'}
            </Text>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Visit date: </Text>
              {booking.visitDate || '-'}
            </Text>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Confirmation: </Text>
              {booking.confirmationCode || '-'}
            </Text>
            <Text style={styles.resultRow}>
              <Text style={styles.resultKey}>Total: </Text>
              {formatLkr(booking.totalLkr || 0)}
            </Text>
            {result.kind === 'warning' && result.checkedInAt ? (
              <Text style={styles.resultRow}>
                <Text style={styles.resultKey}>Checked in at: </Text>
                {String(result.checkedInAt).slice(0, 19).replace('T', ' ')}
              </Text>
            ) : null}
            {result.kind === 'success' && result.dateMatchesToday === false ? (
              <Text style={[styles.resultRow, styles.resultWarn]}>
                Note: this ticket is for {booking.visitDate}, not today.
              </Text>
            ) : null}
          </View>
        ) : null}
        <Pressable
          onPress={reset}
          style={styles.resetBtn}
          accessibilityRole="button"
          accessibilityLabel="Scan another ticket"
        >
          <Text style={styles.resetBtnText}>Scan another</Text>
        </Pressable>
      </View>
    );
  };

  const renderCameraSection = () => {
    if (!cameraPermission) {
      return (
        <View style={styles.cameraFallback}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
        </View>
      );
    }
    if (!cameraPermission.granted) {
      return (
        <View style={styles.cameraFallback}>
          <Text style={styles.cameraFallbackText}>
            Camera permission is required to scan QR codes.
          </Text>
          <Pressable
            onPress={requestCameraPermission}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Grant camera permission"
          >
            <Text style={styles.primaryBtnText}>Grant camera access</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={result ? undefined : onBarcodeScanned}
        />
        <Text style={styles.cameraHint}>Point the camera at the visitor's QR code</Text>
      </View>
    );
  };

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <Pressable
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate('AdminEntryTicketsShowBooking')
        }
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>

      <View style={styles.heroCard} accessibilityRole="header">
        <Text style={styles.title}>Scan Visitor Ticket</Text>
        <Text style={styles.sub}>
          Verify a visitor's confirmation code via QR scan or manual entry to mark their entry.
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setMode('manual')}
          style={[styles.tabBtn, mode === 'manual' && styles.tabBtnActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'manual' }}
        >
          <Text style={[styles.tabBtnText, mode === 'manual' && styles.tabBtnTextActive]}>
            Manual entry
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('camera')}
          style={[styles.tabBtn, mode === 'camera' && styles.tabBtnActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'camera' }}
        >
          <Text style={[styles.tabBtnText, mode === 'camera' && styles.tabBtnTextActive]}>
            Camera scan
          </Text>
        </Pressable>
      </View>

      {mode === 'manual' ? (
        <View style={styles.manualCard}>
          <Text style={styles.fieldLabel}>Confirmation code</Text>
          <TextInput
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="e.g. ABC-12345"
            placeholderTextColor="rgba(13, 45, 29, 0.45)"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            editable={!submitting}
          />
          <Pressable
            onPress={() => verify(manualCode)}
            disabled={submitting || !manualCode.trim()}
            style={[
              styles.primaryBtn,
              (submitting || !manualCode.trim()) && styles.primaryBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Verify confirmation code"
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Verify ticket</Text>
            )}
          </Pressable>
          <Text style={styles.helperText}>
            Tip: paste the JSON QR payload or just the confirmation code.
          </Text>
        </View>
      ) : (
        renderCameraSection()
      )}

      {submitting && mode === 'camera' ? (
        <View style={styles.scanningBanner}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
          <Text style={styles.scanningText}>Verifying...</Text>
        </View>
      ) : null}

      {renderResultCard()}

      {Platform.OS === 'web' && mode === 'camera' ? (
        <Text style={styles.webNotice}>
          On web, your browser will prompt for camera access on first use.
        </Text>
      ) : null}
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  heroCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  tabRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.linkGreen,
    borderColor: theme.colors.linkGreen,
  },
  tabBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  tabBtnTextActive: {
    color: theme.colors.white,
  },
  manualCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  helperText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.7,
  },
  cameraWrap: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
  },
  cameraHint: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
    textAlign: 'center',
  },
  cameraFallback: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cameraFallbackText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
    textAlign: 'center',
  },
  scanningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  scanningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  resultCard: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  resultTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  resultMessage: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  resultDetails: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    gap: 2,
  },
  resultRow: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
  },
  resultKey: {
    fontWeight: '700',
  },
  resultWarn: {
    marginTop: theme.spacing.xs,
    color: '#8A5A00',
    fontStyle: 'italic',
  },
  resetBtn: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
    backgroundColor: theme.colors.white,
  },
  resetBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  webNotice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});
