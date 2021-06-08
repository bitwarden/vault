import { Component } from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { AttachmentView } from 'jslib-common/models/view/attachmentView';

import { AttachmentsComponent as BaseAttachmentsComponent } from 'jslib-angular/components/attachments.component';

@Component({
    selector: 'emergency-access-attachments',
    templateUrl: '../vault/attachments.component.html',
})
export class EmergencyAccessAttachmentsComponent extends BaseAttachmentsComponent {
    viewOnly = true;
    canAccessAttachments = true;

    constructor(cipherService: CipherService, i18nService: I18nService,
        cryptoService: CryptoService, userService: UserService,
        platformUtilsService: PlatformUtilsService, apiService: ApiService) {
        super(cipherService, i18nService, cryptoService, userService, platformUtilsService, apiService, window);
    }

    protected async init() {
        // Do nothing since cipher is already decoded
    }

    protected showFixOldAttachments(attachment: AttachmentView) {
        return false;
    }
}
