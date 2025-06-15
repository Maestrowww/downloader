import { Observable } from '@nativescript/core';
import { DataService } from '../services/data.service';
import { BrowserService } from '../services/browser.service';
import { BrowserState } from '../models/browser-state';

export class MainViewModel extends Observable {
  private _selectedTabIndex: number = 0;
  private _isDarkMode: boolean = true;
  private _searchText: string = '';
  private _showWebView: boolean = false;
  private dataService: DataService;
  private browserService: BrowserService;

  constructor() {
    super();
    this.dataService = DataService.getInstance();
    this.browserService = BrowserService.getInstance();
    
    // Écouter les changements d'état du navigateur
    this.browserService.on('propertyChange', (args: any) => {
      if (args.propertyName === 'currentState') {
        this.notifyPropertyChange('browserState', this.browserState);
        this.notifyPropertyChange('currentUrl', this.currentUrl);
        this.notifyPropertyChange('pageTitle', this.pageTitle);
        this.notifyPropertyChange('canGoBack', this.canGoBack);
        this.notifyPropertyChange('canGoForward', this.canGoForward);
        this.notifyPropertyChange('isLoading', this.isLoading);
      }
    });
  }

  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }

  set selectedTabIndex(value: number) {
    if (this._selectedTabIndex !== value) {
      this._selectedTabIndex = value;
      this.notifyPropertyChange('selectedTabIndex', value);
    }
  }

  get isDarkMode(): boolean {
    return this._isDarkMode;
  }

  set isDarkMode(value: boolean) {
    if (this._isDarkMode !== value) {
      this._isDarkMode = value;
      this.notifyPropertyChange('isDarkMode', value);
      this.notifyPropertyChange('onLabelBackgroundColor', this.onLabelBackgroundColor);
      this.notifyPropertyChange('offLabelBackgroundColor', this.offLabelBackgroundColor);
    }
  }

  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string) {
    if (this._searchText !== value) {
      this._searchText = value;
      this.notifyPropertyChange('searchText', value);
    }
  }

  get showWebView(): boolean {
    return this._showWebView;
  }

  set showWebView(value: boolean) {
    if (this._showWebView !== value) {
      this._showWebView = value;
      this.notifyPropertyChange('showWebView', value);
    }
  }

  get onLabelBackgroundColor(): string {
    return this._isDarkMode ? '#007AFF' : 'transparent';
  }

  get offLabelBackgroundColor(): string {
    return this._isDarkMode ? 'transparent' : '#007AFF';
  }

  get downloads() {
    return this.dataService.getDownloads();
  }

  get topSites() {
    return this.dataService.getTopSites();
  }

  get files() {
    return this.dataService.getFiles();
  }

  get hasDownloads(): boolean {
    return this.downloads.length > 0;
  }

  get freeSpace(): string {
    return '16,63 GB d\'espace libre';
  }

  get itemCount(): string {
    const count = this.files.length;
    return `${count} item${count !== 1 ? 's' : ''}`;
  }

  // Propriétés du navigateur
  get browserState(): BrowserState {
    return this.browserService.currentState;
  }

  get currentUrl(): string {
    return this.browserService.currentState.currentUrl || '';
  }

  get pageTitle(): string {
    return this.browserService.currentState.title || 'Nouvelle page';
  }

  get canGoBack(): boolean {
    return this.browserService.currentState.canGoBack;
  }

  get canGoForward(): boolean {
    return this.browserService.currentState.canGoForward;
  }

  get isLoading(): boolean {
    return this.browserService.currentState.isLoading;
  }

  get searchPlaceholder(): string {
    return this.showWebView ? this.currentUrl || 'Rechercher ou saisir un site' : 'Rechercher ou saisir un site';
  }

  // Méthodes d'événements
  onTabSelected(args: any) {
    this.selectedTabIndex = args.newIndex;
    if (args.newIndex === 0) {
      // Retour à l'onglet navigateur
      this.showWebView = false;
    }
  }

  onSearchBarTap() {
    console.log('Search bar tapped');
    // Ici on pourrait ouvrir un clavier virtuel ou une interface de saisie
  }

  onSearchSubmit() {
    if (this.searchText.trim()) {
      this.browserService.navigateToUrl(this.searchText.trim());
      this.showWebView = true;
      this.searchText = '';
    }
  }

  onTopSiteTap(args: any) {
    const index = args.object.tag || 0;
    const site = this.topSites[index];
    if (site) {
      console.log(`Navigating to: ${site.name} - ${site.url}`);
      this.browserService.navigateToTopSite(site);
      this.showWebView = true;
    }
  }

  onBackButtonTap() {
    if (this.showWebView && this.canGoBack) {
      this.browserService.goBack();
    } else if (this.showWebView) {
      this.showWebView = false;
    }
  }

  onForwardButtonTap() {
    if (this.canGoForward) {
      this.browserService.goForward();
    }
  }

  onRefreshButtonTap() {
    this.browserService.refresh();
  }

  onShareButtonTap() {
    console.log('Share button tapped');
    // Implémenter le partage
  }

  onBookmarkButtonTap() {
    console.log('Bookmark button tapped');
    // Implémenter les favoris
  }

  onToggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    console.log(`Dark mode: ${this.isDarkMode ? 'enabled' : 'disabled'}`);
  }

  onRemoveAds() {
    console.log('Remove ads tapped');
  }

  onSendEmail() {
    console.log('Send email to developer tapped');
  }

  onShareWithFriend() {
    console.log('Share with friend tapped');
  }

  onWatchAd() {
    console.log('Watch ad tapped');
  }

  onFileTap(args: any) {
    const index = args.object.tag || 0;
    const file = this.files[index];
    if (file) {
      console.log(`File tapped: ${file.name}`);
    }
  }
}