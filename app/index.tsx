import { dataSaldo, SaldoData } from '@/assets/data/DataSaldo';
import { dataTransaction, TransactionData } from '@/assets/data/DataTrasction';
import CartTransaction from '@/components/CartTransaction';
import FilterDate from '@/components/FilterDate';
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { z } from 'zod';
import ItemTransaction from '../components/ItemTransaction';

export default function Index() {
  const [allTransactions] = useState<TransactionData[]>(dataTransaction);
  const [data] = useState<SaldoData>(dataSaldo);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>(dataTransaction);

  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1)); // 01/01/2025
  const [endDate, setEndDate] = useState(new Date(2025, 0, 30)); // 30/01/2025

  const [errors, setErrors] = useState<{ description?: string; amount?: string; category?: string }>({});

  // Schema validasi Zod
  const transactionSchema = z.object({
    description: z.string().min(1, 'Deskripsi tidak boleh kosong'),
    amount: z.string().min(1, 'Jumlah tidak boleh kosong'),
    category: z.string().min(1, 'Kategori harus dipilih'),
  });

  // State Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const [isOpen, setIsOpen] = useState(false);

  // Fungsi bantu untuk ubah teks "30 Januari 2025" → Date
  const parseDate = (dayString: string) => {
    try {
      const parts = dayString.split(',')[1]?.trim(); // "30 Januari 2025"
      const [day, monthName, year] = parts.split(' ');
      const monthMap: Record<string, number> = {
        Januari: 0,
        Februari: 1,
        Maret: 2,
        April: 3,
        Mei: 4,
        Juni: 5,
        Juli: 6,
        Agustus: 7,
        September: 8,
        Oktober: 9,
        November: 10,
        Desember: 11,
      };
      return new Date(Number(year), monthMap[monthName], Number(day));
    } catch {
      return new Date();
    }
  };

  // Filter data berdasarkan tanggal
  useEffect(() => {
    const filtered = allTransactions.filter((item) => {
      const date = parseDate(item.day);
      return date >= startDate && date <= endDate;
    });
    setFilteredTransactions(filtered);
  }, [startDate, endDate]);

  const handleSubmit = () => {
    const result = transactionSchema.safeParse({
      description,
      amount,
      category,
    });

    if (!result.success) {
      // Ambil pesan error per field
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        description: fieldErrors.description?.[0],
        amount: fieldErrors.amount?.[0],
        category: fieldErrors.category?.[0],
      });
      return;
    }

    // Jika valid
    setErrors({});
    const newTransaction = { description, amount, category };
    console.log('Transaksi baru:', newTransaction);

    setIsModalVisible(false);
    setDescription('');
    setAmount('');
    setCategory('');
  };

  return (
    <View className='flex-1 bg-white px-6 pt-16'>
      {/* Header */}
      <View className='w-full flex-row justify-between items-center mb-6'>
        <Text className='text-2xl font-bold w-56 leading-tight'>Pencatatan Pengeluaran</Text>
        <Image
          source={require('../assets/profile/profile.png')}
          className='w-16 h-16 rounded-full bg-gray-200'
        />
      </View>

      {/* Saldo Utama */}
      <View className='bg-neutral-800 rounded-2xl py-6 mb-6 items-center justify-center'>
        <Text className='text-white text-2xl font-bold'>
          {data.saldo.toLocaleString('ID-id', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </View>

      {/* Filter dan Export */}
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-sm font-semibold text-gray-800'>Semua Transaksi</Text>

        <View className='flex-row gap-2 items-center'>
          <TouchableOpacity className='border border-gray-400 px-2 py-1 rounded-md'>
            <Text className='text-xs font-medium text-gray-800'>export</Text>
          </TouchableOpacity>

          {/* Start Date */}
          <FilterDate
            date={startDate}
            onChange={setStartDate}
          />

          {/* End Date */}
          <FilterDate
            date={endDate}
            onChange={setEndDate}
          />
        </View>
      </View>

      {/* Daftar Transaksi */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className='flex-1'
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transactionDay, index) => (
            <CartTransaction
              key={index}
              day={transactionDay.day}
              amount={transactionDay.amount}
            >
              {transactionDay.transactions.map((item, idx) => (
                <ItemTransaction
                  key={idx}
                  icon={
                    item.category === 'pemasukan' ? (
                      <ArrowDownRightFromCircle
                        size={18}
                        color='white'
                      />
                    ) : (
                      <ArrowUpRightFromCircle
                        size={18}
                        color='white'
                      />
                    )
                  }
                  description={item.description}
                  time={item.time}
                  amount={item.amount}
                />
              ))}
            </CartTransaction>
          ))
        ) : (
          <Text className='text-gray-500 text-center mt-10'>Trasaksi Tidak Di Temukan.</Text>
        )}

        {/* Spacer untuk FAB */}
        <View className='h-24' />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className='absolute bottom-8 right-8 bg-neutral-900 rounded-full w-14 h-14 items-center justify-center shadow-lg'
        activeOpacity={0.7}
        onPress={() => setIsModalVisible(true)}
      >
        <Text className='text-white text-3xl font-bold'>+</Text>
      </TouchableOpacity>

      {/* Modal Tambah Transaksi */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View className='flex-1 bg-black/50 justify-center items-center px-6'>
            <TouchableWithoutFeedback>
              <View className='bg-white w-full rounded-2xl p-6'>
                <Text className='text-xl font-bold mb-4 text-center'>Tambah Transaksi</Text>

                {/* Deskripsi */}
                <View className='mb-3'>
                  <TextInput
                    placeholder='Deskripsi'
                    value={description}
                    onChangeText={setDescription}
                    className='border border-gray-300 rounded-lg px-3 py-2'
                  />
                  {errors.description && <Text className='text-red-500 text-sm'>{errors.description}</Text>}
                </View>

                {/* Jumlah */}
                <View className='mb-3'>
                  <TextInput
                    placeholder='Jumlah'
                    value={amount}
                    onChangeText={setAmount}
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
                        onPress={() => {
                          setCategory('pemasukan');
                          setIsOpen(false);
                        }}
                        className='px-3 py-2 bg-white'
                      >
                        <Text className='text-gray-800'>Pemasukan</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setCategory('pengeluaran');
                          setIsOpen(false);
                        }}
                        className='px-3 py-2 bg-white'
                      >
                        <Text className='text-gray-800'>Pengeluaran</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View className='flex-row justify-between'>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
