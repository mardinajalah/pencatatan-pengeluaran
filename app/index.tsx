import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import ItemTransaction from "../components/ItemTransaction";
import { ArrowDownRightFromCircle, ArrowUpRightFromCircle } from "lucide-react-native";
import CartTransaction from "@/components/CartTransaction";
import { dataTransaction, TransactionData } from "@/assets/data/DataTrasction";

export default function Index() {
  const [dataTransactions] = React.useState<TransactionData[]>(dataTransaction);

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Header */}
      <View className="w-full flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold w-56 leading-tight">
          Pencatatan Pengeluaran
        </Text>
        <Image
          source={require("../assets/profile/profile.png")}
          className="w-16 h-16 rounded-full bg-gray-200"
        />
      </View>

      {/* Saldo Utama */}
      <View className="bg-neutral-800 rounded-2xl py-6 mb-6 items-center justify-center">
        <Text className="text-white text-2xl font-bold">Rp 350.000</Text>
      </View>

      {/* Filter dan Export */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-semibold text-gray-800">
          Semua Transaksi
        </Text>

        <View className="flex-row gap-2 items-center">
          <TouchableOpacity className="border border-gray-400 px-2 py-1 rounded-md">
            <Text className="text-xs font-medium text-gray-800">export</Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-400 px-2 py-1 rounded-md">
            <Text className="text-xs text-gray-600">01/01/2025</Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-400 px-2 py-1 rounded-md">
            <Text className="text-xs text-gray-600">01/30/2025</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daftar Transaksi */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {dataTransactions.map((transactionDay, index) => (
          <CartTransaction
            key={index}
            day={transactionDay.day}
            amount={transactionDay.amount}
          >
            {transactionDay.transactions.map((item, idx) => (
              <ItemTransaction
                key={idx}
                icon={
                  item.category === "pemasukan" ? (
                    <ArrowDownRightFromCircle size={18} color="white" />
                  ) : (
                    <ArrowUpRightFromCircle size={18} color="white" />
                  )
                }
                description={item.description}
                time={item.time}
                amount={item.amount}
              />
            ))}
          </CartTransaction>
        ))}

        {/* Spacer untuk FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-neutral-900 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        activeOpacity={0.7}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
