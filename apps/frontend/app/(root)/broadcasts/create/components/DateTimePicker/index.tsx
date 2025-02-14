"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

// Types
import { CalendarIcon, Clock } from "lucide-react";

const DateTimePicker = ({
  value,
  onChange,
  label,
  error,
  minDate,
  minTime
}: {
  value: Date | null;
  onChange: (date: Date | undefined, time?: string) => void;
  label: string;
  error?: string;
  minDate?: Date;
  minTime?: string;
}) => {
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Time options for the select dropdown (30-minute intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });


  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value as Date}
              onSelect={(date) => onChange(date, selectedTime)}
              disabled={(date) =>
                minDate
                  ? date < new Date(new Date(minDate).setDate(minDate.getDate() - 1))
                  : date < new Date(new Date().setDate(new Date().getDate() - 1))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select
          value={selectedTime}
          onValueChange={(time) => {
            setSelectedTime(time);
            onChange(value ?? undefined, time);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select time">
              {selectedTime || <Clock className="h-4 w-4" />}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem
                key={time}
                value={time}
                disabled={minTime ? time < minTime : false}
              >
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default DateTimePicker