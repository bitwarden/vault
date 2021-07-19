import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ValidationService } from 'jslib-angular/services/validation.service';

import { ProviderService } from '../services/provider.service';

import { Organization } from 'jslib-common/models/domain/organization';
import { Provider } from 'jslib-common/models/domain/provider';


@Component({
    selector: 'provider-add-organization',
    templateUrl: 'add-organization.component.html',
})
export class AddOrganizationComponent implements OnInit {

    @Input() providerId: string;
    @Output() onAddedOrganization = new EventEmitter();

    provider: Provider;
    formPromise: Promise<any>;
    loading = true;
    organizations: Organization[];

    constructor(private userService: UserService, private providerService: ProviderService,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService, private validationService: ValidationService) { }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        if (this.providerId == null) {
            return;
        }

        this.provider = await this.userService.getProvider(this.providerId);

        this.organizations = (await this.userService.getAllOrganizations()).filter(p => p.providerId == null);
        this.loading = false;
    }

    async add(organization: Organization) {
        if (this.formPromise) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('addOrganizationConfirmation', organization.name, this.provider.name), organization.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

        if (!confirmed) {
            return false;
        }

        try {
            this.formPromise = this.providerService.addOrganizationToProvider(this.providerId, organization.id);
            await this.formPromise;
        } catch (e) {
            this.validationService.showError(e);
            return;
        } finally {
            this.formPromise = null;
        }

        this.toasterService.popAsync('success', null, this.i18nService.t('organizationJoinedProvider'));
        this.onAddedOrganization.emit();
    }
}
