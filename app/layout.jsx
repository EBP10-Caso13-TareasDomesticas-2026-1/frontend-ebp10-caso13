// app/layout.jsx
import { AuthProvider } from "@/context/AuthContext";
import { GroupProvider } from "@/context/GroupContext";
import "@/app/globals.css";

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
