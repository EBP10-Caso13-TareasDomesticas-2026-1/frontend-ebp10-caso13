
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children, navbarContent, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar>{navbarContent}</Navbar>

      <main className={fullWidth ? "flex-1 w-full px-0 py-0" : "flex-1 page-container"}>
        {children}
      </main>

      <Footer />
    </div>
  );
}