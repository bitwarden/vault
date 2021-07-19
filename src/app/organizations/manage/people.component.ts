import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ValidationService } from 'jslib-angular/services/validation.service';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { OrganizationKeysRequest } from 'jslib-common/models/request/organizationKeysRequest';
import { OrganizationUserBulkRequest } from 'jslib-common/models/request/organizationUserBulkRequest';
import { OrganizationUserConfirmRequest } from 'jslib-common/models/request/organizationUserConfirmRequest';

import { ListResponse } from 'jslib-common/models/response/listResponse';
import { OrganizationUserBulkResponse } from 'jslib-common/models/response/organizationUserBulkResponse';
import { OrganizationUserUserDetailsResponse } from 'jslib-common/models/response/organizationUserResponse';

import { OrganizationUserStatusType } from 'jslib-common/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib-common/enums/organizationUserType';
import { PolicyType } from 'jslib-common/enums/policyType';
import { ProviderUserType } from 'jslib-common/enums/providerUserType';

import { SearchPipe } from 'jslib-angular/pipes/search.pipe';
import { UserNamePipe } from 'jslib-angular/pipes/user-name.pipe';

import { BasePeopleComponent } from '../../common/base.people.component';
import { ModalComponent } from '../../modal.component';
import { BulkConfirmComponent } from './bulk/bulk-confirm.component';
import { BulkRemoveComponent } from './bulk/bulk-remove.component';
import { BulkStatusComponent } from './bulk/bulk-status.component';
import { EntityEventsComponent } from './entity-events.component';
import { ResetPasswordComponent } from './reset-password.component';
import { UserAddEditComponent } from './user-add-edit.component';
import { UserGroupsComponent } from './user-groups.component';

