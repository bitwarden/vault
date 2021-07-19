import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { PaymentComponent } from './payment.component';
import { TaxInfoComponent } from './tax-info.component';

import { EncString } from 'jslib-common/models/domain/encString';
import { SymmetricCryptoKey } from 'jslib-common/models/domain/symmetricCryptoKey';

import { OrganizationUserStatusType } from 'jslib-common/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib-common/enums/organizationUserType';
import { PaymentMethodType } from 'jslib-common/enums/paymentMethodType';
import { PlanType } from 'jslib-common/enums/planType';
import { PolicyType } from 'jslib-common/enums/policyType';
import { ProductType } from 'jslib-common/enums/productType';

import { OrganizationCreateRequest } from 'jslib-common/models/request/organizationCreateRequest';
import { OrganizationKeysRequest } from 'jslib-common/models/request/organizationKeysRequest';
import { OrganizationUpgradeRequest } from 'jslib-common/models/request/organizationUpgradeRequest';

import { PlanResponse } from 'jslib-common/models/response/planResponse';

@Component({
    selector: 'app-organization-plans',
    templateUrl: 'organization-plans.component.html',
})
export class OrganizationPlansComponent implements OnInit {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
    @ViewChild(TaxInfoComponent) taxComponent: TaxInfoComponent;

    @Input() organizationId: string;
    @Input() showFree = true;
    @Input() showCancel = false;
    @Input() product: ProductType = ProductType.Free;
    @Input() plan: PlanType = PlanType.Free;
    @Input() providerId: string;
    @Output() onSuccess = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    loading: boolean = true;
    selfHosted: boolean = false;
    ownedBusiness: boolean = false;
    premiumAccessAddon: boolean = false;
    additionalStorage: number = 0;
    additionalSeats: number = 0;
    name: string;
    billingEmail: string;
    businessName: string;
    productTypes = ProductType;
    formPromise: Promise<any>;
    singleOrgPolicyBlock: boolean = false;
    freeTrial: boolean = false;

