// Simple in-memory database for reports
// This will reset on page refresh, but serves as a provisional database

export interface Report {
    id: string;
    type: string;
    typeLabel: string;
    icon: string;
    description: string;
    location: string;
    photoUrl?: string;
    audioUrl?: string;
    timestamp: number;
    reportCount: number;
}

class ReportsDatabase {
    private reports: Report[] = [
        {
            id: "1",
            type: "flooding",
            typeLabel: "Inundación",
            icon: "🌊",
            description: "Nivel de agua alto en la calle principal",
            location: "El Hormiguero, Valle del Cauca",
            timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
            reportCount: 1
        }
    ];

    private nextId = 2;

    getAll(): Report[] {
        return [...this.reports].sort((a, b) => b.timestamp - a.timestamp);
    }

    add(report: Omit<Report, 'id' | 'reportCount'>): Report {
        const newReport: Report = {
            ...report,
            id: String(this.nextId++),
            reportCount: 1
        };
        this.reports.unshift(newReport);
        return newReport;
    }

    getRecent(limit: number = 10): Report[] {
        return this.getAll().slice(0, limit);
    }
}

export const reportsDB = new ReportsDatabase();
