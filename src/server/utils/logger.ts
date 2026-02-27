import * as fs from 'fs';
import * as path from 'path';

export class ClusterLogger {
    private filepath: string;
    private logStream: fs.WriteStream | null = null;
    private isDev: boolean;

    constructor(folderId: string) {
        this.isDev = process.env.NODE_ENV !== 'production';

        if (this.isDev) {
            const logsDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            this.filepath = path.join(logsDir, `clustering_run_${folderId}_${timestamp}.log`);
            this.logStream = fs.createWriteStream(this.filepath, { flags: 'a' });

            this.log(`--- Clustering Run Started at ${new Date().toISOString()} ---`);
            this.log(`Folder ID: ${folderId}`);
        } else {
            this.filepath = "";
        }
    }

    public log(message: string) {
        if (this.isDev && this.logStream) {
            const timestamp = new Date().toISOString();
            this.logStream.write(`[${timestamp}] ${message}\n`);
            // Also mirror to console in dev
            console.log(`[CLUSTER] ${message}`);
        } else {
            // In production, just standard console.log
            console.log(`[CLUSTER] ${message}`);
        }
    }

    public close() {
        if (this.logStream) {
            this.log(`--- Clustering Run Ended ---`);
            this.logStream.end();
            this.logStream = null;
        }
    }
}
