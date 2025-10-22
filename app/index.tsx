import { dataSaldo, SaldoData } from '@/assets/data/DataSaldo';
import { dataTransaction, TransactionData } from '@/assets/data/DataTrasction';
import CartTransaction from '@/components/CartTransaction';
import FilterDate from '@/components/FilterDate';
import ModalComponet from '@/components/ModalComponet';
import SkeletonLoader from '@/components/SkeletonLoader';
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import ItemTransaction from '../components/ItemTransaction';

// 📦 Import tambahan untuk export Excel
import ModalItemAddTransaction from '@/components/ModalItemAddTransaction';
import ModalItemValidationTransaction from '@/components/ModalItemValidationTransaction';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [allTransactions, setAllTransactions] = useState<TransactionData[]>(dataTransaction);
  const [data] = useState<SaldoData>(dataSaldo);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>(dataTransaction);

  const [startDate, setStartDate] = useState(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState(new Date(2025, 0, 30));

  const [errors, setErrors] = useState<{ description?: string; amount?: string; category?: string }>({});

  const transactionSchema = z.object({
    description: z.string().min(4, 'Deskripsi tidak boleh kosong'),
    amount: z.string().min(1, 'Jumlah tidak boleh kosong'),
    category: z.string().min(1, 'Kategori harus dipilih'),
  });

  // simulasi loading pertama kali
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // 2 detik
    return () => clearTimeout(timer);
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const parseDate = (dayString: string) => {
    try {
      const parts = dayString.split(',')[1]?.trim();
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

  useEffect(() => {
    const filtered = allTransactions.filter((item) => {
      const date = parseDate(item.day);
      return date >= startDate && date <= endDate;
    });
    setFilteredTransactions(filtered);
  }, [startDate, endDate, allTransactions]);

  const handleExportExcel = async () => {
    try {
      const rows: any[] = [];
      filteredTransactions.forEach((group) => {
        group.transactions.forEach((t) => {
          rows.push({
            Tanggal: group.day,
            Waktu: t.time,
            Deskripsi: t.description,
            Jumlah: t.amount,
            Kategori: t.category,
          });
        });
      });

      if (rows.length === 0) {
        Alert.alert('Tidak ada data', 'Tidak ada transaksi yang dapat diexport.');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const dir = FileSystem.documentDirectory;
      const fileUri = `${dir}transaksi.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Gagal export Excel:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat export Excel.');
    }
  };

  const handleSubmit = () => {
    const result = transactionSchema.safeParse({ description, amount, category });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        description: fieldErrors.description?.[0],
        amount: fieldErrors.amount?.[0],
        category: fieldErrors.category?.[0],
      });
      return;
    }

    setValidated(true);
  };

  const handleConfirmSubmittion = async () => {
    setIsModalVisible(false);
    setValidated(false);

    const cleanAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    const newTransaction = {
      id: Date.now(),
      description,
      amount: cleanAmount.toString(),
      category,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const today = new Date();
    const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });
    const day = `${dayName}, ${today.getDate()} ${today.toLocaleDateString('id-ID', {
      month: 'long',
    })} ${today.getFullYear()}`;

    try {
      setAllTransactions((prev) => {
        const existingDay = prev.find((t) => t.day === day);

        if (existingDay) {
          return prev.map((t) => {
            if (t.day === day) {
              const updatedTransactions = [...t.transactions, newTransaction];
              const total = updatedTransactions.reduce((acc, curr) => acc + parseInt(curr.amount), 0);
              return {
                ...t,
                transactions: updatedTransactions,
                amount: `Rp ${total.toLocaleString('id-ID')}`,
              };
            }
            return t;
          });
        } else {
          return [
            {
              id: prev.length + 1,
              day,
              amount: `Rp ${cleanAmount.toLocaleString('id-ID')}`,
              transactions: [newTransaction],
            },
            ...prev,
          ];
        }
      });

      setDescription('');
      setAmount('');
      setCategory('');
      setErrors({});
      console.log('✅ Transaksi baru ditambahkan:', newTransaction);
    } catch (error) {
      console.error('Gagal menambahkan transaksi:', error);
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <View className='flex-1 bg-white'>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className='w-full flex-row justify-between items-center mb-6'>
          <Text className='text-2xl font-bold w-56 leading-tight'>Pencatatan Pengeluaran</Text>
          <Image
            source={require('../assets/profile/profile.png')}
            className='w-16 h-16 rounded-full bg-gray-200'
          />
        </View>

        {/* Saldo */}
        <View className='bg-neutral-800 rounded-2xl py-6 mb-6 items-center justify-center'>
          <Text className='text-white text-2xl font-bold'>
            {data.saldo.toLocaleString('ID-id', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            })}
          </Text>
        </View>

        {/* Filter dan Export */}
        <View className='flex-row justify-between items-center mb-4'>
          <Text className='text-sm font-semibold text-gray-800'>Semua Transaksi</Text>
          <View className='flex-row gap-2 items-center'>
            <TouchableOpacity
              className='border border-gray-400 px-2 py-1 rounded-md'
              onPress={handleExportExcel}
            >
              <Text className='text-xs font-medium text-gray-800'>Export Excel</Text>
            </TouchableOpacity>
            <FilterDate
              date={startDate}
              onChange={setStartDate}
            />
            <FilterDate
              date={endDate}
              onChange={setEndDate}
            />
          </View>
        </View>

        {/* Daftar Transaksi */}
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
          <Text className='text-gray-500 text-center mt-10'>Transaksi tidak ditemukan.</Text>
        )}
      </ScrollView>

      {/* FAB Tambah Transaksi */}
      <TouchableOpacity
        className='absolute bottom-8 right-8 bg-neutral-900 rounded-full w-14 h-14 items-center justify-center shadow-lg'
        activeOpacity={0.7}
        onPress={() => setIsModalVisible(true)}
      >
        <Text className='text-white text-3xl font-bold'>+</Text>
      </TouchableOpacity>

      {/* Modal Tambah Transaksi */}
      <ModalComponet
        isModalVisible={isModalVisible}
        handleIsModalVisible={() => setIsModalVisible(false)}
      >
        {!validated ? (
          <ModalItemAddTransaction
            description={description}
            amount={amount}
            category={category}
            errors={errors}
            handleDescription={(text) => {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            handleAmount={(text) => {
              setAmount(text);
              setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            handleCategory={(text) => {
              setCategory(text);
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            handleIsModalVisible={() => {
              setIsModalVisible(false);
              setErrors({});
              setDescription('');
              setAmount('');
              setCategory('');
            }}
            handleSubmit={handleSubmit}
          />
        ) : (
          <ModalItemValidationTransaction
            desc={description}
            amount={amount}
            category={category}
            hendleClose={() => setValidated(false)}
            handleConfirm={handleConfirmSubmittion}
          />
        )}
      </ModalComponet>
    </View>
  );
}
