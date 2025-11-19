import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { CheckCircle2, Circle, Volume2, VolumeX } from "lucide-react";

interface ChecklistItem {
  id: string;
  icon: string;
  label: string;
  completed: boolean;
}

interface PrepareViewProps {
  onTabChange: (tab: string) => void;
}

const PrepareView = ({ onTabChange }: PrepareViewProps) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", icon: "💧", label: "Agua potable (3 litros por persona)", completed: false },
    { id: "2", icon: "🍞", label: "Alimentos no perecederos", completed: false },
    { id: "3", icon: "🔦", label: "Linterna con pilas", completed: false },
    { id: "4", icon: "📻", label: "Radio portátil", completed: false },
    { id: "5", icon: "💊", label: "Botiquín de primeros auxilios", completed: false },
    { id: "6", icon: "📱", label: "Cargador portátil", completed: false },
    { id: "7", icon: "📄", label: "Documentos importantes", completed: false },
    { id: "8", icon: "👕", label: "Cambio de ropa", completed: false },
    { id: "9", icon: "🧴", label: "Artículos de higiene", completed: false },
    { id: "10", icon: "💰", label: "Dinero en efectivo", completed: false },
  ]);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  // Audio guide function
  const playAudioGuide = () => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      alert("Tu navegador no soporta la función de lectura de texto");
      return;
    }

    // If already speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Build the audio guide text
    let guideText = `Guía de audio para tu kit de emergencia. `;
    guideText += `Has completado ${completedCount} de ${checklist.length} elementos. `;

    if (progress === 100) {
      guideText += `¡Excelente! Tu kit está completo. `;
    } else {
      guideText += `Faltan ${checklist.length - completedCount} elementos por preparar. `;
    }

    guideText += `A continuación, la lista de elementos: `;

    // Add each item with its status
    checklist.forEach((item, index) => {
      guideText += `${index + 1}. ${item.label}. `;
      if (item.completed) {
        guideText += `Completado. `;
      } else {
        guideText += `Pendiente. `;
      }
    });

    guideText += `Recuerda revisar y renovar los elementos de tu kit cada 6 meses. `;
    guideText += `Mantente preparado ante cualquier emergencia.`;

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(guideText);

    // Configure the utterance
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Error en la síntesis de voz:", event);
      setIsSpeaking(false);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-safe to-accent p-6 rounded-b-3xl text-safe-foreground">
        <h1 className="text-2xl font-bold mb-2">Centro de Preparación 🎒</h1>
        <p className="text-sm opacity-90">Lista para estar listo ante emergencias</p>
      </div>

      {/* Progress Card */}
      <div className="px-6">
        <Card className="p-5 bg-gradient-to-br from-primary to-accent text-primary-foreground border-none shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Tu Progreso</h3>
            <span className="text-2xl font-bold">{completedCount}/{checklist.length}</span>
          </div>
          <div className="w-full h-3 bg-primary-foreground/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-foreground transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm mt-3 opacity-90">
            {progress === 100
              ? "¡Excelente! Tu kit está completo"
              : `Faltan ${checklist.length - completedCount} elementos`
            }
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6">
        <div className="flex gap-3">
          <Button
            variant={isSpeaking ? "destructive" : "default"}
            className="flex-1 rounded-xl"
            onClick={playAudioGuide}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Detener guía
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Audio guía
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Emergency Kit Checklist */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Kit de Emergencia</h3>
        <Card className="p-5 border-none shadow-lg">
          <div className="space-y-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.label}
                  </p>
                </div>
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-safe" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Preparation Steps */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4">Pasos de Preparación</h3>
        <div className="space-y-3">
          <Card className="p-4 border-none shadow-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Identifica tu refugio</h4>
                <p className="text-sm text-muted-foreground">
                  Conoce la ubicación del refugio más cercano y las rutas de evacuación.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Plan familiar</h4>
                <p className="text-sm text-muted-foreground">
                  Establece un punto de encuentro y contactos de emergencia con tu familia.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Mantén tu kit actualizado</h4>
                <p className="text-sm text-muted-foreground">
                  Revisa y renueva los elementos de tu kit cada 6 meses.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Evacuation Routes */}
      <div className="px-6">
        <Card className="p-5 bg-alert text-alert-foreground border-none shadow-md">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">🚶</span>
            Rutas de Evacuación
          </h3>
          <p className="text-sm opacity-90 mb-3">
            En caso de emergencia, sigue las rutas marcadas hacia zonas seguras en terreno elevado.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-alert-foreground text-alert-foreground hover:bg-alert-foreground hover:text-alert"
            onClick={() => onTabChange("map")}
          >
            Ver mapa de rutas
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PrepareView;
