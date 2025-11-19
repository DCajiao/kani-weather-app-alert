import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiskBadge from "./RiskBadge";
import { MapPin, Layers, Navigation } from "lucide-react";

const MapView = () => {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Mapa de Riesgo 🗺️</h1>
        <p className="text-sm opacity-90">Vista de tu comunidad</p>
      </div>

      {/* Map Legend */}
      <div className="px-6">
        <Card className="p-4 border-none shadow-md">
          <h3 className="font-semibold mb-3 text-sm">Niveles de Riesgo</h3>
          <div className="flex gap-4 justify-around">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-safe" />
              <span className="text-xs">Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-alert" />
              <span className="text-xs">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-danger" />
              <span className="text-xs">Peligro</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Map Placeholder */}
      <div className="px-6">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
          {/* Simulated map view */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <MapPin className="w-16 h-16 mx-auto text-primary animate-bounce" />
                <p className="text-muted-foreground">
                  Vista interactiva del mapa
                </p>
                <p className="text-xs text-muted-foreground">
                  Muestra capas de precipitación, niveles de ríos y zonas de riesgo
                </p>
              </div>
            </div>
            
            {/* Sample risk zones */}
            <div className="absolute top-1/4 left-1/4 w-20 h-20 rounded-full bg-alert/30 animate-pulse" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-danger/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-safe/30 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Floating controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button size="icon" className="rounded-full shadow-lg bg-card text-foreground hover:bg-card/90">
              <Layers className="w-5 h-5" />
            </Button>
            <Button size="icon" className="rounded-full shadow-lg bg-card text-foreground hover:bg-card/90">
              <Navigation className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Nearby Points of Interest */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Puntos Importantes Cercanos</h3>
        <div className="space-y-3">
          <Card className="p-4 border-none shadow-md">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏥</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Centro de Salud La Floresta</p>
                <p className="text-xs text-muted-foreground">0.8 km • Abierto 24h</p>
              </div>
              <RiskBadge level="safe" size="sm" />
            </div>
          </Card>

          <Card className="p-4 border-none shadow-md">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏫</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Refugio Temporal - Escuela</p>
                <p className="text-xs text-muted-foreground">1.2 km • Capacidad: 200</p>
              </div>
              <RiskBadge level="safe" size="sm" />
            </div>
          </Card>

          <Card className="p-4 border-none shadow-md">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Zona de Riesgo - Quebrada</p>
                <p className="text-xs text-muted-foreground">0.5 km • Evitar en lluvia</p>
              </div>
              <RiskBadge level="danger" size="sm" />
            </div>
          </Card>
        </div>
      </div>

      {/* Map Info */}
      <div className="px-6">
        <Card className="p-4 bg-muted border-none">
          <p className="text-xs text-muted-foreground text-center">
            Datos actualizados hace 10 minutos • Fuente: Open Meteo
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
