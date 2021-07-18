import * as jq from 'jquery';
import Swal from 'sweetalert2';

import {
    BodyOutputType,
    Toast,
    ToasterConfig,
    ToasterService,
} from 'angular2-toaster';

import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    SecurityContext,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
    NavigationEnd,
    Router,
} from '@angular/router';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { StorageService } from 'jslib-common/abstractions/storage.service';

import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { SettingsService } from 'jslib-common/abstractions/settings.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { TokenService } from 'jslib-common/abstractions/token.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { WebWorkerService } from 'jslib-common/abstractions/webWorker.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { RouterService } from './services/router.service';

const BroadcasterSubscriptionId = 'AppComponent';
const IdleTimeout = 60000 * 10; // 10 minutes

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnDestroy, OnInit {
    toasterConfig: ToasterConfig = new ToasterConfig({
        showCloseButton: true,
        mouseoverTimerStop: true,
        animation: 'flyRight',
        limit: 5,
    });

    private lastActivity: number = null;
    private idleTimer: number = null;
    private isIdle = false;

    constructor(
        private broadcasterService: BroadcasterService, private userService: UserService,
        private tokenService: TokenService, private folderService: FolderService,
        private settingsService: SettingsService, private syncService: SyncService,
        private passwordGenerationService: PasswordGenerationService, private cipherService: CipherService,
        private authService: AuthService, private router: Router,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService, private ngZone: NgZone,
        private vaultTimeoutService: VaultTimeoutService, private storageService: StorageService,
        private cryptoService: CryptoService, private collectionService: CollectionService,
        private sanitizer: DomSanitizer, private searchService: SearchService,
        private notificationsService: NotificationsService, private routerService: RouterService,
        private stateService: StateService, private eventService: EventService,
        private policyService: PolicyService, private webWorkerService: WebWorkerService) { }

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            window.onmousemove = () => this.recordActivity();
            window.onmousedown = () => this.recordActivity();
            window.ontouchstart = () => this.recordActivity();
            window.onclick = () => this.recordActivity();
            window.onscroll = () => this.recordActivity();
            window.onkeypress = () => this.recordActivity();
        });

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'loggedIn':
                    case 'loggedOut':
                    case 'unlocked':
                        this.notificationsService.updateConnection(false);
                        break;
                    case 'authBlocked':
                        this.router.navigate(['/']);
                        break;
                    case 'logout':
                        this.logOut(!!message.expired);
                        break;
                    case 'lockVault':
                        await this.vaultTimeoutService.lock();
                        break;
                    case 'locked':
                        this.notificationsService.updateConnection(false);
                        this.router.navigate(['lock']);
                        break;
                    case 'lockedUrl':
                        window.setTimeout(() => this.routerService.setPreviousUrl(message.url), 500);
                        break;
                    case 'syncStarted':
                        break;
                    case 'syncCompleted':
                        break;
                    case 'upgradeOrganization':
                        const upgradeConfirmed = await this.platformUtilsService.showDialog(
                            this.i18nService.t('upgradeOrganizationDesc'), this.i18nService.t('upgradeOrganization'),
                            this.i18nService.t('upgradeOrganization'), this.i18nService.t('cancel'));
                        if (upgradeConfirmed) {
                            this.router.navigate(['organizations', message.organizationId, 'settings', 'billing']);
                        }
                        break;
                    case 'premiumRequired':
                        const premiumConfirmed = await this.platformUtilsService.showDialog(
                            this.i18nService.t('premiumRequiredDesc'), this.i18nService.t('premiumRequired'),
                            this.i18nService.t('learnMore'), this.i18nService.t('cancel'));
                        if (premiumConfirmed) {
                            this.router.navigate(['settings/premium']);
                        }
                        break;
                    case 'emailVerificationRequired':
                        const emailVerificationConfirmed = await this.platformUtilsService.showDialog(
                            this.i18nService.t('emailVerificationRequiredDesc'),
                            this.i18nService.t('emailVerificationRequired'),
                            this.i18nService.t('learnMore'), this.i18nService.t('cancel'));
                        if (emailVerificationConfirmed) {
                            this.platformUtilsService.launchUri('https://bitwarden.com/help/article/create-bitwarden-account/');
                        }
                        break;
                    case 'showToast':
                        this.showToast(message);
                        break;
                    case 'setFullWidth':
                        this.setFullWidth();
                        break;
                    default:
                        break;
                }
            });
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const modals = Array.from(document.querySelectorAll('.modal'));
                for (const modal of modals) {
                    (jq(modal) as any).modal('hide');
                }

                if (document.querySelector('.swal-modal') != null) {
                    Swal.close(undefined);
                }
            }
        });

        this.setFullWidth();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    private async logOut(expired: boolean) {
        await this.eventService.uploadEvents();
        const userId = await this.userService.getUserId();

        await Promise.all([
            this.eventService.clearEvents(),
            this.syncService.setLastSync(new Date(0)),
            this.tokenService.clearToken(),
            this.cryptoService.clearKeys(),
            this.userService.clear(),
            this.settingsService.clear(userId),
            this.cipherService.clear(userId),
            this.folderService.clear(userId),
            this.collectionService.clear(userId),
            this.policyService.clear(userId),
            this.passwordGenerationService.clear(),
            this.stateService.purge(),
            this.webWorkerService.terminateAll(),
        ]);

        this.searchService.clearIndex();
        this.authService.logOut(async () => {
            if (expired) {
                this.toasterService.popAsync('warning', this.i18nService.t('loggedOut'),
                    this.i18nService.t('loginExpired'));
            }

            Swal.close();
            this.router.navigate(['/']);
        });
    }

    private async recordActivity() {
        const now = (new Date()).getTime();
        if (this.lastActivity != null && now - this.lastActivity < 250) {
            return;
        }

        this.lastActivity = now;
        this.storageService.save(ConstantsService.lastActiveKey, now);

        // Idle states
        if (this.isIdle) {
            this.isIdle = false;
            this.idleStateChanged();
        }
        if (this.idleTimer != null) {
            window.clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        this.idleTimer = window.setTimeout(() => {
            if (!this.isIdle) {
                this.isIdle = true;
                this.idleStateChanged();
            }
        }, IdleTimeout);
    }

    private showToast(msg: any) {
        const toast: Toast = {
            type: msg.type,
            title: msg.title,
        };
        if (typeof (msg.text) === 'string') {
            toast.body = msg.text;
        } else if (msg.text.length === 1) {
            toast.body = msg.text[0];
        } else {
            let message = '';
            msg.text.forEach((t: string) =>
                message += ('<p>' + this.sanitizer.sanitize(SecurityContext.HTML, t) + '</p>'));
            toast.body = message;
            toast.bodyOutputType = BodyOutputType.TrustedHtml;
        }
        if (msg.options != null) {
            if (msg.options.trustedHtml === true) {
                toast.bodyOutputType = BodyOutputType.TrustedHtml;
            }
            if (msg.options.timeout != null && msg.options.timeout > 0) {
                toast.timeout = msg.options.timeout;
            }
        }
        this.toasterService.popAsync(toast);
    }

    private idleStateChanged() {
        if (this.isIdle) {
            this.notificationsService.disconnectFromInactivity();
        } else {
            this.notificationsService.reconnectFromActivity();
        }
    }

    private async setFullWidth() {
        const enableFullWidth = await this.storageService.get<boolean>('enableFullWidth');
        if (enableFullWidth) {
            document.body.classList.add('full-width');
        } else {
            document.body.classList.remove('full-width');
        }
    }
}
