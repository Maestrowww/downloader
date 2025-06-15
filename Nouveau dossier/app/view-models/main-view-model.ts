import { Observable } from '@nativescript/core';
import { DataService } from '../services/data.service';
import { BrowserService } from '../services/browser.service';
import { BrowserState, HistoryItem } from '../models/browser-state';

export class MainViewModel extends Observable {
  private _selectedTabIndex: number = 0;
  private _isDarkMode: boolean = true;
  private _searchText: string = '';
  private _showWebView: boolean = false;
  private _currentUrl: string = '';
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
        this.updateContentVisibility();
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

  get currentUrl(): string {
    return this.browserService.currentState.currentUrl || this._currentUrl;
  }

  set currentUrl(value: string) {
    if (this._currentUrl !== value) {
      this._currentUrl = value;
      this.notifyPropertyChange('currentUrl', value);
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

  get hasHistory(): boolean {
    return this.browserService.history.length > 0;
  }

  get recentHistory(): HistoryItem[] {
    return this.browserService.history.slice(-5).reverse(); // Last 5 items, most recent first
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

  // Content visibility properties
  get isGoogleSearch(): boolean {
    const url = this.currentUrl.toLowerCase();
    return url.includes('google.com/search') || url.includes('google.com') && this.searchText;
  }

  get isYouTube(): boolean {
    return this.currentUrl.toLowerCase().includes('youtube.com');
  }

  get isFacebook(): boolean {
    return this.currentUrl.toLowerCase().includes('facebook.com');
  }

  get isTwitter(): boolean {
    return this.currentUrl.toLowerCase().includes('twitter.com');
  }

  get isGenericSite(): boolean {
    return !this.isGoogleSearch && !this.isYouTube && !this.isFacebook && !this.isTwitter && this.currentUrl.length > 0;
  }

  private updateContentVisibility(): void {
    this.notifyPropertyChange('isGoogleSearch', this.isGoogleSearch);
    this.notifyPropertyChange('isYouTube', this.isYouTube);
    this.notifyPropertyChange('isFacebook', this.isFacebook);
    this.notifyPropertyChange('isTwitter', this.isTwitter);
    this.notifyPropertyChange('isGenericSite', this.isGenericSite);
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
  }

  onSearchSubmit() {
    if (this.searchText.trim()) {
      this.browserService.navigateToUrl(this.searchText.trim());
      this.showWebView = true;
      this.searchText = '';
    }
  }

  onUrlBarSubmit() {
    if (this.currentUrl.trim()) {
      this.browserService.navigateToUrl(this.currentUrl.trim());
    }
  }

  onTopSiteTap(args: any) {
    const index = parseInt(args.object.tag) || 0;
    const site = this.topSites[index];
    if (site) {
      console.log(`Navigating to: ${site.name} - ${site.url}`);
      this.browserService.navigateToTopSite(site);
      this.showWebView = true;
    }
  }

  onHistoryItemTap(args: any) {
    const item = args.bindingContext as HistoryItem;
    if (item) {
      this.browserService.navigateToUrl(item.url);
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

  // Quick actions
  onBookmarksAction() {
    console.log('Bookmarks action tapped');
  }

  onHistoryAction() {
    console.log('History action tapped');
  }

  onPrivateBrowsingAction() {
    console.log('Private browsing action tapped');
  }

  onSettingsAction() {
    console.log('Settings action tapped');
  }

  onEditTopSites() {
    console.log('Edit top sites tapped');
  }

  // Downloads actions
  onAddDownload() {
    console.log('Add download tapped');
  }

  onEditDownloads() {
    console.log('Edit downloads tapped');
  }

  // Files actions
  onAddFile() {
    console.log('Add file tapped');
  }

  onAddFolder() {
    console.log('Add folder tapped');
  }

  onSortFiles() {
    console.log('Sort files tapped');
  }

  onEditFiles() {
    console.log('Edit files tapped');
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
    const file = args.bindingContext;
    if (file) {
      console.log(`File tapped: ${file.name}`);
    }
  }
}