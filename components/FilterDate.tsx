import { TouchableOpacity, Text } from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

interface FilterDateProps {
  date: Date;
  onChange: (date: Date) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({ date, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) onChange(selectedDate);
  };

  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <TouchableOpacity
        className="border border-gray-400 px-2 py-1 rounded-md"
        onPress={() => setShowPicker(true)}
      >
        <Text className="text-xs text-gray-600">{formatDate(date)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default FilterDate;