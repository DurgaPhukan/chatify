"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
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
import { getAuthToken } from "@/app/utils/getAuthToken";
import { cn } from "@/lib/utils";
import Combobox from "./ComboBox";
import DateTimePicker from "./DateTimePicker";

// Types
export type User = {
  id: string;
  name: string;
  email: string;
};

type BroadcastData = {
  title: string;
  description: string;
  startTime: Date | null;
  endTime: Date | null;
  visibility: string;
  creatorId: string
  members?: string[]
};

// Combobox component to replace Command component


// API function to fetch users
const fetchUsers = async (searchQuery: string = ""): Promise<User[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authorization token is missing");
  }

  try {
    const response = await axios.get('http://localhost:4000/auth/users', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 20,
        search: searchQuery || undefined // Only send `search` if it has a value
      }
    });
    console.log("resss", response)
    return response.data.data.users; // Adjust response path if necessary
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      console.error('Invalid pagination parameters:', error.response.data);
    }
    throw error;
  }
};

const CreateBroadcast = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [startTimeError, setStartTimeError] = useState<string>("");
  const [endTimeError, setEndTimeError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [creatorId, setCreatorId] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();


  const getCreatorIdFromToken = () => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1])); // Decode JWT payload
        return payload.sub; // Assuming `creatorId` is in the token payload
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  // Query for users
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => fetchUsers(searchTerm),
    enabled: open,
    staleTime: 5000,
  });

  console.log("pew pew", users)

  const validateStartTime = (date: Date | null) => {
    if (!date) return;

    const now = new Date();
    now.setSeconds(0, 0); // Remove seconds and milliseconds for precise comparison.

    if (date <= now) {
      setStartTimeError("Start time must be greater than the current time");
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

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const createBroadcast = useMutation({
    mutationFn: async (broadcastData: BroadcastData) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      return axios.post(
        "http://localhost:4000/broadcasts",
        {
          ...broadcastData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      console.log("Broadcast created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime(null);
      setEndTime(null);
      setSelectedUsers([]);
      setStartTimeError("");
      setEndTimeError("");
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
      creatorId,
      members: selectedUsers.map(user => user.id),
    });
  };

  useEffect(() => {
    const id = getCreatorIdFromToken();
    if (id) {
      setCreatorId(id);
    } else {
      const router = useRouter();
      router.push("/login");
    }
  }, []);

  // Component for date and time selection


  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Create a Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <DateTimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartTimeChange}
              error={startTimeError}
              minDate={new Date()}
            />

            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={handleEndTimeChange}
              error={endTimeError}
              minDate={startTime || new Date()}
              minTime={startTime ? format(startTime, "HH:mm") : undefined}
            />
          </div>

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

          <div className="space-y-2">
            <Label>Select Users</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedUsers.length > 0
                    ? `${selectedUsers.length} users selected`
                    : "Select users..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Combobox
                  users={users}
                  isLoading={isLoading}
                  selectedUsers={selectedUsers}
                  onSelect={handleUserSelect}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                />
              </PopoverContent>
            </Popover>
          </div>

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