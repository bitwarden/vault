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

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';
import { CipherCreateRequest } from 'jslib/models/request/cipherCreateRequest';
import { CipherRequest } from 'jslib/models/request/cipherRequest';

import { AddEditComponent as BaseAddEditComponent } from '../../vault/add-edit.component';

@Component({
    selector: 'app-org-vault-add-edit',
    templateUrl: '../../vault/add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent {
    organization: Organization;
    originalCipher: Cipher = null;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        totpService: TotpService, passwordGenerationService: PasswordGenerationService,
        protected apiService: ApiService, messagingService: MessagingService,
        eventService: EventService, policyService: PolicyService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, collectionService, totpService, passwordGenerationService, messagingService,
            eventService, policyService, apiService);
    }

    protected allowOwnershipAssignment() {
        if (this.ownershipOptions != null && (this.ownershipOptions.length > 1 || !this.allowPersonal)) {
            if (this.organization != null) {
                return this.cloneMode && this.organization.canManageAllCollections;
            } else {
                return !this.editMode || this.cloneMode;
            }
        }
        return false;
    }

    protected loadCollections() {
        if (!this.organization.canManageAllCollections) {
            return super.loadCollections();
        }
        return Promise.resolve(this.collections);
    }

    protected async loadCipher() {
        if (!this.organization.canManageAllCollections) {
            return await super.loadCipher();
        }
        const response = await this.apiService.getCipherAdmin(this.cipherId);
        const data = new CipherData(response);
        this.originalCipher = new Cipher(data);
        return new Cipher(data);
    }

    protected encryptCipher() {
        if (!this.organization.canManageAllCollections) {
            return super.encryptCipher();
        }
        return this.cipherService.encrypt(this.cipher, null, this.originalCipher);
    }

    protected async saveCipher(cipher: Cipher) {
        if (!this.organization.canManageAllCollections || cipher.organizationId == null) {
            return super.saveCipher(cipher);
        }
        if (this.editMode && !this.cloneMode) {
            const request = new CipherRequest(cipher);
            return this.apiService.putCipherAdmin(this.cipherId, request);
        } else {
            const request = new CipherCreateRequest(cipher);
            return this.apiService.postCipherAdmin(request);
        }
    }

    protected async deleteCipher() {
        if (!this.organization.canManageAllCollections) {
            return super.deleteCipher();
        }
        return this.cipher.isDeleted ? this.apiService.deleteCipherAdmin(this.cipherId)
            : this.apiService.putDeleteCipherAdmin(this.cipherId);
    }
}
