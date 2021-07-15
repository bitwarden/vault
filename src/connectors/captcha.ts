import { b64Decode, getQsParam } from './common';

declare var hcaptcha: any;

// tslint:disable-next-line
require('./captcha.scss');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

(window as any).captchaSuccess = captchaSuccess;
(window as any).captchaError = captchaError;

let parentUrl: string = null;
let parentOrigin: string = null;
let sentSuccess = false;

async function init() {
    await start();
    onMessage();
    watchHeight();
}

async function start() {
    sentSuccess = false;

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

    let decodedData: any;
    try {
        decodedData = JSON.parse(b64Decode(data));
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    let src = 'https://hcaptcha.com/1/api.js?render=explicit';

    // Set language code
    if (decodedData.locale) {
        src += `&hl=${decodedData.locale ?? 'en'}`;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    let i = 0;
    while (typeof hcaptcha === 'undefined' && i < 20) {
        i += 1;
        await sleep(100);
    }

    hcaptcha.render('captcha', {
        sitekey: decodedData.siteKey,
        callback: 'captchaSuccess',
        'error-callback': 'captchaError',
    });
}

function captchaSuccess(response: string) {
    success(response);
}

function captchaError() {
    error('An error occurred with the captcha. Try again.');
}

function onMessage() {
    window.addEventListener('message', event => {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'start') {
            start();
        }
    }, false);
}

function error(message: string) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(data: string) {
    if (sentSuccess) {
        return;
    }
    parent.postMessage('success|' + data, parentUrl);
    sentSuccess = true;
}

function info(message: string | object) {
    parent.postMessage('info|' + JSON.stringify(message), parentUrl);
}

async function watchHeight() {
    const imagesDiv = document.body.lastChild as HTMLElement;
    while (true) {
        info({
            height: imagesDiv.style.visibility === 'hidden' ?
                document.documentElement.offsetHeight :
                document.documentElement.scrollHeight,
            width: document.documentElement.scrollWidth,
        });
        await sleep(100);
    }
}

async function sleep(ms: number) {
    await new Promise(r => setTimeout(r, ms));
}

