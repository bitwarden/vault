import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { OrganizationUserInviteRequest } from 'jslib/models/request/organizationUserInviteRequest';
import { OrganizationUserUpdateRequest } from 'jslib/models/request/organizationUserUpdateRequest';
import { SelectionReadOnlyRequest } from 'jslib/models/request/selectionReadOnlyRequest';
import { CollectionDetailsResponse } from 'jslib/models/response/collectionResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

import { OrganizationUserType } from 'jslib/enums/organizationUserType';

import { PermissionsInterface } from 'jslib/models/interfaces/permissions';

@Component({
    selector: 'app-user-add-edit',
    templateUrl: 'user-add-edit.component.html',
})
export class UserAddEditComponent implements OnInit, PermissionsInterface {
    @Input() name: string;
    @Input() organizationUserId: string;
    @Input() organizationId: string;
    @Output() onSavedUser = new EventEmitter();
    @Output() onDeletedUser = new EventEmitter();

    loading = true;
    editMode: boolean = false;
    title: string;
    emails: string;
    type: OrganizationUserType = OrganizationUserType.User;
    accessBusinessPortal: boolean;
    accessEventLogs: boolean;
    accessImportExport: boolean;
    accessReports: boolean;
    manageAllCollections: boolean;
    manageAssignedCollections: boolean;
    manageGroups: boolean;
    managePolicies: boolean;
    manageUsers: boolean;
    showCustom = false;
    access: 'all' | 'selected' = 'selected';
    collections: CollectionView[] = [];
    formPromise: Promise<any>;
    deletePromise: Promise<any>;
    organizationUserType = OrganizationUserType;

    get customUserTypeSelected(): boolean {
        return this.type === OrganizationUserType.Custom;
    }

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private collectionService: CollectionService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.editMode = this.loading = this.organizationUserId != null;
        await this.loadCollections();

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editUser');
            try {
                const user = await this.apiService.getOrganizationUser(this.organizationId, this.organizationUserId);
                this.access = user.accessAll ? 'all' : 'selected';
                this.type = user.type;
                if (user.type === OrganizationUserType.Custom) {
                    this.accessBusinessPortal = user.accessBusinessPortal;
                    this.accessEventLogs = user.accessEventLogs;
                    this.accessImportExport = user.accessImportExport;
                    this.accessReports = user.accessReports;
                    this.manageAllCollections = user.manageAllCollections;
                    this.manageAssignedCollections = user.manageAssignedCollections;
                    this.manageGroups = user.manageGroups;
                    this.managePolicies = user.managePolicies;
                    this.manageUsers = user.manageUsers;
                }
                if (user.collections != null && this.collections != null) {
                    user.collections.forEach((s) => {
                        const collection = this.collections.filter((c) => c.id === s.id);
                        if (collection != null && collection.length > 0) {
                            (collection[0] as any).checked = true;
                            collection[0].readOnly = s.readOnly;
                            collection[0].hidePasswords = s.hidePasswords;
                        }
                    });
                }
            } catch { }
        } else {
            this.title = this.i18nService.t('inviteUser');
        }

        this.loading = false;
    }

    async loadCollections() {
        const response = await this.apiService.getCollections(this.organizationId);
        const collections = response.data.map((r) =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
        if (!(c as any).checked) {
            c.readOnly = false;
        }
    }

    selectAll(select: boolean) {
        this.collections.forEach((c) => this.check(c, select));
    }

    setRequestPermissions<T extends PermissionsInterface>(o: T, clearPermissions: boolean): T {
        o.accessBusinessPortal = clearPermissions ?
            false :
            this.accessBusinessPortal;
        o.accessEventLogs = this.accessEventLogs = clearPermissions ?
            false :
            this.accessEventLogs;
        o.accessImportExport = clearPermissions ?
            false :
            this.accessImportExport;
        o.accessReports = clearPermissions ?
            false :
            this.accessReports;
        o.manageAllCollections = clearPermissions ?
            false :
            this.manageAllCollections;
        o.manageAssignedCollections = clearPermissions ?
            false :
            this.manageAssignedCollections;
        o.manageGroups = clearPermissions ?
            false :
            this.manageGroups;
        o.managePolicies = clearPermissions ?
            false :
            this.managePolicies;
        o.manageUsers = clearPermissions ?
            false :
            this.manageUsers;
        return o;
    }

    async submit() {
        let collections: SelectionReadOnlyRequest[] = null;
        if (this.access !== 'all') {
            collections = this.collections.filter((c) => (c as any).checked)
                .map((c) => new SelectionReadOnlyRequest(c.id, !!c.readOnly, !!c.hidePasswords));
        }

        try {
            if (this.editMode) {
                let request = new OrganizationUserUpdateRequest();
                request.accessAll = this.access === 'all';
                request.type = this.type;
                request.collections = collections;
                request = this.setRequestPermissions(request, request.type !== OrganizationUserType.Custom);
                this.formPromise = this.apiService.putOrganizationUser(this.organizationId, this.organizationUserId,
                    request);
            } else {
                let request = new OrganizationUserInviteRequest();
                request.emails = this.emails.trim().split(/\s*,\s*/);
                request.accessAll = this.access === 'all';
                request.type = this.type;
                request = this.setRequestPermissions(request, request.type !== OrganizationUserType.Custom);
                request.collections = collections;
                this.formPromise = this.apiService.postOrganizationUserInvite(this.organizationId, request);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({ action: this.editMode ? 'Edited User' : 'Invited User' });
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
            this.deletePromise = this.apiService.deleteOrganizationUser(this.organizationId, this.organizationUserId);
            await this.deletePromise;
            this.analytics.eventTrack.next({ action: 'Deleted User' });
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', this.name));
            this.onDeletedUser.emit();
        } catch { }
    }

}
