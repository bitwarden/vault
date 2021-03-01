import 'core-js';

import { ToasterModule } from 'angular2-toaster';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppRoutingModule } from './app-routing.module';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ServicesModule } from './services/services.module';

import { AppComponent } from './app.component';
import { ModalComponent } from './modal.component';

import { AvatarComponent } from './components/avatar.component';
import { PasswordStrengthComponent } from './components/password-strength.component';

import { FooterComponent } from './layouts/footer.component';
import { FrontendLayoutComponent } from './layouts/frontend-layout.component';
import { NavbarComponent } from './layouts/navbar.component';
import { OrganizationLayoutComponent } from './layouts/organization-layout.component';
import { UserLayoutComponent } from './layouts/user-layout.component';

import { AcceptEmergencyComponent } from './accounts/accept-emergency.component';
import { AcceptOrganizationComponent } from './accounts/accept-organization.component';
import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RecoverDeleteComponent } from './accounts/recover-delete.component';
import { RecoverTwoFactorComponent } from './accounts/recover-two-factor.component';
import { RegisterComponent } from './accounts/register.component';
import { SetPasswordComponent } from './accounts/set-password.component';
import { SsoComponent } from './accounts/sso.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { VerifyEmailTokenComponent } from './accounts/verify-email-token.component';
import { VerifyRecoverDeleteComponent } from './accounts/verify-recover-delete.component';

import {
    CollectionAddEditComponent as OrgCollectionAddEditComponent,
} from './organizations/manage/collection-add-edit.component';
import { CollectionsComponent as OrgManageCollectionsComponent } from './organizations/manage/collections.component';
import { EntityEventsComponent as OrgEntityEventsComponent } from './organizations/manage/entity-events.component';
import { EntityUsersComponent as OrgEntityUsersComponent } from './organizations/manage/entity-users.component';
import { EventsComponent as OrgEventsComponent } from './organizations/manage/events.component';
import { GroupAddEditComponent as OrgGroupAddEditComponent } from './organizations/manage/group-add-edit.component';
import { GroupsComponent as OrgGroupsComponent } from './organizations/manage/groups.component';
import { ManageComponent as OrgManageComponent } from './organizations/manage/manage.component';
import { PeopleComponent as OrgPeopleComponent } from './organizations/manage/people.component';
import { PoliciesComponent as OrgPoliciesComponent } from './organizations/manage/policies.component';
import { PolicyEditComponent as OrgPolicyEditComponent } from './organizations/manage/policy-edit.component';
import { UserAddEditComponent as OrgUserAddEditComponent } from './organizations/manage/user-add-edit.component';
import { UserConfirmComponent as OrgUserConfirmComponent } from './organizations/manage/user-confirm.component';
import { UserGroupsComponent as OrgUserGroupsComponent } from './organizations/manage/user-groups.component';

import { AccountComponent as OrgAccountComponent } from './organizations/settings/account.component';
import { AdjustSeatsComponent } from './organizations/settings/adjust-seats.component';
import { ChangePlanComponent } from './organizations/settings/change-plan.component';
import { DeleteOrganizationComponent } from './organizations/settings/delete-organization.component';
import { DownloadLicenseComponent } from './organizations/settings/download-license.component';
import { OrganizationBillingComponent } from './organizations/settings/organization-billing.component';
import { OrganizationSubscriptionComponent } from './organizations/settings/organization-subscription.component';
import { SettingsComponent as OrgSettingComponent } from './organizations/settings/settings.component';
import {
    TwoFactorSetupComponent as OrgTwoFactorSetupComponent,
} from './organizations/settings/two-factor-setup.component';

import { ExportComponent as OrgExportComponent } from './organizations/tools/export.component';
import {
    ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent,
} from './organizations/tools/exposed-passwords-report.component';
import { ImportComponent as OrgImportComponent } from './organizations/tools/import.component';
import {
    InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent,
} from './organizations/tools/inactive-two-factor-report.component';
import {
    ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent,
} from './organizations/tools/reused-passwords-report.component';
import { ToolsComponent as OrgToolsComponent } from './organizations/tools/tools.component';
import {
    UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent,
} from './organizations/tools/unsecured-websites-report.component';
import {
    WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent,
} from './organizations/tools/weak-passwords-report.component';

