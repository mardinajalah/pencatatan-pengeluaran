import { View, Text } from 'react-native';
import React from 'react';

interface ItemTransactionProps {
  icon: React.ReactNode;
  description: string;
  time: string;
  amount: string;
}

const ItemTransaction: React.FC<ItemTransactionProps> = ({
  icon,
  description,
  time,
  amount,
}) => {
  return (
    <View className="bg-gray-100 rounded-xl p-3 flex-row justify-between items-center mb-2">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center">
          {icon}
        </View>
        <View>
          <Text className="text-gray-800 font-semibold">{description}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>
      <Text className="text-gray-900 font-bold">Rp {amount}</Text>
    </View>
  );
};

export default ItemTransaction;
