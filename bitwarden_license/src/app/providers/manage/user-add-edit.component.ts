import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { ProviderUserInviteRequest } from 'jslib-common/models/request/provider/providerUserInviteRequest';

import { PermissionsApi } from 'jslib-common/models/api/permissionsApi';

import { ProviderUserType } from 'jslib-common/enums/providerUserType';
import { ProviderUserUpdateRequest } from 'jslib-common/models/request/provider/providerUserUpdateRequest';

@Component({
    selector: 'provider-user-add-edit',
    templateUrl: 'user-add-edit.component.html',
})
export class UserAddEditComponent implements OnInit {
    @Input() name: string;
    @Input() providerUserId: string;
    @Input() providerId: string;
    @Output() onSavedUser = new EventEmitter();
    @Output() onDeletedUser = new EventEmitter();

    loading = true;
    editMode: boolean = false;
    title: string;
    emails: string;
    type: ProviderUserType = ProviderUserType.ServiceUser;
    permissions = new PermissionsApi();
    showCustom = false;
    access: 'all' | 'selected' = 'selected';
    formPromise: Promise<any>;
    deletePromise: Promise<any>;
    userType = ProviderUserType;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.editMode = this.loading = this.providerUserId != null;

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editUser');
            try {
                const user = await this.apiService.getProviderUser(this.providerId, this.providerUserId);
                this.type = user.type;
            } catch { }
        } else {
            this.title = this.i18nService.t('inviteUser');
        }

        this.loading = false;
    }

    async submit() {
        try {
            if (this.editMode) {
                const request = new ProviderUserUpdateRequest();
                request.type = this.type;
                this.formPromise = this.apiService.putProviderUser(this.providerId, this.providerUserId, request);
            } else {
                const request = new ProviderUserInviteRequest();
                request.emails = this.emails.trim().split(/\s*,\s*/);
                request.type = this.type;
                this.formPromise = this.apiService.postProviderUserInvite(this.providerId, request);
            }
            await this.formPromise;
            this.toasterService.popAsync('success', null,
                this.i18nService.t(this.editMode ? 'editedUserId' : 'invitedUsers', this.name));
            this.onSavedUser.emit();
        } catch { }
    }

    async delete() {
        if (!this.editMode) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), this.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.deletePromise = this.apiService.deleteProviderUser(this.providerId, this.providerUserId);
            await this.deletePromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', this.name));
            this.onDeletedUser.emit();
        } catch { }
    }

}
