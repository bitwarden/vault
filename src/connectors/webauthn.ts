import { b64Decode, getQsParam } from './common';
import { buildDataString, parseWebauthnJson } from './common-webauthn';

// tslint:disable-next-line
require('./webauthn.scss');

document.addEventListener('DOMContentLoaded', () => {
    init();

    const text = getQsParam('btnText');
    if (text) {
        const button = document.getElementById('webauthn-button');
        button.innerText = decodeURI(text);
        button.onclick = executeWebAuthn;
    }
});

let parentUrl: string = null;
let parentOrigin: string = null;
let stopWebAuthn = false;
let sentSuccess = false;
let obj: any = null;

function init() {
    start();
    onMessage();
    info('ready');
}

function start() {
    sentSuccess = false;

    if (!('credentials' in navigator)) {
        error('WebAuthn is not supported in this browser.');
        return;
    }

    const data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    parentUrl = getQsParam('parent');
    if (!parentUrl) {
        error('No parent.');
        return;
    } else {
        parentUrl = decodeURIComponent(parentUrl);
        parentOrigin = new URL(parentUrl).origin;
    }

    try {
        const jsonString = b64Decode(data);
        obj = parseWebauthnJson(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    stopWebAuthn = false;

    if (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
        // TODO: Hide image, show button
    } else {
        executeWebAuthn();
    }
}

function executeWebAuthn() {
    if (stopWebAuthn) {
        return;
    }

    navigator.credentials.get({ publicKey: obj })
        .then(success)
        .catch(err => error('WebAuth Error: ' + err));
}

function onMessage() {
    window.addEventListener('message', event => {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'stop') {
            stopWebAuthn = true;
        }
        else if (event.data === 'start' && stopWebAuthn) {
            start();
        }
    }, false);
}

function error(message: string) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(assertedCredential: PublicKeyCredential) {
    if (sentSuccess) {
        return;
    }

    const dataString = buildDataString(assertedCredential);
    parent.postMessage('success|' + dataString, parentUrl);
    sentSuccess = true;
}

function info(message: string) {
    parent.postMessage('info|' + message, parentUrl);
}

