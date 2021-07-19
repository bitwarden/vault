import { Component } from '@angular/core';

import { BaseAcceptComponent } from 'src/app/common/base.accept.component';

@Component({
    selector: 'app-setup-provider',
    templateUrl: 'setup-provider.component.html',
})
export class SetupProviderComponent extends BaseAcceptComponent {

    failedShortMessage = 'inviteAcceptFailedShort';
    failedMessage = 'inviteAcceptFailed';

    requiredParameters = ['providerId', 'email', 'token'];

    async authedHandler(qParams: any) {
        this.router.navigate(['/providers/setup'], {queryParams: qParams});
    }

    // tslint:disable-next-line
    async unauthedHandler(qParams: any) {}
}
