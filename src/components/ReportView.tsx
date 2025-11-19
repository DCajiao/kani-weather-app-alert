import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Camera, Mic, MapPin, Send, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { reportsDB, Report } from "@/lib/reportsDB";
import { sendReportToMultipleEmails, REPORT_RECIPIENTS } from "@/lib/emailService";

const ReportView = () => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string>("Obteniendo ubicación...");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Media states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const reportTypes = [
    { id: "flooding", icon: "🌊", label: "Inundación" },
    { id: "landslide", icon: "⛰️", label: "Deslizamiento" },
    { id: "rain", icon: "🌧️", label: "Lluvia fuerte" },
    { id: "river", icon: "🏞️", label: "Río crecido" },
    { id: "damage", icon: "🏚️", label: "Daño estructural" },
    { id: "other", icon: "📝", label: "Otro" },
  ];

  // Get user location on mount
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
          setCoordinates({ lat: latitude, lon: longitude });

          try {
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
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation("Cali, Valle del Cauca");
          setIsLoadingLocation(false);
        }
      );
    };

    getLocation();

    // Load reports
    setReports(reportsDB.getRecent());
  }, []);

  // Handle photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioPreview(audioUrl);

        // Create File from Blob
        const audioFile = new File([audioBlob], 'audio-report.webm', { type: 'audio/webm' });
        setAudioFile(audioFile);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Grabando audio...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Audio grabado");
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioPreview(null);
  };

  // Send email to multiple recipients using the email service
  const sendEmailReport = async (report: Report) => {
    try {
      return await sendReportToMultipleEmails({
        recipients: REPORT_RECIPIENTS,
        reportType: report.typeLabel,
        location: report.location,
        description: report.description,
        coordinates: coordinates ? `${coordinates.lat}, ${coordinates.lon}` : 'No disponible',
        timestamp: new Date(report.timestamp).toLocaleString('es-ES'),
        hasPhoto: !!photoFile,
        hasAudio: !!audioFile,
        photoFile: photoFile,
        audioFile: audioFile
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Por favor selecciona un tipo de evento");
      return;
    }

    const selectedTypeData = reportTypes.find(t => t.id === selectedType);
    if (!selectedTypeData) return;

    // Create new report
    const newReport = reportsDB.add({
      type: selectedType,
      typeLabel: selectedTypeData.label,
      icon: selectedTypeData.icon,
      description: description,
      location: location,
      photoUrl: photoPreview || undefined,
      audioUrl: audioPreview || undefined,
      timestamp: Date.now()
    });

    // Update reports list
    setReports(reportsDB.getRecent());

    // Send email to multiple recipients
    const recipientCount = REPORT_RECIPIENTS.length;
    toast.promise(
      sendEmailReport(newReport),
      {
        loading: `Enviando reporte a ${recipientCount} destinatario${recipientCount > 1 ? 's' : ''}...`,
        success: `Reporte enviado exitosamente a ${recipientCount} destinatario${recipientCount > 1 ? 's' : ''}`,
        error: 'Error al enviar el reporte'
      }
    );

    // Reset form
    setSelectedType("");
    setDescription("");
    removePhoto();
    removeAudio();
  };

  const getTimeAgo = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
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
              className={`p-4 rounded-2xl border-2 transition-all ${selectedType === type.id
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
              <p className="text-xs text-muted-foreground">
                {isLoadingLocation ? (
                  <span className="animate-pulse">Obteniendo ubicación...</span>
                ) : (
                  location
                )}
              </p>
            </div>
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

        {/* Photo Preview */}
        {photoPreview && (
          <div className="mb-3 relative">
            <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
            <button
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Audio Preview */}
        {audioPreview && (
          <div className="mb-3 relative">
            <Card className="p-4 border-none shadow-md">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <audio src={audioPreview} controls className="w-full" />
                </div>
                <button
                  onClick={removeAudio}
                  className="text-destructive hover:text-destructive/90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            className="h-auto py-4 rounded-2xl"
            onClick={() => photoInputRef.current?.click()}
            disabled={!!photoPreview}
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">{photoPreview ? 'Foto añadida' : 'Foto'}</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 rounded-2xl"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!audioPreview && !isRecording}
          >
            <div className="flex flex-col items-center gap-2">
              <Mic className={`w-6 h-6 ${isRecording ? 'text-destructive animate-pulse' : ''}`} />
              <span className="text-sm">
                {isRecording ? 'Detener' : audioPreview ? 'Audio añadido' : 'Audio'}
              </span>
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
          {reports.length === 0 ? (
            <Card className="p-6 border-none shadow-md">
              <p className="text-center text-muted-foreground text-sm">
                No hay reportes recientes
              </p>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-4 border-none shadow-md">
                <div className="flex gap-3">
                  <div className="text-2xl">{report.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{report.typeLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.location} • {getTimeAgo(report.timestamp)}
                    </p>
                    {report.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {report.photoUrl && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="w-3 h-3" />
                          Foto
                        </div>
                      )}
                      {report.audioUrl && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mic className="w-3 h-3" />
                          Audio
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">+{report.reportCount}</div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
