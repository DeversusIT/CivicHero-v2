import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#001030]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
