import CenteredLayout from "@/components/layout/CenteredLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function TestCenteredPage() {
  return (
    <CenteredLayout
      navbarContent={
        <Button variant="primary">Registrarse</Button>
      }
    >
      <div className="card flex flex-col gap-4 text-center">

        <h2>Crear tu grupo familiar</h2>
        <p className="text-sm text-secondary">
          Organiza las tareas de tu hogar con tu familia en un solo lugar.
        </p>

        <Input
          label="Nombre del grupo"
          placeholder="Ej: Familia García"
        />

        <Button className="w-full">
          Crear grupo
        </Button>

        <Button variant="secondary" className="w-full">
          Cancelar
        </Button>

      </div>
    </CenteredLayout>
  );
}