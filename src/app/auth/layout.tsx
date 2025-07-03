import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
       <div className="absolute top-4 left-4">
         <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
          >
            <Home className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-semibold">SEBENZA</h1>
          </Link>
       </div>
      {children}
    </div>
  );
}
