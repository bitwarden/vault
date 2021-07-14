export function buildDataString(assertedCredential: PublicKeyCredential) {
    const response = assertedCredential.response as AuthenticatorAssertionResponse;

    const authData = new Uint8Array(response.authenticatorData);
    const clientDataJSON = new Uint8Array(response.clientDataJSON);
    const rawId = new Uint8Array(assertedCredential.rawId);
    const sig = new Uint8Array(response.signature);

    const data = {
        id: assertedCredential.id,
        rawId: coerceToBase64Url(rawId),
        type: assertedCredential.type,
        extensions: assertedCredential.getClientExtensionResults(),
        response: {
            authenticatorData: coerceToBase64Url(authData),
            clientDataJson: coerceToBase64Url(clientDataJSON),
            signature: coerceToBase64Url(sig),
        },
    };

    return JSON.stringify(data);
}

export function parseWebauthnJson(jsonString: string) {
    const json = JSON.parse(jsonString);

    const challenge = json.challenge.replace(/-/g, '+').replace(/_/g, '/');
    json.challenge = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));

    json.allowCredentials.forEach((listItem: any) => {
        const fixedId = listItem.id.replace(/\_/g, '/').replace(/\-/g, '+');
        listItem.id = Uint8Array.from(atob(fixedId), c => c.charCodeAt(0));
    });

    return json;
}

// From https://github.com/abergs/fido2-net-lib/blob/b487a1d47373ea18cd752b4988f7262035b7b54e/Demo/wwwroot/js/helpers.js#L34
// License: https://github.com/abergs/fido2-net-lib/blob/master/LICENSE.txt
function coerceToBase64Url(thing: any) {
    // Array or ArrayBuffer to Uint8Array
    if (Array.isArray(thing)) {
        thing = Uint8Array.from(thing);
    }

    if (thing instanceof ArrayBuffer) {
        thing = new Uint8Array(thing);
    }

    // Uint8Array to base64
    if (thing instanceof Uint8Array) {
        let str = '';
        const len = thing.byteLength;

        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(thing[i]);
        }
        thing = window.btoa(str);
    }

    if (typeof thing !== 'string') {
        throw new Error('could not coerce to string');
    }

    // base64 to base64url
    // NOTE: "=" at the end of challenge is optional, strip it off here
    thing = thing.replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/g, '');

    return thing;
}
