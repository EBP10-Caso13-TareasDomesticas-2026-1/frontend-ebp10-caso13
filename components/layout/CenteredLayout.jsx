
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function CenteredLayout({ children, navbarContent }) {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar>{navbarContent}</Navbar>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="form-container">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}