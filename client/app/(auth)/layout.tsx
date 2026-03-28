export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background selection:bg-primary/20 flex flex-col">
      {children}
    </div>
  );
}
