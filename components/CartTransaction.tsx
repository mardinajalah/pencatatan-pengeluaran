import React from 'react';
import { Text, View } from 'react-native';

interface CartTransactionProps {
  day: string;
  amount: string;
  children: React.ReactNode;
}

const CartTransaction: React.FC<CartTransactionProps> = ({ day, amount, children }) => {

  return (
    <View className='mb-4'>
      {/* Header hari */}
      <View className='flex-row justify-between mb-2'>
        <Text className='font-semibold text-gray-800'>{day}</Text>
        <Text className={`text-right font-semibold mb-2 ${Number(amount) < 0 ? 'text-red-600' : 'text-green-700'}`}>{Number(amount) < 0 ? `- Rp ${Math.abs(Number(amount.replace(/[^0-9]/g, ''))).toLocaleString('id-ID')}` : `Rp ${Number(amount.replace(/[^0-9]/g, '')).toLocaleString('id-ID')}`}</Text>
      </View>

      {/* Daftar transaksi */}
      <View>{children}</View>
    </View>
  );
};

export default CartTransaction;
