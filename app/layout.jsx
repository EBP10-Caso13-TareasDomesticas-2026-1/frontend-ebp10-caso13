// app/layout.jsx
import { AuthProvider } from "@/context/AuthContext";
import { GroupProvider } from "@/context/GroupContext";
import { TaskProvider } from "@/context/TaskContext";
import "@/app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <GroupProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
          </GroupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
