import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Stethoscope } from "lucide-react";

export default function PublicLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-cyan-50 text-gray-800 flex flex-col">
      {/* 🔹 NAVBAR SUPERIOR */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-cyan-100 fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-cyan-600" />
            <span className="text-xl font-semibold text-cyan-700">MedConnect</span>
          </Link>

         
        </div>
      </nav>

      {/* 🔹 HERO */}
      <header className="pt-32 pb-20 px-6 sm:px-10 text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          <Badge className="bg-cyan-600 text-white hover:bg-cyan-700">Tu salud, conectada</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Gestiona tu atención médica desde cualquier lugar
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Agenda citas, recibe recordatorios y mantén comunicación directa con tu profesional de salud.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/patient-portal">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-base px-6 py-3">
                Ir al Portal del Paciente
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 text-base px-6 py-3">
                Soy profesional médico
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 sm:px-10 space-y-20 pb-28 mt-6">
        {/* BENEFICIOS */}
        <section id="beneficios" className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Beneficios para pacientes</h2>
            <p className="text-gray-600 mt-2">
              Todo lo que necesitas para gestionar tu atención médica en un solo lugar.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Reserva de citas",
                text: "Solicita y gestiona citas fácilmente. Recibe confirmaciones al instante.",
              },
              {
                title: "Recordatorios",
                text: "Recibe notificaciones automáticas para no olvidar tus citas o tratamientos.",
              },
              {
                title: "Historia médica",
                text: "Consulta tu información médica compartida por tu profesional.",
              },
              {
                title: "Mensajería segura",
                text: "Comunícate directamente con tu médico desde un entorno protegido.",
              },
            ].map((item, i) => (
              <Card key={i} className="transition-all hover:shadow-md hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-700">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">{item.text}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">¿Cómo funciona?</h2>
            <p className="text-gray-600">Tres pasos sencillos para empezar.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "1. Solicita tu cita", text: "Accede al portal y selecciona la fecha y motivo de tu consulta." },
              { title: "2. Confirma tu atención", text: "Tu profesional aprueba o ajusta la cita según disponibilidad." },
              { title: "3. Recibe recordatorios", text: "Te avisamos antes de la cita y puedes dejar comentarios después." },
            ].map((item, i) => (
              <Card key={i} className="transition hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-cyan-700">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">{item.text}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="opiniones" className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros usuarios</h2>
            <p className="text-gray-600">Experiencias reales de pacientes satisfechos.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { text: "Reservé mi cita en minutos y recibí recordatorios automáticos. Súper práctico.", author: "— Carla M." },
              { text: "Pude chatear con mi doctor sin esperar días para una respuesta. Excelente servicio.", author: "— Andrés R." },
            ].map((item, i) => (
              <Card key={i} className="transition hover:shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <blockquote className="italic text-gray-700">“{item.text}”</blockquote>
                  <p className="mt-3 text-sm text-gray-500">{item.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="faq" className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="text-gray-600">Resuelve tus dudas más comunes.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Necesito una cuenta para usar el portal?</AccordionTrigger>
              <AccordionContent>
                Puedes agendar citas básicas sin registro, pero con una cuenta accederás a más funcionalidades.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Cómo recibiré las notificaciones?</AccordionTrigger>
              <AccordionContent>
                Recibirás alertas dentro del portal y, si lo configuras, también por correo o mensaje de texto.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Puedo cancelar o reprogramar una cita?</AccordionTrigger>
              <AccordionContent>
                Sí, desde tu perfil puedes cancelar o cambiar la fecha con un solo clic (según la política del profesional).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

       
        <section id="cta" className="max-w-5xl mx-auto text-center">
          <Card className="bg-cyan-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Comienza hoy mismo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-cyan-50">
                Da el primer paso hacia una gestión médica más cómoda y conectada.
              </p>
              <Link to="/patient-portal">
                <Button className="bg-white text-cyan-700 hover:bg-cyan-50 font-medium">
                  Acceder al Portal del Paciente
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="px-6 sm:px-10 py-10 text-center text-sm text-gray-500 border-t border-cyan-100 bg-white/60 backdrop-blur-sm">
        © {new Date().getFullYear()} <span className="font-semibold text-cyan-700">MedConnect</span>. Todos los derechos reservados.
      </footer>
    </div>
  );
}
