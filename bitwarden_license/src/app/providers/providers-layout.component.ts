import {
    Component,
    NgZone,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

@Component({
    selector: 'providers-layout',
    templateUrl: 'providers-layout.component.html',
})
export class ProvidersLayoutComponent {

    provider: Provider;
    private providerId: string;

    constructor(private route: ActivatedRoute, private userService: UserService) { }

    ngOnInit() {
        document.body.classList.remove('layout_frontend');
        this.route.params.subscribe(async params => {
            this.providerId = params.providerId;
            await this.load();
        });
    }

    async load() {
        this.provider = await this.userService.getProvider(this.providerId);
    }

    get showMenuBar() {
        return true; // TODO: Replace with permissions
    }

    get manageRoute(): string {
        switch (true) {
            case this.provider.canManageUsers:
                return 'manage/people';
            case this.provider.canAccessEventLogs:
                return 'manage/events';
        }
    }
}
