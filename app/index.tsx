import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import ItemTransaction from '../components/ItemTransaction';
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle } from 'lucide-react-native';
import CartTransaction from '@/components/CartTransaction';
import { dataTransaction, TransactionData } from '@/assets/data/DataTrasction';
import { dataSaldo, SaldoData } from '@/assets/data/DataSaldo';
import FilterDate from '@/components/FilterDate';

export default function Index() {
  const [allTransactions] = useState<TransactionData[]>(dataTransaction);
  const [saldoData] = useState<SaldoData>(dataSaldo);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>(dataTransaction);

  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1)); // 01/01/2025
  const [endDate, setEndDate] = useState(new Date(2025, 0, 30)); // 30/01/2025

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
        <Text className='text-white text-2xl font-bold'>{dataSaldo.saldo.toLocaleString("ID-id", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}</Text>
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
          <Text className='text-gray-500 text-center mt-10'>Tidak ada transaksi pada rentang tanggal ini.</Text>
        )}

        {/* Spacer untuk FAB */}
        <View className='h-24' />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className='absolute bottom-8 right-8 bg-neutral-900 rounded-full w-14 h-14 items-center justify-center shadow-lg'
        activeOpacity={0.7}
      >
        <Text className='text-white text-3xl font-bold'>+</Text>
      </TouchableOpacity>
    </View>
  );
}
