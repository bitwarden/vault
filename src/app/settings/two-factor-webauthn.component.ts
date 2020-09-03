import {
    Component,
    NgZone,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';
import { UpdateTwoFactorU2fDeleteRequest } from 'jslib/models/request/updateTwoFactorU2fDeleteRequest';
import { UpdateTwoFactorWebAuthnRequest } from 'jslib/models/request/updateTwoFactorWebAuthnRequest';
import {
    ChallengeResponse,
    TwoFactorWebAuthnResponse,
} from 'jslib/models/response/twoFactorWebAuthnResponse';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-webauthn',
    templateUrl: 'two-factor-webauthn.component.html',
})
export class TwoFactorWebAuthnComponent extends TwoFactorBaseComponent {
    type = TwoFactorProviderType.WebAuthn;
    name: string;
    keys: any[];
    keyIdAvailable: number = null;
    keysConfiguredCount = 0;
    webAuthnError: boolean;
    webAuthnListening: boolean;
    webAuthnResponse: PublicKeyCredential;
    challengePromise: Promise<ChallengeResponse>;
    formPromise: Promise<any>;

    constructor(apiService: ApiService, i18nService: I18nService,
        analytics: Angulartics2, toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService, private ngZone: NgZone) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService);
    }

    auth(authResponse: any) {
        super.auth(authResponse);
        this.processResponse(authResponse.response);
    }

    submit() {
        if (this.webAuthnResponse == null || this.keyIdAvailable == null) {
            // Should never happen.
            return Promise.reject();
        }
        const request = new UpdateTwoFactorWebAuthnRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.deviceResponse = this.webAuthnResponse;
        request.id = this.keyIdAvailable;
        request.name = this.name;

        return super.enable(async () => {
            this.formPromise = this.apiService.putTwoFactorWebAuthn(request);
            const response = await this.formPromise;
            await this.processResponse(response);
        });
    }

    disable() {
        return super.disable(this.formPromise);
    }

    async remove(key: any) {
        if (this.keysConfiguredCount <= 1 || key.removePromise != null) {
            return;
        }
        const name = key.name != null ? key.name : this.i18nService.t('webAuthnkeyX', key.id);
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeU2fConfirmation'), name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }
        const request = new UpdateTwoFactorU2fDeleteRequest();
        request.id = key.id;
        request.masterPasswordHash = this.masterPasswordHash;
        try {
            key.removePromise = this.apiService.deleteTwoFactorWebAuthn(request);
            const response = await key.removePromise;
            key.removePromise = null;
            await this.processResponse(response);
        } catch { }
    }

    async readKey() {
        if (this.keyIdAvailable == null) {
            return;
        }
        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        try {
            this.challengePromise = this.apiService.getTwoFactorWebAuthnChallenge(request);
            const challenge = await this.challengePromise;
            this.readDevice(challenge);
        } catch { }
    }

    private readDevice(webAuthnChallenge: ChallengeResponse) {
        // tslint:disable-next-line
        console.log('listening for key...');
        this.resetWebAuthn(true);

        navigator.credentials.create({
            publicKey: webAuthnChallenge
        }).then((data: PublicKeyCredential) => {
            this.ngZone.run(() => {
                this.webAuthnListening = false;
                this.webAuthnResponse = data;
            });
        }).catch((err) => {
            // tslint:disable-next-line
            console.error(err);
            this.resetWebAuthn(false);
            // TODO: Should we display the actual error?
            this.webAuthnError = true;
        })
    }

    private resetWebAuthn(listening = false) {
        this.webAuthnResponse = null;
        this.webAuthnError = false;
        this.webAuthnListening = listening;
    }

    private processResponse(response: TwoFactorWebAuthnResponse) {
        this.resetWebAuthn();
        this.keys = [];
        this.keyIdAvailable = null;
        this.name = null;
        this.keysConfiguredCount = 0;
        for (let i = 1; i <= 5; i++) {
            if (response.keys != null) {
                const key = response.keys.filter((k) => k.id === i);
                if (key.length > 0) {
                    this.keysConfiguredCount++;
                    this.keys.push({
                        id: i, name: key[0].name,
                        configured: true,
                        compromised: key[0].compromised,
                        removePromise: null,
                    });
                    continue;
                }
            }
            this.keys.push({ id: i, name: null, configured: false, compromised: false, removePromise: null });
            if (this.keyIdAvailable == null) {
                this.keyIdAvailable = i;
            }
        }
        this.enabled = response.enabled;
    }
}
