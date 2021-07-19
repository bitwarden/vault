import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

@Component({
    selector: 'provider-manage',
    templateUrl: 'manage.component.html',
})
export class ManageComponent implements OnInit {
    provider: Provider;
    accessEvents = false;

    constructor(private route: ActivatedRoute, private userService: UserService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            this.provider = await this.userService.getProvider(params.providerId);
            this.accessEvents = this.provider.useEvents;
        });
    }
}
