import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

// Extend MenuItem to support SVG icons
interface MenuItemWithSvg extends MenuItem {
    svgIcon?: string; // Path to SVG file or inline SVG
}

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItemWithSvg[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Main',
                items: [
                    {
                        label: 'Dashboard',
                        svgIcon: 'assets/icon/dashboard.svg', // Change to your SVG path
                        routerLink: ['/home']
                    },
                    {
                        label: 'Security Search',
                        svgIcon: 'assets/icon/security.svg', // Change to your SVG path
                        routerLink: ['/home'],
                        disabled: true,
                        title: 'Coming Soon'
                    },
                    {
                        label: 'Color Process',
                        svgIcon: 'assets/icon/colorprocess.svg', // Change to your SVG path
                        routerLink: ['/color-type']
                    },
                    {
                        label: 'Data Statistics',
                        svgIcon: 'assets/icon/data.svg', // Change to your SVG path
                        routerLink: ['/home'],
                        disabled: true,
                        title: 'Coming Soon'
                    }
                ]
            },

            {
                label: 'Settings',
                items: [
                    {
                        label: 'Rules',
                        svgIcon: 'assets/icon/rules.svg', // Change to your SVG path
                        routerLink: ['/settings'],
                        queryParams: { section: 'rules' }
                    },
                    {
                        label: 'Preset',
                        svgIcon: 'assets/icon/cronjobs.svg', // Change to your SVG path
                        routerLink: ['/settings'],
                        queryParams: { section: 'preset' }
                    },
                    {
                        label: 'Cron Jobs',
                        svgIcon: 'assets/icon/clock.svg', // Change to your SVG path
                        routerLink: ['/settings'],
                        queryParams: { section: 'cron-jobs' }
                    },
                    {
                        label: 'Email & Restore',
                        svgIcon: 'assets/icon/envelope.svg', // Change to your SVG path
                        routerLink: ['/settings'],
                        queryParams: { section: 'restore-email' }
                    }
                ]
            }
        ];
    }
}
