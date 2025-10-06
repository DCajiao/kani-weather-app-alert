import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiskBadge, { RiskLevel } from "./RiskBadge";
import { Clock, MapPin, Volume2 } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  location: string;
  time: string;
  icon: string;
}

const AlertsView = () => {
  const alerts: Alert[] = [
    {
      id: "1",
      title: "Lluvias Intensas Esperadas",
      description: "Se esperan precipitaciones de 80-120mm en las próximas 6 horas. Riesgo de inundaciones en zonas bajas.",
      level: "danger",
      location: "Medellín y área metropolitana",
      time: "Hace 15 minutos",
      icon: "🌧️"
    },
    {
      id: "2",
      title: "Nivel de Río en Aumento",
      description: "El río Medellín presenta niveles elevados. Evite acercarse a las orillas.",
      level: "alert",
      location: "Ribera del río Medellín",
      time: "Hace 1 hora",
      icon: "🌊"
    },
    {
      id: "3",
      title: "Monitoreo de Deslizamientos",
      description: "Suelo saturado en laderas. Mantenga precaución en zonas de alta pendiente.",
      level: "alert",
      location: "Comuna 1, 3 y 8",
      time: "Hace 2 horas",
      icon: "⛰️"
    }
  ];

  const playAlert = () => {
    // Placeholder for audio playback
    console.log("Playing alert audio narration");
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-danger to-destructive p-6 rounded-b-3xl text-danger-foreground">
        <h1 className="text-2xl font-bold mb-2">Alertas Activas 🚨</h1>
        <p className="text-sm opacity-90">3 alertas requieren tu atención</p>
      </div>

      {/* Filter Options */}
      <div className="px-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="default" size="sm" className="rounded-full whitespace-nowrap">
            Todas
          </Button>
          <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
            Alta Prioridad
          </Button>
          <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
            Mi Zona
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-6 space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-5 border-none shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{alert.icon}</div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg leading-tight">{alert.title}</h3>
                  <RiskBadge level={alert.level} size="sm" />
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {alert.description}
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{alert.time}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl"
                    onClick={playAlert}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Escuchar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 rounded-xl"
                  >
                    Ver detalles
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="px-6">
        <Card className="p-5 bg-safe text-safe-foreground border-none">
          <h3 className="font-semibold mb-3">Contactos de Emergencia</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>📞 Cruz Roja:</span>
              <span className="font-semibold">132</span>
            </div>
            <div className="flex justify-between">
              <span>🚒 Bomberos:</span>
              <span className="font-semibold">119</span>
            </div>
            <div className="flex justify-between">
              <span>🚨 Defensa Civil:</span>
              <span className="font-semibold">144</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlertsView;
