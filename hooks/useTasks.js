import { useContext } from "react";
import { TaskContext } from "@/context/TaskContext";

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks debe usarse dentro de <TaskProvider>");
  }

  return context;
}
