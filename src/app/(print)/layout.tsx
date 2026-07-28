export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-3xl px-6 py-8 print:p-0">{children}</div>;
}
