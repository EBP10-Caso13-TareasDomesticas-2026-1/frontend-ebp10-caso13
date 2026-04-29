// app/layout.jsx
import { AuthProvider } from "@/context/AuthContext";
import { GroupProvider } from "@/context/GroupContext";
import "@/app/globals.css";

export const metadata = {
  title: "homesync",
  description: "Organiza las tareas de tu hogar con tu familia",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <GroupProvider>
            {children}
          </GroupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
