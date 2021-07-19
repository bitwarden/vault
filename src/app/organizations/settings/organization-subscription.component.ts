import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { Organization } from 'jslib-common/models/domain/organization';
import { OrganizationSubscriptionResponse } from 'jslib-common/models/response/organizationSubscriptionResponse';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { UserService } from 'jslib-common/abstractions';
import { PlanType } from 'jslib-common/enums/planType';

@Component({
    selector: 'app-org-subscription',
    templateUrl: 'organization-subscription.component.html',
})
export class OrganizationSubscriptionComponent implements OnInit {
    loading = false;
    firstLoaded = false;
    organizationId: string;
    adjustSeatsAdd = true;
    showAdjustSeats = false;
    adjustStorageAdd = true;
    showAdjustStorage = false;
    showUpdateLicense = false;
    showDownloadLicense = false;
    showChangePlan = false;
    sub: OrganizationSubscriptionResponse;
    selfHosted = false;

    userOrg: Organization;

    cancelPromise: Promise<any>;
    reinstatePromise: Promise<any>;

    constructor(private apiService: ApiService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService, private toasterService: ToasterService,
        private messagingService: MessagingService, private route: ActivatedRoute,
        private userService: UserService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
            this.firstLoaded = true;
        });
    }

    async load() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.userOrg = await this.userService.getOrganization(this.organizationId);
        this.sub = await this.apiService.getOrganizationSubscription(this.organizationId);
        this.loading = false;
    }

    async reinstate() {
        if (this.loading) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('reinstateConfirmation'),
            this.i18nService.t('reinstateSubscription'), this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (!confirmed) {
            return;
        }

        try {
            this.reinstatePromise = this.apiService.postOrganizationReinstate(this.organizationId);
            await this.reinstatePromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('reinstated'));
            this.load();
        } catch { }
    }

    async cancel() {
        if (this.loading) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('cancelConfirmation'),
            this.i18nService.t('cancelSubscription'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            this.cancelPromise = this.apiService.postOrganizationCancel(this.organizationId);
            await this.cancelPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('canceledSubscription'));
            this.load();
        } catch { }
    }

    async changePlan() {
        if (this.subscription == null && this.sub.planType === PlanType.Free) {
            this.showChangePlan = !this.showChangePlan;
            return;
        }
        const contactSupport = await this.platformUtilsService.showDialog(this.i18nService.t('changeBillingPlanDesc'),
            this.i18nService.t('changeBillingPlan'), this.i18nService.t('contactSupport'), this.i18nService.t('close'));
        if (contactSupport) {
            this.platformUtilsService.launchUri('https://bitwarden.com/contact');
        }
    }

    closeChangePlan(changed: boolean) {
        this.showChangePlan = false;
    }

    downloadLicense() {
        this.showDownloadLicense = !this.showDownloadLicense;
    }

    closeDownloadLicense() {
        this.showDownloadLicense = false;
    }

    updateLicense() {
        if (this.loading) {
            return;
        }
        this.showUpdateLicense = true;
    }

    closeUpdateLicense(updated: boolean) {
        this.showUpdateLicense = false;
        if (updated) {
            this.load();
            this.messagingService.send('updatedOrgLicense');
        }
    }

    adjustSeats(add: boolean) {
        this.adjustSeatsAdd = add;
        this.showAdjustSeats = true;
    }

    closeSeats(load: boolean) {
        this.showAdjustSeats = false;
        if (load) {
            this.load();
        }
    }

    adjustStorage(add: boolean) {
        this.adjustStorageAdd = add;
        this.showAdjustStorage = true;
    }

    closeStorage(load: boolean) {
        this.showAdjustStorage = false;
        if (load) {
            this.load();
        }
    }

    get isExpired() {
        return this.sub != null && this.sub.expiration != null &&
            new Date(this.sub.expiration) < new Date();
    }

    get subscriptionMarkedForCancel() {
        return this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate;
    }

    get subscription() {
        return this.sub != null ? this.sub.subscription : null;
    }

    get nextInvoice() {
        return this.sub != null ? this.sub.upcomingInvoice : null;
    }

    get storagePercentage() {
        return this.sub != null && this.sub.maxStorageGb ?
            +(100 * (this.sub.storageGb / this.sub.maxStorageGb)).toFixed(2) : 0;
    }

    get storageProgressWidth() {
        return this.storagePercentage < 5 ? 5 : 0;
    }

    get billingInterval() {
        const monthly = !this.sub.plan.isAnnual;
        return monthly ? 'month' : 'year';
    }

    get storageGbPrice() {
        return this.sub.plan.additionalStoragePricePerGb;
    }

    get seatPrice() {
        return this.sub.plan.seatPrice;
    }

    get canAdjustSeats() {
        return this.sub.plan.hasAdditionalSeatsOption;
    }

    get canDownloadLicense() {
        return (this.sub.planType !== PlanType.Free && this.subscription == null) ||
            (this.subscription != null && !this.subscription.cancelled);
    }
}
