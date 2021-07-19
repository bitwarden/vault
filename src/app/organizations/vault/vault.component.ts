import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { Organization } from 'jslib-common/models/domain/organization';
import { CipherView } from 'jslib-common/models/view/cipherView';

import { CipherType } from 'jslib-common/enums/cipherType';

import { ModalComponent } from '../../modal.component';

import { EntityEventsComponent } from '../manage/entity-events.component';
import { AddEditComponent } from './add-edit.component';
import { AttachmentsComponent } from './attachments.component';
import { CiphersComponent } from './ciphers.component';
import { CollectionsComponent } from './collections.component';
import { GroupingsComponent } from './groupings.component';

const BroadcasterSubscriptionId = 'OrgVaultComponent';

@Component({
    selector: 'app-org-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit, OnDestroy {
    @ViewChild(GroupingsComponent, { static: true }) groupingsComponent: GroupingsComponent;
    @ViewChild(CiphersComponent, { static: true }) ciphersComponent: CiphersComponent;
    @ViewChild('attachments', { read: ViewContainerRef, static: true }) attachmentsModalRef: ViewContainerRef;
    @ViewChild('cipherAddEdit', { read: ViewContainerRef, static: true }) cipherAddEditModalRef: ViewContainerRef;
    @ViewChild('collections', { read: ViewContainerRef, static: true }) collectionsModalRef: ViewContainerRef;
    @ViewChild('eventsTemplate', { read: ViewContainerRef, static: true }) eventsModalRef: ViewContainerRef;

    organization: Organization;
    collectionId: string = null;
    type: CipherType = null;
    deleted: boolean = false;
    trashCleanupWarning: string = null;

    modal: ModalComponent = null;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private router: Router, private changeDetectorRef: ChangeDetectorRef,
        private syncService: SyncService, private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver, private messagingService: MessagingService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        this.trashCleanupWarning = this.i18nService.t(
            this.platformUtilsService.isSelfHost() ? 'trashCleanupWarningSelfHosted' : 'trashCleanupWarning'
        );

        const queryParams = this.route.parent.params.subscribe(async params => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.groupingsComponent.organization = this.organization;
            this.ciphersComponent.organization = this.organization;

            const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
                this.ciphersComponent.searchText = this.groupingsComponent.searchText = qParams.search;
                if (!this.organization.canManageAllCollections) {
                    await this.syncService.fullSync(false);
                    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
                        this.ngZone.run(async () => {
                            switch (message.command) {
                                case 'syncCompleted':
                                    if (message.successfully) {
                                        await Promise.all([
                                            this.groupingsComponent.load(),
                                            this.ciphersComponent.refresh(),
                                        ]);
                                        this.changeDetectorRef.detectChanges();
                                    }
                                    break;
                            }
                        });
                    });
                }
                await this.groupingsComponent.load();

                if (qParams == null || qParams.cipherId) {
                    if (qParams.cipherId) {
                        this.editCipherById(qParams.cipherId);
                    }
                    this.groupingsComponent.selectedAll = true;
                    await this.ciphersComponent.reload();
                } else {
                    if (qParams.deleted) {
                        this.groupingsComponent.selectedTrash = true;
                        await this.filterDeleted(true);
                    } else if (qParams.type) {
                        const t = parseInt(qParams.type, null);
                        this.groupingsComponent.selectedType = t;
                        await this.filterCipherType(t, true);
                    } else if (qParams.collectionId) {
                        this.groupingsComponent.selectedCollectionId = qParams.collectionId;
                        await this.filterCollection(qParams.collectionId, true);
                    } else {
                        this.groupingsComponent.selectedAll = true;
                        await this.ciphersComponent.reload();
                    }
                }

                if (qParams.viewEvents != null) {
                    const cipher = this.ciphersComponent.ciphers.filter(c => c.id === qParams.viewEvents);
                    if (cipher.length > 0) {
                        this.viewEvents(cipher[0]);
                    }
                }

                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            });

            if (queryParams != null) {
                queryParams.unsubscribe();
            }
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async clearGroupingFilters() {
        this.ciphersComponent.showAddNew = true;
        this.ciphersComponent.deleted = false;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchVault');
        await this.ciphersComponent.applyFilter();
        this.clearFilters();
        this.go();
    }

    async filterCipherType(type: CipherType, load = false) {
        this.ciphersComponent.showAddNew = true;
        this.ciphersComponent.deleted = false;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchType');
        const filter = (c: CipherView) => c.type === type;
        if (load) {
            await this.ciphersComponent.reload(filter);
        } else {
            await this.ciphersComponent.applyFilter(filter);
        }
        this.clearFilters();
        this.type = type;
        this.go();
    }

    async filterCollection(collectionId: string, load = false) {
        this.ciphersComponent.showAddNew = true;
        this.ciphersComponent.deleted = false;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchCollection');
        const filter = (c: CipherView) => {
            if (collectionId === 'unassigned') {
                return c.collectionIds == null || c.collectionIds.length === 0;
            } else {
                return c.collectionIds != null && c.collectionIds.indexOf(collectionId) > -1;
            }
        };
        if (load) {
            await this.ciphersComponent.reload(filter);
        } else {
            await this.ciphersComponent.applyFilter(filter);
        }
        this.clearFilters();
        this.collectionId = collectionId;
        this.go();
    }

    async filterDeleted(load: boolean = false) {
        this.ciphersComponent.showAddNew = false;
        this.ciphersComponent.deleted = true;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchTrash');
        if (load) {
            await this.ciphersComponent.reload(null, true);
        } else {
            await this.ciphersComponent.applyFilter(null);
        }
        this.clearFilters();
        this.deleted = true;
        this.go();
    }

    filterSearchText(searchText: string) {
        this.ciphersComponent.searchText = searchText;
        this.ciphersComponent.search(200);
    }

    editCipherAttachments(cipher: CipherView) {
        if (this.organization.maxStorageGb == null || this.organization.maxStorageGb === 0) {
            this.messagingService.send('upgradeOrganization', { organizationId: cipher.organizationId });
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.attachmentsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AttachmentsComponent>(AttachmentsComponent, this.attachmentsModalRef);

        childComponent.organization = this.organization;
        childComponent.cipherId = cipher.id;
        let madeAttachmentChanges = false;
        childComponent.onUploadedAttachment.subscribe(() => madeAttachmentChanges = true);
        childComponent.onDeletedAttachment.subscribe(() => madeAttachmentChanges = true);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
            if (madeAttachmentChanges) {
                await this.ciphersComponent.refresh();
            }
            madeAttachmentChanges = false;
        });
    }

    editCipherCollections(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.collectionsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<CollectionsComponent>(CollectionsComponent, this.collectionsModalRef);

        if (this.organization.canManageAllCollections) {
            childComponent.collectionIds = cipher.collectionIds;
            childComponent.collections = this.groupingsComponent.collections.filter(c => !c.readOnly);
        }
        childComponent.organization = this.organization;
        childComponent.cipherId = cipher.id;
        childComponent.onSavedCollections.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    addCipher() {
        const component = this.editCipher(null);
        component.organizationId = this.organization.id;
        component.type = this.type;
        if (this.organization.canManageAllCollections) {
            component.collections = this.groupingsComponent.collections.filter(c => !c.readOnly);
        }
        if (this.collectionId != null) {
            component.collectionIds = [this.collectionId];
        }
    }

    editCipher(cipher: CipherView) {
        return this.editCipherById(cipher == null ? null : cipher.id);
    }

    cloneCipher(cipher: CipherView) {
        const component = this.editCipher(cipher);
        component.cloneMode = true;
        component.organizationId = this.organization.id;
        if (this.organization.canManageAllCollections) {
            component.collections = this.groupingsComponent.collections.filter(c => !c.readOnly);
        }
        // Regardless of Admin state, the collection Ids need to passed manually as they are not assigned value
        // in the add-edit componenet
        component.collectionIds = cipher.collectionIds;
    }

    async viewEvents(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.eventsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityEventsComponent>(
            EntityEventsComponent, this.eventsModalRef);

        childComponent.name = cipher.name;
        childComponent.organizationId = this.organization.id;
        childComponent.entityId = cipher.id;
        childComponent.showUser = true;
        childComponent.entity = 'cipher';

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private editCipherById(cipherId: string) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.cipherAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(AddEditComponent, this.cipherAddEditModalRef);

        childComponent.organization = this.organization;
        childComponent.cipherId = cipherId == null ? null : cipherId;
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });
        childComponent.onRestoredCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    private clearFilters() {
        this.collectionId = null;
        this.type = null;
        this.deleted = false;
    }

    private go(queryParams: any = null) {
        if (queryParams == null) {
            queryParams = {
                type: this.type,
                collectionId: this.collectionId,
                deleted: this.deleted ? true : null,
            };
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            replaceUrl: true,
        });
    }
}