    plans: PlanResponse[];

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, platformUtilsService: PlatformUtilsService,
        private cryptoService: CryptoService, private router: Router, private syncService: SyncService,
        private policyService: PolicyService, private userService: UserService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        if (!this.selfHosted) {
            const plans = await this.apiService.getPlans();
            this.plans = plans.data;
            if (this.product === ProductType.Enterprise || this.product === ProductType.Teams) {
                this.ownedBusiness = true;
            }
        }
        this.loading = false;
    }

    get createOrganization() {
        return this.organizationId == null;
    }

    get selectedPlan() {
        return this.plans.find(plan => plan.type === this.plan);
    }

    get selectedPlanInterval() {
        return this.selectedPlan.isAnnual
            ? 'year'
            : 'month';
    }

    get selectableProducts() {
        let validPlans = this.plans.filter(plan => plan.type !== PlanType.Custom);

        if (this.ownedBusiness) {
            validPlans = validPlans.filter(plan => plan.canBeUsedByBusiness);
        }

        if (!this.showFree) {
            validPlans = validPlans.filter(plan => plan.product !== ProductType.Free);
        }

        validPlans = validPlans
            .filter(plan => !plan.legacyYear
                && !plan.disabled
                && (plan.isAnnual || plan.product === this.productTypes.Free));

        return validPlans;
    }

    get selectablePlans() {
        return this.plans.filter(plan => !plan.legacyYear && !plan.disabled && plan.product === this.product);
    }

    additionalStoragePriceMonthly(selectedPlan: PlanResponse) {
        if (!selectedPlan.isAnnual) {
            return selectedPlan.additionalStoragePricePerGb;
        }
        return selectedPlan.additionalStoragePricePerGb / 12;
    }

    seatPriceMonthly(selectedPlan: PlanResponse) {
        if (!selectedPlan.isAnnual) {
            return selectedPlan.seatPrice;
        }
        return selectedPlan.seatPrice / 12;
    }

    additionalStorageTotal(plan: PlanResponse): number {
        if (!plan.hasAdditionalStorageOption) {
            return 0;
        }

        return plan.additionalStoragePricePerGb * Math.abs(this.additionalStorage || 0);
    }

    seatTotal(plan: PlanResponse): number {
        if (!plan.hasAdditionalSeatsOption) {
            return 0;
        }

        return plan.seatPrice * Math.abs(this.additionalSeats || 0);
    }

    get subtotal() {
        let subTotal = this.selectedPlan.basePrice;
        if (this.selectedPlan.hasAdditionalSeatsOption && this.additionalSeats) {
            subTotal += this.seatTotal(this.selectedPlan);
        }
        if (this.selectedPlan.hasAdditionalStorageOption && this.additionalStorage) {
            subTotal += this.additionalStorageTotal(this.selectedPlan);
        }
        if (this.selectedPlan.hasPremiumAccessOption && this.premiumAccessAddon) {
            subTotal += this.selectedPlan.premiumAccessOptionPrice;
        }
        return subTotal;
    }

    get taxCharges() {
        return this.taxComponent != null && this.taxComponent.taxRate != null ?
            (this.taxComponent.taxRate / 100) * this.subtotal :
            0;
    }

    get total() {
        return (this.subtotal + this.taxCharges) || 0;
    }

    changedProduct() {
        this.plan = this.selectablePlans[0].type;
        if (!this.selectedPlan.hasPremiumAccessOption) {
            this.premiumAccessAddon = false;
        }
        if (!this.selectedPlan.hasAdditionalStorageOption) {
            this.additionalStorage = 0;
        }
        if (!this.selectedPlan.hasAdditionalSeatsOption) {
            this.additionalSeats = 0;
        } else if (!this.additionalSeats && !this.selectedPlan.baseSeats &&
            this.selectedPlan.hasAdditionalSeatsOption) {
            this.additionalSeats = 1;
        }
        this.freeTrial = this.selectedPlan.trialPeriodDays != null;
    }

    changedOwnedBusiness() {
        if (!this.ownedBusiness || this.selectedPlan.canBeUsedByBusiness) {
            return;
        }
        this.product = ProductType.Teams;
        this.plan = PlanType.TeamsAnnually;
    }

    changedCountry() {
        this.paymentComponent.hideBank = this.taxComponent.taxInfo.country !== 'US';
        // Bank Account payments are only available for US customers
        if (this.paymentComponent.hideBank &&
            this.paymentComponent.method === PaymentMethodType.BankAccount) {
            this.paymentComponent.method = PaymentMethodType.Card;
            this.paymentComponent.changeMethod();
        }
    }

    cancel() {
        this.onCanceled.emit();
    }

    async submit() {
        this.singleOrgPolicyBlock = await this.userHasBlockingSingleOrgPolicy();

        if (this.singleOrgPolicyBlock) {
            return;
        }

        try {
            const doSubmit = async () => {
                let orgId: string = null;
                if (this.createOrganization) {
                    const shareKey = await this.cryptoService.makeShareKey();
                    const key = shareKey[0].encryptedString;
                    const collection = await this.cryptoService.encrypt(
                        this.i18nService.t('defaultCollection'), shareKey[1]);
                    const collectionCt = collection.encryptedString;
                    const orgKeys = await this.cryptoService.makeKeyPair(shareKey[1]);

                    if (this.selfHosted) {
                        orgId = await this.createSelfHosted(key, collectionCt, orgKeys);
                    } else {
                        orgId = await this.createCloudHosted(key, collectionCt, orgKeys, shareKey[1]);
                    }

                    this.toasterService.popAsync('success', this.i18nService.t('organizationCreated'), this.i18nService.t('organizationReadyToGo'));
                } else {
                    orgId = await this.updateOrganization(orgId);
                    this.toasterService.popAsync('success', null, this.i18nService.t('organizationUpgraded'));
                }

                await this.apiService.refreshIdentityToken();
                await this.syncService.fullSync(true);
                this.router.navigate(['/organizations/' + orgId]);
            };

            this.formPromise = doSubmit();
            await this.formPromise;
            this.onSuccess.emit();
        } catch { }
    }

    private async userHasBlockingSingleOrgPolicy() {
        const policies = await this.policyService.getAll(PolicyType.SingleOrg);
        const orgs = await this.userService.getAllOrganizations();

        const orgsWithSingleOrgPolicy = policies
            .filter(p => p.enabled && p.type === PolicyType.SingleOrg)
            .map(p => p.organizationId);

        return orgs.some(org => org.type !== OrganizationUserType.Owner &&
            org.type !== OrganizationUserType.Admin &&
            org.status !== OrganizationUserStatusType.Invited &&
            orgsWithSingleOrgPolicy.includes(org.id));
    }

    private async updateOrganization(orgId: string) {
        const request = new OrganizationUpgradeRequest();
        request.businessName = this.ownedBusiness ? this.businessName : null;
        request.additionalSeats = this.additionalSeats;
        request.additionalStorageGb = this.additionalStorage;
        request.premiumAccessAddon = this.selectedPlan.hasPremiumAccessOption && this.premiumAccessAddon;
        request.planType = this.selectedPlan.type;
        request.billingAddressCountry = this.taxComponent.taxInfo.country;
        request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;

        // Retrieve org info to backfill pub/priv key if necessary
        const org = await this.userService.getOrganization(this.organizationId);
        if (!org.hasPublicAndPrivateKeys) {
            const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
            const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
            request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
        }

        const result = await this.apiService.postOrganizationUpgrade(this.organizationId, request);
        if (!result.success && result.paymentIntentClientSecret != null) {
            await this.paymentComponent.handleStripeCardPayment(result.paymentIntentClientSecret, null);
        }
        return this.organizationId;
    }

    private async createCloudHosted(key: string, collectionCt: string, orgKeys: [string, EncString], orgKey: SymmetricCryptoKey) {
        const request = new OrganizationCreateRequest();
        request.key = key;
        request.collectionName = collectionCt;
        request.name = this.name;
        request.billingEmail = this.billingEmail;
        request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);

        if (this.selectedPlan.type === PlanType.Free) {
            request.planType = PlanType.Free;
        } else {
            const tokenResult = await this.paymentComponent.createPaymentToken();

            request.paymentToken = tokenResult[0];
            request.paymentMethodType = tokenResult[1];
            request.businessName = this.ownedBusiness ? this.businessName : null;
            request.additionalSeats = this.additionalSeats;
            request.additionalStorageGb = this.additionalStorage;
            request.premiumAccessAddon = this.selectedPlan.hasPremiumAccessOption &&
                this.premiumAccessAddon;
            request.planType = this.selectedPlan.type;
            request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;
            request.billingAddressCountry = this.taxComponent.taxInfo.country;
            if (this.taxComponent.taxInfo.includeTaxId) {
                request.taxIdNumber = this.taxComponent.taxInfo.taxId;
                request.billingAddressLine1 = this.taxComponent.taxInfo.line1;
                request.billingAddressLine2 = this.taxComponent.taxInfo.line2;
                request.billingAddressCity = this.taxComponent.taxInfo.city;
                request.billingAddressState = this.taxComponent.taxInfo.state;
            }
        }

        if (this.providerId) {
            const providerKey = await this.cryptoService.getProviderKey(this.providerId);
            request.key = (await this.cryptoService.encrypt(orgKey.key, providerKey)).encryptedString;
            return (await this.apiService.postProviderCreateOrganization(this.providerId, request)).id;
        } else {
            return (await this.apiService.postOrganization(request)).id;
        }
    }

    private async createSelfHosted(key: string, collectionCt: string, orgKeys: [string, EncString]) {
        const fileEl = document.getElementById('file') as HTMLInputElement;
        const files = fileEl.files;
        if (files == null || files.length === 0) {
            throw new Error(this.i18nService.t('selectFile'));
        }

        const fd = new FormData();
        fd.append('license', files[0]);
        fd.append('key', key);
        fd.append('collectionName', collectionCt);
        const response = await this.apiService.postOrganizationLicense(fd);
        const orgId = response.id;

        // Org Keys live outside of the OrganizationLicense - add the keys to the org here
        const request = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
        await this.apiService.postOrganizationKeys(orgId, request);

        return orgId;
    }
}
