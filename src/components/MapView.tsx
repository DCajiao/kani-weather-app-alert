import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiskBadge from "./RiskBadge";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type RiskLevel = "safe" | "warning" | "alert" | "danger";

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}

const MapView = () => {
  const [location, setLocation] = useState<string>("Obteniendo ubicación...");
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: 3.4516, // Default: Cali
    lon: -76.532
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("safe");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate risk level based on weather data
  const calculateRiskLevel = (weather: WeatherData): RiskLevel => {
    const { precipitation, windSpeed, weatherCode } = weather;

    // Danger: Heavy rain, storms, or extreme conditions
    if (precipitation > 10 || windSpeed > 50 || weatherCode >= 95) {
      return "danger";
    }

    // Alert: Moderate rain or concerning conditions
    if (precipitation > 5 || windSpeed > 30 || (weatherCode >= 61 && weatherCode <= 67)) {
      return "alert";
    }

    // Warning: Light rain or mild conditions
    if (precipitation > 2 || windSpeed > 20 || (weatherCode >= 51 && weatherCode <= 57)) {
      return "warning";
    }

    // Safe: Good conditions
    return "safe";
  };

  // Get color based on risk level
  const getRiskColor = (level: RiskLevel): { fill: string; stroke: string } => {
    switch (level) {
      case "safe":
        return { fill: "rgba(34, 197, 94, 0.3)", stroke: "rgba(34, 197, 94, 0.6)" }; // green
      case "warning":
        return { fill: "rgba(234, 179, 8, 0.3)", stroke: "rgba(234, 179, 8, 0.6)" }; // yellow
      case "alert":
        return { fill: "rgba(249, 115, 22, 0.3)", stroke: "rgba(249, 115, 22, 0.6)" }; // orange
      case "danger":
        return { fill: "rgba(239, 68, 68, 0.3)", stroke: "rgba(239, 68, 68, 0.6)" }; // red
      default:
        return { fill: "rgba(34, 197, 94, 0.3)", stroke: "rgba(34, 197, 94, 0.6)" };
    }
  };

  // Draw heat map on canvas
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = getRiskColor(riskLevel);

    // Draw outer circle (2km radius representation)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // Outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle (1km radius representation)
    const innerRadius = outerRadius * 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = colors.fill.replace('0.3', '0.2');
    ctx.fill();
    ctx.strokeStyle = colors.stroke.replace('0.6', '0.4');
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw center marker
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = colors.stroke;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [riskLevel, isLoading]);

  // Get user location and weather data
  useEffect(() => {
    const getLocationAndWeather = async () => {
      if (!navigator.geolocation) {
        setLocation("Cali, Valle del Cauca");
        setIsLoading(false);
        await fetchWeatherData(3.4516, -76.532);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });

          try {
            // Get location name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
            );

            if (response.ok) {
              const data = await response.json();
              const address = data.address;
              const city = address.city || address.town || address.village || address.municipality || "Ubicación";
              const state = address.state || address.region || "";
              setLocation(state ? `${city}, ${state}` : city);
            } else {
              setLocation("Cali, Valle del Cauca");
            }
          } catch (error) {
            console.error("Error getting location:", error);
            setLocation("Cali, Valle del Cauca");
          }

          // Fetch weather data
          await fetchWeatherData(latitude, longitude);
        },
        async (error) => {
          console.error("Geolocation error:", error);
          setLocation("Cali, Valle del Cauca");
          await fetchWeatherData(3.4516, -76.532);
        }
      );
    };

    getLocationAndWeather();
  }, []);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`
      );

      if (response.ok) {
        const data = await response.json();
        const current = data.current;

        const weather: WeatherData = {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          precipitation: current.precipitation,
          windSpeed: current.wind_speed_10m,
          weatherCode: current.weather_code
        };

        setWeatherData(weather);
        const risk = calculateRiskLevel(weather);
        setRiskLevel(risk);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get static map URL from OpenStreetMap
  const getStaticMapUrl = () => {
    const zoom = 13;
    const width = 600;
    const height = 600;
    // Using StaticMap API from OpenStreetMap
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.02},${coordinates.lat - 0.02},${coordinates.lon + 0.02},${coordinates.lat + 0.02}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Mapa de Riesgo 🗺️</h1>
        <p className="text-sm opacity-90">Vista de tu comunidad</p>
      </div>

      {/* Current Location & Risk */}
      <div className="px-6">
        <Card className="p-4 border-none shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Tu ubicación</p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Cargando..." : location}
                </p>
              </div>
            </div>
            <RiskBadge level={riskLevel} />
          </div>
        </Card>
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
              <div className="w-4 h-4 rounded-full bg-warning" />
              <span className="text-xs">Precaución</span>
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

      {/* Interactive Map with Heat Overlay */}
      <div className="px-6">
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : 'aspect-square'} rounded-3xl overflow-hidden shadow-xl`}>
          {!isLoading && (
            <>
              {/* OpenStreetMap iframe */}
              <iframe
                src={getStaticMapUrl()}
                className="w-full h-full border-0 pointer-events-none"
                title="Mapa de ubicación"
              />

              {/* Heat map overlay */}
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
              />

              {/* Fullscreen toggle */}
              <Button
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-lg"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>

              {/* Legend overlay */}
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <p className="text-xs font-semibold mb-1">Radio de análisis</p>
                <p className="text-xs text-muted-foreground">Círculo: 2km</p>
                <p className="text-xs text-muted-foreground">Centro: Tu ubicación</p>
              </div>
            </>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <MapPin className="w-16 h-16 mx-auto text-primary animate-bounce" />
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weather Details */}
      {weatherData && (
        <div className="px-6">
          <h3 className="text-lg font-semibold mb-4">Condiciones Actuales</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-none shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Temperatura</p>
              <p className="text-2xl font-bold">{weatherData.temperature.toFixed(1)}°C</p>
            </Card>
            <Card className="p-4 border-none shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Humedad</p>
              <p className="text-2xl font-bold">{weatherData.humidity}%</p>
            </Card>
            <Card className="p-4 border-none shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Precipitación</p>
              <p className="text-2xl font-bold">{weatherData.precipitation.toFixed(1)}mm</p>
            </Card>
            <Card className="p-4 border-none shadow-md">
              <p className="text-xs text-muted-foreground mb-1">Viento</p>
              <p className="text-2xl font-bold">{weatherData.windSpeed.toFixed(1)} km/h</p>
            </Card>
          </div>
        </div>
      )}

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
            Datos actualizados en tiempo real • Fuente: Open-Meteo & OpenStreetMap
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
