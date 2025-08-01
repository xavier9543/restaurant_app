import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProtectedRoute>
        <Navigation />
        {children}
      </ProtectedRoute>
      <Toaster />
    </>
  );
}
