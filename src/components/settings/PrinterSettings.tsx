import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Device } from 'react-native-ble-plx';

import { printerService } from '@/service/printerService';

export default function PrinterSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [printing, setPrinting] = useState(false);
  const [testText, setTestText] = useState('');

  const startScan = useCallback(() => {
    setDevices([]);
    setScanning(true);

    void printerService.scanForPrinters((device) => {
      setDevices((previous) => {
        const exists = previous.some((item) => item.id === device.id);

        if (exists) {
          return previous;
        }

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
      if (connecting) {
        return;
      }

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
    if (printing) {
      return;
    }

    const connected = await printerService.isConnected();

    if (!connected) {
      Alert.alert('Printer Not Connected', 'Connect to a printer first.');

      setConnectedDevice(null);

      return;
    }

    if (!testText.trim()) {
      Alert.alert('Enter Test Text', 'Please enter some text to print.');

      return;
    }

    setPrinting(true);

    try {
      await printerService.printText(testText);

      Alert.alert('Test Sent', 'The test text was sent to the printer.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error('PRINT TEST ERROR:', error);

      Alert.alert('Print Failed', message);
    } finally {
      setPrinting(false);
    }
  }, [printing, testText]);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await printerService.isConnected();

      if (connected) {
        setConnectedDevice(printerService.getConnectedDevice());
      }
    };

    void checkConnection();

    return () => {
      printerService.stopScan();
    };
  }, []);

  const getDeviceName = (device: Device) => device.name || device.localName || 'Unknown Printer';

  if (connectedDevice) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Printer</Text>

        <View style={styles.connectedCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />

            <Text style={styles.connectedLabel}>Connected</Text>
          </View>

          <Text style={styles.printerName}>{getDeviceName(connectedDevice)}</Text>

          <Text style={styles.deviceId}>{connectedDevice.id}</Text>

          <View style={styles.testSection}>
            <Text style={styles.inputLabel}>Test Text</Text>

            <TextInput
              value={testText}
              onChangeText={setTestText}
              placeholder="Enter text to print"
              placeholderTextColor="#8A93A1"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={styles.testInput}
              editable={!printing}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.printButton, printing && styles.disabledButton]}
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
              disabled={printing}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Printer</Text>

      <Pressable
        style={[styles.scanButton, scanning && styles.disabledButton]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.buttonText}>{scanning ? 'Scanning...' : 'Scan for Printers'}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Available Printers</Text>

      {devices.length === 0 && !scanning && (
        <Text style={styles.emptyText}>
          No printers found.{'\n'}
          Tap the Scan for Printers button to search.
        </Text>
      )}

      {scanning && devices.length === 0 && (
        <Text style={styles.emptyText}>Searching for Bluetooth printers...</Text>
      )}

      {devices.map((device) => (
        <Pressable
          key={device.id}
          style={styles.deviceCard}
          disabled={connecting}
          onPress={() => {
            void connectToPrinter(device);
          }}
        >
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{getDeviceName(device)}</Text>

            <Text style={styles.deviceId}>{device.id}</Text>
          </View>

          <Text style={styles.connectText}>{connecting ? 'Connecting...' : 'Connect'}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
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
    borderColor: '#DCE1E9',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#16A34A',
    marginRight: 8,
  },

  connectedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252B35',
  },

  printerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#151A23',
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#252B35',
  },

  deviceId: {
    fontSize: 11,
    marginTop: 5,
    color: '#8A93A1',
  },

  testSection: {
    marginTop: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#252B35',
  },

  testInput: {
    minHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    fontSize: 15,
    color: '#151A23',
  },

  scanButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#222222',
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
    backgroundColor: '#087F23',
  },

  disconnectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#992222',
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#252B35',
  },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  connectText: {
    fontWeight: '700',
    marginLeft: 12,
    color: '#1745D1',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 22,
    color: '#8A93A1',
  },
});
