import { Injectable } from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';

import { ProviderAddOrganizationRequest } from 'jslib-common/models/request/provider/providerAddOrganizationRequest';

@Injectable()
export class ProviderService {
    constructor(private cryptoService: CryptoService, private syncService: SyncService, private apiService: ApiService) {}

    async addOrganizationToProvider(providerId: string, organizationId: string) {
        const orgKey = await this.cryptoService.getOrgKey(organizationId);
        const providerKey = await this.cryptoService.getProviderKey(providerId);

        const encryptedOrgKey = await this.cryptoService.encrypt(orgKey.key, providerKey);

        const request = new ProviderAddOrganizationRequest();
        request.organizationId = organizationId;
        request.key = encryptedOrgKey.encryptedString;

        const response = await this.apiService.postProviderAddOrganization(providerId, request);
        await this.syncService.fullSync(true);
        return response;
    }

    async detachOrganizastion(providerId: string, organizationId: string): Promise<any> {
        await this.apiService.deleteProviderOrganization(providerId, organizationId);
        await this.syncService.fullSync(true);
    }
}
