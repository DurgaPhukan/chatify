"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";

type BroadcastData = {
  title: string;
  description: string;
  startTime: Date | null;
  endTime: Date | null;
  visibility: string;
};

type BroadcastResponse = {
  id: string;
} & BroadcastData;

const CreateBroadcast = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [startTimeError, setStartTimeError] = useState<string>("");
  const [endTimeError, setEndTimeError] = useState<string>("");
  const router = useRouter();

  // Time options for the select dropdown (30-minute intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const validateStartTime = (date: Date | null) => {
    if (!date) return;
    const now = new Date();
    if (date <= now) {
      setStartTimeError("Start time must be greater than or equal to current time");
      return false;
    }
    setStartTimeError("");
    return true;
  };

  const validateEndTime = (date: Date | null) => {
    if (!date || !startTime) return;
    if (date <= startTime) {
      setEndTimeError("End time must be greater than start time");
      return false;
    }
    setEndTimeError("");
    return true;
  };

  const handleStartTimeChange = (date: Date | undefined, timeStr?: string) => {
    if (!date) {
      setStartTime(null);
      return;
    }

    const newDate = new Date(date);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      newDate.setHours(hours, minutes);
    }

    if (validateStartTime(newDate)) {
      setStartTime(newDate);
      // Clear end time if it's now invalid
      if (endTime && endTime <= newDate) {
        setEndTime(null);
      }
    }
  };

  const handleEndTimeChange = (date: Date | undefined, timeStr?: string) => {
    if (!date) {
      setEndTime(null);
      return;
    }

    const newDate = new Date(date);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      newDate.setHours(hours, minutes);
    }

    if (validateEndTime(newDate)) {
      setEndTime(newDate);
    }
  };

  const createBroadcast = useMutation<
    BroadcastResponse,
    Error,
    BroadcastData,
    unknown
  >({
    mutationFn: async (broadcastData: BroadcastData) => {
      console.log("========================>>>>", broadcastData)
      const response: AxiosResponse<BroadcastResponse> = await axios.post("http://localhost:4000/broadcasts",
        {
          title: broadcastData.title,
          description: broadcastData.description,
          startTime: new Date(broadcastData.startTime as Date),
          endTime: new Date(broadcastData.endTime as Date),
          visibility: broadcastData.visibility,
          creatorId: "67acb608ab120cae75b60ed6",
        },
        {
          headers: {
            // Authorization: `Bearer ${token}`, // Add auth token in the request
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbmpveW9mZmljYWxwQGdtYWlsLmNvbSIsInN1YiI6IjY3YWNiNjA4YWIxMjBjYWU3NWI2MGVkNiIsImlhdCI6MTczOTM3NTcwOCwiZXhwIjoxNzM5Mzc5MzA4fQ.OS1WHRfGO8maSmHjgiP33kSxLI3D2h6svD-cw0lrcCA"
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      console.log("Broadcast created successfully!");
      setTitle("")
      setDescription("")
      setStartTime(null)
      setEndTime(null)
      setStartTimeError("")
      setEndTimeError("")
    },
    onError: (error: Error) => {
      console.error("Error creating broadcast:", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTimeError || endTimeError) return;

    createBroadcast.mutate({
      title,
      description,
      startTime,
      endTime,
      visibility,
    });
  };

  interface DateTimePickerProps {
    value: Date | null;
    onChange: (date: Date | undefined, time?: string) => void;
    label: string;
    error?: string;
    minDate?: Date;
    minTime?: string;
  }

  const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    label,
    error,
    minDate,
    minTime
  }) => {
    const [selectedTime, setSelectedTime] = useState<string>("");

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
                {value ? format(value, "PPP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value as Date}
                onSelect={(date) => onChange(date, selectedTime)}
                disabled={(date) =>
                  minDate ? date < minDate : date < new Date()
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

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Create a Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter broadcast title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter broadcast description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <DateTimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartTimeChange}
              error={startTimeError}
              minDate={new Date()}
            />

            {/* End Time */}
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={handleEndTimeChange}
              error={endTimeError}
              minDate={startTime || new Date()}
              minTime={startTime ? format(startTime, "HH:mm") : undefined}
            />
          </div>

          {/* Visibility */}
          <div>
            <Label>Visibility</Label>
            <Select onValueChange={setVisibility} value={visibility}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              className="w-full"
              disabled={createBroadcast.isPending || !!startTimeError || !!endTimeError}
            >
              {createBroadcast.isPending ? "Creating..." : "Create Broadcast"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBroadcast;