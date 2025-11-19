import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Sign up at https://www.emailjs.com/ to get your credentials
// Free tier: 200 emails/month

const EMAILJS_CONFIG = {
    serviceId: 'service_kani_weather', // You need to create this in EmailJS dashboard
    templateId: 'template_report', // You need to create this in EmailJS dashboard
    publicKey: 'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
};

export interface EmailData {
    to_email: string;
    report_type: string;
    location: string;
    description: string;
    coordinates: string;
    timestamp: string;
    has_photo: string;
    has_audio: string;
}

export const sendReportEmail = async (data: EmailData): Promise<boolean> => {
    try {
        // For development/demo purposes, we'll use a simple fetch to a free email service
        // In production, you should set up EmailJS properly with your credentials

        // Using FormSubmit.co - completely free, no signup required
        const formData = new FormData();
        formData.append('_subject', `Nuevo Reporte: ${data.report_type}`);
        formData.append('Tipo de evento', data.report_type);
        formData.append('Ubicación', data.location);
        formData.append('Descripción', data.description || 'Sin descripción');
        formData.append('Coordenadas', data.coordinates);
        formData.append('Fecha y hora', data.timestamp);
        formData.append('Incluye foto', data.has_photo);
        formData.append('Incluye audio', data.has_audio);

        // FormSubmit.co endpoint - sends to david.cajiao@uao.edu.co
        const response = await fetch('https://formsubmit.co/david.cajiao@uao.edu.co', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Alternative: EmailJS implementation (requires setup)
export const sendReportEmailWithEmailJS = async (data: EmailData): Promise<boolean> => {
    try {
        const templateParams = {
            to_email: data.to_email,
            report_type: data.report_type,
            location: data.location,
            description: data.description || 'Sin descripción',
            coordinates: data.coordinates,
            timestamp: data.timestamp,
            has_photo: data.has_photo,
            has_audio: data.has_audio
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );

        return response.status === 200;
    } catch (error) {
        console.error('Error sending email with EmailJS:', error);
        return false;
    }
};
