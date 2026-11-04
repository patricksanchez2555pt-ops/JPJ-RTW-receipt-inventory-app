import { NativeModule, requireNativeModule } from 'expo';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type ProvisioningProfileEvents = Record<never, never>;

declare class ProvisioningProfileModule extends NativeModule<ProvisioningProfileEvents> {
  getExpirationTimestamp(): Promise<number>;
}

type ExpirationState =
  | { status: 'loading' }
  | { status: 'available'; timestamp: number }
  | { status: 'unavailable'; message: string };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export default function AppExpirationSettings() {
  const [expiration, setExpiration] = useState<ExpirationState>(() =>
    Platform.OS === 'ios'
      ? { status: 'loading' }
      : {
          status: 'unavailable',
          message: 'Provisioning profile expiration is only available on iOS.',
        },
  );

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    let isMounted = true;

    void Promise.resolve()
      .then(() =>
        requireNativeModule<ProvisioningProfileModule>(
          'ProvisioningProfile',
        ).getExpirationTimestamp(),
      )
      .then((timestamp) => {
        if (isMounted) {
          setExpiration({ status: 'available', timestamp });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setExpiration({ status: 'unavailable', message: getErrorMessage(error) });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value =
    expiration.status === 'loading'
      ? 'Loading...'
      : expiration.status === 'available'
        ? new Date(expiration.timestamp).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          })
        : expiration.message;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App expiration</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  value: {
    color: '#374151',
  },
});
