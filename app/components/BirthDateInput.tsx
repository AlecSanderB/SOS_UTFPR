import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "../../util/ThemeContext";
import LabeledInput from "./LabeledInput";

interface Props {
  value: string;
  onChange: (display: string, dbValue: string) => void;
  label?: string;
}

export default function BirthDateInput({ value, onChange, label = "Data de nascimento (DD/MM/YYYY)" }: Props) {
  const [displayValue, setDisplayValue] = useState(value);
  const { theme } = useTheme();

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    let digits = text.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    let formatted = "";

    if (digits.length >= 1) {
      let day = digits.slice(0, 2);
      if (day.length === 2) {
        const dayNum = Math.min(Number(day), 31);
        day = dayNum < 10 ? "0" + dayNum : String(dayNum);
      }
      formatted += day;
      if (digits.length >= 3) formatted += "/";
    }

    if (digits.length >= 3) {
      let month = digits.slice(2, 4);
      if (month.length === 2) {
        const monthNum = Math.min(Number(month), 12);
        month = monthNum < 10 ? "0" + monthNum : String(monthNum);
      }
      formatted += month;
      if (digits.length >= 5) formatted += "/";
    }

    if (digits.length > 4) {
      formatted += digits.slice(4, 8);
    }

    let dbValue = "";
    const parts = formatted.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map((p) => Number(p));
      const today = new Date();
      const inputDate = new Date(year, month - 1, day);
      if (inputDate <= today) {
        dbValue = `${year.toString().padStart(4, "0")}-${month
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      }
    }

    setDisplayValue(formatted);
    onChange(formatted, dbValue);
  };

  return (
    <View>
      <LabeledInput
        label={label}
        value={displayValue}
        keyboardType="number-pad"
        onChangeText={handleChange}
      />
    </View>
  );
}