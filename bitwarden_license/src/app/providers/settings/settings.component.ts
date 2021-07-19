import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

@Component({
    selector: 'provider-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent {
    constructor(private route: ActivatedRoute, private userService: UserService,
        private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            const provider = await this.userService.getProvider(params.providerId);
        });
    }
}
