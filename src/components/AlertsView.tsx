import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiskBadge, { RiskLevel } from "./RiskBadge";
import { Clock, MapPin, Volume2, VolumeX } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  location: string;
  time: string;
  icon: string;
}

interface ForecastData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    weather_code: number[];
  };
}

const AlertsView = () => {
  const [speakingAlertId, setSpeakingAlertId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>("tu zona");

  // Fetch forecast data and generate alerts
  useEffect(() => {
    const fetchForecastAndGenerateAlerts = async () => {
      try {
        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // Get location name
              try {
                const locationResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
                );
                if (locationResponse.ok) {
                  const locationData = await locationResponse.json();
                  const address = locationData.address;
                  const city = address.city || address.town || address.village || address.municipality || "tu zona";
                  const state = address.state || address.region || "";
                  setLocation(state ? `${city}, ${state}` : city);
                }
              } catch (error) {
                console.error("Error getting location name:", error);
              }

              // Fetch forecast data
              await fetchAndProcessForecast(latitude, longitude);
            },
            async (error) => {
              console.error("Geolocation error:", error);
              // Default to Cali, Valle del Cauca
              setLocation("Cali, Valle del Cauca");
              await fetchAndProcessForecast(3.4516, -76.5320);
            }
          );
        } else {
          // Default to Cali, Valle del Cauca
          setLocation("Cali, Valle del Cauca");
          await fetchAndProcessForecast(3.4516, -76.5320);
        }
      } catch (error) {
        console.error("Error in forecast fetch:", error);
        setIsLoading(false);
      }
    };

    const fetchAndProcessForecast = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code&forecast_days=7`
        );

        if (response.ok) {
          const data: ForecastData = await response.json();
          const generatedAlerts = generateAlertsFromForecast(data);
          setAlerts(generatedAlerts);
        }
      } catch (error) {
        console.error("Error fetching forecast:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastAndGenerateAlerts();
  }, []);

  // Generate alerts based on forecast data
  const generateAlertsFromForecast = (data: ForecastData): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();
    const hourly = data.hourly;

    // Analyze next 7 days
    for (let i = 0; i < hourly.time.length; i++) {
      const forecastTime = new Date(hourly.time[i]);
      const hoursFromNow = Math.round((forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60));

      // Only check future hours
      if (hoursFromNow < 0) continue;

      const precipitation = hourly.precipitation[i];
      const precipProb = hourly.precipitation_probability[i];
      const weatherCode = hourly.weather_code[i];
      const temp = hourly.temperature_2m[i];

      // Check for heavy rain alert
      if (precipitation > 5 && precipProb > 70 && hoursFromNow <= 168) {
        const existing = alerts.find(a => a.id === "heavy-rain");
        if (!existing) {
          alerts.push({
            id: "heavy-rain",
            title: "Lluvias Intensas Esperadas",
            description: `Se esperan precipitaciones de ${precipitation.toFixed(1)}mm con ${precipProb}% de probabilidad en las próximas ${hoursFromNow} horas. Riesgo de inundaciones en zonas bajas.`,
            level: precipitation > 10 ? "danger" : "alert",
            location: location,
            time: `En ${hoursFromNow} hora${hoursFromNow !== 1 ? 's' : ''}`,
            icon: "🌧️"
          });
        }
      }

      // Check for storm alert (weather code 95-99)
      if (weatherCode >= 95 && hoursFromNow <= 168) {
        const existing = alerts.find(a => a.id === "storm");
        if (!existing) {
          alerts.push({
            id: "storm",
            title: "Alerta de Tormenta",
            description: `Se pronostica tormenta eléctrica en las próximas ${hoursFromNow} horas. Busque refugio seguro y evite espacios abiertos.`,
            level: "danger",
            location: location,
            time: `En ${hoursFromNow} hora${hoursFromNow !== 1 ? 's' : ''}`,
            icon: "⛈️"
          });
        }
      }

      // Check for continuous rain (multiple hours)
      if (i < hourly.time.length - 6) {
        let continuousRainHours = 0;
        let totalRain = 0;
        for (let j = i; j < i + 6 && j < hourly.time.length; j++) {
          if (hourly.precipitation[j] > 0) {
            continuousRainHours++;
            totalRain += hourly.precipitation[j];
          }
        }

        if (continuousRainHours >= 4 && totalRain > 15 && hoursFromNow <= 168) {
          const existing = alerts.find(a => a.id === "flooding-risk");
          if (!existing) {
            alerts.push({
              id: "flooding-risk",
              title: "Riesgo de Inundación",
              description: `Se esperan ${continuousRainHours} horas continuas de lluvia con acumulado de ${totalRain.toFixed(1)}mm. Alto riesgo de inundaciones en zonas bajas y cauces de ríos.`,
              level: "danger",
              location: location,
              time: `Inicia en ${hoursFromNow} hora${hoursFromNow !== 1 ? 's' : ''}`,
              icon: "🌊"
            });
          }
        }
      }

      // Check for high precipitation probability
      if (precipProb > 80 && precipitation > 2 && hoursFromNow <= 168) {
        const existing = alerts.find(a => a.id === "rain-warning");
        if (!existing && alerts.length < 3) {
          alerts.push({
            id: "rain-warning",
            title: "Probabilidad Alta de Lluvia",
            description: `${precipProb}% de probabilidad de lluvia en las próximas ${hoursFromNow} horas. Se recomienda llevar paraguas y evitar zonas propensas a encharcamientos.`,
            level: "warning",
            location: location,
            time: `En ${hoursFromNow} hora${hoursFromNow !== 1 ? 's' : ''}`,
            icon: "☔"
          });
        }
      }

      // Check for extreme temperatures
      if (temp > 35 && hoursFromNow <= 168) {
        const existing = alerts.find(a => a.id === "heat-alert");
        if (!existing && alerts.length < 3) {
          alerts.push({
            id: "heat-alert",
            title: "Alerta por Calor Extremo",
            description: `Temperatura de ${temp.toFixed(1)}°C esperada. Manténgase hidratado, evite exposición prolongada al sol y busque lugares frescos.`,
            level: "alert",
            location: location,
            time: `En ${hoursFromNow} hora${hoursFromNow !== 1 ? 's' : ''}`,
            icon: "🌡️"
          });
        }
      }

      // Limit to 5 alerts
      if (alerts.length >= 5) break;
    }

    // If no alerts generated, add a safe status message
    if (alerts.length === 0) {
      alerts.push({
        id: "safe",
        title: "Condiciones Favorables",
        description: "No se esperan condiciones climáticas adversas en los próximos 7 días. Mantente informado sobre actualizaciones del clima.",
        level: "safe",
        location: location,
        time: "Ahora",
        icon: "☀️"
      });
    }

    return alerts;
  };

  const playAlert = (alert: Alert) => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      console.error("Tu navegador no soporta síntesis de voz");
      alert("Tu navegador no soporta la función de lectura de texto");
      return;
    }

    // If already speaking this alert, stop it
    if (speakingAlertId === alert.id) {
      window.speechSynthesis.cancel();
      setSpeakingAlertId(null);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create the text to be spoken
    const textToSpeak = `Alerta: ${alert.title}. ${alert.description}. Ubicación: ${alert.location}. ${alert.time}.`;

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Configure the utterance
    utterance.lang = 'es-ES'; // Spanish language
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Set up event handlers
    utterance.onstart = () => {
      setSpeakingAlertId(alert.id);
    };

    utterance.onend = () => {
      setSpeakingAlertId(null);
    };

    utterance.onerror = (event) => {
      console.error("Error en la síntesis de voz:", event);
      setSpeakingAlertId(null);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-danger to-destructive p-6 rounded-b-3xl text-danger-foreground">
        <h1 className="text-2xl font-bold mb-2">Alertas Activas 🚨</h1>
        <p className="text-sm opacity-90">
          {isLoading
            ? "Cargando alertas..."
            : `${alerts.length} alerta${alerts.length !== 1 ? 's' : ''} ${alerts.length === 1 && alerts[0].level === 'safe' ? '' : 'requieren tu atención'}`
          }
        </p>
      </div>

      {/* Alerts List */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <Card className="p-6 border-none shadow-lg">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">
                Analizando pronóstico del clima...
              </div>
            </div>
          </Card>
        ) : (
          alerts.map((alert) => (
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
                      variant={speakingAlertId === alert.id ? "destructive" : "default"}
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => playAlert(alert)}
                    >
                      {speakingAlertId === alert.id ? (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Detener
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Escuchar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
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
