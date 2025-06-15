import { Observable, alert, confirm } from '@nativescript/core';
import { DataService } from '../services/data.service';
import { BrowserService } from '../services/browser.service';
import { BrowserState, HistoryItem } from '../models/browser-state';
import { DownloadItem } from '../models/download-item';
import { FileItem } from '../models/file-item';

export class MainViewModel extends Observable {
  private _selectedTabIndex: number = 0;
  private _isDarkMode: boolean = true;
  private _searchText: string = '';
  private _showWebView: boolean = false;
  private _currentUrl: string = '';
  private _downloads: DownloadItem[] = [];
  private _files: FileItem[] = [];
  private _isEditingDownloads: boolean = false;
  private _isEditingFiles: boolean = false;
  private _sortBy: string = 'name';
  private dataService: DataService;
  private browserService: BrowserService;

  constructor() {
    super();
    this.dataService = DataService.getInstance();
    this.browserService = BrowserService.getInstance();
    
    // Initialiser les données
    this._downloads = this.dataService.getDownloads();
    this._files = this.dataService.getFiles();
    
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

  get downloads(): DownloadItem[] {
    return this._downloads;
  }

  get topSites() {
    return this.dataService.getTopSites();
  }

  get files(): FileItem[] {
    return this._files;
  }

  get hasDownloads(): boolean {
    return this._downloads.length > 0;
  }

  get hasHistory(): boolean {
    return this.browserService.history.length > 0;
  }

  get recentHistory(): HistoryItem[] {
    return this.browserService.history.slice(-5).reverse();
  }

  get freeSpace(): string {
    return '16,63 GB d\'espace libre';
  }

  get itemCount(): string {
    const count = this._files.length;
    return `${count} élément${count !== 1 ? 's' : ''}`;
  }

  get isEditingDownloads(): boolean {
    return this._isEditingDownloads;
  }

  get isEditingFiles(): boolean {
    return this._isEditingFiles;
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

  // Propriétés de visibilité du contenu
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

  // Méthodes d'événements - Navigateur
  onTabSelected(args: any) {
    this.selectedTabIndex = args.newIndex;
    if (args.newIndex === 0) {
      this.showWebView = false;
    }
  }

  onSearchBarTap() {
    console.log('Barre de recherche touchée');
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
      console.log(`Navigation vers: ${site.name} - ${site.url}`);
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

  async onShareButtonTap() {
    await alert({
      title: "Partager",
      message: `Partager: ${this.currentUrl}`,
      okButtonText: "OK"
    });
  }

  async onBookmarkButtonTap() {
    await alert({
      title: "Favori ajouté",
      message: `${this.pageTitle} a été ajouté aux favoris`,
      okButtonText: "OK"
    });
  }

  // Actions rapides
  async onBookmarksAction() {
    await alert({
      title: "Favoris",
      message: "Affichage des favoris...",
      okButtonText: "OK"
    });
  }

  async onHistoryAction() {
    const historyCount = this.browserService.history.length;
    await alert({
      title: "Historique",
      message: `Vous avez ${historyCount} page${historyCount !== 1 ? 's' : ''} dans votre historique`,
      okButtonText: "OK"
    });
  }

  async onPrivateBrowsingAction() {
    await alert({
      title: "Navigation privée",
      message: "Mode navigation privée activé",
      okButtonText: "OK"
    });
  }

  async onSettingsAction() {
    await alert({
      title: "Paramètres",
      message: "Ouverture des paramètres du navigateur...",
      okButtonText: "OK"
    });
  }

  async onEditTopSites() {
    await alert({
      title: "Modifier les sites",
      message: "Modification des sites favoris...",
      okButtonText: "OK"
    });
  }

  // Actions Téléchargements
  async onAddDownload() {
    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      name: `Fichier_${this._downloads.length + 1}.pdf`,
      size: `${Math.floor(Math.random() * 50 + 1)} MB`,
      progress: 0,
      status: 'downloading'
    };

    this._downloads.push(newDownload);
    this.notifyPropertyChange('downloads', this._downloads);
    this.notifyPropertyChange('hasDownloads', this.hasDownloads);

    // Simuler le téléchargement
    this.simulateDownload(newDownload);

    await alert({
      title: "Téléchargement démarré",
      message: `${newDownload.name} est en cours de téléchargement`,
      okButtonText: "OK"
    });
  }

  private simulateDownload(download: DownloadItem) {
    const interval = setInterval(() => {
      download.progress += Math.random() * 15 + 5;
      if (download.progress >= 100) {
        download.progress = 100;
        download.status = 'completed';
        clearInterval(interval);
      }
      this.notifyPropertyChange('downloads', this._downloads);
    }, 500);
  }

  onEditDownloads() {
    this._isEditingDownloads = !this._isEditingDownloads;
    this.notifyPropertyChange('isEditingDownloads', this._isEditingDownloads);
  }

  async onDeleteDownload(args: any) {
    const download = args.bindingContext as DownloadItem;
    const result = await confirm({
      title: "Supprimer le téléchargement",
      message: `Voulez-vous supprimer ${download.name} ?`,
      okButtonText: "Supprimer",
      cancelButtonText: "Annuler"
    });

    if (result) {
      const index = this._downloads.findIndex(d => d.id === download.id);
      if (index > -1) {
        this._downloads.splice(index, 1);
        this.notifyPropertyChange('downloads', this._downloads);
        this.notifyPropertyChange('hasDownloads', this.hasDownloads);
      }
    }
  }

  // Actions Fichiers
  async onAddFile() {
    const fileName = `Document_${this._files.length + 1}.txt`;
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileName,
      size: `${Math.floor(Math.random() * 10 + 1)} KB`,
      type: 'file',
      icon: '📄'
    };

    this._files.push(newFile);
    this.notifyPropertyChange('files', this._files);
    this.notifyPropertyChange('itemCount', this.itemCount);

    await alert({
      title: "Fichier créé",
      message: `${fileName} a été créé`,
      okButtonText: "OK"
    });
  }

  async onAddFolder() {
    const folderName = `Dossier_${this._files.filter(f => f.type === 'folder').length + 1}`;
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: folderName,
      size: '0 KB',
      itemCount: 0,
      type: 'folder',
      icon: '📁'
    };

    this._files.push(newFolder);
    this.notifyPropertyChange('files', this._files);
    this.notifyPropertyChange('itemCount', this.itemCount);

    await alert({
      title: "Dossier créé",
      message: `${folderName} a été créé`,
      okButtonText: "OK"
    });
  }

