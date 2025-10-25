import { SaldoData } from '@/assets/data/DataSaldo';
import { TransactionData } from '@/assets/data/DataTrasction';
import CartTransaction from '@/components/CartTransaction';
import FilterDate from '@/components/FilterDate';
import ModalComponet from '@/components/ModalComponet';
import SkeletonLoader from '@/components/SkeletonLoader';
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import ItemTransaction from '../components/ItemTransaction';
import { EXPO_PUBLIC_BASEURL } from '@env';

// 📦 Import tambahan untuk export Excel
import ModalItemAddTransaction from '@/components/ModalItemAddTransaction';
import ModalItemValidationTransaction from '@/components/ModalItemValidationTransaction';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

import axios from 'axios';

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [allTransactions, setAllTransactions] = useState<TransactionData[]>([]);
  const [data_Saldo, setData_saldo] = useState<SaldoData>({ id: 0, saldo: 0 });
  const [saldoError, setSaldoError] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>(allTransactions);

  // ⏰ Dapatkan bulan & tahun sekarang
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 📅 Tanggal pertama dan terakhir bulan ini
  const [startDate, setStartDate] = useState(new Date(currentYear, currentMonth, 1));
  const [endDate, setEndDate] = useState(new Date(currentYear, currentMonth + 1, 0));

  const [errors, setErrors] = useState<{ description?: string; amount?: string; category?: string }>({});

  const transactionSchema = z.object({
    description: z.string().min(4, 'Deskripsi tidak boleh kosong'),
    amount: z.string().min(1, 'Jumlah tidak boleh kosong'),
    category: z.string().min(1, 'Kategori harus dipilih'),
  });

  const fetchSaldo = async () => {
    try {
      const res = await axios.get(`${EXPO_PUBLIC_BASEURL}/saldo`); // ganti IP sesuai milik kamu
      const saldoData = res.data.data[0];
      setData_saldo(saldoData);
    } catch (error) {
      console.error('Gagal mengambil data saldo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${EXPO_PUBLIC_BASEURL}/transaction`);
      setAllTransactions(res.data.data);
    } catch (error) {
      console.error('Gagal mengambil transaksi:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulasi loading, bisa kamu ganti dengan fetch data asli nanti
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStartDate(new Date(currentYear, currentMonth, 1));
    setEndDate(new Date(currentYear, currentMonth + 1, 0));

    fetchSaldo()
    fetchTransactions()

    setRefreshing(false);
  };

  // simulasi loading pertama kali
  useEffect(() => {
    fetchSaldo();
    fetchTransactions();
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
    const cleanAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    const today = new Date();
    const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });
    const day = `${dayName}, ${today.getDate()} ${today.toLocaleDateString('id-ID', {
      month: 'long',
    })} ${today.getFullYear()}`;

    try {
      let saldoSekarang = data_Saldo.saldo;
      let saldoBaru = saldoSekarang;

      if (category === 'pengeluaran') {
        if (saldoSekarang < cleanAmount) {
          setSaldoError('Saldo tidak mencukupi untuk melakukan transaksi ini.');
          return;
        }
        saldoBaru -= cleanAmount;
      } else if (category === 'pemasukan') {
        saldoBaru += cleanAmount;
      }

      // 🔹 Kirim transaksi ke backend
      const res = await axios.post(`${EXPO_PUBLIC_BASEURL}/transaction`, {
        day: today.toISOString(),
        amount: cleanAmount,
        transactions: [
          {
            category,
            description,
            time: today.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            amount: cleanAmount,
          },
        ],
      });

      if (res.status === 201) {
        // 🔹 Update saldo di backend
        await axios.put(`${EXPO_PUBLIC_BASEURL}/saldo/${data_Saldo.id}`, {
          saldo: saldoBaru,
        });

        // 🔹 Refresh saldo dan transaksi
        const [saldoRes, transaksiRes] = await Promise.all([axios.get(`${EXPO_PUBLIC_BASEURL}/saldo`), axios.get(`${EXPO_PUBLIC_BASEURL}/transaction`)]);

        setData_saldo(saldoRes.data.data[0]);
        setAllTransactions(transaksiRes.data.data);

        // 🔹 Reset modal
        setIsModalVisible(false);
        setValidated(false);
        setDescription('');
        setAmount('');
        setCategory('');
        setErrors({});
        setSaldoError('');
      } else {
        Alert.alert('Gagal', 'Transaksi gagal ditambahkan.');
      }
    } catch (error) {
      console.error('Gagal menambahkan transaksi:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menambahkan transaksi.');
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000']} // warna spinner (Android)
            tintColor='#000' // warna spinner (iOS)
          />
        }
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
            {data_Saldo.saldo.toLocaleString('ID-id', {
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
            hendleClose={() => {
              setValidated(false);
              setSaldoError('');
            }}
            handleConfirm={handleConfirmSubmittion}
            saldoError={saldoError}
          />
        )}
      </ModalComponet>
    </View>
  );
}
