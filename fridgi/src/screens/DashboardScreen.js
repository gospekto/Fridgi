import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Button, Card, IconButton, Title, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const DashboardTile = ({ icon, title, color, onPress }) => {
  return (
    <Card style={styles.tile} onPress={onPress}>
      <Card.Content style={styles.tileContent}>
        <IconButton 
          icon={icon}
          size={40}
          color="white"
          style={[styles.tileButton, { backgroundColor: color }]}
          onPress={onPress}
        />
        <Title style={styles.tileTitle}>{title}</Title>
      </Card.Content>
    </Card>
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Fridgi</Title>
        <IconButton 
          icon="cog" 
          size={24} 
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      
      <View style={styles.tilesContainer}>
        <DashboardTile 
          icon="barcode-scan" 
          title="Skanuj produkt" 
          color={theme.colors.accent}
          onPress={() => navigation.navigate('BarcodeScanner')}
        />
        
        <DashboardTile 
          icon="cart" 
          title="Lista zakupów" 
          color={theme.colors.accent}
          onPress={() => navigation.navigate('ShoppingList')}
        />
        
        <DashboardTile 
          icon="fridge" 
          title="Dostępne produkty" 
          color={theme.colors.accent}
          onPress={() => navigation.navigate('ProductsList')}
        />

        <DashboardTile 
          icon="database" 
          title="Baza produktów" 
          color={theme.colors.accent}
          onPress={() => navigation.navigate('ProductDatabase')}
        />
      </View>
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / 2 - 24;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: tileSize,
    height: tileSize,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tileTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DashboardScreen;