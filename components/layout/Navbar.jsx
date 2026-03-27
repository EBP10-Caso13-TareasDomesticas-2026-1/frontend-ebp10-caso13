import Logo from "@/components/ui/Logo";

export default function Navbar({ children }) {
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">

        <Logo size="md" />

        {/* AQUÍ VA LO DINÁMICO */}
        <div className="flex items-center gap-3">
          {children}
        </div>

      </div>
    </nav>
  );
}