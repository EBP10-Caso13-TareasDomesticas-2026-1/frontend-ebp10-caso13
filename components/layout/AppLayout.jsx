
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children, navbarContent }) {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar>{navbarContent}</Navbar>

      <main className="flex-1 page-container">
        {children}
      </main>

      <Footer />
    </div>
  );
}