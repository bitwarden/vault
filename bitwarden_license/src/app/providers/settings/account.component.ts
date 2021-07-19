import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';

import { ProviderUpdateRequest } from 'jslib-common/models/request/provider/providerUpdateRequest';

import { ProviderResponse } from 'jslib-common/models/response/provider/providerResponse';

@Component({
    selector: 'provider-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    selfHosted = false;
    loading = true;
    provider: ProviderResponse;
    formPromise: Promise<any>;
    taxFormPromise: Promise<any>;

    private providerId: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private route: ActivatedRoute,
        private syncService: SyncService, private platformUtilsService: PlatformUtilsService,
        private logService: LogService) { }

    async ngOnInit() {
        this.selfHosted = this.platformUtilsService.isSelfHost();
        this.route.parent.parent.params.subscribe(async params => {
            this.providerId = params.providerId;
            try {
                this.provider = await this.apiService.getProvider(this.providerId);
            } catch (e) {
                this.logService.error(`Handled exception: ${e}`);
            }
        });
        this.loading = false;
    }

    async submit() {
        try {
            const request = new ProviderUpdateRequest();
            request.name = this.provider.name;
            request.businessName = this.provider.businessName;
            request.billingEmail = this.provider.billingEmail;

            this.formPromise = this.apiService.putProvider(this.providerId, request).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('providerUpdated'));
        } catch (e) {
            this.logService.error(`Handled exception: ${e}`);
        }
    }
}
