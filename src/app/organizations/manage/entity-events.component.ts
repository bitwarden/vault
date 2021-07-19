import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { EventService } from '../../services/event.service';

import { UserNamePipe } from 'jslib-angular/pipes/user-name.pipe';

import { EventResponse } from 'jslib-common/models/response/eventResponse';
import { ListResponse } from 'jslib-common/models/response/listResponse';

@Component({
    selector: 'app-entity-events',
    templateUrl: 'entity-events.component.html',
})
export class EntityEventsComponent implements OnInit {
    @Input() name: string;
    @Input() entity: 'user' | 'cipher';
    @Input() entityId: string;
    @Input() organizationId: string;
    @Input() providerId: string;
    @Input() showUser = false;

    loading = true;
    loaded = false;
    events: any[];
    start: string;
    end: string;
    continuationToken: string;
    refreshPromise: Promise<any>;
    morePromise: Promise<any>;

    private orgUsersUserIdMap = new Map<string, any>();
    private orgUsersIdMap = new Map<string, any>();

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private eventService: EventService, private toasterService: ToasterService,
        private userNamePipe: UserNamePipe) { }

    async ngOnInit() {
        const defaultDates = this.eventService.getDefaultDateFilters();
        this.start = defaultDates[0];
        this.end = defaultDates[1];
        await this.load();
    }

    async load() {
        if (this.showUser) {
            const response = await this.apiService.getOrganizationUsers(this.organizationId);
            response.data.forEach(u => {
                const name = this.userNamePipe.transform(u);
                this.orgUsersIdMap.set(u.id, { name: name, email: u.email });
                this.orgUsersUserIdMap.set(u.userId, { name: name, email: u.email });
            });
        }
        await this.loadEvents(true);
        this.loaded = true;
    }

    async loadEvents(clearExisting: boolean) {
        if (this.refreshPromise != null || this.morePromise != null) {
            return;
        }

        let dates: string[] = null;
        try {
            dates = this.eventService.formatDateFilters(this.start, this.end);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidDateRange'));
            return;
        }

        this.loading = true;
        let response: ListResponse<EventResponse>;
        try {
            let promise: Promise<any>;
            if (this.entity === 'user' && this.providerId) {
                promise = this.apiService.getEventsProviderUser(this.providerId, this.entityId,
                    dates[0], dates[1], clearExisting ? null : this.continuationToken);
            } else if (this.entity === 'user') {
                promise = this.apiService.getEventsOrganizationUser(this.organizationId, this.entityId,
                    dates[0], dates[1], clearExisting ? null : this.continuationToken);
            } else {
                promise = this.apiService.getEventsCipher(this.entityId,
                    dates[0], dates[1], clearExisting ? null : this.continuationToken);
            }
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            response = await promise;
        } catch { }

        this.continuationToken = response.continuationToken;
        const events = await Promise.all(response.data.map(async r => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = await this.eventService.getEventInfo(r);
            const user = this.showUser && userId != null && this.orgUsersUserIdMap.has(userId) ?
                this.orgUsersUserIdMap.get(userId) : null;
            return {
                message: eventInfo.message,
                appIcon: eventInfo.appIcon,
                appName: eventInfo.appName,
                userId: userId,
                userName: user != null ? user.name : this.showUser ? this.i18nService.t('unknown') : null,
                userEmail: user != null ? user.email : this.showUser ? '' : null,
                date: r.date,
                ip: r.ipAddress,
                type: r.type,
            };
        }));

        if (!clearExisting && this.events != null && this.events.length > 0) {
            this.events = this.events.concat(events);
        } else {
            this.events = events;
        }

        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }
}
