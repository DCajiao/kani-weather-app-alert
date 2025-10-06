import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Camera, Mic, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const ReportView = () => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [description, setDescription] = useState("");

  const reportTypes = [
    { id: "flooding", icon: "🌊", label: "Inundación" },
    { id: "landslide", icon: "⛰️", label: "Deslizamiento" },
    { id: "rain", icon: "🌧️", label: "Lluvia fuerte" },
    { id: "river", icon: "🏞️", label: "Río crecido" },
    { id: "damage", icon: "🏚️", label: "Daño estructural" },
    { id: "other", icon: "📝", label: "Otro" },
  ];

  const handleSubmit = () => {
    if (!selectedType) {
      toast.error("Por favor selecciona un tipo de evento");
      return;
    }
    toast.success("Reporte enviado exitosamente", {
      description: "Tu reporte ayuda a mantener segura a la comunidad"
    });
    setSelectedType("");
    setDescription("");
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Reportar Evento 📢</h1>
        <p className="text-sm opacity-90">Tu observación ayuda a toda la comunidad</p>
      </div>

      {/* Info Card */}
      <div className="px-6">
        <Card className="p-4 bg-safe/10 border-safe">
          <div className="flex gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="text-sm text-muted-foreground">
                Reporta lo que observas en tu comunidad: ríos crecidos, lluvias intensas, deslizamientos, etc.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Event Type Selection */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">¿Qué está ocurriendo?</h3>
        <div className="grid grid-cols-3 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedType === type.id
                  ? 'border-primary bg-primary text-primary-foreground scale-105'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <p className="text-xs font-medium">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-3">Ubicación</h3>
        <Card className="p-4 border-none shadow-md">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Tu ubicación actual</p>
              <p className="text-xs text-muted-foreground">Comuna 1, Medellín</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              Cambiar
            </Button>
          </div>
        </Card>
      </div>

      {/* Description */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-3">Descripción (opcional)</h3>
        <Textarea
          placeholder="Cuéntanos qué está pasando..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] rounded-2xl resize-none"
        />
      </div>

      {/* Media Upload Options */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-3">Agregar evidencia</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 rounded-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Foto</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 rounded-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <Mic className="w-6 h-6" />
              <span className="text-sm">Audio</span>
            </div>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Las imágenes y audios se comprimen para ahorrar datos
        </p>
      </div>

      {/* Submit Button */}
      <div className="px-6">
        <Button 
          onClick={handleSubmit}
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg"
          disabled={!selectedType}
        >
          <Send className="w-5 h-5 mr-2" />
          Enviar Reporte
        </Button>
      </div>

      {/* Recent Reports */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Reportes Recientes</h3>
        <div className="space-y-3">
          <Card className="p-4 border-none shadow-md">
            <div className="flex gap-3">
              <div className="text-2xl">🌊</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Inundación reportada</p>
                <p className="text-xs text-muted-foreground">Comuna 3 • Hace 20 min</p>
              </div>
              <div className="text-xs text-muted-foreground">+12</div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-md">
            <div className="flex gap-3">
              <div className="text-2xl">🌧️</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Lluvia intensa</p>
                <p className="text-xs text-muted-foreground">Tu zona • Hace 35 min</p>
              </div>
              <div className="text-xs text-muted-foreground">+8</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
