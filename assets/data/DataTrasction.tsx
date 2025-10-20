export const dataTransaction = [
  {
    id: 1,
    day: 'Hari Ini, 30 Januari 2025',
    amount: '347.000',
    transactions: [
      {
        id: 1,
        category: 'pemasukan',
        description: 'kiriman',
        time: '10:00 AM',
        amount: '350.000',
      },
      {
        id: 2,
        category: 'pengeluaran',
        description: 'Makan Siang',
        time: '12:30 PM',
        amount: '13.000',
      },
      {
        id: 3,
        category: 'pengeluaran',
        description: 'Ngopi',
        time: '03:00 PM',
        amount: '25.000',
      }
    ],
  },
  {
    id: 2,
    day: 'Senin, 29 Januari 2025',
    amount: '150.000',
    transactions: [
      {
        id: 1,
        category: 'pengeluaran',
        description: 'Transportasi',
        time: '09:00 AM',
        amount: '20.000',
      },
      {
        id: 2,
        category: 'pengeluaran',
        description: 'Belanja Bulanan',
        time: '05:00 PM',
        amount: '130.000',
      },
      {
        id: 3,
        category: 'pengeluaran',
        description: 'makan malam',
        time: '07:30 PM',
        amount: '15.000',
      }
    ],
  },
  {
    id: 3,
    day: 'Minggu, 28 Januari 2025',
    amount: '500.000',
    transactions: [
      {
        id: 1,
        category: 'pemasukan',
        description: 'gaji',
        time: '09:00 AM',
        amount: '500.000',
      },
      {
        id: 2,
        category: 'pengeluaran',
        description: 'jajan',
        time: '02:00 PM',
        amount: '50.000',
      },
      {
        id: 3,
        category: 'pengeluaran',
        description: 'makan siang',
        time: '12:30 PM',
        amount: '30.000',
      }
    ],
  }
];

export type TransactionData = {
  id: number;
  day: string;
  amount: string;
  transactions: {
    id: number;
    category: string;
    description: string;
    time: string;
    amount: string;
  }[];
}