import { AddEditComponent as OrgAddEditComponent } from './organizations/vault/add-edit.component';
import { AttachmentsComponent as OrgAttachmentsComponent } from './organizations/vault/attachments.component';
import { CiphersComponent as OrgCiphersComponent } from './organizations/vault/ciphers.component';
import { CollectionsComponent as OrgCollectionsComponent } from './organizations/vault/collections.component';
import { GroupingsComponent as OrgGroupingsComponent } from './organizations/vault/groupings.component';
import { VaultComponent as OrgVaultComponent } from './organizations/vault/vault.component';

import { AccessComponent } from './send/access.component';
import { AddEditComponent as SendAddEditComponent } from './send/add-edit.component';
import { SendComponent } from './send/send.component';

import { AccountComponent } from './settings/account.component';
import { AddCreditComponent } from './settings/add-credit.component';
import { AdjustPaymentComponent } from './settings/adjust-payment.component';
import { AdjustStorageComponent } from './settings/adjust-storage.component';
import { ApiKeyComponent } from './settings/api-key.component';
import { ChangeEmailComponent } from './settings/change-email.component';
import { ChangeKdfComponent } from './settings/change-kdf.component';
import { ChangePasswordComponent } from './settings/change-password.component';
import { CreateOrganizationComponent } from './settings/create-organization.component';
import { DeauthorizeSessionsComponent } from './settings/deauthorize-sessions.component';
import { DefaultUsernamesComponent } from './settings/default-usernames.component';
import { DeleteAccountComponent } from './settings/delete-account.component';
import { DomainRulesComponent } from './settings/domain-rules.component';
import { EmergencyAccessAddEditComponent } from './settings/emergency-access-add-edit.component';
import { EmergencyAccessAttachmentsComponent } from './settings/emergency-access-attachments.component';
import { EmergencyAccessConfirmComponent } from './settings/emergency-access-confirm.component';
import { EmergencyAccessTakeoverComponent } from './settings/emergency-access-takeover.component';
import { EmergencyAccessViewComponent } from './settings/emergency-access-view.component';
import { EmergencyAccessComponent } from './settings/emergency-access.component';
import { EmergencyAddEditComponent } from './settings/emergency-add-edit.component';
import { LinkSsoComponent } from './settings/link-sso.component';
import { OptionsComponent } from './settings/options.component';
import { OrganizationPlansComponent } from './settings/organization-plans.component';
import { OrganizationsComponent } from './settings/organizations.component';
import { PaymentComponent } from './settings/payment.component';
import { PremiumComponent } from './settings/premium.component';
import { ProfileComponent } from './settings/profile.component';
import { PurgeVaultComponent } from './settings/purge-vault.component';
import { SettingsComponent } from './settings/settings.component';
import { TaxInfoComponent } from './settings/tax-info.component';
import { TwoFactorAuthenticatorComponent } from './settings/two-factor-authenticator.component';
import { TwoFactorDuoComponent } from './settings/two-factor-duo.component';
import { TwoFactorEmailComponent } from './settings/two-factor-email.component';
import { TwoFactorRecoveryComponent } from './settings/two-factor-recovery.component';
import { TwoFactorSetupComponent } from './settings/two-factor-setup.component';
import { TwoFactorU2fComponent } from './settings/two-factor-u2f.component';
import { TwoFactorVerifyComponent } from './settings/two-factor-verify.component';
import { TwoFactorYubiKeyComponent } from './settings/two-factor-yubikey.component';
import { UpdateKeyComponent } from './settings/update-key.component';
import { UpdateLicenseComponent } from './settings/update-license.component';
import { UserBillingComponent } from './settings/user-billing.component';
import { UserSubscriptionComponent } from './settings/user-subscription.component';
import { VerifyEmailComponent } from './settings/verify-email.component';

