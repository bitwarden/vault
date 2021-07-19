import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

@Component({
    selector: 'app-user-confirm',
    templateUrl: 'user-confirm.component.html',
})
export class UserConfirmComponent implements OnInit {
    @Input() name: string;
    @Input() userId: string;
    @Input() publicKey: Uint8Array;
    @Output() onConfirmedUser = new EventEmitter();

    dontAskAgain = false;
    loading = true;
    fingerprint: string;

    constructor(private cryptoService: CryptoService, private storageService: StorageService) { }

    async ngOnInit() {
        try {
            if (this.publicKey != null) {
                const fingerprint = await this.cryptoService.getFingerprint(this.userId, this.publicKey.buffer);
                if (fingerprint != null) {
                    this.fingerprint = fingerprint.join('-');
                }
            }
        } catch { }
        this.loading = false;
    }

    async submit() {
        if (this.loading) {
            return;
        }

        if (this.dontAskAgain) {
            await this.storageService.save(ConstantsService.autoConfirmFingerprints, true);
        }

        this.onConfirmedUser.emit();
    }
}
