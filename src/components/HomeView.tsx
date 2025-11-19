import { useState, useEffect } from "react";
import RiskBadge, { RiskLevel } from "./RiskBadge";
import { CloudRain, Wind, Thermometer, Droplets, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HomeViewProps {
  onTabChange: (tab: string) => void;
}

const HomeView = ({ onTabChange }: HomeViewProps) => {
  // Simulated current risk level
  const currentRisk: RiskLevel = "alert";

  // Location state
  const [location, setLocation] = useState<string>("Obteniendo ubicación...");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  const weatherData = [
    { icon: CloudRain, label: "Precipitación", value: "65%", color: "text-primary" },
    { icon: Wind, label: "Viento", value: "15 km/h", color: "text-muted-foreground" },
    { icon: Thermometer, label: "Temperatura", value: "28°C", color: "text-alert" },
    { icon: Droplets, label: "Humedad", value: "82%", color: "text-primary" }
  ];

  // Get user's location on component mount
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setLocation("Cali, Valle del Cauca");
        setIsLoadingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
            );

            if (response.ok) {
              const data = await response.json();
              const address = data.address;

              // Try to get city and state/department
              const city = address.city || address.town || address.village || address.municipality || "Ubicación";
              const state = address.state || address.region || "";

              setLocation(state ? `${city}, ${state}` : city);
            } else {
              setLocation("Cali, Valle del Cauca");
            }
          } catch (error) {
            console.error("Error al obtener la ubicación:", error);
            setLocation("Cali, Valle del Cauca");
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Error de geolocalización:", error);
          setLocation("Cali, Valle del Cauca");
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    };

    getLocation();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">¡Hola, Comunidad! 👋</h1>
        <p className="text-sm opacity-90 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {isLoadingLocation ? (
            <span className="animate-pulse">Obteniendo ubicación...</span>
          ) : (
            location
          )}
        </p>
      </div>

      {/* Current Risk Status */}
      <div className="px-6">
        <Card className="p-6 bg-gradient-to-br from-card to-muted border-none shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Estado Actual</h2>
              <RiskBadge level={currentRisk} size="lg" />
            </div>
            <div className="text-5xl">⚠️</div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Posibles lluvias intensas en las próximas 6 horas. Mantente atento a las actualizaciones.
          </p>
        </Card>
      </div>

      {/* Weather Conditions */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Condiciones Actuales</h3>
        <div className="grid grid-cols-2 gap-4">
          {weatherData.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="p-4 border-none shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
        <div className="space-y-3">
          <Button
            onClick={() => onTabChange("alerts")}
            className="w-full justify-start h-auto py-4 px-5 bg-danger hover:bg-danger/90 text-danger-foreground rounded-2xl shadow-lg"
          >
            <span className="text-2xl mr-3">🚨</span>
            <div className="text-left">
              <p className="font-semibold">Ver Alertas Activas</p>
              <p className="text-xs opacity-90">2 alertas en tu zona</p>
            </div>
          </Button>

          <Button
            onClick={() => onTabChange("prepare")}
            className="w-full justify-start h-auto py-4 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg"
          >
            <span className="text-2xl mr-3">🎒</span>
            <div className="text-left">
              <p className="font-semibold">Revisar Kit de Emergencia</p>
              <p className="text-xs opacity-90">Prepárate con anticipación</p>
            </div>
          </Button>

          <Button
            onClick={() => onTabChange("map")}
            className="w-full justify-start h-auto py-4 px-5 bg-safe hover:bg-safe/90 text-safe-foreground rounded-2xl shadow-lg"
          >
            <span className="text-2xl mr-3">📍</span>
            <div className="text-left">
              <p className="font-semibold">Encontrar Refugio Cercano</p>
              <p className="text-xs opacity-90">3 refugios disponibles</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Educational Tip */}
      <div className="px-6">
        <Card className="p-5 bg-accent text-accent-foreground border-none shadow-md">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold mb-1">¿Sabías qué?</h4>
              <p className="text-sm opacity-90">
                Durante lluvias intensas, evita cruzar corrientes de agua. 15 cm de agua en movimiento pueden derribar a una persona.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeView;
