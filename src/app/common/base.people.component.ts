import {
    ComponentFactoryResolver,
    Directive,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';

import { ValidationService } from 'jslib-angular/services/validation.service';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { SearchPipe } from 'jslib-angular/pipes/search.pipe';
import { UserNamePipe } from 'jslib-angular/pipes/user-name.pipe';

import { OrganizationUserStatusType } from 'jslib-common/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib-common/enums/organizationUserType';
import { ProviderUserStatusType } from 'jslib-common/enums/providerUserStatusType';
import { ProviderUserType } from 'jslib-common/enums/providerUserType';

import { ListResponse } from 'jslib-common/models/response/listResponse';
import { OrganizationUserUserDetailsResponse } from 'jslib-common/models/response/organizationUserResponse';
import { ProviderUserUserDetailsResponse } from 'jslib-common/models/response/provider/providerUserResponse';

import { Utils } from 'jslib-common/misc/utils';

import { ModalComponent } from '../modal.component';
import { UserConfirmComponent } from '../organizations/manage/user-confirm.component';

type StatusType = OrganizationUserStatusType | ProviderUserStatusType;

const MaxCheckedCount = 500;

@Directive()
export abstract class BasePeopleComponent<UserType extends ProviderUserUserDetailsResponse | OrganizationUserUserDetailsResponse>  {

    @ViewChild('confirmTemplate', { read: ViewContainerRef, static: true }) confirmModalRef: ViewContainerRef;

    get allCount() {
        return this.allUsers != null ? this.allUsers.length : 0;
    }

    get invitedCount() {
        return this.statusMap.has(this.userStatusType.Invited) ?
            this.statusMap.get(this.userStatusType.Invited).length : 0;
    }

    get acceptedCount() {
        return this.statusMap.has(this.userStatusType.Accepted) ?
            this.statusMap.get(this.userStatusType.Accepted).length : 0;
    }

    get confirmedCount() {
        return this.statusMap.has(this.userStatusType.Confirmed) ?
            this.statusMap.get(this.userStatusType.Confirmed).length : 0;
    }

    get showConfirmUsers(): boolean {
        return this.allUsers != null && this.statusMap != null && this.allUsers.length > 1 &&
            this.confirmedCount > 0 && this.confirmedCount < 3 && this.acceptedCount > 0;
    }

    get showBulkConfirmUsers(): boolean {
        return this.acceptedCount > 0;
    }

    abstract userType: typeof OrganizationUserType | typeof ProviderUserType;
    abstract userStatusType: typeof OrganizationUserStatusType | typeof ProviderUserStatusType;

    loading = true;
    statusMap = new Map<StatusType, UserType[]>();
    status: StatusType;
    users: UserType[] = [];
    pagedUsers: UserType[] = [];
    searchText: string;
    actionPromise: Promise<any>;

    protected allUsers: UserType[] = [];

    protected didScroll = false;
    protected pageSize = 100;
    protected modal: ModalComponent = null;

    private pagedUsersCount = 0;

    constructor(protected apiService: ApiService, private searchService: SearchService,
        protected i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        protected toasterService: ToasterService, protected cryptoService: CryptoService,
        private storageService: StorageService, protected validationService: ValidationService,
        protected componentFactoryResolver: ComponentFactoryResolver, private logService: LogService,
        private searchPipe: SearchPipe, protected userNamePipe: UserNamePipe) { }

    abstract edit(user: UserType): void;
    abstract getUsers(): Promise<ListResponse<UserType>>;
    abstract deleteUser(id: string): Promise<any>;
    abstract reinviteUser(id: string): Promise<any>;
    abstract confirmUser(user: UserType, publicKey: Uint8Array): Promise<any>;

    async load() {
        const response = await this.getUsers();
        this.statusMap.clear();
        this.allUsers = response.data != null && response.data.length > 0 ? response.data : [];
        this.allUsers.sort(Utils.getSortFunction(this.i18nService, 'email'));
        this.allUsers.forEach(u => {
            if (!this.statusMap.has(u.status)) {
                this.statusMap.set(u.status, [u]);
            } else {
                this.statusMap.get(u.status).push(u);
            }
        });
        this.filter(this.status);
        this.loading = false;
    }

    filter(status: StatusType) {
        this.status = status;
        if (this.status != null) {
            this.users = this.statusMap.get(this.status);
        } else {
            this.users = this.allUsers;
        }
        // Reset checkbox selecton
        this.selectAll(false);
        this.resetPaging();
    }

    loadMore() {
        if (!this.users || this.users.length <= this.pageSize) {
            return;
        }
        const pagedLength = this.pagedUsers.length;
        let pagedSize = this.pageSize;
        if (pagedLength === 0 && this.pagedUsersCount > this.pageSize) {
            pagedSize = this.pagedUsersCount;
        }
        if (this.users.length > pagedLength) {
            this.pagedUsers = this.pagedUsers.concat(this.users.slice(pagedLength, pagedLength + pagedSize));
        }
        this.pagedUsersCount = this.pagedUsers.length;
        this.didScroll = this.pagedUsers.length > this.pageSize;
    }

    checkUser(user: OrganizationUserUserDetailsResponse, select?: boolean) {
        (user as any).checked = select == null ? !(user as any).checked : select;
    }

    selectAll(select: boolean) {
        if (select) {
            this.selectAll(false);
        }

        const filteredUsers = this.searchPipe.transform(this.users, this.searchText, 'name', 'email', 'id');

        const selectCount = select && filteredUsers.length > MaxCheckedCount
            ? MaxCheckedCount
            : filteredUsers.length;
        for (let i = 0; i < selectCount; i++) {
            this.checkUser(filteredUsers[i], select);
        }
    }

    async resetPaging() {
        this.pagedUsers = [];
        this.loadMore();
    }

    invite() {
        this.edit(null);
    }

    async remove(user: UserType) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), this.userNamePipe.transform(user),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

        if (!confirmed) {
            return false;
        }

        this.actionPromise = this.deleteUser(user.id);
        try {
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', this.userNamePipe.transform(user)));
            this.removeUser(user);
        } catch (e) {
            this.validationService.showError(e);
        }
        this.actionPromise = null;
    }

    async reinvite(user: UserType) {
        if (this.actionPromise != null) {
            return;
        }

        this.actionPromise = this.reinviteUser(user.id);
        try {
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenReinvited', this.userNamePipe.transform(user)));
        } catch (e) {
            this.validationService.showError(e);
        }
        this.actionPromise = null;
    }

    async confirm(user: UserType) {
        function updateUser(self: BasePeopleComponent<UserType>) {
            user.status = self.userStatusType.Confirmed;
            const mapIndex = self.statusMap.get(self.userStatusType.Accepted).indexOf(user);
            if (mapIndex > -1) {
                self.statusMap.get(self.userStatusType.Accepted).splice(mapIndex, 1);
                self.statusMap.get(self.userStatusType.Confirmed).push(user);
            }
        }

        const confirmUser = async (publicKey: Uint8Array) => {
            try {
                this.actionPromise = this.confirmUser(user, publicKey);
                await this.actionPromise;
                updateUser(this);
                this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenConfirmed', this.userNamePipe.transform(user)));
            } catch (e) {
                this.validationService.showError(e);
                throw e;
            } finally {
                this.actionPromise = null;
            }
        };

        if (this.actionPromise != null) {
            return;
        }

        try {
            const publicKeyResponse = await this.apiService.getUserPublicKey(user.userId);
            const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);

            const autoConfirm = await this.storageService.get<boolean>(ConstantsService.autoConfirmFingerprints);
            if (autoConfirm == null || !autoConfirm) {
                if (this.modal != null) {
                    this.modal.close();
                }

                const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
                this.modal = this.confirmModalRef.createComponent(factory).instance;
                const childComponent = this.modal.show<UserConfirmComponent>(
                    UserConfirmComponent, this.confirmModalRef);

                childComponent.name = this.userNamePipe.transform(user);
                childComponent.userId = user != null ? user.userId : null;
                childComponent.publicKey = publicKey;
                childComponent.onConfirmedUser.subscribe(async () => {
                    try {
                        await confirmUser(publicKey);
                        this.modal.close();
                    } catch (e) {
                        this.logService.error(`Handled exception: ${e}`);
                    }
                });

                this.modal.onClosed.subscribe(() => {
                    this.modal = null;
                });
                return;
            }

            try {
                const fingerprint = await this.cryptoService.getFingerprint(user.userId, publicKey.buffer);
                this.logService.info(`User's fingerprint: ${fingerprint.join('-')}`);
            } catch { }
            await confirmUser(publicKey);
        } catch (e) {
            this.logService.error(`Handled exception: ${e}`);
        }
    }

    isSearching() {
        return this.searchService.isSearchable(this.searchText);
    }

    isPaging() {
        const searching = this.isSearching();
        if (searching && this.didScroll) {
            this.resetPaging();
        }
        return !searching && this.users && this.users.length > this.pageSize;
    }

    protected getCheckedUsers() {
        return this.users.filter(u => (u as any).checked);
    }

    protected removeUser(user: UserType) {
        let index = this.users.indexOf(user);
        if (index > -1) {
            this.users.splice(index, 1);
            this.resetPaging();
        }
        if (this.statusMap.has(user.status)) {
            index = this.statusMap.get(user.status).indexOf(user);
            if (index > -1) {
                this.statusMap.get(user.status).splice(index, 1);
            }
        }
    }

}