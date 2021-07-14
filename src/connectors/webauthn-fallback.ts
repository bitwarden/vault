import { b64Decode, getQsParam } from './common';
import { buildDataString, parseWebauthnJson } from './common-webauthn';

// tslint:disable-next-line
require('./webauthn.scss');

let parentUrl: string = null;
let parentOrigin: string = null;
let sentSuccess = false;

let locales: any = {};

document.addEventListener('DOMContentLoaded', async () => {

    const locale = getQsParam('locale').replace('-', '_');
    try {
        locales = await loadLocales(locale);
    } catch {
        // tslint:disable-next-line:no-console
        console.error('Failed to load the locale', locale);
        locales = await loadLocales('en');
    }

    document.getElementById('msg').innerText = translate('webAuthnFallbackMsg');
    document.getElementById('remember-label').innerText = translate('rememberMe');

    const button = document.getElementById('webauthn-button');
    button.innerText = translate('webAuthnAuthenticate');
    button.onclick = start;

    document.getElementById('spinner').classList.add('d-none');
    const content = document.getElementById('content');
    content.classList.add('d-block');
    content.classList.remove('d-none');
});

async function loadLocales(locale: string) {
    const filePath = `locales/${locale}/messages.json?cache=${process.env.CACHE_TAG}`;
    const localesResult = await fetch(filePath);
    return await localesResult.json();
}

function translate(id: string) {
    return locales[id]?.message || '';
}

function start() {
    if (sentSuccess) {
        return;
    }

    if (!('credentials' in navigator)) {
        error(translate('webAuthnNotSupported'));
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

    let json: any;
    try {
        const jsonString = b64Decode(data);
        json = parseWebauthnJson(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    initWebAuthn(json);
}

async function initWebAuthn(obj: any) {
    try {
        const assertedCredential = await navigator.credentials.get({ publicKey: obj }) as PublicKeyCredential;

        if (sentSuccess) {
            return;
        }

        const dataString = buildDataString(assertedCredential);
        const remember = (document.getElementById('remember') as HTMLInputElement).checked;
        window.postMessage({ command: 'webAuthnResult', data: dataString, remember: remember }, '*');

        sentSuccess = true;
        success(translate('webAuthnSuccess'));
    } catch (err) {
        error(err);
    }
}

function error(message: string) {
    const el = document.getElementById('msg');
    resetMsgBox(el);
    el.textContent = message;
    el.classList.add('alert');
    el.classList.add('alert-danger');
}

function success(message: string) {
    (document.getElementById('webauthn-button') as HTMLButtonElement).disabled = true;

    const el = document.getElementById('msg');
    resetMsgBox(el);
    el.textContent = message;
    el.classList.add('alert');
    el.classList.add('alert-success');
}

function resetMsgBox(el: HTMLElement) {
    el.classList.remove('alert');
    el.classList.remove('alert-danger');
    el.classList.remove('alert-success');
}
