import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrganizationPlansComponent } from 'src/app/settings/organization-plans.component';

@Component({
    selector: 'app-create-organization',
    templateUrl: 'create-organization.component.html',
})
export class CreateOrganizationComponent implements OnInit {
    @ViewChild(OrganizationPlansComponent, { static: true }) orgPlansComponent: OrganizationPlansComponent;

    providerId: string;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            this.providerId = params.providerId;
        });
    }
}
