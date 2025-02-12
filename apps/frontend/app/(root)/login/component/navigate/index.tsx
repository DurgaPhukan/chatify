"use client"; // Ensure this is a Client Component
import { useRouter } from "next/navigation";

const Navigate = () => {
  const router = useRouter(); // ✅ Correct way in App Router

  return <button onClick={() => router.push("/dashboard")}>Go to Dashboard</button>;
};

export default Navigate;
