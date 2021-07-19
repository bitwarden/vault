import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { UserNamePipe } from 'jslib-angular/pipes/user-name.pipe';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Organization } from 'jslib-common/models/domain/organization';
import { EventResponse } from 'jslib-common/models/response/eventResponse';

import { EventService } from '../../services/event.service';

import { BaseEventsComponent } from '../../common/base.events.component';

@Component({
    selector: 'app-org-events',
    templateUrl: 'events.component.html',
})
export class EventsComponent extends BaseEventsComponent implements OnInit {
    exportFileName: string = 'org-events';
    organizationId: string;
    organization: Organization;

    private orgUsersUserIdMap = new Map<string, any>();

    constructor(private apiService: ApiService, private route: ActivatedRoute, eventService: EventService,
        i18nService: I18nService, toasterService: ToasterService, private userService: UserService,
        exportService: ExportService, platformUtilsService: PlatformUtilsService, private router: Router,
        logService: LogService, private userNamePipe: UserNamePipe) {
        super(eventService, i18nService, toasterService, exportService, platformUtilsService, logService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            this.organization = await this.userService.getOrganization(this.organizationId);
            if (this.organization == null || !this.organization.useEvents) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }

            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getOrganizationUsers(this.organizationId);
        response.data.forEach(u => {
            const name = this.userNamePipe.transform(u);
            this.orgUsersUserIdMap.set(u.userId, { name: name, email: u.email });
        });

        if (this.organization.providerId != null && (await this.userService.getProvider(this.organization.providerId)) != null) {
            const providerUsersResponse = await this.apiService.getProviderUsers(this.organization.providerId);
            providerUsersResponse.data.forEach(u => {
                const name = this.userNamePipe.transform(u);
                this.orgUsersUserIdMap.set(u.userId, { name: `${name} (${this.organization.providerName})`, email: u.email });
            });
        }

        await this.loadEvents(true);
        this.loaded = true;
    }

    protected requestEvents(startDate: string, endDate: string, continuationToken: string) {
        return this.apiService.getEventsOrganization(this.organizationId, startDate, endDate, continuationToken);
    }

    protected getUserName(r: EventResponse, userId: string) {
        if (userId == null) {
            return null;
        }

        if (this.orgUsersUserIdMap.has(userId)) {
            return this.orgUsersUserIdMap.get(userId);
        }

        if (r.providerId != null && r.providerId === this.organization.providerId) {
            return {
                'name': this.organization.providerName,
            };
        }

        return null;
    }
}
