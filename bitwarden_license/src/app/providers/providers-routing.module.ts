import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';
import { Permissions } from 'jslib-common/enums/permissions';

import { AddOrganizationComponent } from './clients/add-organization.component';
import { ClientsComponent } from './clients/clients.component';
import { CreateOrganizationComponent } from './clients/create-organization.component';
import { AcceptProviderComponent } from './manage/accept-provider.component';
import { EventsComponent } from './manage/events.component';
import { ManageComponent } from './manage/manage.component';
import { PeopleComponent } from './manage/people.component';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { SettingsComponent } from './settings/settings.component';
import { SetupProviderComponent } from './setup/setup-provider.component';
import { SetupComponent } from './setup/setup.component';

import { FrontendLayoutComponent } from 'src/app/layouts/frontend-layout.component';

import { ProviderGuardService } from './services/provider-guard.service';
import { ProviderTypeGuardService } from './services/provider-type-guard.service';
import { AccountComponent } from './settings/account.component';

const routes: Routes = [
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            {
                path: 'setup-provider',
                component: SetupProviderComponent,
                data: { titleId: 'setupProvider' },
            },
            {
                path: 'accept-provider',
                component: AcceptProviderComponent,
                data: { titleId: 'acceptProvider' },
            },
        ],
    },
    {
        path: '',
        canActivate: [AuthGuardService],
        children: [
            {
                path: 'setup',
                component: SetupComponent,
            },
            {
                path: ':providerId',
                component: ProvidersLayoutComponent,
                canActivate: [ProviderGuardService],
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'clients' },
                    { path: 'clients/create', component: CreateOrganizationComponent },
                    { path: 'clients', component: ClientsComponent, data: { titleId: 'clients' } },
                    {
                        path: 'manage',
                        component: ManageComponent,
                        children: [
                            {
                                path: '',
                                pathMatch: 'full',
                                redirectTo: 'people',
                            },
                            {
                                path: 'people',
                                component: PeopleComponent,
                                canActivate: [ProviderTypeGuardService],
                                data: {
                                    titleId: 'people',
                                    permissions: [Permissions.ManageUsers],
                                },
                            },
                            {
                                path: 'events',
                                component: EventsComponent,
                                canActivate: [ProviderTypeGuardService],
                                data: {
                                    titleId: 'eventLogs',
                                    permissions: [Permissions.AccessEventLogs],
                                },
                            },
                        ],
                    },
                    {
                        path: 'settings',
                        component: SettingsComponent,
                        children: [
                            {
                                path: '',
                                pathMatch: 'full',
                                redirectTo: 'account',
                            },
                            {
                                path: 'account',
                                component: AccountComponent,
                                canActivate: [ProviderTypeGuardService],
                                data: {
                                    titleId: 'myProvider',
                                    permissions: [Permissions.ManageProvider],
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProvidersRoutingModule { }
