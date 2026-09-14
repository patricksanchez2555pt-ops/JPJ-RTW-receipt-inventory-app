import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useColorStore } from '../../../store/useColorStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import type { Product } from '../../../types/localModels';

type Props = {
  product: Product;
  onDeleted?: () => void;
};

export default function ProductEdit({ product, onDeleted }: Props) {
  const colors = useColorStore((state) => state.colors);
  const sizes = useSizeStore((state) => state.sizes);

  const updateProduct = useProductStore((state) => state.updateProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const updateColor = useColorStore((state) => state.updateColor);
  const addColor = useColorStore((state) => state.addColor);
  const deleteColor = useColorStore((state) => state.deleteColor);

  const updateSize = useSizeStore((state) => state.updateSize);
  const addSize = useSizeStore((state) => state.addSize);
  const deleteSize = useSizeStore((state) => state.deleteSize);

  /*
   * Product colors
   */
  const productColors = useMemo(
    () => colors.filter((color) => color.productId === product.id),
    [colors, product.id],
  );

  /*
   * Product sizes sorted by price.
   */
  const productSizes = useMemo(
    () => sizes.filter((size) => size.productId === product.id).sort((a, b) => a.price - b.price),
    [sizes, product.id],
  );

  /*
   * PRODUCT NAME
   */
  const [productName, setProductName] = useState(product.name);

  /*
   * COLORS
   */
  const [colorNames, setColorNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(productColors.map((color) => [color.id, color.name])),
  );

  const [colorHexValues, setColorHexValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(productColors.map((color) => [color.id, color.hexValue])),
  );

  /*
   * SIZES
   */
  const [sizeNames, setSizeNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(productSizes.map((size) => [size.id, size.name])),
  );

  const [sizePrices, setSizePrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(productSizes.map((size) => [size.id, String(size.price)])),
  );

  /*
   * PRODUCT NAME UNSAVED
   */
  const productNameChanged = productName.trim() !== product.name;

  /*
   * SAVE PRODUCT NAME
   */
  function saveProductName() {
    const name = productName.trim();

    if (!name) {
      Alert.alert('Invalid Product', 'Product name cannot be empty.');
      return;
    }

    if (name === product.name) {
      return;
    }

    updateProduct(product.id, name);

    Alert.alert('Saved', 'Product name updated.');
  }

  /*
   * DELETE PRODUCT
   */
  function handleDeleteProduct() {
    Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          onDeleted?.();
        },
      },
    ]);
  }

  /*
   * ADD COLOR
   */
  function addNewColor() {
    const id = `color-${Date.now()}`;

    addColor({
      id,
      productId: product.id,
      name: 'New Color',
      hexValue: '#CCCCCC',
    });
    setColorNames((current) => ({
      ...current,
      [id]: 'New Color',
    }));

    setColorHexValues((current) => ({
      ...current,
      [id]: '#CCCCCC',
    }));
  }

  /*
   * CHECK COLOR CHANGES
   */
  function hasColorChanges(colorId: string) {
    const color = productColors.find((item) => item.id === colorId);

    if (!color) {
      return false;
    }

    const currentName = colorNames[colorId] ?? color.name;

    const currentHex = colorHexValues[colorId] ?? color.hexValue;

    return (
      currentName.trim() !== color.name ||
      currentHex.trim().toUpperCase() !== color.hexValue.toUpperCase()
    );
  }

  /*
   * SAVE COLOR
   */
  function saveColor(colorId: string) {
    const color = productColors.find((item) => item.id === colorId);

    if (!color) {
      return;
    }

    const name = (colorNames[colorId] ?? color.name).trim();

    const hexValue = (colorHexValues[colorId] ?? color.hexValue).trim().toUpperCase();

    if (!name) {
      Alert.alert('Invalid Color', 'Color name cannot be empty.');
      return;
    }

    if (!/^#[0-9A-F]{6}$/.test(hexValue)) {
      Alert.alert('Invalid Color', 'HEX color must be in the format #FFFFFF.');
      return;
    }

    updateColor(colorId, name, hexValue);

    setColorNames((current) => ({
      ...current,
      [colorId]: name,
    }));

    setColorHexValues((current) => ({
      ...current,
      [colorId]: hexValue,
    }));
  }

  /*
   * DELETE COLOR
   */
  function handleDeleteColor(colorId: string) {
    deleteColor(colorId);

    setColorNames((current) => {
      const next = { ...current };
      delete next[colorId];
      return next;
    });

    setColorHexValues((current) => {
      const next = { ...current };
      delete next[colorId];
      return next;
    });
  }

  /*
   * ADD SIZE
   */
  function addNewSize() {
    const id = `size-${Date.now()}`;

    addSize({
      id,
      productId: product.id,
      name: 'New Size',
      price: 0,
    });

    setSizeNames((current) => ({
      ...current,
      [id]: 'New Size',
    }));

    setSizePrices((current) => ({
      ...current,
      [id]: '0',
    }));
  }

  /*
   * CHECK SIZE CHANGES
   */
  function hasSizeChanges(sizeId: string) {
    const size = productSizes.find((item) => item.id === sizeId);

    if (!size) {
      return false;
    }

    const currentName = sizeNames[sizeId] ?? size.name;

    const currentPrice = sizePrices[sizeId] ?? String(size.price);

    const parsedPrice = Number(currentPrice.replace(/[^0-9.]/g, ''));

    return currentName.trim() !== size.name || parsedPrice !== size.price;
  }

  /*
   * SAVE SIZE
   */
  function saveSize(sizeId: string) {
    const size = productSizes.find((item) => item.id === sizeId);

    if (!size) {
      return;
    }

    const name = (sizeNames[sizeId] ?? size.name).trim();

    const priceText = sizePrices[sizeId] ?? String(size.price);

    const price = Number(priceText.replace(/[^0-9.]/g, ''));

    if (!name) {
      Alert.alert('Invalid Size', 'Size name cannot be empty.');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    updateSize(sizeId, name, price);

    setSizeNames((current) => ({
      ...current,
      [sizeId]: name,
    }));

    setSizePrices((current) => ({
      ...current,
      [sizeId]: String(price),
    }));
  }

  /*
   * DELETE SIZE
   */
  function handleDeleteSize(sizeId: string) {
    deleteSize(sizeId);

    setSizeNames((current) => {
      const next = { ...current };
      delete next[sizeId];
      return next;
    });

    setSizePrices((current) => {
      const next = { ...current };
      delete next[sizeId];
      return next;
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Edit Product</Text>

            <Text style={styles.subtitle}>{product.name}</Text>
          </View>

          <Pressable
            onPress={handleDeleteProduct}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={18} color="#C62828" />

            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>

        {/* PRODUCT NAME */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>

          <Text style={styles.label}>Product Name</Text>

          <View style={[styles.inputRow, productNameChanged && styles.unsavedContainer]}>
            <TextInput
              value={productName}
              onChangeText={setProductName}
              style={[styles.input, productNameChanged && styles.unsavedInput]}
              placeholder="Product name"
              placeholderTextColor="#9AA2AF"
            />

            <Pressable
              onPress={saveProductName}
              disabled={!productNameChanged}
              style={({ pressed }) => [
                styles.smallButton,
                !productNameChanged && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.smallButtonText}>Save</Text>
            </Pressable>
          </View>

          {productNameChanged && <Text style={styles.unsavedText}>Unsaved changes</Text>}
        </View>

        {/* COLORS + SIZES */}
        <View style={styles.editorColumns}>
          {/* SIZES */}
          <View style={styles.editorSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sizes & Prices</Text>

                <Text style={styles.sectionSubtitle}>
                  {productSizes.length} size
                  {productSizes.length === 1 ? '' : 's'}
                </Text>
              </View>

              <Pressable
                onPress={addNewSize}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />

                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>

            {productSizes.map((size) => {
              const name = sizeNames[size.id] ?? size.name;

              const price = sizePrices[size.id] ?? String(size.price);

              const changed = hasSizeChanges(size.id);

              return (
                <View key={size.id} style={[styles.editorCard, changed && styles.unsavedCard]}>
                  <View style={styles.sizeRow}>
                    {/* SIZE NAME */}
                    <TextInput
                      value={name}
                      onChangeText={(value) =>
                        setSizeNames((current) => ({
                          ...current,
                          [size.id]: value,
                        }))
                      }
                      style={[styles.sizeInput, changed && styles.unsavedInput]}
                      placeholder="Size"
                      placeholderTextColor="#9AA2AF"
                    />

                    {/* PRICE */}
                    <View style={[styles.priceInputContainer, changed && styles.unsavedInput]}>
                      <Text style={styles.currency}>₱</Text>

                      <TextInput
                        value={price}
                        onChangeText={(value) =>
                          setSizePrices((current) => ({
                            ...current,
                            [size.id]: value,
                          }))
                        }
                        style={styles.priceInput}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="#9AA2AF"
                      />
                    </View>

                    {/* SAVE */}
                    <Pressable
                      onPress={() => saveSize(size.id)}
                      disabled={!changed}
                      style={({ pressed }) => [
                        styles.saveIconButton,
                        !changed && styles.disabledSaveButton,
                        changed && styles.unsavedSaveButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={changed ? '#1745D1' : '#AAB2C0'}
                      />
                    </Pressable>

                    {/* DELETE */}
                    <Pressable onPress={() => handleDeleteSize(size.id)} style={styles.iconButton}>
                      <Ionicons name="trash-outline" size={20} color="#C62828" />
                    </Pressable>
                  </View>

                  {changed && <Text style={styles.unsavedText}>Unsaved changes</Text>}
                </View>
              );
            })}

            {productSizes.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No sizes added.</Text>
              </View>
            )}
          </View>

          {/* COLORS */}
          <View style={styles.editorSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Colors</Text>

                <Text style={styles.sectionSubtitle}>
                  {productColors.length} color
                  {productColors.length === 1 ? '' : 's'}
                </Text>
              </View>

              <Pressable
                onPress={addNewColor}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />

                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>

            {productColors.map((color) => {
              const name = colorNames[color.id] ?? color.name;

              const hexValue = colorHexValues[color.id] ?? color.hexValue;

              const changed = hasColorChanges(color.id);

              const validHex = /^#[0-9A-Fa-f]{6}$/.test(hexValue);

              return (
                <View key={color.id} style={[styles.editorCard, changed && styles.unsavedCard]}>
                  <View style={styles.colorEditRow}>
                    {/* COLOR PREVIEW */}
                    <View
                      style={[
                        styles.colorPreview,
                        {
                          backgroundColor: validHex ? hexValue : '#CCCCCC',
                        },
                      ]}
                    />

                    {/* COLOR NAME */}
                    <TextInput
                      value={name}
                      onChangeText={(value) =>
                        setColorNames((current) => ({
                          ...current,
                          [color.id]: value,
                        }))
                      }
                      style={[styles.colorNameInput, changed && styles.unsavedInput]}
                      placeholder="Color name"
                      placeholderTextColor="#9AA2AF"
                    />

                    {/* HEX */}
                    <TextInput
                      value={hexValue}
                      onChangeText={(value) =>
                        setColorHexValues((current) => ({
                          ...current,
                          [color.id]: value.toUpperCase(),
                        }))
                      }
                      style={[styles.hexInput, changed && styles.unsavedInput]}
                      placeholder="#FFFFFF"
                      placeholderTextColor="#9AA2AF"
                      autoCapitalize="characters"
                      maxLength={7}
                    />

                    {/* SAVE */}
                    <Pressable
                      onPress={() => saveColor(color.id)}
                      disabled={!changed}
                      style={({ pressed }) => [
                        styles.saveIconButton,
                        !changed && styles.disabledSaveButton,
                        changed && styles.unsavedSaveButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={changed ? '#1745D1' : '#AAB2C0'}
                      />
                    </Pressable>

                    {/* DELETE */}
                    <Pressable
                      onPress={() => handleDeleteColor(color.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#C62828" />
                    </Pressable>
                  </View>

                  {changed && <Text style={styles.unsavedText}>Unsaved changes</Text>}
                </View>
              );
            })}

            {productColors.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No colors added.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE1E9',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: f(22),
    fontWeight: '800',
    color: '#151A23',
  },

  subtitle: {
    marginTop: 4,
    fontSize: f(14),
    color: '#707989',
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0CACA',
    backgroundColor: '#FFF5F5',
  },

  deleteText: {
    color: '#C62828',
    fontWeight: '700',
  },

  /* SECTIONS */

  section: {
    marginBottom: 28,
  },

  editorColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },

  editorSection: {
    flex: 1,
    minWidth: 0,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: f(17),
    fontWeight: '800',
    color: '#151A23',
  },

  sectionSubtitle: {
    marginTop: 3,
    color: '#707989',
    fontSize: f(13),
  },

  label: {
    marginBottom: 7,
    fontSize: f(14),
    color: '#4D5665',
  },

  /* PRODUCT NAME */

  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#151A23',
    backgroundColor: '#FFFFFF',
  },

  smallButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#1745D1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ADD BUTTON */

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1745D1',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* CARDS */

  editorCard: {
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DCE1E9',
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
  },

  unsavedCard: {
    borderColor: '#F0B429',
    backgroundColor: '#FFFBEB',
  },

  /* COLORS */

  colorEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  colorPreview: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    flexShrink: 0,
  },

  colorNameInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A23',
  },

  hexInput: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A23',
  },

  /* SIZES */

  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sizeInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A23',
  },

  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 105,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },

  currency: {
    marginLeft: 8,
    fontSize: f(15),
    color: '#707989',
  },

  priceInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 5,
    color: '#151A23',
    textAlign: 'right',
  },

  /* SAVE */

  saveIconButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
  },

  unsavedSaveButton: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#F0B429',
  },

  disabledSaveButton: {
    backgroundColor: '#F2F4F7',
  },

  /* UNSAVED */

  unsavedInput: {
    borderColor: '#F0B429',
    backgroundColor: '#FFFDF5',
  },

  unsavedContainer: {
    borderRadius: 8,
  },

  unsavedText: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: f(11),
    fontWeight: '600',
    color: '#B7791F',
  },

  /* DELETE */

  iconButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* EMPTY */

  emptyBox: {
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8DDE5',
    borderRadius: 8,
    alignItems: 'center',
  },

  emptyText: {
    color: '#8A93A2',
  },

  /* DISABLED */

  disabledButton: {
    backgroundColor: '#AAB2C0',
  },

  /* PRESS */

  pressed: {
    opacity: 0.7,
  },
});