  async onSortFiles() {
    const options = ["Nom", "Taille", "Date"];
    // Simulation du tri (dans une vraie app, on utiliserait un ActionSheet)
    this._sortBy = this._sortBy === 'name' ? 'size' : 'name';
    
    if (this._sortBy === 'name') {
      this._files.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this._files.sort((a, b) => parseInt(a.size) - parseInt(b.size));
    }
    
    this.notifyPropertyChange('files', this._files);
    
    await alert({
      title: "Tri appliqué",
      message: `Fichiers triés par ${this._sortBy === 'name' ? 'nom' : 'taille'}`,
      okButtonText: "OK"
    });
  }

  onEditFiles() {
    this._isEditingFiles = !this._isEditingFiles;
    this.notifyPropertyChange('isEditingFiles', this._isEditingFiles);
  }

  async onFileTap(args: any) {
    const file = args.bindingContext as FileItem;
    if (file) {
      if (file.type === 'folder') {
        await alert({
          title: "Dossier",
          message: `Ouverture du dossier: ${file.name}`,
          okButtonText: "OK"
        });
      } else {
        await alert({
          title: "Fichier",
          message: `Ouverture du fichier: ${file.name}`,
          okButtonText: "OK"
        });
      }
    }
  }

  async onDeleteFile(args: any) {
    const file = args.bindingContext as FileItem;
    const result = await confirm({
      title: "Supprimer",
      message: `Voulez-vous supprimer ${file.name} ?`,
      okButtonText: "Supprimer",
      cancelButtonText: "Annuler"
    });

    if (result) {
      const index = this._files.findIndex(f => f.id === file.id);
      if (index > -1) {
        this._files.splice(index, 1);
        this.notifyPropertyChange('files', this._files);
        this.notifyPropertyChange('itemCount', this.itemCount);
      }
    }
  }

  // Actions Plus
  onToggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    console.log(`Mode sombre: ${this.isDarkMode ? 'activé' : 'désactivé'}`);
  }

  async onRemoveAds() {
    await alert({
      title: "Version Premium",
      message: "Mise à niveau vers la version premium pour supprimer les publicités",
      okButtonText: "OK"
    });
  }

  async onSendEmail() {
    await alert({
      title: "Contacter le développeur",
      message: "Ouverture de l'application mail...",
      okButtonText: "OK"
    });
  }

  async onShareWithFriend() {
    await alert({
      title: "Partager l'application",
      message: "Partage de l'application avec vos amis...",
      okButtonText: "OK"
    });
  }

  async onWatchAd() {
    await alert({
      title: "Publicité",
      message: "Lecture de la publicité en cours...",
      okButtonText: "OK"
    });
  }
}