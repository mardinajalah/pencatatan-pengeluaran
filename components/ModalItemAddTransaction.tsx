import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ItemModalAddTransactionProps {
  description: string;
  amount: string;
  category: string;
  errors: {
    description?: string;
    amount?: string;
    category?: string;
  };
  handleDescription: (text: string) => void;
  handleAmount: (text: string) => void;
  handleCategory: (text: string) => void;
  handleIsModalVisible: () => void;
  handleSubmit: () => void;
}

const ModalItemAddTransaction: React.FC<ItemModalAddTransactionProps> = ({description, amount, category, errors, handleDescription, handleAmount, handleCategory, handleIsModalVisible, handleSubmit}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectCategory = (selected: string) => {
    handleCategory(selected);
    setIsOpen(false);
  };
  
  return (
    <View className='bg-white w-full rounded-2xl p-6'>
      <Text className='text-xl font-bold mb-4 text-center'>Tambah Transaksi</Text>

      {/* Deskripsi */}
      <View className='mb-3'>
        <TextInput
          placeholder='Deskripsi'
          value={description}
          onChangeText={handleDescription}
          className='border border-gray-300 rounded-lg px-3 py-2'
        />
        {errors.description && <Text className='text-red-500 text-sm'>{errors.description}</Text>}
      </View>

      {/* Jumlah */}
      <View className='mb-3'>
        <TextInput
          placeholder='Jumlah'
          value={amount}
          onChangeText={handleAmount}
          keyboardType='numeric'
          className='border border-gray-300 rounded-lg px-3 py-2'
        />
        {errors.amount && <Text className='text-red-500 text-sm'>{errors.amount}</Text>}
      </View>

      {/* Dropdown kategori */}
      <View className='relative mb-3'>
        <View>
          <TouchableOpacity
            onPress={() => setIsOpen(!isOpen)}
            className='border border-gray-300 rounded-lg px-3 py-2 flex-row justify-between items-center'
          >
            <Text className='text-gray-800'>{category ? (category === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran') : 'Pilih Kategori'}</Text>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </TouchableOpacity>
          {errors.category && <Text className='text-red-500 text-sm'>{errors.category}</Text>}
        </View>
        {isOpen && (
          <View className='absolute -bottom-20 w-full z-10 border border-gray-300 rounded-lg mb-4 overflow-hidden'>
            <TouchableOpacity
              onPress={() => selectCategory('pemasukan')}
              className='px-3 py-2 bg-white'
            >
              <Text className='text-gray-800'>Pemasukan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectCategory('pengeluaran')}
              className='px-3 py-2 bg-white'
            >
              <Text className='text-gray-800'>Pengeluaran</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className='flex-row justify-between'>
        <TouchableOpacity
          onPress={handleIsModalVisible}
          className='bg-gray-300 px-4 py-2 rounded-lg flex-1 mr-2 items-center'
        >
          <Text className='text-gray-800 font-semibold'>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className='bg-neutral-900 px-4 py-2 rounded-lg flex-1 ml-2 items-center'
        >
          <Text className='text-white font-semibold'>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModalItemAddTransaction;
