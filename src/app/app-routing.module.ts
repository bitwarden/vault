import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { FrontendLayoutComponent } from './layouts/frontend-layout.component';
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
import { TwoFactorComponent } from './accounts/two-factor.component';
import { VerifyEmailTokenComponent } from './accounts/verify-email-token.component';
import { VerifyRecoverDeleteComponent } from './accounts/verify-recover-delete.component';

import { CollectionsComponent as OrgManageCollectionsComponent } from './organizations/manage/collections.component';
import { EventsComponent as OrgEventsComponent } from './organizations/manage/events.component';
import { GroupsComponent as OrgGroupsComponent } from './organizations/manage/groups.component';
import { ManageComponent as OrgManageComponent } from './organizations/manage/manage.component';
import { PeopleComponent as OrgPeopleComponent } from './organizations/manage/people.component';
import { PoliciesComponent as OrgPoliciesComponent } from './organizations/manage/policies.component';

import { AccountComponent as OrgAccountComponent } from './organizations/settings/account.component';
import { OrganizationBillingComponent } from './organizations/settings/organization-billing.component';
import { OrganizationSubscriptionComponent } from './organizations/settings/organization-subscription.component';
import { SettingsComponent as OrgSettingsComponent } from './organizations/settings/settings.component';
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

import { VaultComponent as OrgVaultComponent } from './organizations/vault/vault.component';

import { AccessComponent } from './send/access.component';
import { SendComponent } from './send/send.component';

import { AccountComponent } from './settings/account.component';
import { CreateOrganizationComponent } from './settings/create-organization.component';
import { DomainRulesComponent } from './settings/domain-rules.component';
import { OptionsComponent } from './settings/options.component';
import { OrganizationsComponent } from './settings/organizations.component';
import { PremiumComponent } from './settings/premium.component';
import { SettingsComponent } from './settings/settings.component';
import { TwoFactorSetupComponent } from './settings/two-factor-setup.component';
import { UserBillingComponent } from './settings/user-billing.component';
import { UserSubscriptionComponent } from './settings/user-subscription.component';

import { BreachReportComponent } from './tools/breach-report.component';
import { ExportComponent } from './tools/export.component';
import { ExposedPasswordsReportComponent } from './tools/exposed-passwords-report.component';
import { ImportComponent } from './tools/import.component';
import { InactiveTwoFactorReportComponent } from './tools/inactive-two-factor-report.component';
import { PasswordGeneratorComponent } from './tools/password-generator.component';
import { ReusedPasswordsReportComponent } from './tools/reused-passwords-report.component';
import { ToolsComponent } from './tools/tools.component';
import { UnsecuredWebsitesReportComponent } from './tools/unsecured-websites-report.component';
import { WeakPasswordsReportComponent } from './tools/weak-passwords-report.component';

import { VaultComponent } from './vault/vault.component';

import { OrganizationGuardService } from './services/organization-guard.service';
import { OrganizationTypeGuardService } from './services/organization-type-guard.service';
import { UnauthGuardService } from './services/unauth-guard.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

import { Permissions } from 'jslib/enums/permissions';

import { EmergencyAccessViewComponent } from './settings/emergency-access-view.component';
import { EmergencyAccessComponent } from './settings/emergency-access.component';

import { DefaultUsernamesComponent } from './settings/default-usernames.component';

