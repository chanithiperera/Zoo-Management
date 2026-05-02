import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/order.api';
import StatusModal from '../../components/ui/StatusModal';



export default function CheckoutScreen({ navigation }) {
  const { cart, totalAmount, clearCart } = useCart();
  const SHIPPING_CHARGE = 250;
  const finalAmount = totalAmount + SHIPPING_CHARGE;
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
  const [cardError, setCardError] = useState('');
  const [expiryError, setExpiryError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'success', title: '', message: '' });



  const SRI_LANKA_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ].sort();

  const validateCardNumberLogic = (number) => {
    return number.length === 16;
  };

  const validateExpiryDateLogic = (expiryStr) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryStr)) return false;
    const [month, year] = expiryStr.split('/').map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!address || !city || !zipCode || !phone) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all shipping details.'
      });
      return;
    }
    if (!cardNumber || !expiry || !cvv) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all payment details.'
      });
      return;
    }

    
    if (!validateCardNumberLogic(cardNumber)) {
      setCardError('Enter a valid 16-digit card number');
      return;
    }

    if (!validateExpiryDateLogic(expiry)) {
      setExpiryError('Enter a valid future expiry date (MM/YY)');
      return;
    }

    if (cvv.length !== 3) {
      setCvvError('CVV must be 3 digits');
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
          price: item.product.price,
          size: item.product.selectedSize
        })),
        totalAmount: finalAmount,
        shippingAddress: { address, city, zipCode, phone }
      };

      await createOrder(orderData);
      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Payment Successful',
        message: 'Your order has been placed successfully! Thank you for shopping with us.'
      });
    } catch (error) {

      console.error('Error placing order', error);
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TextField
          label="Street Address"
          placeholder="Enter your address"
          value={address}
          onChangeText={setAddress}
        />
        
        <Text style={styles.label}>City</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={[styles.dropdownButtonText, !city && { color: '#9E9E9E' }]}>
            {city || 'Select District'}
          </Text>
          <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#666" />
        </TouchableOpacity>

        {dropdownVisible && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
            {SRI_LANKA_DISTRICTS.map(dist => (
              <TouchableOpacity 
                key={dist} 
                style={[styles.dropdownItem, city === dist && styles.selectedDropdownItem]}
                onPress={() => {
                  setCity(dist);
                  setDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownItemText, city === dist && styles.selectedDropdownItemText]}>
                  {dist}
                </Text>
                {city === dist && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            setCardNumber(cleaned);
            if (cleaned.length > 0 && cleaned.length !== 16) {
              setCardError('Enter a valid 16-digit card number');
            } else {
              setCardError('');
            }
          }}
          keyboardType="numeric"
          maxLength={16}
          error={cardError}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TextField
              label="Expiry Date"
              placeholder="MM/YY"
              value={expiry}
              onChangeText={(text) => {
                // Auto format MM/YY
                let formatted = text.replace(/\D/g, '');
                if (formatted.length > 2) {
                  formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
                }
                setExpiry(formatted);
                
                if (formatted.length === 5) {
                  if (!validateExpiryDateLogic(formatted)) {
                    setExpiryError('Invalid date');
                  } else {
                    setExpiryError('');
                  }
                } else {
                  setExpiryError('');
                }
              }}
              maxLength={5}
              error={expiryError}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="CVV"
              placeholder="000"
              value={cvv}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                setCvv(cleaned);
                if (cleaned.length > 0 && cleaned.length !== 3) {
                  setCvvError('CVV must be 3 digits');
                } else {
                  setCvvError('');
                }
              }}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              error={cvvError}
            />
          </View>
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Charge</Text>
            <Text style={styles.summaryValue}>Rs. {SHIPPING_CHARGE.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {finalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <PrimaryButton
          title={loading ? "Processing..." : "Place Order & Pay"}
          onPress={handlePlaceOrder}
          disabled={loading}
          style={styles.payBtn}
        />
      </ScrollView>

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => {
          if (modalConfig.type === 'success') {
            clearCart();
            navigation.navigate('MyOrders');
          }
          setModalConfig({ ...modalConfig, visible: false });
        }}
      />
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  payBtn: {
    marginTop: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    fontWeight: '600',
  },
  label: {
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDropdownItem: {
    backgroundColor: '#E8F5E9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  selectedDropdownItemText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
  },
});
