import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar">
        <app-menu></app-menu>
    </div>`,
    styles: [
        `
            .layout-sidebar {
                position: fixed;
                width: 17rem;
                height: calc(100vh - 4rem); /* Adjusted to account for topbar only */
                z-index: 999;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-user-select: none;
                user-select: none;
                top: 4rem;
                left: 0;
                transition:
                    transform var(--layout-section-transition-duration),
                    left var(--layout-section-transition-duration),
                    opacity var(--layout-section-transition-duration),
                    display 0.3s ease;
                background-color: #ffffff;
                border-radius: 0;
                padding: 0.5rem 1.5rem;
                border-right: 1px solid var(--surface-border);
                display: block;
            }

            /* Hide sidebar when table is expanded */
            .layout-sidebar.hidden {
                display: none;
                opacity: 0;
                transform: translateX(-100%);
            }

            /* Scrollbar styling */
            .layout-sidebar::-webkit-scrollbar {
                width: 6px;
            }

            .layout-sidebar::-webkit-scrollbar-track {
                background: transparent;
            }

            .layout-sidebar::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 3px;
            }

            .layout-sidebar::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
        `
    ]
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}