const routes: Routes = [
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            { path: '', pathMatch: 'full', component: LoginComponent, canActivate: [UnauthGuardService] },
            { path: '2fa', component: TwoFactorComponent, canActivate: [UnauthGuardService] },
            {
                path: 'register', component: RegisterComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'createAccount' },
            },
            {
                path: 'sso', component: SsoComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'enterpriseSingleSignOn' },
            },
            {
                path: 'set-password', component: SetPasswordComponent,
                data: { titleId: 'setMasterPassword' },
            },
            {
                path: 'hint', component: HintComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'passwordHint' },
            },
            { path: 'lock', component: LockComponent },
            { path: 'verify-email', component: VerifyEmailTokenComponent },
            {
                path: 'accept-organization',
                component: AcceptOrganizationComponent,
                data: { titleId: 'joinOrganization' },
            },
            {
                path: 'accept-emergency',
                component: AcceptEmergencyComponent,
                data: { titleId: 'acceptEmergency' },
            },
            { path: 'recover', pathMatch: 'full', redirectTo: 'recover-2fa' },
            {
                path: 'recover-2fa',
                component: RecoverTwoFactorComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'recoverAccountTwoStep' },
            },
            {
                path: 'recover-delete',
                component: RecoverDeleteComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'deleteAccount' },
            },
            {
                path: 'verify-recover-delete',
                component: VerifyRecoverDeleteComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'deleteAccount' },
            },
            {
                path: 'send/:sendId/:key',
                component: AccessComponent,
                data: { title: 'Bitwarden Send' },
            },
        ],
    },
    {
        path: '',
        component: UserLayoutComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: 'vault', component: VaultComponent, data: { titleId: 'myVault' } },
            { path: 'sends', component: SendComponent, data: { title: 'Send' } },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: AccountComponent, data: { titleId: 'myAccount' } },
                    { path: 'options', component: OptionsComponent, data: { titleId: 'options' } },
                    { path: 'domain-rules', component: DomainRulesComponent, data: { titleId: 'domainRules' } },
                    { path: 'default-usernames', component: DefaultUsernamesComponent, data: { titleId: 'defaultUsernames' } },
                    { path: 'two-factor', component: TwoFactorSetupComponent, data: { titleId: 'twoStepLogin' } },
                    { path: 'premium', component: PremiumComponent, data: { titleId: 'goPremium' } },
                    { path: 'billing', component: UserBillingComponent, data: { titleId: 'billing' } },
                    {
                        path: 'subscription',
                        component: UserSubscriptionComponent,
                        data: { titleId: 'premiumMembership' },
                    },
                    { path: 'organizations', component: OrganizationsComponent, data: { titleId: 'organizations' } },
                    {
                        path: 'create-organization',
                        component: CreateOrganizationComponent,
                        data: { titleId: 'newOrganization' },
                    },
                    {
                        path: 'emergency-access',
                        children: [
                            {
                                path: '',
                                component: EmergencyAccessComponent,
                                data: { titleId: 'emergencyAccess'},
                            },
                            {
                                path: ':id',
                                component: EmergencyAccessViewComponent,
                                data: { titleId: 'emergencyAccess'},
                            },
                        ],
                    },
                ],
            },
            {
                path: 'tools',
                component: ToolsComponent,
                canActivate: [AuthGuardService],
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'generator' },
                    { path: 'import', component: ImportComponent, data: { titleId: 'importData' } },
                    { path: 'export', component: ExportComponent, data: { titleId: 'exportVault' } },
                    {
                        path: 'generator',
                        component: PasswordGeneratorComponent,
                        data: { titleId: 'passwordGenerator' },
                    },
                    { path: 'breach-report', component: BreachReportComponent, data: { titleId: 'dataBreachReport' } },
                    {
                        path: 'reused-passwords-report',
                        component: ReusedPasswordsReportComponent,
                        data: { titleId: 'reusedPasswordsReport' },
                    },
                    {
                        path: 'unsecured-websites-report',
                        component: UnsecuredWebsitesReportComponent,
                        data: { titleId: 'unsecuredWebsitesReport' },
                    },
                    {
                        path: 'weak-passwords-report',
                        component: WeakPasswordsReportComponent,
                        data: { titleId: 'weakPasswordsReport' },
                    },
                    {
                        path: 'exposed-passwords-report',
                        component: ExposedPasswordsReportComponent,
                        data: { titleId: 'exposedPasswordsReport' },
                    },
                    {
                        path: 'inactive-two-factor-report',
                        component: InactiveTwoFactorReportComponent,
                        data: { titleId: 'inactive2faReport' },
                    },
                ],
            },
        ],
    },
    {
        path: 'organizations/:organizationId',
        component: OrganizationLayoutComponent,
        canActivate: [AuthGuardService, OrganizationGuardService],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'vault' },
            { path: 'vault', component: OrgVaultComponent, data: { titleId: 'vault' } },
            {
                path: 'tools',
                component: OrgToolsComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { permissions: [Permissions.AccessImportExport, Permissions.AccessReports] },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'import',
                    },
                    {
                        path: 'import',
                        component: OrgImportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'importData',
                            permissions: [Permissions.AccessImportExport],
                        },
                    },
                    {
                        path: 'export',
                        component: OrgExportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'exportVault',
                            permissions: [Permissions.AccessImportExport],
                        },
                    },
                    {
                        path: 'exposed-passwords-report',
                        component: OrgExposedPasswordsReportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'exposedPasswordsReport',
                            permissions: [Permissions.AccessReports],
                        },
                    },
                    {
                        path: 'inactive-two-factor-report',
                        component: OrgInactiveTwoFactorReportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'inactive2faReport',
                            permissions: [Permissions.AccessReports],
                        },
                    },
                    {
                        path: 'reused-passwords-report',
                        component: OrgReusedPasswordsReportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'reusedPasswordsReport',
                            permissions: [Permissions.AccessReports],
                        },
                    },
                    {
                        path: 'unsecured-websites-report',
                        component: OrgUnsecuredWebsitesReportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'unsecuredWebsitesReport',
                            permissions: [Permissions.AccessReports],
                        },
                    },
                    {
                        path: 'weak-passwords-report',
                        component: OrgWeakPasswordsReportComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'weakPasswordsReport',
                            permissions: [Permissions.AccessReports],
                        },
                    },
                ],
            },
            {
                path: 'manage',
                component: OrgManageComponent,
                canActivate: [OrganizationTypeGuardService],
                data: {
                    permissions: [
                        Permissions.ManageAssignedCollections,
                        Permissions.ManageAllCollections,
                        Permissions.AccessEventLogs,
                        Permissions.ManageGroups,
                        Permissions.ManageUsers,
                        Permissions.ManagePolicies,
                    ],
                },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'people',
                    },
                    {
                        path: 'collections',
                        component: OrgManageCollectionsComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'collections',
                            permissions: [Permissions.ManageAssignedCollections, Permissions.ManageAllCollections],
                        },
                    },
                    {
                        path: 'events',
                        component: OrgEventsComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'eventLogs',
                            permissions: [Permissions.AccessEventLogs],
                        },
                    },
                    {
                        path: 'groups',
                        component: OrgGroupsComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'groups',
                            permissions: [Permissions.ManageGroups],
                        },
                    },
                    {
                        path: 'people',
                        component: OrgPeopleComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'people',
                            permissions: [Permissions.ManageUsers],
                        },
                    },
                    {
                        path: 'policies',
                        component: OrgPoliciesComponent,
                        canActivate: [OrganizationTypeGuardService],
                        data: {
                            titleId: 'policies',
                            permissions: [Permissions.ManagePolicies],
                        },
                    },
                ],
            },
            {
                path: 'settings',
                component: OrgSettingsComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { permissions: [Permissions.ManageOrganization] },
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: OrgAccountComponent, data: { titleId: 'myOrganization' } },
                    { path: 'two-factor', component: OrgTwoFactorSetupComponent, data: { titleId: 'twoStepLogin' } },
                    {
                        path: 'billing',
                        component: OrganizationBillingComponent,
                        data: { titleId: 'billing' },
                    },
                    {
                        path: 'subscription',
                        component: OrganizationSubscriptionComponent,
                        data: { titleId: 'subscription' },
                    },
                ],
            },
        ],
    },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        paramsInheritanceStrategy: 'always',
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
