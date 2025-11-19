// Email configuration for reports
// Add or remove emails from this array as needed

export const REPORT_RECIPIENTS = [
    'david.cajiao@uao.edu.co',
    'camila_and.cardona@uao.edu.co',
    //'jmnunez@uao.edu.co'
    // Add more emails here:
    // 'admin@example.com',
    // 'alerts@example.com',
];

export interface EmailData {
    recipients: string[];
    reportType: string;
    location: string;
    description: string;
    coordinates: string;
    timestamp: string;
    hasPhoto: boolean;
    hasAudio: boolean;
    photoFile?: File | null;
    audioFile?: File | null;
}

/**
 * Send report email to multiple recipients using FormSubmit.co
 * Note: FormSubmit.co sends to one email at a time, so we send multiple requests
 * Supports file attachments (photo and audio)
 */
export const sendReportToMultipleEmails = async (data: EmailData): Promise<boolean> => {
    try {
        const promises = data.recipients.map(async (email) => {
            const formData = new FormData();
            formData.append('_subject', `Kani Weather - 📣 Nuevo Reporte: ${data.reportType}`);
            formData.append('_captcha', 'false');
            formData.append('Tipo de evento', data.reportType);
            formData.append('Ubicación', data.location);
            formData.append('Descripción', data.description || 'Sin descripción');
            formData.append('Coordenadas', data.coordinates);
            formData.append('Fecha y hora', data.timestamp);

            // Attach photo if available
            if (data.photoFile) {
                formData.append('_attachment', data.photoFile, data.photoFile.name);
            }

            // Attach audio if available
            if (data.audioFile) {
                formData.append('_attachment', data.audioFile, data.audioFile.name);
            }

            const response = await fetch(`https://formsubmit.co/${email}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            return response.ok;
        });

        // Wait for all emails to be sent
        const results = await Promise.all(promises);

        // Return true if at least one email was sent successfully
        return results.some(result => result === true);
    } catch (error) {
        console.error('Error sending emails:', error);
        return false;
    }
};
