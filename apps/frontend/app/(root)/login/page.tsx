// "use client";
// import { auth, provider } from "@/firebase";
// import { signInWithPopup } from "firebase/auth";
// import { useRouter } from "next/router";
import Navigate from "./component/navigate";

export default function Login() {
  // const router = useRouter();

  // const handleLogin = async () => {
  //   const result = await signInWithPopup(auth, provider);
  //   console.log("User:", result.user);
  //   router.push("/dashboard");
  // };

  return (
    <div className="flex h-screen items-center justify-center">
      {/* <button onClick={handleLogin} className="bg-blue-500 text-white p-3 rounded">
        Sign in with Google
      </button> */}
      <Navigate />
    </div>
  );
}
