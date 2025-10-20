import { View, Text } from 'react-native';
import React from 'react';

interface CartTransactionProps {
  day: string;
  amount: string;
  children: React.ReactNode;
}

const CartTransaction: React.FC<CartTransactionProps> = ({ day, amount, children }) => {
  return (
    <View className="mb-4">
      {/* Header hari */}
      <View className="flex-row justify-between mb-2">
        <Text className="font-semibold text-gray-800">{day}</Text>
        <Text className="text-gray-700 font-semibold">Rp {amount}</Text>
      </View>

      {/* Daftar transaksi */}
      <View>{children}</View>
    </View>
  );
};

export default CartTransaction;