import { BreachReportComponent } from './tools/breach-report.component';
import { ExportComponent } from './tools/export.component';
import { ExposedPasswordsReportComponent } from './tools/exposed-passwords-report.component';
import { ImportComponent } from './tools/import.component';
import { InactiveTwoFactorReportComponent } from './tools/inactive-two-factor-report.component';
import { PasswordGeneratorHistoryComponent } from './tools/password-generator-history.component';
import { PasswordGeneratorComponent } from './tools/password-generator.component';
import { ReusedPasswordsReportComponent } from './tools/reused-passwords-report.component';
import { ToolsComponent } from './tools/tools.component';
import { UnsecuredWebsitesReportComponent } from './tools/unsecured-websites-report.component';
import { WeakPasswordsReportComponent } from './tools/weak-passwords-report.component';

import { AddEditComponent } from './vault/add-edit.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { BulkActionsComponent } from './vault/bulk-actions.component';
import { BulkDeleteComponent } from './vault/bulk-delete.component';
import { BulkMoveComponent } from './vault/bulk-move.component';
import { BulkRestoreComponent } from './vault/bulk-restore.component';
import { BulkShareComponent } from './vault/bulk-share.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CollectionsComponent } from './vault/collections.component';
import { FolderAddEditComponent } from './vault/folder-add-edit.component';
import { GroupingsComponent } from './vault/groupings.component';
import { ShareComponent } from './vault/share.component';
import { VaultComponent } from './vault/vault.component';

import { CalloutComponent } from 'jslib/angular/components/callout.component';
import { IconComponent } from 'jslib/angular/components/icon.component';

import { A11yTitleDirective } from 'jslib/angular/directives/a11y-title.directive';
import { ApiActionDirective } from 'jslib/angular/directives/api-action.directive';
import { AutofocusDirective } from 'jslib/angular/directives/autofocus.directive';
import { BlurClickDirective } from 'jslib/angular/directives/blur-click.directive';
import { BoxRowDirective } from 'jslib/angular/directives/box-row.directive';
import { FallbackSrcDirective } from 'jslib/angular/directives/fallback-src.directive';
import { InputVerbatimDirective } from 'jslib/angular/directives/input-verbatim.directive';
import { SelectCopyDirective } from 'jslib/angular/directives/select-copy.directive';
import { StopClickDirective } from 'jslib/angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib/angular/directives/stop-prop.directive';
import { TrueFalseValueDirective } from 'jslib/angular/directives/true-false-value.directive';

import { ColorPasswordPipe } from 'jslib/angular/pipes/color-password.pipe';
import { I18nPipe } from 'jslib/angular/pipes/i18n.pipe';
import { SearchCiphersPipe } from 'jslib/angular/pipes/search-ciphers.pipe';
import { SearchPipe } from 'jslib/angular/pipes/search.pipe';

import {
    DatePipe,
    registerLocaleData,
} from '@angular/common';
import localeCa from '@angular/common/locales/ca';
import localeCs from '@angular/common/locales/cs';
import localeDa from '@angular/common/locales/da';
import localeDe from '@angular/common/locales/de';
import localeEl from '@angular/common/locales/el';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEs from '@angular/common/locales/es';
import localeEt from '@angular/common/locales/et';
import localeFr from '@angular/common/locales/fr';
import localeHe from '@angular/common/locales/he';
import localeIt from '@angular/common/locales/it';
import localeJa from '@angular/common/locales/ja';
import localeKo from '@angular/common/locales/ko';
import localeLv from '@angular/common/locales/lv';
import localeMl from '@angular/common/locales/ml';
import localeNb from '@angular/common/locales/nb';
import localeNl from '@angular/common/locales/nl';
import localePl from '@angular/common/locales/pl';
import localePtBr from '@angular/common/locales/pt';
import localePtPt from '@angular/common/locales/pt-PT';
import localeRu from '@angular/common/locales/ru';
import localeSk from '@angular/common/locales/sk';
import localeSv from '@angular/common/locales/sv';
import localeUk from '@angular/common/locales/uk';
import localeZhCn from '@angular/common/locales/zh-Hans';
import localeZhTw from '@angular/common/locales/zh-Hant';