@Component({
    selector: 'app-org-people',
    templateUrl: 'people.component.html',
})
export class PeopleComponent extends BasePeopleComponent<OrganizationUserUserDetailsResponse> implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
    @ViewChild('groupsTemplate', { read: ViewContainerRef, static: true }) groupsModalRef: ViewContainerRef;
    @ViewChild('eventsTemplate', { read: ViewContainerRef, static: true }) eventsModalRef: ViewContainerRef;
    @ViewChild('confirmTemplate', { read: ViewContainerRef, static: true }) confirmModalRef: ViewContainerRef;
    @ViewChild('resetPasswordTemplate', { read: ViewContainerRef, static: true }) resetPasswordModalRef: ViewContainerRef;
    @ViewChild('bulkStatusTemplate', { read: ViewContainerRef, static: true }) bulkStatusModalRef: ViewContainerRef;
    @ViewChild('bulkConfirmTemplate', { read: ViewContainerRef, static: true }) bulkConfirmModalRef: ViewContainerRef;
    @ViewChild('bulkRemoveTemplate', { read: ViewContainerRef, static: true }) bulkRemoveModalRef: ViewContainerRef;

    userType = ProviderUserType;
    userStatusType = OrganizationUserStatusType;

    organizationId: string;
    status: OrganizationUserStatusType = null;
    accessEvents = false;
    accessGroups = false;
    canResetPassword = false; // User permission (admin/custom)
    orgUseResetPassword = false; // Org plan ability
    orgHasKeys = false; // Org public/private keys
    orgResetPasswordPolicyEnabled = false;
    callingUserType: OrganizationUserType = null;

    constructor(apiService: ApiService, private route: ActivatedRoute,
        i18nService: I18nService, componentFactoryResolver: ComponentFactoryResolver,
        platformUtilsService: PlatformUtilsService, toasterService: ToasterService,
        cryptoService: CryptoService, private userService: UserService, private router: Router,
        storageService: StorageService, searchService: SearchService,
        validationService: ValidationService, private policyService: PolicyService,
        logService: LogService, searchPipe: SearchPipe, userNamePipe: UserNamePipe, private syncService: SyncService) {
            super(apiService, searchService, i18nService, platformUtilsService, toasterService, cryptoService,
                storageService, validationService, componentFactoryResolver, logService, searchPipe, userNamePipe);
        }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            if (!organization.canManageUsers) {
                this.router.navigate(['../collections'], { relativeTo: this.route });
                return;
            }
            this.accessEvents = organization.useEvents;
            this.accessGroups = organization.useGroups;
            this.canResetPassword = organization.canManageUsersPassword;
            this.orgUseResetPassword = organization.useResetPassword;
            this.callingUserType = organization.type;
            this.orgHasKeys = organization.hasPublicAndPrivateKeys;

            // Backfill pub/priv key if necessary
            if (this.canResetPassword && !this.orgHasKeys) {
                const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
                const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
                const request = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
                const response = await this.apiService.postOrganizationKeys(this.organizationId, request);
                if (response != null) {
                    this.orgHasKeys = response.publicKey != null && response.privateKey != null;
                    await this.syncService.fullSync(true); // Replace oganizations with new data
                } else {
                    throw new Error(this.i18nService.t('resetPasswordOrgKeysError'));
                }
            }

            await this.load();

            const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
                this.searchText = qParams.search;
                if (qParams.viewEvents != null) {
                    const user = this.users.filter(u => u.id === qParams.viewEvents);
                    if (user.length > 0 && user[0].status === OrganizationUserStatusType.Confirmed) {
                        this.events(user[0]);
                    }
                }
                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            });
        });
    }

    async load() {
        const policies = await this.policyService.getAll(PolicyType.ResetPassword);
        this.orgResetPasswordPolicyEnabled = policies.some(p => p.organizationId === this.organizationId && p.enabled);
        super.load();
    }

    getUsers(): Promise<ListResponse<OrganizationUserUserDetailsResponse>> {
        return this.apiService.getOrganizationUsers(this.organizationId);
    }

    deleteUser(id: string): Promise<any> {
        return this.apiService.deleteOrganizationUser(this.organizationId, id);
    }

    reinviteUser(id: string): Promise<any> {
        return this.apiService.postOrganizationUserReinvite(this.organizationId, id);
    }

    async confirmUser(user: OrganizationUserUserDetailsResponse, publicKey: Uint8Array): Promise<any> {
        const orgKey = await this.cryptoService.getOrgKey(this.organizationId);
        const key = await this.cryptoService.rsaEncrypt(orgKey.key, publicKey.buffer);
        const request = new OrganizationUserConfirmRequest();
        request.key = key.encryptedString;
        await this.apiService.postOrganizationUserConfirm(this.organizationId, user.id, request);
    }

    allowResetPassword(orgUser: OrganizationUserUserDetailsResponse): boolean {
        // Hierarchy check
        let callingUserHasPermission = false;

        switch (this.callingUserType) {
            case OrganizationUserType.Owner:
                callingUserHasPermission = true;
                break;
            case OrganizationUserType.Admin:
                callingUserHasPermission = orgUser.type !== OrganizationUserType.Owner;
                break;
            case OrganizationUserType.Custom:
                callingUserHasPermission = orgUser.type !== OrganizationUserType.Owner
                    && orgUser.type !== OrganizationUserType.Admin;
                break;
        }

        // Final
        return this.canResetPassword && callingUserHasPermission && this.orgUseResetPassword && this.orgHasKeys
            && orgUser.resetPasswordEnrolled && this.orgResetPasswordPolicyEnabled
            && orgUser.status === OrganizationUserStatusType.Confirmed;
    }

    showEnrolledStatus(orgUser: OrganizationUserUserDetailsResponse): boolean {
        return this.orgUseResetPassword && orgUser.resetPasswordEnrolled && this.orgResetPasswordPolicyEnabled;
    }

    edit(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<UserAddEditComponent>(
            UserAddEditComponent, this.addEditModalRef);

        childComponent.name = this.userNamePipe.transform(user);
        childComponent.organizationId = this.organizationId;
        childComponent.organizationUserId = user != null ? user.id : null;
        childComponent.onSavedUser.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedUser.subscribe(() => {
            this.modal.close();
            this.removeUser(user);
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    groups(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.groupsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<UserGroupsComponent>(
            UserGroupsComponent, this.groupsModalRef);

        childComponent.name = this.userNamePipe.transform(user);
        childComponent.organizationId = this.organizationId;
        childComponent.organizationUserId = user != null ? user.id : null;
        childComponent.onSavedUser.subscribe(() => {
            this.modal.close();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async bulkRemove() {
        if (this.actionPromise != null) {
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkRemoveModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show(BulkRemoveComponent, this.bulkRemoveModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.users = this.getCheckedUsers();

        this.modal.onClosed.subscribe(async () => {
            await this.load();
            this.modal = null;
        });
    }

    async bulkReinvite() {
        if (this.actionPromise != null) {
            return;
        }

        const users = this.getCheckedUsers();
        const filteredUsers = users.filter(u => u.status === OrganizationUserStatusType.Invited);

        if (filteredUsers.length <= 0) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('noSelectedUsersApplicable'));
            return;
        }


        try {
            const request = new OrganizationUserBulkRequest(filteredUsers.map(user => user.id));
            const response = this.apiService.postManyOrganizationUserReinvite(this.organizationId, request);
            this.showBulkStatus(users, filteredUsers, response, this.i18nService.t('bulkReinviteMessage'));
        } catch (e) {
            this.validationService.showError(e);
        }
        this.actionPromise = null;
    }

    async bulkConfirm() {
        if (this.actionPromise != null) {
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkConfirmModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show(BulkConfirmComponent, this.bulkConfirmModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.users = this.getCheckedUsers();

        this.modal.onClosed.subscribe(async () => {
            await this.load();
            this.modal = null;
        });
    }

    async events(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.eventsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityEventsComponent>(
            EntityEventsComponent, this.eventsModalRef);

        childComponent.name = this.userNamePipe.transform(user);
        childComponent.organizationId = this.organizationId;
        childComponent.entityId = user.id;
        childComponent.showUser = false;
        childComponent.entity = 'user';

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async resetPassword(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.resetPasswordModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ResetPasswordComponent>(
            ResetPasswordComponent, this.resetPasswordModalRef);

        childComponent.name = this.userNamePipe.transform(user);
        childComponent.email = user != null ? user.email : null;
        childComponent.organizationId = this.organizationId;
        childComponent.id = user != null ? user.id : null;

        childComponent.onPasswordReset.subscribe(() => {
            this.modal.close();
            this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private async showBulkStatus(users: OrganizationUserUserDetailsResponse[], filteredUsers: OrganizationUserUserDetailsResponse[],
        request: Promise<ListResponse<OrganizationUserBulkResponse>>, successfullMessage: string) {

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkStatusModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<BulkStatusComponent>(
            BulkStatusComponent, this.bulkStatusModalRef);

        childComponent.loading = true;

        // Workaround to handle closing the modal shortly after it has been opened
        let close = false;
        this.modal.onShown.subscribe(() => {
            if (close) {
                this.modal.close();
            }
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        try {
            const response = await request;

            if (this.modal) {
                const keyedErrors: any = response.data.filter(r => r.error !== '').reduce((a, x) => ({ ...a, [x.id]: x.error }), {});
                const keyedFilteredUsers: any = filteredUsers.reduce((a, x) => ({ ...a, [x.id]: x }), {});

                childComponent.users = users.map(user => {
                    let message = keyedErrors[user.id] ?? successfullMessage;
                    if (!keyedFilteredUsers.hasOwnProperty(user.id)) {
                        message = this.i18nService.t('bulkFilteredMessage');
                    }

                    return {
                        user: user,
                        error: keyedErrors.hasOwnProperty(user.id),
                        message: message,
                    };
                });
                childComponent.loading = false;
            }
        } catch {
            close = true;
            if (this.modal) {
                this.modal.close();
            }
        }
    }
}
