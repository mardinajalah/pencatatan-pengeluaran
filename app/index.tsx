import { dataSaldo, SaldoData } from '@/assets/data/DataSaldo';
import { dataTransaction, TransactionData } from '@/assets/data/DataTrasction';
import CartTransaction from '@/components/CartTransaction';
import FilterDate from '@/components/FilterDate';
import ModalComponet from '@/components/ModalComponet';
import ModalItemAddTransaction from '@/components/ModalItemAddTransaction';
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import ItemTransaction from '../components/ItemTransaction';

// 📦 Import tambahan untuk export Excel
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

export default function Index() {
  const [allTransactions] = useState<TransactionData[]>(dataTransaction);
  const [data] = useState<SaldoData>(dataSaldo);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>(dataTransaction);

  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState(new Date(2025, 0, 30));

  const [errors, setErrors] = useState<{ description?: string; amount?: string; category?: string }>({});

  // Schema validasi Zod
  const transactionSchema = z.object({
    description: z.string().min(4, 'Deskripsi tidak boleh kosong'),
    amount: z.string().min(1, 'Jumlah tidak boleh kosong'),
    category: z.string().min(1, 'Kategori harus dipilih'),
  });

  // State Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Fungsi bantu ubah teks tanggal → Date
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

  // Filter data transaksi berdasar tanggal
  useEffect(() => {
    const filtered = allTransactions.filter((item) => {
      const date = parseDate(item.day);
      return date >= startDate && date <= endDate;
    });
    setFilteredTransactions(filtered);
  }, [startDate, endDate]);

  // 🧾 Fungsi export Excel
  const handleExportExcel = async () => {
    try {
      // 1️⃣ Flatten data transaksi agar bisa ditulis ke sheet
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

      // 2️⃣ Buat worksheet & workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

      // 3️⃣ Konversi ke base64
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      const dir = FileSystem.documentDirectory;
      if (!dir) {
        Alert.alert('Gagal', 'Tidak dapat mengakses direktori dokumen.');
        return;
      }
      const fileUri = `${dir}transaksi.xlsx`;

      // 5️⃣ Tulis file sebagai base64
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });

      // 6️⃣ Bagikan
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
          {/* 🔽 Tombol Export Excel */}
          <TouchableOpacity
            className='border border-gray-400 px-2 py-1 rounded-md'
            onPress={handleExportExcel}
          >
            <Text className='text-xs font-medium text-gray-800'>Export Excel</Text>
          </TouchableOpacity>

          {/* Start & End Date */}
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
          <Text className='text-gray-500 text-center mt-10'>Transaksi tidak ditemukan.</Text>
        )}
        <View className='h-24' />
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
          handleIsModalVisible={() => setIsModalVisible(false)}
          handleSubmit={handleSubmit}
        />
      </ModalComponet>
    </View>
  );
}