registerLocaleData(localeCa, 'ca');
registerLocaleData(localeCs, 'cs');
registerLocaleData(localeDa, 'da');
registerLocaleData(localeDe, 'de');
registerLocaleData(localeEl, 'el');
registerLocaleData(localeEnGb, 'en-GB');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEt, 'et');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeHe, 'he');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeJa, 'ja');
registerLocaleData(localeKo, 'ko');
registerLocaleData(localeLv, 'lv');
registerLocaleData(localeMl, 'ml');
registerLocaleData(localeNb, 'nb');
registerLocaleData(localeNl, 'nl');
registerLocaleData(localePl, 'pl');
registerLocaleData(localePtBr, 'pt-BR');
registerLocaleData(localePtPt, 'pt-PT');
registerLocaleData(localeRu, 'ru');
registerLocaleData(localeSk, 'sk');
registerLocaleData(localeSv, 'sv');
registerLocaleData(localeUk, 'uk');
registerLocaleData(localeZhCn, 'zh-CN');
registerLocaleData(localeZhTw, 'zh-TW');

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        ServicesModule,
        Angulartics2Module.forRoot({
            pageTracking: {
                clearQueryParams: true,
            },
        }),
        ToasterModule.forRoot(),
        InfiniteScrollModule,
        DragDropModule,
    ],
    declarations: [
        A11yTitleDirective,
        AcceptEmergencyComponent,
        AccessComponent,
        AcceptOrganizationComponent,
        AccountComponent,
        SetPasswordComponent,
        AddCreditComponent,
        AddEditComponent,
        AdjustPaymentComponent,
        AdjustSeatsComponent,
        AdjustStorageComponent,
        ApiActionDirective,
        ApiKeyComponent,
        AppComponent,
        AttachmentsComponent,
        AutofocusDirective,
        AvatarComponent,
        BlurClickDirective,
        BoxRowDirective,
        BreachReportComponent,
        BulkActionsComponent,
        BulkDeleteComponent,
        BulkMoveComponent,
        BulkRestoreComponent,
        BulkShareComponent,
        CalloutComponent,
        ChangeEmailComponent,
        ChangeKdfComponent,
        ChangePasswordComponent,
        ChangePlanComponent,
        CiphersComponent,
        CollectionsComponent,
        ColorPasswordPipe,
        CreateOrganizationComponent,
        DeauthorizeSessionsComponent,
        DefaultUsernamesComponent,
        DeleteAccountComponent,
        DeleteOrganizationComponent,
        DomainRulesComponent,
        DownloadLicenseComponent,
        EmergencyAccessAddEditComponent,
        EmergencyAccessAttachmentsComponent,
        EmergencyAccessComponent,
        EmergencyAccessConfirmComponent,
        EmergencyAccessTakeoverComponent,
        EmergencyAccessViewComponent,
        EmergencyAddEditComponent,
        ExportComponent,
        ExposedPasswordsReportComponent,
        FallbackSrcDirective,
        FolderAddEditComponent,
        FooterComponent,
        FrontendLayoutComponent,
        GroupingsComponent,
        HintComponent,
        I18nPipe,
        IconComponent,
        ImportComponent,
        InactiveTwoFactorReportComponent,
        InputVerbatimDirective,
        LinkSsoComponent,
        LockComponent,
        LoginComponent,
        ModalComponent,
        NavbarComponent,
        OptionsComponent,
        OrgAccountComponent,
        OrgAddEditComponent,
        OrganizationBillingComponent,
        OrganizationPlansComponent,
        OrganizationSubscriptionComponent,
        OrgAttachmentsComponent,
        OrgCiphersComponent,
        OrgCollectionAddEditComponent,
        OrgCollectionsComponent,
        OrgEntityEventsComponent,
        OrgEntityUsersComponent,
        OrgEventsComponent,
        OrgExportComponent,
        OrgExposedPasswordsReportComponent,
        OrgImportComponent,
        OrgInactiveTwoFactorReportComponent,
        OrgGroupAddEditComponent,
        OrgGroupingsComponent,
        OrgGroupsComponent,
        OrgManageCollectionsComponent,
        OrgManageComponent,
        OrgPeopleComponent,
        OrgPolicyEditComponent,
        OrgPoliciesComponent,
        OrgReusedPasswordsReportComponent,
        OrgSettingComponent,
        OrgToolsComponent,
        OrgTwoFactorSetupComponent,
        OrgUserAddEditComponent,
        OrgUserConfirmComponent,
        OrgUserGroupsComponent,
        OrganizationsComponent,
        OrganizationLayoutComponent,
        OrgUnsecuredWebsitesReportComponent,
        OrgVaultComponent,
        OrgWeakPasswordsReportComponent,
        PasswordGeneratorComponent,
        PasswordGeneratorHistoryComponent,
        PasswordStrengthComponent,
        PaymentComponent,
        PremiumComponent,
        ProfileComponent,
        PurgeVaultComponent,
        RecoverDeleteComponent,
        RecoverTwoFactorComponent,
        RegisterComponent,
        ReusedPasswordsReportComponent,
        SearchCiphersPipe,
        SearchPipe,
        SelectCopyDirective,
        SendAddEditComponent,
        SendComponent,
        SettingsComponent,
        ShareComponent,
        SsoComponent,
        StopClickDirective,
        StopPropDirective,
        TaxInfoComponent,
        ToolsComponent,
        TrueFalseValueDirective,
        TwoFactorAuthenticatorComponent,
        TwoFactorComponent,
        TwoFactorDuoComponent,
        TwoFactorEmailComponent,
        TwoFactorOptionsComponent,
        TwoFactorRecoveryComponent,
        TwoFactorSetupComponent,
        TwoFactorU2fComponent,
        TwoFactorVerifyComponent,
        TwoFactorYubiKeyComponent,
        UnsecuredWebsitesReportComponent,
        UpdateKeyComponent,
        UpdateLicenseComponent,
        UserBillingComponent,
        UserLayoutComponent,
        UserSubscriptionComponent,
        VaultComponent,
        VerifyEmailComponent,
        VerifyEmailTokenComponent,
        VerifyRecoverDeleteComponent,
        WeakPasswordsReportComponent,
    ],
    entryComponents: [
        AddEditComponent,
        ApiKeyComponent,
        AttachmentsComponent,
        BulkActionsComponent,
        BulkDeleteComponent,
        BulkMoveComponent,
        BulkRestoreComponent,
        BulkShareComponent,
        CollectionsComponent,
        DeauthorizeSessionsComponent,
        DeleteAccountComponent,
        DeleteOrganizationComponent,
        EmergencyAccessAddEditComponent,
        EmergencyAccessAttachmentsComponent,
        EmergencyAccessConfirmComponent,
        EmergencyAccessTakeoverComponent,
        EmergencyAddEditComponent,
        FolderAddEditComponent,
        ModalComponent,
        OrgAddEditComponent,
        OrgAttachmentsComponent,
        OrgCollectionAddEditComponent,
        OrgCollectionsComponent,
        OrgEntityEventsComponent,
        OrgEntityUsersComponent,
        OrgGroupAddEditComponent,
        OrgPolicyEditComponent,
        OrgUserAddEditComponent,
        OrgUserConfirmComponent,
        OrgUserGroupsComponent,
        PasswordGeneratorHistoryComponent,
        PurgeVaultComponent,
        SendAddEditComponent,
        ShareComponent,
        TwoFactorAuthenticatorComponent,
        TwoFactorDuoComponent,
        TwoFactorEmailComponent,
        TwoFactorOptionsComponent,
        TwoFactorRecoveryComponent,
        TwoFactorU2fComponent,
        TwoFactorYubiKeyComponent,
        UpdateKeyComponent,
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule { }
