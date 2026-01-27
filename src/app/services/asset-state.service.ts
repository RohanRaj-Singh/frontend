import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AssetOption {
    name: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class AssetStateService {
    private assetSubject = new BehaviorSubject<AssetOption>({
        name: 'US CLO',
        value: 'us_clo'
    });

    asset$ = this.assetSubject.asObservable();

    setAsset(asset: AssetOption) {
        this.assetSubject.next(asset);
    }

    getCurrentAsset(): AssetOption {
        return this.assetSubject.value;
    }
}
