import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllOrders } from '../../../api/order.api';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import AccountDrawerLayout from '../../../components/profile/AccountDrawerLayout';
import AdminModuleHero from '../../../components/admin/AdminModuleHero';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from '../adminNavigation';

export default function AdminStoreDashboard({ navigation }) {
  const route = useRoute();
  const hero = useMemo(() => getAdminModuleHeroByRouteName(route.name), [route.name]);
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchPendingCount();
    }, [])
  );

  const fetchPendingCount = async () => {
    try {
      const response = await getAllOrders();
      const orders = response.data.data || [];
      const pending = orders.filter(o => o.orderStatus === 'pending').length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error fetching pending count', error);
    }
  };

  const menuItems = [
    {
      title: 'Manage Products',
      description: 'Add, edit or remove products and manage inventory stock.',
      icon: 'cube-outline',
      screen: 'ManageProducts'
    },
    {
      title: 'Manage Orders',
      description: 'View and process customer orders, update delivery status.',
      icon: 'receipt-outline',
      screen: 'ManageOrders',
      showBadge: true
    },
  ];

  const drawerMenuItems = React.useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  return (
    <AccountDrawerLayout
      headerTitle={hero?.title ?? 'Store admin'}
      headerTitleNumberOfLines={2}
      drawerMenuItems={drawerMenuItems}
    >
      {hero ? <AdminModuleHero title={hero.title} subtitle={hero.subtitle} /> : null}

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>

            <View style={styles.rightAction}>
              {item.showBadge && pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  menuList: {
    gap: 16,
  },
  menuItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuContent: {
    flex: 1,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    lineHeight: 18,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

