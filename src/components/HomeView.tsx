import { useState, useEffect } from "react";
import RiskBadge, { RiskLevel } from "./RiskBadge";
import { CloudRain, Wind, Thermometer, Droplets, MapPin, Cloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HomeViewProps {
  onTabChange: (tab: string) => void;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
}

const HomeView = ({ onTabChange }: HomeViewProps) => {
  // Location state
  const [location, setLocation] = useState<string>("Obteniendo ubicación...");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  // Coordinates state
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Function to determine risk level based on weather conditions
  const getRiskLevel = (weather: WeatherData | null): RiskLevel => {
    if (!weather) return "safe";

    // High risk conditions
    if (weather.precipitation > 10 || weather.windSpeed > 50 || weather.weatherCode >= 95) {
      return "danger";
    }

    // Medium risk conditions
    if (weather.precipitation > 5 || weather.windSpeed > 30 || weather.weatherCode >= 80) {
      return "alert";
    }

    // Low risk conditions
    if (weather.precipitation > 0 || weather.windSpeed > 20 || weather.weatherCode >= 60) {
      return "warning";
    }

    return "safe";
  };

  // Function to get weather description based on weather code
  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Cielo despejado";
    if (code <= 3) return "Parcialmente nublado";
    if (code <= 48) return "Niebla";
    if (code <= 57) return "Llovizna";
    if (code <= 67) return "Lluvia";
    if (code <= 77) return "Nieve";
    if (code <= 82) return "Chubascos";
    if (code <= 86) return "Chubascos de nieve";
    return "Tormenta";
  };

  // Function to get weather emoji based on weather code
  const getWeatherEmoji = (code: number): string => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌦️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "🌨️";
    return "⛈️";
  };

  // Get user's location and weather data
  useEffect(() => {
    const getLocationAndWeather = async () => {
      if (!navigator.geolocation) {
        // Default to Cali, Valle del Cauca
        const defaultLat = 3.4516;
        const defaultLon = -76.5320;
        setLocation("Cali, Valle del Cauca");
        setCoordinates({ lat: defaultLat, lon: defaultLon });
        setIsLoadingLocation(false);
        await fetchWeatherData(defaultLat, defaultLon);
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
            console.error("Error al obtener la ubicación:", error);
            setLocation("Cali, Valle del Cauca");
          } finally {
            setIsLoadingLocation(false);
          }

          // Fetch weather data
          await fetchWeatherData(latitude, longitude);
        },
        async (error) => {
          console.error("Error de geolocalización:", error);
          // Default to Cali, Valle del Cauca
          const defaultLat = 3.4516;
          const defaultLon = -76.5320;
          setLocation("Cali, Valle del Cauca");
          setCoordinates({ lat: defaultLat, lon: defaultLon });
          setIsLoadingLocation(false);
          await fetchWeatherData(defaultLat, defaultLon);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    };

    const fetchWeatherData = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m`
        );

        if (response.ok) {
          const data = await response.json();
          const current = data.current;

          setWeatherData({
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            precipitation: current.precipitation,
            weatherCode: current.weather_code,
            cloudCover: current.cloud_cover
          });
        }
      } catch (error) {
        console.error("Error al obtener datos del clima:", error);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    getLocationAndWeather();
  }, []);

  const currentRisk = getRiskLevel(weatherData);

  const weatherConditions = [
    {
      icon: CloudRain,
      label: "Precipitación",
      value: isLoadingWeather ? "..." : `${weatherData?.precipitation || 0} mm`,
      color: "text-primary"
    },
    {
      icon: Wind,
      label: "Viento",
      value: isLoadingWeather ? "..." : `${weatherData?.windSpeed.toFixed(1) || 0} km/h`,
      color: "text-muted-foreground"
    },
    {
      icon: Thermometer,
      label: "Temperatura",
      value: isLoadingWeather ? "..." : `${weatherData?.temperature.toFixed(1) || 0}°C`,
      color: "text-alert"
    },
    {
      icon: Droplets,
      label: "Humedad",
      value: isLoadingWeather ? "..." : `${weatherData?.humidity || 0}%`,
      color: "text-primary"
    }
  ];

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
            <div className="text-5xl">
              {isLoadingWeather ? "🌍" : getWeatherEmoji(weatherData?.weatherCode || 0)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {isLoadingWeather
              ? "Cargando información del clima..."
              : weatherData
                ? `${getWeatherDescription(weatherData.weatherCode)}. ${currentRisk === "danger"
                  ? "Condiciones peligrosas, mantente alerta."
                  : currentRisk === "alert"
                    ? "Posibles condiciones adversas en las próximas horas. Mantente atento a las actualizaciones."
                    : currentRisk === "warning"
                      ? "Condiciones variables, mantente informado."
                      : "Condiciones favorables en tu zona."
                }`
                : "No se pudo obtener información del clima."
            }
          </p>
        </Card>
      </div>

      {/* Weather Conditions */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Condiciones Actuales</h3>
        <div className="grid grid-cols-2 gap-4">
          {weatherConditions.map((item, index) => {
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
