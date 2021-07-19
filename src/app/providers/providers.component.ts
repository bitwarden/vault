import {
    Component,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-providers',
    templateUrl: 'providers.component.html',
})
export class ProvidersComponent implements OnInit {
    providers: Provider[];
    loaded: boolean = false;
    actionPromise: Promise<any>;

    constructor(private userService: UserService, private i18nService: I18nService, private syncService: SyncService) { }

    async ngOnInit() {
        await this.syncService.fullSync(false);
        await this.load();
    }

    async load() {
        const providers = await this.userService.getAllProviders();
        providers.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.providers = providers;
        this.loaded = true;
    }
}
