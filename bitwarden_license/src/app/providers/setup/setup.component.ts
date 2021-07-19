import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import {
    Toast,
    ToasterService,
} from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';

import { ValidationService } from 'jslib-angular/services/validation.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { ProviderSetupRequest } from 'jslib-common/models/request/provider/providerSetupRequest';

@Component({
    selector: 'provider-setup',
    templateUrl: 'setup.component.html',
})
export class SetupComponent implements OnInit {
    loading = true;
    authed = false;
    email: string;
    formPromise: Promise<any>;

    providerId: string;
    token: string;
    name: string;
    billingEmail: string;
    businessName: string;

    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private cryptoService: CryptoService, private apiService: ApiService,
        private syncService: SyncService, private validationService: ValidationService) { }

    ngOnInit() {
        document.body.classList.remove('layout_frontend');
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            const error = qParams.providerId == null || qParams.email == null || qParams.token == null;

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: this.i18nService.t('emergencyInviteAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            } else {
                this.providerId = qParams.providerId;
                this.token = qParams.token;
            }
        });
    }

    async submit() {
        this.formPromise = this.doSubmit();
        await this.formPromise;
        this.formPromise = null;
    }

    async doSubmit() {
        try {
            const shareKey = await this.cryptoService.makeShareKey();
            const key = shareKey[0].encryptedString;

            const request = new ProviderSetupRequest();
            request.name = this.name;
            request.billingEmail = this.billingEmail;
            request.businessName = this.businessName;
            request.token = this.token;
            request.key = key;

            const provider = await this.apiService.postProviderSetup(this.providerId, request);
            this.toasterService.popAsync('success', this.i18nService.t('providerSetup'));
            await this.syncService.fullSync(true);

            this.router.navigate(['/providers', provider.id]);
        } catch (e) {
            this.validationService.showError(e);
        }
    }
}
