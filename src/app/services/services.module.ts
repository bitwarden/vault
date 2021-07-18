import {
    APP_INITIALIZER,
    LOCALE_ID,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { BroadcasterMessagingService } from '../../services/broadcasterMessaging.service';
import { HtmlStorageService } from '../../services/htmlStorage.service';
import { I18nService } from '../../services/i18n.service';
import { WebPlatformUtilsService } from '../../services/webPlatformUtils.service';

import { EventService } from './event.service';
import { OrganizationGuardService } from './organization-guard.service';
import { OrganizationTypeGuardService } from './organization-type-guard.service';
import { RouterService } from './router.service';

import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';
import { LockGuardService } from 'jslib-angular/services/lock-guard.service';
import { UnauthGuardService } from 'jslib-angular/services/unauth-guard.service';
import { ValidationService } from 'jslib-angular/services/validation.service';

import { ApiService } from 'jslib-common/services/api.service';
import { AppIdService } from 'jslib-common/services/appId.service';
import { AuditService } from 'jslib-common/services/audit.service';
import { AuthService } from 'jslib-common/services/auth.service';
import { CipherService } from 'jslib-common/services/cipher.service';
import { CollectionService } from 'jslib-common/services/collection.service';
import { ConsoleLogService } from 'jslib-common/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { CryptoService } from 'jslib-common/services/crypto.service';
import { EnvironmentService } from 'jslib-common/services/environment.service';
import { EventService as EventLoggingService } from 'jslib-common/services/event.service';
import { ExportService } from 'jslib-common/services/export.service';
import { FileUploadService } from 'jslib-common/services/fileUpload.service';
import { FolderService } from 'jslib-common/services/folder.service';
import { ImportService } from 'jslib-common/services/import.service';
import { MemoryStorageService } from 'jslib-common/services/memoryStorage.service';
import { NotificationsService } from 'jslib-common/services/notifications.service';
import { PasswordGenerationService } from 'jslib-common/services/passwordGeneration.service';
import { PasswordRepromptService } from 'jslib-common/services/passwordReprompt.service';
import { PolicyService } from 'jslib-common/services/policy.service';
import { SearchService } from 'jslib-common/services/search.service';
import { SendService } from 'jslib-common/services/send.service';
import { SettingsService } from 'jslib-common/services/settings.service';
import { StateService } from 'jslib-common/services/state.service';
import { SyncService } from 'jslib-common/services/sync.service';
import { TokenService } from 'jslib-common/services/token.service';
import { TotpService } from 'jslib-common/services/totp.service';
import { UserService } from 'jslib-common/services/user.service';
import { VaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';
import { WebWorkerService } from 'jslib-common/services/webWorker.service';

import { ApiService as ApiServiceAbstraction } from 'jslib-common/abstractions/api.service';
import { AuditService as AuditServiceAbstraction } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib-common/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib-common/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib-common/abstractions/environment.service';
import { EventService as EventLoggingServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib-common/abstractions/export.service';
import { FileUploadService as FileUploadServiceAbstraction }  from 'jslib-common/abstractions/fileUpload.service';
import { FolderService as FolderServiceAbstraction } from 'jslib-common/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { ImportService as ImportServiceAbstraction } from 'jslib-common/abstractions/import.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib-common/abstractions/passwordGeneration.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib-common/abstractions/policy.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib-common/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { TokenService as TokenServiceAbstraction } from 'jslib-common/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib-common/abstractions/totp.service';
import { UserService as UserServiceAbstraction } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';
import { WebWorkerService as WebWorkerServiceAbstraction } from 'jslib-common/abstractions/webWorker.service';

const i18nService = new I18nService(window.navigator.language, 'locales');
const stateService = new StateService();
const broadcasterService = new BroadcasterService();
const messagingService = new BroadcasterMessagingService(broadcasterService);
const consoleLogService = new ConsoleLogService(false);
const platformUtilsService = new WebPlatformUtilsService(i18nService, messagingService, consoleLogService);
const storageService: StorageServiceAbstraction = new HtmlStorageService(platformUtilsService);
const secureStorageService: StorageServiceAbstraction = new MemoryStorageService();
const cryptoFunctionService: CryptoFunctionServiceAbstraction = new WebCryptoFunctionService(window,
    platformUtilsService);
const cryptoService = new CryptoService(storageService,
    platformUtilsService.isDev() ? storageService : secureStorageService, cryptoFunctionService, platformUtilsService,
    consoleLogService);
const tokenService = new TokenService(storageService);
const appIdService = new AppIdService(storageService);
const apiService = new ApiService(tokenService, platformUtilsService,
    async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const userService = new UserService(tokenService, storageService);
const settingsService = new SettingsService(userService, storageService);
export let searchService: SearchService = null;
const fileUploadService = new FileUploadService(consoleLogService, apiService);
const webWorkerService = new WebWorkerService();
const cipherService = new CipherService(cryptoService, userService, settingsService,
    apiService, fileUploadService, storageService, i18nService, () => searchService, webWorkerService,
    consoleLogService, platformUtilsService);
const folderService = new FolderService(cryptoService, userService, apiService, storageService,
    i18nService, cipherService);
const collectionService = new CollectionService(cryptoService, userService, storageService, i18nService);
searchService = new SearchService(cipherService, consoleLogService, i18nService);
const policyService = new PolicyService(userService, storageService);
const sendService = new SendService(cryptoService, userService, apiService, fileUploadService, storageService,
    i18nService, cryptoFunctionService);
const vaultTimeoutService = new VaultTimeoutService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, storageService, messagingService, searchService, userService, tokenService,
    null, async () => messagingService.send('logout', { expired: false }), webWorkerService);
const syncService = new SyncService(userService, apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService, storageService, messagingService, policyService,
    sendService, async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const passwordGenerationService = new PasswordGenerationService(cryptoService, storageService, policyService);
const totpService = new TotpService(storageService, cryptoFunctionService);
const containerService = new ContainerService(cryptoService);
const authService = new AuthService(cryptoService, apiService,
    userService, tokenService, appIdService, i18nService, platformUtilsService, messagingService, vaultTimeoutService,
    consoleLogService);
const exportService = new ExportService(folderService, cipherService, apiService, cryptoService);
const importService = new ImportService(cipherService, folderService, apiService, i18nService, collectionService,
    platformUtilsService, cryptoService);
const notificationsService = new NotificationsService(userService, syncService, appIdService,
    apiService, vaultTimeoutService, async () => messagingService.send('logout', { expired: true }), consoleLogService);
const environmentService = new EnvironmentService(apiService, storageService, notificationsService);
const auditService = new AuditService(cryptoFunctionService, apiService);
const eventLoggingService = new EventLoggingService(storageService, apiService, userService, cipherService);
const passwordRepromptService = new PasswordRepromptService(i18nService, cryptoService, platformUtilsService);

containerService.attachToWindow(window);

export function initFactory(): Function {
    return async () => {
        await (storageService as HtmlStorageService).init();

        if (process.env.ENV !== 'production' || platformUtilsService.isSelfHost()) {
            environmentService.baseUrl = window.location.origin;
        } else {
            environmentService.notificationsUrl = 'https://notifications.bitwarden.com';
            environmentService.enterpriseUrl = 'https://portal.bitwarden.com';
        }

        apiService.setUrls({
            base: window.location.origin,
            api: null,
            identity: null,
            events: null,
        });
        setTimeout(() => notificationsService.init(environmentService), 3000);

        vaultTimeoutService.init(true);
        const locale = await storageService.get<string>(ConstantsService.localeKey);
        await i18nService.init(locale);
        eventLoggingService.init(true);
        authService.init();
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('locale_' + i18nService.translationLocale);
        let theme = await storageService.get<string>(ConstantsService.themeKey);
        if (theme == null) {
            theme = 'light';
        }
        htmlEl.classList.add('theme_' + theme);
        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));
        stateService.save('enableGravatars', await storageService.get<boolean>('enableGravatars'));
    };
}

@NgModule({
    imports: [
        ToasterModule,
    ],
    declarations: [],
    providers: [
        ValidationService,
        AuthGuardService,
        OrganizationGuardService,
        OrganizationTypeGuardService,
        UnauthGuardService,
        RouterService,
        EventService,
        LockGuardService,
        { provide: AuditServiceAbstraction, useValue: auditService },
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: CipherServiceAbstraction, useValue: cipherService },
        { provide: FolderServiceAbstraction, useValue: folderService },
        { provide: CollectionServiceAbstraction, useValue: collectionService },
        { provide: EnvironmentServiceAbstraction, useValue: environmentService },
        { provide: TotpServiceAbstraction, useValue: totpService },
        { provide: TokenServiceAbstraction, useValue: tokenService },
        { provide: I18nServiceAbstraction, useValue: i18nService },
        { provide: CryptoServiceAbstraction, useValue: cryptoService },
        { provide: PlatformUtilsServiceAbstraction, useValue: platformUtilsService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: ApiServiceAbstraction, useValue: apiService },
        { provide: FileUploadServiceAbstraction, useValue: fileUploadService },
        { provide: SyncServiceAbstraction, useValue: syncService },
        { provide: UserServiceAbstraction, useValue: userService },
        { provide: MessagingServiceAbstraction, useValue: messagingService },
        { provide: BroadcasterService, useValue: broadcasterService },
        { provide: SettingsServiceAbstraction, useValue: settingsService },
        { provide: VaultTimeoutServiceAbstraction, useValue: vaultTimeoutService },
        { provide: StorageServiceAbstraction, useValue: storageService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: ExportServiceAbstraction, useValue: exportService },
        { provide: SearchServiceAbstraction, useValue: searchService },
        { provide: ImportServiceAbstraction, useValue: importService },
        { provide: NotificationsServiceAbstraction, useValue: notificationsService },
        { provide: CryptoFunctionServiceAbstraction, useValue: cryptoFunctionService },
        { provide: EventLoggingServiceAbstraction, useValue: eventLoggingService },
        { provide: PolicyServiceAbstraction, useValue: policyService },
        { provide: SendServiceAbstraction, useValue: sendService },
        { provide: WebWorkerServiceAbstraction, useValue: webWorkerService },
        { provide: PasswordRepromptServiceAbstraction, useValue: passwordRepromptService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useFactory: () => i18nService.translationLocale,
            deps: [],
        },
    ],
})
export class ServicesModule {
}
