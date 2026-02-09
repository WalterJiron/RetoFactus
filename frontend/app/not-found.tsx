"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background to-default-100 px-4">
      {/* Glow decorativo */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-warning/20 blur-3xl" />

      <Card className="relative w-full max-w-xl border border-default-200/50 bg-background/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-4 pt-10">
          {/* Ícono */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <AlertTriangle size={32} />
          </div>

          {/* Código */}
          <h1 className="text-6xl font-extrabold tracking-tight">404</h1>

          {/* Título */}
          <p className="text-xl font-semibold text-default-600">
            Página no encontrada
          </p>
        </CardHeader>

        <CardBody className="flex flex-col items-center gap-6 pb-10 text-center">
          <p className="max-w-md text-default-500">
            La ruta que intentaste visitar no existe, fue eliminada o no tienes
            permisos para acceder a ella.
          </p>

          <Button
            color="primary"
            size="lg"
            startContent={<ArrowLeft size={18} />}
            className="shadow-lg transition-transform hover:scale-105"
            onPress={() => router.back()}
          >
            Volver a la página anterior
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
