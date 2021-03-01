import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { UpdateDefaultUsernamesRequest } from 'jslib/models/request/updateDefaultUsernamesRequest';

@Component({
    selector: 'app-default-usernames',
    templateUrl: 'default-usernames.component.html',
})
export class DefaultUsernamesComponent implements OnInit {
    loading = true;
    usernames: string[] = [];
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async ngOnInit() {
        const response = await this.apiService.getSettingsDefaultUsernames();
        this.loading = false;
        if (response.defaultUsernames != null) {
            this.usernames = response.defaultUsernames;
        }
    }

    remove(index: number) {
        this.usernames.splice(index, 1);
    }

    add() {
        this.usernames.push('');
    }

    async submit() {
        const request = new UpdateDefaultUsernamesRequest();

        request.defaultUsernames = this.usernames.filter(d => d != null && d.trim() !== '');
        if (request.defaultUsernames.length === 0) {
            request.defaultUsernames = null;
        }

        try {
            this.formPromise = this.apiService.putSettingsDefaultUsernames(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Saved Default Usernames' });
            this.toasterService.popAsync('success', null, this.i18nService.t('defaultUsernamesUpdated'));
        } catch { }
    }

    indexTrackBy(index: number, obj: any): any {
        return index;
    }
}
