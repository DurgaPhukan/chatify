import { Check } from "lucide-react";
import { User } from "../CreateBroadcast";
import { cn } from "@/lib/utils";

const Combobox = ({
  users,
  isLoading,
  selectedUsers,
  onSelect,
  searchTerm,
  onSearch
}: {
  users: User[];
  isLoading: boolean;
  selectedUsers: User[];
  onSelect: (user: User) => void;
  searchTerm: string;
  onSearch: (value: string) => void;
}) => {
  return (
    <div className="w-full p-2">
      <div className="flex items-center border rounded-md px-3 py-2">
        <input
          className="w-full outline-none bg-transparent"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="mt-2 max-h-60 overflow-auto">
        {isLoading ? (
          <div className="p-2 text-sm text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No users found.</div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <button
                key={user.id}
                className={cn(
                  "w-full flex items-center px-2 py-1.5 text-sm rounded-md",
                  "hover:bg-gray-100 transition-colors",
                  selectedUsers.some((u) => u.id === user.id) && "bg-gray-50"
                )}
                onClick={() => onSelect(user)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUsers.some((u) => u.id === user.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex flex-col items-start">
                  <span>{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Combobox