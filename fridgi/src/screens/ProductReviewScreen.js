import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import {
  getReviewByProductId,
  getExistingReviewByProductId,
  deleteProductReview,
  updateProductReview,
  addProductReview,
} from '../services/productReviewsServices/productReviewsServices';
import ProductReviewForm from '../components/ProductReviewForm';

const ProductReviewScreen = ({ route }) => {
  const { product } = route.params;

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const r = await getExistingReviewByProductId(product.remoteId);
        console.log(product);
        console.log(r);
        setReview(r);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [product.id]);

  const handleDelete = () => {
    Alert.alert(
      'Usuń opinię',
      'Czy na pewno chcesz usunąć tę opinię?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteProductReview(review.reviewId);
            setReview(null);
          },
        },
      ]
    );
  };

  const handleSubmit = async ({ rating, comment }) => {
    if (mode === 'add') {
      const newReview = await addProductReview({
        productId: product.remoteId,
        rating,
        comment,
      });
      setReview(newReview);
    }

    if (mode === 'edit') {
      const updated = await updateProductReview({
        reviewId: review.reviewId,
        rating,
        comment,
      });
      setReview(updated);
    }

    setShowReviewForm(false);
    setMode(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            {product.imageUri && <Card.Cover source={{ uri: product.imageUri }} style={styles.productImage} />}
            <Text variant="titleMedium" style={styles.title}>
              {product.name}
            </Text>
            <Text>{product.brand || 'Brak informacji o marce'}</Text>
            <Text>Kategoria: {product.category || 'Brak'}</Text>
            <Text>Jednostka: {product.unit || 'Brak'}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.title}>
              Twoja opinia
            </Text>

            {review ? (
              <>
                <Text>Ocena: {review.rating} / 5</Text>
                <Text style={{ marginVertical: 8 }}>
                  {review.comment}
                </Text>

                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setMode('edit');
                      setShowReviewForm(true);
                    }}
                  >
                    Edytuj
                  </Button>

                  <Button
                    mode="outlined"
                    textColor="#d32f2f"
                    onPress={handleDelete}
                  >
                    Usuń
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.noReview}>
                  Nie wystawiono jeszcze opinii.
                </Text>

                <Button
                  mode="contained"
                  style={{ marginTop: 12 }}
                  onPress={() => {
                    setMode('add');
                    setShowReviewForm(true);
                  }}
                >
                  Dodaj opinię
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Modal visible={showReviewForm} animationType="slide">
        <ProductReviewForm
          onCancel={() => {
            setShowReviewForm(false);
            setMode(null);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noReview: {
    fontStyle: 'italic',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default ProductReviewScreen;
