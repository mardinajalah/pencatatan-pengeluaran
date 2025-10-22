import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ModalItemValidationTransactionProps {
  desc: string;
  amount: string;
  category: string;
  saldoError?: string;
  hendleClose: () => void;
  handleConfirm: () => void;
}

const ModalItemValidationTransaction: React.FC<ModalItemValidationTransactionProps> = ({ desc, amount, category, hendleClose, handleConfirm, saldoError }) => {
  return (
    <View className='bg-white w-full rounded-2xl p-6'>
      <Text className='text-xl font-bold mb-4 text-center'>Apakah Anda Yakin</Text>

      <View className='mb-6'>
        <Text className='text-gray-700 text-center'>Data yang telah disimpan tidak dapat diubah atau dihapus. Pastikan semua informasi sudah benar sebelum melanjutkan.</Text>
      </View>

      {/* data */}
      <View className='mb-6'>
        <View className='flex-row justify-between mb-2'>
          <Text className='text-gray-600'>Deskripsi:</Text>
          <Text className='text-gray-800 font-semibold'>{desc}</Text>
        </View>
        <View className='flex-row justify-between mb-2'>
          <Text className='text-gray-600'>Jumlah:</Text>
          <Text className='text-gray-800 font-semibold'>Rp {amount}</Text>
        </View>
        <View className='flex-row justify-between'>
          <Text className='text-gray-600'>Kategori:</Text>
          <Text className='text-gray-800 font-semibold'>{category}</Text>
        </View>
      </View>

      {saldoError ? <Text className='text-red-500 text-center my-4 font-medium'>{saldoError}</Text> : null}

      <View className='flex-row justify-between'>
        <TouchableOpacity
          onPress={hendleClose}
          className='bg-gray-300 px-4 py-2 rounded-lg flex-1 mr-2 items-center'
        >
          <Text className='text-gray-800 font-semibold'>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirm}
          className='bg-neutral-900 px-4 py-2 rounded-lg flex-1 ml-2 items-center'
        >
          <Text className='text-white font-semibold'>konfirmasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModalItemValidationTransaction;
