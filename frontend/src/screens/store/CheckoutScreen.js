import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/order.api';

export default function CheckoutScreen({ navigation }) {
  const { cart, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handlePlaceOrder = async () => {
    if (!address || !city || !zipCode || !phone) {
      Alert.alert('Validation Error', 'Please fill in all shipping details.');
      return;
    }
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert('Validation Error', 'Please fill in all payment details.');
      return;
    }
    if (cardNumber.length < 16) {
      Alert.alert('Validation Error', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount,
        shippingAddress: { address, city, zipCode, phone }
      };

      await createOrder(orderData);
      
      Alert.alert(
        'Success',
        'Your order has been placed successfully!',
        [{ text: 'OK', onPress: () => {
          clearCart();
          navigation.navigate('MyOrders');
        }}]
      );
    } catch (error) {
      console.error('Error placing order', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TextField
          label="Street Address"
          placeholder="Enter your address"
          value={address}
          onChangeText={setAddress}
        />
        <TextField
          label="City"
          placeholder="Enter your city"
          value={city}
          onChangeText={setCity}
        />
        <TextField
          label="Zip Code"
          placeholder="Enter zip code"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
        />
        <TextField
          label="Phone Number"
          placeholder="Enter phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (text.length > 0 && text.length !== 10) {
              setPhoneError('Phone number must be exactly 10 digits');
            } else {
              setPhoneError('');
            }
          }}
          keyboardType="phone-pad"
          maxLength={10}
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        <Text style={styles.sectionTitle}>Payment Details</Text>
        <TextField
          label="Card Number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={16}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TextField
              label="Expiry Date"
              placeholder="MM/YY"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="CVV"
              placeholder="000"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{cart.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <PrimaryButton
          title={loading ? "Processing..." : "Place Order & Pay"}
          onPress={handlePlaceOrder}
          disabled={loading}
          style={styles.payBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  orderSummary: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Dosis_600SemiBold',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Dosis_700Bold',
  },
  payBtn: {
    marginTop: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    fontFamily: 'Dosis_600SemiBold',
  },
});
