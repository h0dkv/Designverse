import { auth, db } from './firebase-init.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

let currentUser = null;
onAuthStateChanged && onAuthStateChanged(auth, user => { currentUser = user; });

async function sendLog(level, message, meta = {}) {
    try {
        await addDoc(collection(db, 'logs'), {
            level,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            meta,
            userId: currentUser ? currentUser.uid : null,
            url: location.href,
            ts: serverTimestamp()
        });
    } catch (err) {
        // do not throw from logger
        console.warn('monitor: failed to write log', err);
    }
}

window.addEventListener('error', (event) => {
    try {
        sendLog('error', event.message || 'window error', {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error ? (event.error.stack || String(event.error)) : null
        });
    } catch (e) { /* ignore */ }
});

window.addEventListener('unhandledrejection', (event) => {
    try {
        sendLog('error', 'unhandledrejection', { reason: event.reason ? (event.reason.stack || String(event.reason)) : null });
    } catch (e) { /* ignore */ }
});

export function captureException(err, context) {
    sendLog('error', err ? (err.stack || String(err)) : 'manual', context || {});
}

export function logInfo(msg, context) {
    sendLog('info', msg, context || {});
}
