import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast, ToasterService } from 'angular2-toaster';

import { BaseAcceptComponent } from 'src/app/common/base.accept.component';

import { ApiService } from 'jslib-common/abstractions/api.service';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { ProviderUserAcceptRequest } from 'jslib-common/models/request/provider/providerUserAcceptRequest';

@Component({
    selector: 'app-accept-provider',
    templateUrl: 'accept-provider.component.html',
})
export class AcceptProviderComponent extends BaseAcceptComponent {
    providerName: string;

    failedMessage = 'providerInviteAcceptFailed';

    requiredParameters = ['providerId', 'providerUserId', 'token'];

    constructor(router: Router, toasterService: ToasterService, i18nService: I18nService, route: ActivatedRoute,
        userService: UserService, stateService: StateService, private apiService: ApiService) {
        super(router, toasterService, i18nService, route, userService, stateService);
    }

    async authedHandler(qParams: any) {
        const request = new ProviderUserAcceptRequest();
        request.token = qParams.token;

        await this.apiService.postProviderUserAccept(qParams.providerId, qParams.providerUserId, request);
        const toast: Toast = {
            type: 'success',
            title: this.i18nService.t('inviteAccepted'),
            body: this.i18nService.t('providerInviteAcceptedDesc'),
            timeout: 10000,
        };
        this.toasterService.popAsync(toast);
        this.router.navigate(['/vault']);
    }

    async unauthedHandler(qParams: any) {
        this.providerName = qParams.providerName;
    }
}
