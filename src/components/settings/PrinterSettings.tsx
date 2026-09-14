import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Device } from 'react-native-ble-plx';

import { printerService } from '@/service/printerService';

export default function PrinterSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [printing, setPrinting] = useState(false);

  const startScan = useCallback(() => {
    setDevices([]);
    setScanning(true);

    void printerService.scanForPrinters((device) => {
      setDevices((previous) => {
        const exists = previous.some((item) => item.id === device.id);

        if (exists) return previous;

        return [...previous, device];
      });
    });

    setTimeout(() => {
      printerService.stopScan();
      setScanning(false);
    }, 10000);
  }, []);

  const connectToPrinter = useCallback(
    async (device: Device) => {
      if (connecting) return;

      setConnecting(true);

      try {
        const connected = await printerService.connect(device.id);

        setConnectedDevice(connected);

        Alert.alert(
          'Printer Connected',
          `${connected.name || connected.localName || 'Printer'} is ready to print.`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error('PRINTER CONNECTION ERROR:', error);

        Alert.alert('Connection Failed', message);
      } finally {
        setConnecting(false);
      }
    },
    [connecting],
  );

  const disconnectPrinter = useCallback(async () => {
    try {
      await printerService.disconnect();

      setConnectedDevice(null);

      Alert.alert('Disconnected', 'Printer disconnected.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      Alert.alert('Disconnect Failed', message);
    }
  }, []);

  const printTest = useCallback(async () => {
    if (printing) return;

    const connected = await printerService.isConnected();

    if (!connected) {
      Alert.alert('Printer Not Connected', 'Connect to a printer first.');

      setConnectedDevice(null);

      return;
    }

    setPrinting(true);

    try {
      await printerService.printTest();

      Alert.alert('Test Sent', 'The test receipt was sent to the printer.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error('PRINT TEST ERROR:', error);

      Alert.alert('Print Failed', message);
    } finally {
      setPrinting(false);
    }
  }, [printing]);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await printerService.isConnected();

      if (connected) setConnectedDevice(printerService.getConnectedDevice());
    };

    void checkConnection();

    return () => {
      printerService.stopScan();
    };
  }, []);

  const getDeviceName = (device: Device) => device.name || device.localName || 'Unknown Printer';

  if (connectedDevice) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Printer</Text>

        <View style={styles.connectedCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />

            <Text style={styles.connectedLabel}>Connected</Text>
          </View>

          <Text style={styles.printerName}>{getDeviceName(connectedDevice)}</Text>

          <Text style={styles.deviceId}>{connectedDevice.id}</Text>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.printButton}
              onPress={() => {
                void printTest();
              }}
              disabled={printing}
            >
              <Text style={styles.buttonText}>{printing ? 'Printing...' : '🖨 Print TEST'}</Text>
            </Pressable>

            <Pressable
              style={styles.disconnectButton}
              onPress={() => {
                void disconnectPrinter();
              }}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Printer</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.deviceCard}
            disabled={connecting}
            onPress={() => {
              void connectToPrinter(item);
            }}
          >
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{getDeviceName(item)}</Text>

              <Text style={styles.deviceId}>{item.id}</Text>
            </View>

            <Text style={styles.connectText}>{connecting ? 'Connecting...' : 'Connect'}</Text>
          </Pressable>
        )}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.scanButton} onPress={startScan} disabled={scanning}>
              <Text style={styles.buttonText}>
                {scanning ? 'Scanning...' : 'Scan for Printers'}
              </Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Available Printers</Text>

            {devices.length === 0 && !scanning && (
              <Text style={styles.emptyText}>
                No printers found.{'\n'}Tap the Scan for Printers button to search.
              </Text>
            )}

            {scanning && devices.length === 0 && (
              <Text style={styles.emptyText}>Searching for Bluetooth printers...</Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },

  connectedCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
    marginRight: 8,
  },

  connectedLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  printerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: 17,
    fontWeight: '700',
  },

  deviceId: {
    fontSize: 11,
    marginTop: 5,
    opacity: 0.6,
  },

  scanButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#222',
    marginBottom: 24,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  printButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#087f23',
  },

  disconnectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#922',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },

  connectText: {
    fontWeight: '700',
    marginLeft: 12,
  },

  listContent: {
    paddingBottom: 20,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 22,
    opacity: 0.6,
  },
});
