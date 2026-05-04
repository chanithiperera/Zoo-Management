import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryListScreen from '../screens/store/CategoryListScreen';
import ProductListScreen from '../screens/store/ProductListScreen';
import ProductDetailsScreen from '../screens/store/ProductDetailsScreen';
import CartScreen from '../screens/store/CartScreen';
import CheckoutScreen from '../screens/store/CheckoutScreen';
import MyOrdersScreen from '../screens/store/MyOrdersScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function StoreStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: 'Online Store' }} />
      <Stack.Screen name="ProductList" component={ProductListScreen} options={({ route }) => ({ title: route.params.categoryName })} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
    </Stack.Navigator>
  );
}
