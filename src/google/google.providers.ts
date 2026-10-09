import { google } from 'googleapis';

export const GOOGLE_SHEETS = 'GOOGLE_SHEETS';
export const GOOGLE_DRIVE = 'GOOGLE_DRIVE';
export const GOOGLE_CALENDAR = 'GOOGLE_CALENDAR';

const auth = new google.auth.GoogleAuth({
    keyFile:
        process.env.GOOGLE_APPLICATION_CREDENTIALS ??
        'src/llaves/google.json',
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/calendar',
    ],
});

export const googleProviders = [
    {
        provide: GOOGLE_SHEETS,
        useFactory: () => {
            return google.sheets({
                version: 'v4',
                auth,
            });
        },
    },
    {
        provide: GOOGLE_DRIVE,
        useFactory: () => {
            return google.drive({
                version: 'v3',
                auth,
            });
        },
    },
    {
        provide: GOOGLE_CALENDAR,
        useFactory: () => {
            return google.calendar({
                version: 'v3',
                auth,
            });
        },
    },
];