/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subject, Observable } from 'rxjs';
import { OperationType } from 'app/models/operation-models/operation-types';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router'

@Injectable()
export class NavbarService {

  private _items: MenuItem[];
  private _activeItem: MenuItem;
  private _selectedSurvivalId: Subject<number>

  private _isExplore = true;
  private _isExploreResults = false;
  private _isExploreStats = false
  private _isAnalysis = false;
  private _isSurvivalRes = new Array<boolean>();

  private _lastSuccessfulSurvival: number;

  private static get EXPLORE_INDEX() {return 0; }
  private static get EXPLORE_STATISTICS_INDEX() { return 1; }
  private static get ANALYSIS_INDEX() {return 2; }

  private static get EXPLORE_ROUTE () { return '/explore'; }
  private static get EXPLORE_STATS_ROUTE() { return '/explore-statistics'; }
  private static get ANALYSIS_ROUTE() { return '/analysis'; }

  constructor(private authService: AuthenticationService, private router: Router) {
    this._selectedSurvivalId = new Subject<number>()
    this.items = [

      // 0: explore tab, default page
      { label: OperationType.EXPLORE, routerLink: NavbarService.EXPLORE_ROUTE },

      // 1: explore statistics tab
      { label: OperationType.EXPLORE_STATISTICS, routerLink: NavbarService.EXPLORE_STATS_ROUTE },
      
      // 2: survival analysis tab
      { label: OperationType.ANALYSIS, routerLink: NavbarService.ANALYSIS_ROUTE, visible: this.authService.hasAnalysisAuth }

    ];
  }

  updateNavbar(routerLink: string) {
    this.isExplore = (routerLink === NavbarService.EXPLORE_ROUTE || routerLink === '');
    this._isExploreStats = (routerLink == NavbarService.EXPLORE_STATS_ROUTE)
    this.isAnalysis = (routerLink === NavbarService.ANALYSIS_ROUTE)

    for (let i = 0; i < this.isSurvivalRes.length; i++) {
      this.isSurvivalRes[i] = (routerLink === `/survival/${i + 1}`)
    }
    console.log('Updated router link: ', routerLink)

    if (this.isExplore) {
      this.activeItem = this._items[NavbarService.EXPLORE_INDEX];
    } else if (this._isExploreStats) {
      this.activeItem = this._items[NavbarService.EXPLORE_STATISTICS_INDEX];
    } else if (this.isAnalysis) {
      this.activeItem = this._items[NavbarService.ANALYSIS_INDEX];
    } else {
      for (let i = 0; i < this.isSurvivalRes.length; i++) {
        if (this.isSurvivalRes[i]) {
          this.activeItem = this._items[i + this.items.length]
          this._selectedSurvivalId.next(i)
          break
        }
      }
    }
  }

  insertNewSurvResults() {
    let index = this.isSurvivalRes.push(false) - 1;
    this.items.push({ label: `Survival Result ${index + 1}`, routerLink: `/survival/${index + 1}` });
    this._lastSuccessfulSurvival = index + 1;

  }

  navigateToNewResults() {
    this.router.navigateByUrl(`/survival/${this._lastSuccessfulSurvival}`)
  }

  get items(): MenuItem[] {
    return this._items;
  }

  set items(value: MenuItem[]) {
    this._items = value;
  }

  get activeItem(): MenuItem {
    return this._activeItem;
  }

  set activeItem(value: MenuItem) {
    this._activeItem = value;
  }

  get isExplore(): boolean {
    return this._isExplore;
  }

  set isExplore(value: boolean) {
    this._isExplore = value;
  }

  get isExploreResults(): boolean {
    return this._isExploreResults;
  }

  set isExploreResults(value: boolean) {
    this._isExploreResults = value;
  }

  get isAnalysis(): boolean {
    return this._isAnalysis
  }

  set isAnalysis(value: boolean) {
    this._isAnalysis = value
  }

  get isExploreStatistics(): boolean {
    return this._isExploreStats
  }

  set isSurvivalRes(value: boolean[]) {
    this._isSurvivalRes = value
  }
  get isSurvivalRes(): boolean[] {
    return this._isSurvivalRes
  }
  get selectedSurvivalId(): Observable<number> {
    return this._selectedSurvivalId.asObservable()
  }
}
