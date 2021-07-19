import { Directive } from '@angular/core';
import { ToasterService } from 'angular2-toaster';

import { ExportService } from 'jslib-common/abstractions/export.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { EventView } from 'jslib-common/models/view/eventView';

import { ListResponse } from 'jslib-common/models/response';
import { EventResponse } from 'jslib-common/models/response/eventResponse';

import { LogService } from 'jslib-common/abstractions';
import { EventService } from 'src/app/services/event.service';

@Directive()
export abstract class BaseEventsComponent {
    loading = true;
    loaded = false;
    events: EventView[];
    start: string;
    end: string;
    dirtyDates: boolean = true;
    continuationToken: string;
    refreshPromise: Promise<any>;
    exportPromise: Promise<any>;
    morePromise: Promise<any>;

    abstract readonly exportFileName: string;

    constructor(protected eventService: EventService, protected i18nService: I18nService,
        protected toasterService: ToasterService, protected exportService: ExportService,
        protected platformUtilsService: PlatformUtilsService, protected logService: LogService) {
        const defaultDates = this.eventService.getDefaultDateFilters();
        this.start = defaultDates[0];
        this.end = defaultDates[1];
    }

    async exportEvents() {
        if (this.appApiPromiseUnfulfilled() || this.dirtyDates) {
            return;
        }

        this.loading = true;

        const dates = this.parseDates();
        if (dates == null) {
            return;
        }

        try {
            this.exportPromise = this.export(dates[0], dates[1]);

            await this.exportPromise;
        } catch (e) {
            this.logService.error(`Handled exception: ${e}`);
        }

        this.exportPromise = null;
        this.loading = false;
    }

    async loadEvents(clearExisting: boolean) {
        if (this.appApiPromiseUnfulfilled()) {
            return;
        }

        const dates = this.parseDates();
        if (dates == null) {
            return;
        }

        this.loading = true;
        let events: EventView[] = [];
        try {
            const promise = this.loadAndParseEvents(dates[0], dates[1], clearExisting ? null : this.continuationToken);
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            const result = await promise;
            this.continuationToken = result.continuationToken;
            events = result.events;
        } catch (e) {
            this.logService.error(`Handled exception: ${e}`);
        }

        if (!clearExisting && this.events != null && this.events.length > 0) {
            this.events = this.events.concat(events);
        } else {
            this.events = events;
        }

        this.dirtyDates = false;
        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }

    protected abstract requestEvents(startDate: string, endDate: string, continuationToken: string): Promise<ListResponse<EventResponse>>;
    protected abstract getUserName(r: EventResponse, userId: string): { name: string, email: string };

    protected async loadAndParseEvents(startDate: string, endDate: string, continuationToken: string) {
        const response = await this.requestEvents(startDate, endDate, continuationToken);

        const events = await Promise.all(response.data.map(async r => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = await this.eventService.getEventInfo(r);
            const user = this.getUserName(r, userId);
            return new EventView({
                message: eventInfo.message,
                humanReadableMessage: eventInfo.humanReadableMessage,
                appIcon: eventInfo.appIcon,
                appName: eventInfo.appName,
                userId: userId,
                userName: user != null ? user.name : this.i18nService.t('unknown'),
                userEmail: user != null ? user.email : '',
                date: r.date,
                ip: r.ipAddress,
                type: r.type,
            });
        }));
        return { continuationToken: response.continuationToken, events: events };
    }

    protected parseDates() {
        let dates: string[] = null;
        try {
            dates = this.eventService.formatDateFilters(this.start, this.end);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidDateRange'));
            return null;
        }
        return dates;
    }

    protected appApiPromiseUnfulfilled() {
        return this.refreshPromise != null || this.morePromise != null || this.exportPromise != null;
    }

    private async export(start: string, end: string) {
        let continuationToken = this.continuationToken;
        let events = [].concat(this.events);

        while (continuationToken != null) {
            const result = await this.loadAndParseEvents(start, end, continuationToken);
            continuationToken = result.continuationToken;
            events = events.concat(result.events);
        }

        const data = await this.exportService.getEventExport(events);
        const fileName = this.exportService.getFileName(this.exportFileName, 'csv');
        this.platformUtilsService.saveFile(window, data, { type: 'text/plain' }, fileName);
    }
}
