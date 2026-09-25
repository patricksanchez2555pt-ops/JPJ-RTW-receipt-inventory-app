import type { Device } from 'react-native-ble-plx';
import { BleManager, State } from 'react-native-ble-plx';

const PRINTER_SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';

const PRINTER_CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';

const BLE_CHUNK_SIZE = 20;
const CHUNK_DELAY_MS = 30;

class PrinterService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Get the BLE manager.
   * Useful later for scanning from the UI.
   */
  getManager(): BleManager {
    return this.manager;
  }

  /**
   * Check whether Bluetooth is currently powered on.
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.manager.state();

    return state === State.PoweredOn;
  }

  /**
   * Connect to the RP21UB-Y printer.
   */
  async connect(deviceId: string): Promise<Device> {
    if (!(await this.isBluetoothEnabled())) {
      throw new Error('Bluetooth is not powered on.');
    }

    /*
     * If we already have a connection to this printer,
     * verify it before reconnecting.
     */
    if (this.connectedDevice) {
      try {
        const connected = await this.connectedDevice.isConnected();

        if (connected && this.connectedDevice.id === deviceId) {
          return this.connectedDevice;
        }
      } catch {
        this.connectedDevice = null;
      }
    }

    /*
     * Clean up any previous connection.
     */
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      } catch {
        // Ignore cleanup errors.
      }

      this.connectedDevice = null;
    }

    /*
     * Connect to the printer.
     */
    const device = await this.manager.connectToDevice(deviceId, {
      timeout: 15000,
    });

    /*
     * Discover services and characteristics.
     */
    const discovered = await device.discoverAllServicesAndCharacteristics();

    /*
     * Verify that our expected printer
     * service and characteristic exist.
     */
    const services = await discovered.services();

    let printerServiceFound = false;
    let printerCharacteristicFound = false;

    for (const service of services) {
      if (service.uuid.toLowerCase() === PRINTER_SERVICE_UUID.toLowerCase()) {
        printerServiceFound = true;

        const characteristics = await service.characteristics();

        for (const characteristic of characteristics) {
          if (characteristic.uuid.toLowerCase() === PRINTER_CHARACTERISTIC_UUID.toLowerCase()) {
            printerCharacteristicFound = true;

            if (
              !characteristic.isWritableWithResponse &&
              !characteristic.isWritableWithoutResponse
            ) {
              throw new Error('Printer characteristic is not writable.');
            }
          }
        }
      }
    }

    if (!printerServiceFound) {
      await this.disconnect();

      throw new Error('RP21UB-Y printer service was not found.');
    }

    if (!printerCharacteristicFound) {
      await this.disconnect();

      throw new Error('RP21UB-Y printer write characteristic was not found.');
    }

    this.connectedDevice = discovered;

    return discovered;
  }

  /**
   * Check whether the printer is currently connected.
   */
  async isConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      return await this.connectedDevice.isConnected();
    } catch {
      this.connectedDevice = null;
      return false;
    }
  }

  async scanForPrinters(onDeviceFound: (device: Device) => void): Promise<void> {
    await this.manager.stopDeviceScan();

    await this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        return;
      }

      if (!device) {
        return;
      }

      onDeviceFound(device);
    });
  }

  stopScan(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.manager.stopDeviceScan();
  }

  /**
   * Return the currently connected printer.
   */
  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  /**
   * Send raw bytes to the printer.
   *
   * The data is split into small BLE packets to avoid
   * overflowing the printer's BLE buffer.
   */
  async write(data: number[]): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No printer is connected.');
    }

    const connected = await this.connectedDevice.isConnected();

    if (!connected) {
      this.connectedDevice = null;

      throw new Error('Printer is no longer connected.');
    }

    /*
     * Split ESC/POS data into conservative
     * 20-byte BLE chunks.
     */
    for (let offset = 0; offset < data.length; offset += BLE_CHUNK_SIZE) {
      const chunk = data.slice(offset, offset + BLE_CHUNK_SIZE);

      const base64Data = this.bytesToBase64(chunk);

      /*
       * We know the printer accepts this characteristic
       * with response from our successful test.
       */
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        PRINTER_SERVICE_UUID,
        PRINTER_CHARACTERISTIC_UUID,
        base64Data,
      );

      /*
       * Give the printer a little time between packets.
       */
      if (offset + BLE_CHUNK_SIZE < data.length) {
        await this.delay(CHUNK_DELAY_MS);
      }
    }
  }

  /**
   * Send text directly to the printer.
   *
   * This is intentionally simple for now.
   * Full receipt formatting will be added to escPos.ts.
   */
  async printText(text: string): Promise<void> {
    const fontSizeCommand = [0x1b, 0x21, 0x10];
    const data = [...fontSizeCommand, ...this.textToBytes(text)];

    await this.write(data);
  }

  /**
   * Disconnect the current printer.
   */
  async disconnect(): Promise<void> {
    if (!this.connectedDevice) {
      return;
    }

    const deviceId = this.connectedDevice.id;

    this.connectedDevice = null;

    try {
      await this.manager.cancelDeviceConnection(deviceId);
    } catch (error) {
      console.warn('Printer disconnect error:', error);
    }
  }

  /**
   * Destroy the BLE manager.
   *
   * Call this when the application no longer
   * needs Bluetooth.
   */
  destroy(): void {
    this.connectedDevice = null;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.manager.stopDeviceScan();

    void this.manager.destroy();
  }

  /**
   * Convert bytes to Base64.
   *
   * react-native-ble-plx expects Base64 strings
   * when writing characteristic data.
   */
  private bytesToBase64(bytes: number[]): string {
    const binary = bytes.map((byte) => String.fromCharCode(byte)).join('');

    return globalThis.btoa(binary);
  }

  /**
   * Convert UTF-8 text into bytes.
   */
  private textToBytes(text: string): number[] {
    return Array.from(new TextEncoder().encode(text));
  }

  /**
   * Small async delay between BLE packets.
   */
  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

export const printerService = new PrinterService();
