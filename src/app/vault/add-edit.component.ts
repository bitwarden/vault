import { Component } from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';
import { EventType } from 'jslib/enums/eventType';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { EventService } from 'jslib/abstractions/event.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';
import { LoginUriView } from 'jslib/models/view/loginUriView';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent {
    canAccessPremium: boolean;
    totpCode: string;
    totpCodeFormatted: string;
    totpDash: number;
    totpSec: number;
    totpLow: boolean;
    showRevisionDate = false;
    hasPasswordHistory = false;
    viewingPasswordHistory = false;
    viewOnly = false;
    defaultUsernames: string[] = [];

    protected totpInterval: number;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        protected totpService: TotpService, protected passwordGenerationService: PasswordGenerationService,
        protected messagingService: MessagingService, eventService: EventService,
        protected policyService: PolicyService, protected apiService: ApiService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, messagingService, eventService, policyService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        await this.load();
        this.showRevisionDate = this.cipher.passwordRevisionDisplayDate != null;
        this.hasPasswordHistory = this.cipher.hasPasswordHistory;
        this.cleanUp();

        this.canAccessPremium = await this.userService.canAccessPremium();
        if (this.cipher.type === CipherType.Login && this.cipher.login.totp &&
            (this.cipher.organizationUseTotp || this.canAccessPremium)) {
            await this.totpUpdateCode();
            const interval = this.totpService.getTimeInterval(this.cipher.login.totp);
            await this.totpTick(interval);

            this.totpInterval = window.setInterval(async () => {
                await this.totpTick(interval);
            }, 1000);
        }

        const response = await this.apiService.getSettingsDefaultUsernames();
        if (response.defaultUsernames != null) {
            this.defaultUsernames = response.defaultUsernames;
            this.defaultUsernames.unshift('');
        }
    }

    toggleFavorite() {
        this.cipher.favorite = !this.cipher.favorite;
    }

    launch(uri: LoginUriView) {
        if (!uri.canLaunch) {
            return;
        }

        this.platformUtilsService.eventTrack('Launched Login URI');
        this.platformUtilsService.launchUri(uri.launchUri);
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.platformUtilsService.eventTrack('Copied ' + aType);
        this.platformUtilsService.copyToClipboard(value, { window: window });
        this.platformUtilsService.showToast('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));

        if (this.editMode) {
            if (typeI18nKey === 'password') {
                this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, this.cipherId);
            } else if (typeI18nKey === 'securityCode') {
                this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, this.cipherId);
            } else if (aType === 'H_Field') {
                this.eventService.collect(EventType.Cipher_ClientCopiedHiddenField, this.cipherId);
            }
        }
    }

    async generatePassword(): Promise<boolean> {
        const confirmed = await super.generatePassword();
        if (confirmed) {
            const options = (await this.passwordGenerationService.getOptions())[0];
            this.cipher.login.password = await this.passwordGenerationService.generatePassword(options);
        }
        return confirmed;
    }

    premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }

    upgradeOrganization() {
        this.messagingService.send('upgradeOrganization', { organizationId: this.cipher.organizationId });
    }

    viewHistory() {
        this.viewingPasswordHistory = !this.viewingPasswordHistory;
    }

    protected cleanUp() {
        if (this.totpInterval) {
            window.clearInterval(this.totpInterval);
        }
    }

    protected async totpUpdateCode() {
        if (this.cipher == null || this.cipher.type !== CipherType.Login || this.cipher.login.totp == null) {
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
            return;
        }

        this.totpCode = await this.totpService.getCode(this.cipher.login.totp);
        if (this.totpCode != null) {
            if (this.totpCode.length > 4) {
                const half = Math.floor(this.totpCode.length / 2);
                this.totpCodeFormatted = this.totpCode.substring(0, half) + ' ' + this.totpCode.substring(half);
            } else {
                this.totpCodeFormatted = this.totpCode;
            }
        } else {
            this.totpCodeFormatted = null;
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
        }
    }

    protected allowOwnershipAssignment() {
        return (!this.editMode || this.cloneMode) && this.ownershipOptions != null
            && (this.ownershipOptions.length > 1 || !this.allowPersonal);
    }

    private async totpTick(intervalSeconds: number) {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const mod = epoch % intervalSeconds;

        this.totpSec = intervalSeconds - mod;
        this.totpDash = +(Math.round((((78.6 / intervalSeconds) * mod) + 'e+2') as any) + 'e-2');
        this.totpLow = this.totpSec <= 7;
        if (mod === 0) {
            await this.totpUpdateCode();
        }
    }
}
