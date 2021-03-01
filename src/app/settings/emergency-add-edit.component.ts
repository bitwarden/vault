import { Component } from '@angular/core';

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

import { Cipher } from 'jslib/models/domain/cipher';

import { AddEditComponent as BaseAddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-org-vault-add-edit',
    templateUrl: '../vault/add-edit.component.html',
})
export class EmergencyAddEditComponent extends BaseAddEditComponent {
    originalCipher: Cipher = null;
    viewOnly = true;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        totpService: TotpService, passwordGenerationService: PasswordGenerationService,
        messagingService: MessagingService, eventService: EventService, policyService: PolicyService,
        apiService: ApiService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, totpService, passwordGenerationService, messagingService,
            eventService, policyService, apiService);
    }

    async load() {
        this.title = this.i18nService.t('viewItem');
    }

    protected async loadCipher() {
        return Promise.resolve(this.originalCipher);
    }
}
