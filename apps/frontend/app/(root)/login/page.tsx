import { QueryProvider } from "@/app/components/QueryProvider";
import AuthComponent from "./component/AuthComponent";

export default function Login() {

  return (
    <div className="flex h-screen items-center justify-center">
      <QueryProvider>
        <AuthComponent />
      </QueryProvider>
    </div>
  );
}
