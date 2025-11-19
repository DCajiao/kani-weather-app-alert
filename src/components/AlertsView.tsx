import { useState } from "react";
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

const AlertsView = () => {
  const [speakingAlertId, setSpeakingAlertId] = useState<string | null>(null);

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

  // Stop speech when component unmounts
  const stopAllSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingAlertId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-danger to-destructive p-6 rounded-b-3xl text-danger-foreground">
        <h1 className="text-2xl font-bold mb-2">Alertas Activas 🚨</h1>
        <p className="text-sm opacity-90">3 alertas requieren tu atención</p>
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
