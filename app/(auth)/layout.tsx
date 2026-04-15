export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003087] to-[#001a4d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            🚔 CivicHero
          </h1>
          <p className="text-blue-200 mt-2">Impara la legalità giocando!</p>
        </div>
        {children}
      </div>
    </div>
  );
}
