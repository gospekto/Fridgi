import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { 
  Button, 
  TextInput, 
  Text, 
  Appbar, 
  Card, 
  Title, 
  useTheme,
  HelperText,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Avatar,
  Menu,
  Divider
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import 'moment/locale/pl';
import { generateId, addToProductDatabase } from '../services/productServices/productsServices';
import { addToFridge } from '../services/fridgeItemsServices/fridgeItemsServices';

moment.locale('pl');

export default function ProductAdd({ navigation, route }) {
  const theme = useTheme();
  const { barcodeData, barcodeType } = route.params || {};
  
  const categories = [
    'Nabiał', 'Pieczywo', 'Mięso', 'Warzywa', 'Owoce', 
    'Napoje', 'Słodycze', 'Przekąski', 'Mrożonki', 'Przyprawy'
  ];

  const units = ['szt', 'kg', 'g', 'l', 'ml', 'opak'];

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '1',
    unit: 'szt',
    expiryDate: null,
    barcode: barcodeData || '',
    barcodeType: barcodeType || '',
    imageUri: null,
    storageLocation: 'Lodówka',
    notes: '',
    estimatedShelfLife: null,
    addedDate: new Date(),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [storageMenuVisible, setStorageMenuVisible] = useState(false);

  useEffect(() => {
    if (barcodeData) {
      fetchProductData(barcodeData);
    }
    requestPermissions();
  }, [barcodeData]);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        showSnackbar('Aby robić zdjęcia, potrzebne są uprawnienia do aparatu!');
      }
      if (libraryStatus !== 'granted') {
        showSnackbar('Do wybierania zdjęć potrzebne są uprawnienia do biblioteki!');
      }
    } catch (error) {
      showSnackbar('Błąd podczas żądania uprawnień');
    }
  };

  const fetchProductData = async (barcode) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProducts = {
        '5901234123457': { name: 'Mleko UHT 3,2%', category: 'Nabiał', unit: 'l', typicalShelfLife: 14 },
        '5901234123456': { name: 'Chleb razowy', category: 'Pieczywo', unit: 'szt', typicalShelfLife: 3 },
      };
      
      const productData = mockProducts[barcode] || {};
      
      setFormData(prev => ({
        ...prev,
        name: productData.name || '',
        category: productData.category || '',
        unit: productData.unit || 'szt',
        typicalShelfLife: productData.typicalShelfLife || null,
      }));
      
    } catch (error) {
      showSnackbar('Błąd podczas wyszukiwania produktu');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedShelfLife = (expiryDate) => {
    if (!expiryDate) return null;
    
    const addedDate = formData.addedDate || new Date();
    const expiry = moment(expiryDate);
    const added = moment(addedDate);
    
    const daysDifference = expiry.diff(added, 'days');
    const withVariance = Math.round(daysDifference * 0.9);
    
    return withVariance > 0 ? withVariance : 0;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const estimatedShelfLife = calculateEstimatedShelfLife(selectedDate);
      setFormData(prev => ({
        ...prev,
        expiryDate: selectedDate,
        estimatedShelfLife,
      }));
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const compressedImage = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        setFormData(prev => ({
          ...prev,
          imageUri: `data:image/jpeg;base64,${compressedImage}`
        }));
      }
    } catch (error) {
      showSnackbar('Błąd podczas wybierania zdjęcia');
    }
  };

  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUri: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Full error:', error);
      showSnackbar(`Błąd podczas robienia zdjęcia: ${error.message}`);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUri: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nazwa jest wymagana';
    if (!formData.category.trim()) newErrors.category = 'Kategoria jest wymagana';
    if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Nieprawidłowa ilość';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const productToSave = {
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate?.toISOString(),
        barcode: formData.barcode,
        barcodeType: formData.barcodeType,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
        estimatedShelfLife: formData.estimatedShelfLife,
        imageUri: formData.imageUri,
        typicalShelfLife: formData.estimatedShelfLife
      };

      const savedProduct = await addToProductDatabase(productToSave);
      await addToFridge(savedProduct.id);
      
      navigation.goBack();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDate = (date) => {
    return date ? moment(date).format('LL') : 'Nie ustawiono';
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Dodaj produkt" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Dane produktu</Title>
            
            {/* Zdjęcie produktu */}
            <View style={styles.imageSection}>
              {formData.imageUri ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: formData.imageUri }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={removeImage}
                    style={styles.removeImageButton}
                  />
                </View>
              ) : (
                <Avatar.Icon 
                  size={120} 
                  icon="camera" 
                  style={styles.placeholderIcon}
                />
              )}
              
              <View style={styles.imageButtons}>
                <Button 
                  mode="outlined" 
                  onPress={pickImage}
                  icon="image"
                  style={styles.imageButton}
                >
                  Wybierz zdjęcie
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={takePhoto}
                  icon="camera"
                  style={styles.imageButton}
                >
                  Zrób zdjęcie
                </Button>
              </View>
            </View>

            {/* Podstawowe informacje */}
            <TextInput
              label="Nazwa produktu*"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              error={!!errors.name}
              style={styles.input}
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
            )}

            {/* Kategoria - Menu */}
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TextInput
                  label="Kategoria*"
                  value={formData.category}
                  style={styles.input}
                  error={!!errors.category}
                  right={<TextInput.Icon name="chevron-down" onPress={() => setCategoryMenuVisible(true)} />}
                  onFocus={() => setCategoryMenuVisible(true)}
                  showSoftInputOnFocus={false}
                />
              }
            >
              {categories.map((category) => (
                <Menu.Item
                  key={category}
                  onPress={() => {
                    handleChange('category', category);
                    setCategoryMenuVisible(false);
                  }}
                  title={category}
                />
              ))}
            </Menu>
            {errors.category && (
              <HelperText type="error" visible={!!errors.category}>
                {errors.category}
              </HelperText>
            )}

            {/* Ilość i jednostka */}
            <View style={styles.row}>
              {/* <TextInput
                label="Ilość*"
                value={formData.quantity}
                onChangeText={(text) => handleChange('quantity', text)}
                error={!!errors.quantity}
                style={[styles.input, styles.quantityInput]}
                keyboardType="numeric"
              /> */}
              
              {/* Jednostka - Menu */}
              {/* <Menu
                visible={unitMenuVisible}
                onDismiss={() => setUnitMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Jednostka"
                    value={formData.unit}
                    style={[styles.input, styles.unitInput]}
                    right={<TextInput.Icon name="chevron-down" onPress={() => setUnitMenuVisible(true)} />}
                    onFocus={() => setUnitMenuVisible(true)}
                    showSoftInputOnFocus={false}
                  />
                }
              >
                {units.map((unit) => (
                  <Menu.Item
                    key={unit}
                    onPress={() => {
                      handleChange('unit', unit);
                      setUnitMenuVisible(false);
                    }}
                    title={unit}
                  />
                ))}
              </Menu> */}
            </View>
            {errors.quantity && (
              <HelperText type="error" visible={!!errors.quantity}>
                {errors.quantity}
              </HelperText>
            )}

            {/* Data ważności */}
            <TextInput
              label="Data ważności (opcjonalnie)"
              value={formatDate(formData.expiryDate)}
              style={styles.input}
              right={<TextInput.Icon name="calendar" onPress={() => setShowDatePicker(true)} />}
              onFocus={() => setShowDatePicker(true)}
              showSoftInputOnFocus={false}
            />
            {showDatePicker && (
              <DateTimePicker
                value={formData.expiryDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Przewidywany okres trwałości */}
            {formData.estimatedShelfLife !== null && (
              <View style={styles.shelfLifeContainer}>
                <Text style={styles.shelfLifeText}>
                  Przewidywany okres trwałości: {formData.estimatedShelfLife} dni
                </Text>
              </View>
            )}

            {/* Miejsce przechowywania */}
            <Menu
              visible={storageMenuVisible}
              onDismiss={() => setStorageMenuVisible(false)}
              anchor={
                <TextInput
                  label="Miejsce przechowywania"
                  value={formData.storageLocation}
                  style={styles.input}
                  right={<TextInput.Icon name="chevron-down" onPress={() => setStorageMenuVisible(true)} />}
                  onFocus={() => setStorageMenuVisible(true)}
                  showSoftInputOnFocus={false}
                />
              }
            >
              {['Lodówka', 'Zamrażarka', 'Spiżarnia', 'Szafka'].map((location) => (
                <Menu.Item
                  key={location}
                  onPress={() => {
                    handleChange('storageLocation', location);
                    setStorageMenuVisible(false);
                  }}
                  title={location}
                />
              ))}
            </Menu>

            {/* Notatki */}
            <TextInput
              label="Notatki (opcjonalnie)"
              value={formData.notes}
              onChangeText={(text) => handleChange('notes', text)}
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            {/* Kod kreskowy */}
            <TextInput
              label="Kod kreskowy"
              value={formData.barcode}
              onChangeText={(text) => handleChange('barcode', text)}
              style={styles.input}
              disabled={!!barcodeData}
              right={<TextInput.Icon name="barcode" />}
            />
            {barcodeData && (
              <HelperText type="info" style={styles.helperText}>
                Kod zeskanowany automatycznie
              </HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Przyciski akcji */}
        <View style={styles.buttonsContainer}>
          <Button 
            mode="contained" 
            onPress={handleSave}
            style={styles.saveButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Zapisz produkt
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Anuluj
          </Button>
        </View>
      </ScrollView>

      {/* Snackbar z komunikatem */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.primary }}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Wskaźnik ładowania */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  placeholderIcon: {
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  imageButton: {
    marginHorizontal: 5,
    marginVertical: 5,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  helperText: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityInput: {
    flex: 1,
    marginRight: 8,
  },
  unitInput: {
    width: 100,
  },
  buttonsContainer: {
    marginTop: 16,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shelfLifeContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  shelfLifeText: {
    color: '#1976d2',
    textAlign: 'center',
  },
});