import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib-angular/components/ciphers.component';

import { CipherRepromptType } from 'jslib-common/enums/cipherRepromptType';
import { CipherType } from 'jslib-common/enums/cipherType';
import { EventType } from 'jslib-common/enums/eventType';

import { CipherView } from 'jslib-common/models/view/cipherView';

const MaxCheckedCount = 500;

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent implements OnDestroy {
    @Input() showAddNew = true;
    @Output() onAttachmentsClicked = new EventEmitter<CipherView>();
    @Output() onShareClicked = new EventEmitter<CipherView>();
    @Output() onCollectionsClicked = new EventEmitter<CipherView>();
    @Output() onCloneClicked = new EventEmitter<CipherView>();

    cipherType = CipherType;
    actionPromise: Promise<any>;
    userHasPremiumAccess = false;

    constructor(searchService: SearchService, protected toasterService: ToasterService,
        protected i18nService: I18nService, protected platformUtilsService: PlatformUtilsService,
        protected cipherService: CipherService, protected eventService: EventService,
        protected totpService: TotpService, protected userService: UserService,
        protected passwordRepromptService: PasswordRepromptService,
        private environmentService: EnvironmentService) {
        super(searchService);
        this.pageSize = 200;
    }

    async ngOnInit() {
        this.userHasPremiumAccess = await this.userService.canAccessPremium();
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    launch(uri: string) {
        this.platformUtilsService.launchUri(uri);
    }

    async attachments(c: CipherView) {
        if (!await this.repromptCipher(c)) {
            return;
        }
        this.onAttachmentsClicked.emit(c);
    }

    async share(c: CipherView) {
        if (!await this.repromptCipher(c)) {
            return;
        }
        this.onShareClicked.emit(c);
    }

    collections(c: CipherView) {
        this.onCollectionsClicked.emit(c);
    }

    async clone(c: CipherView) {
        if (!await this.repromptCipher(c)) {
            return;
        }
        this.onCloneClicked.emit(c);
    }

    async delete(c: CipherView): Promise<boolean> {
        if (!await this.repromptCipher(c)) {
            return;
        }
        if (this.actionPromise != null) {
            return;
        }
        const permanent = c.isDeleted;
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t(permanent ? 'permanentlyDeleteItemConfirmation' : 'deleteItemConfirmation'),
            this.i18nService.t(permanent ? 'permanentlyDeleteItem' : 'deleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.deleteCipher(c.id, permanent);
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t(permanent ? 'permanentlyDeletedItem'
                : 'deletedItem'));
            this.refresh();
        } catch { }
        this.actionPromise = null;
    }

    async restore(c: CipherView): Promise<boolean> {
        if (this.actionPromise != null || !c.isDeleted) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('restoreItemConfirmation'),
            this.i18nService.t('restoreItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.cipherService.restoreWithServer(c.id);
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('restoredItem'));
            this.refresh();
        } catch { }
        this.actionPromise = null;
    }

    async copy(cipher: CipherView, value: string, typeI18nKey: string, aType: string) {
        if (this.passwordRepromptService.protectedFields().includes(aType) && !await this.repromptCipher(cipher)) {
            return;
        }

        if (value == null || aType === 'TOTP' && !this.displayTotpCopyButton(cipher)) {
            return;
        } else if (value === cipher.login.totp) {
            value = await this.totpService.getCode(value);
        }

        if (!cipher.viewPassword) {
            return;
        }

        this.platformUtilsService.copyToClipboard(value, { window: window });
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));

        if (typeI18nKey === 'password' || typeI18nKey === 'verificationCodeTotp') {
            this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, cipher.id);
        } else if (typeI18nKey === 'securityCode') {
            this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
        }
    }

    async copyUri(cipher: CipherView) {
        let vaultUrl = this.environmentService.getWebVaultUrl() + '/#';
        if (cipher.organizationId != null) {
            vaultUrl += '/organizations/' + cipher.organizationId;
        }
        this.platformUtilsService.copyToClipboard(
            vaultUrl + '/vault?cipherId=' + cipher.id,
            { window: window }
        );

        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t('uri')));
    }

    selectAll(select: boolean) {
        if (select) {
            this.selectAll(false);
        }
        const selectCount = select && this.ciphers.length > MaxCheckedCount
            ? MaxCheckedCount
            : this.ciphers.length;
        for (let i = 0; i < selectCount; i++) {
            this.checkCipher(this.ciphers[i], select);
        }
    }

    checkCipher(c: CipherView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    getSelected(): CipherView[] {
        if (this.ciphers == null) {
            return [];
        }
        return this.ciphers.filter(c => !!(c as any).checked);
    }

    getSelectedIds(): string[] {
        return this.getSelected().map(c => c.id);
    }

    displayTotpCopyButton(cipher: CipherView) {
        return (cipher?.login?.hasTotp ?? false) &&
            (cipher.organizationUseTotp || this.userHasPremiumAccess);
    }

    async selectCipher(cipher: CipherView) {
        if (await this.repromptCipher(cipher)) {
            super.selectCipher(cipher);
        }
    }

    protected deleteCipher(id: string, permanent: boolean) {
        return permanent ? this.cipherService.deleteWithServer(id) : this.cipherService.softDeleteWithServer(id);
    }

    protected showFixOldAttachments(c: CipherView) {
        return c.hasOldAttachments && c.organizationId == null;
    }

    protected async repromptCipher(c: CipherView) {
        return c.reprompt === CipherRepromptType.None || await this.passwordRepromptService.showPasswordPrompt();
    }
}
