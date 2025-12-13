import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';

export default function ProductReviewForm({ onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Oceń produkt</Text>

      <View style={styles.stars}>
        {[1,2,3,4,5].map(star => (
          <IconButton
            key={star}
            icon={star <= rating ? 'star' : 'star-outline'}
            iconColor="#FFD700"
            size={32}
            onPress={() => setRating(star)}
          />
        ))}
      </View>

      <TextInput
        label="Komentarz"
        value={comment}
        onChangeText={setComment}
        multiline
        style={styles.input}
      />

      <Button
        mode="contained"
        disabled={rating === 0}
        onPress={() => onSubmit({ rating, comment })}
      >
        Zapisz ocenę
      </Button>

      <Button onPress={onCancel}>Anuluj</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12
  },
  input: {
    marginBottom: 12
  }
});
