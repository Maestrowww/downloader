import { Observable } from '@nativescript/core';
import { BrowserState, HistoryItem } from '../models/browser-state';
import { TopSite } from '../models/top-site';

export class BrowserService extends Observable {
  private static _instance: BrowserService;
  private _currentState: BrowserState;
  private _history: HistoryItem[] = [];
  private _currentHistoryIndex: number = -1;

  static getInstance(): BrowserService {
    if (!BrowserService._instance) {
      BrowserService._instance = new BrowserService();
    }
    return BrowserService._instance;
  }

  constructor() {
    super();
    this._currentState = {
      currentUrl: '',
      title: 'Nouvelle page',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      progress: 0
    };
  }

  get currentState(): BrowserState {
    return this._currentState;
  }

  get history(): HistoryItem[] {
    return this._history;
  }

  navigateToUrl(url: string): void {
    // Ajouter http:// si pas de protocole
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.')) {
        url = 'https://' + url;
      } else {
        // Recherche Google si pas d'URL valide
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    this.setLoading(true);
    this._currentState.currentUrl = url;
    
    // Simuler le chargement
    setTimeout(() => {
      this.addToHistory(url, this.getTitleFromUrl(url));
      this.setLoading(false);
      this.updateNavigationState();
    }, 1000);

    this.notifyPropertyChange('currentState', this._currentState);
  }

  navigateToTopSite(site: TopSite): void {
    this.navigateToUrl(site.url);
  }

  goBack(): void {
    if (this.canGoBack()) {
      this._currentHistoryIndex--;
      const historyItem = this._history[this._currentHistoryIndex];
      this._currentState.currentUrl = historyItem.url;
      this._currentState.title = historyItem.title;
      this.updateNavigationState();
      this.notifyPropertyChange('currentState', this._currentState);
    }
  }

  goForward(): void {
    if (this.canGoForward()) {
      this._currentHistoryIndex++;
      const historyItem = this._history[this._currentHistoryIndex];
      this._currentState.currentUrl = historyItem.url;
      this._currentState.title = historyItem.title;
      this.updateNavigationState();
      this.notifyPropertyChange('currentState', this._currentState);
    }
  }

  refresh(): void {
    this.setLoading(true);
    setTimeout(() => {
      this.setLoading(false);
    }, 800);
  }

  private canGoBack(): boolean {
    return this._currentHistoryIndex > 0;
  }

  private canGoForward(): boolean {
    return this._currentHistoryIndex < this._history.length - 1;
  }

  private addToHistory(url: string, title: string): void {
    // Supprimer les éléments après l'index actuel si on navigue depuis l'historique
    if (this._currentHistoryIndex < this._history.length - 1) {
      this._history = this._history.slice(0, this._currentHistoryIndex + 1);
    }

    const historyItem: HistoryItem = {
      url,
      title,
      timestamp: new Date()
    };

    this._history.push(historyItem);
    this._currentHistoryIndex = this._history.length - 1;
    
    // Limiter l'historique à 100 éléments
    if (this._history.length > 100) {
      this._history.shift();
      this._currentHistoryIndex--;
    }
  }

  private updateNavigationState(): void {
    this._currentState.canGoBack = this.canGoBack();
    this._currentState.canGoForward = this.canGoForward();
  }

  private setLoading(loading: boolean): void {
    this._currentState.isLoading = loading;
    this._currentState.progress = loading ? 0.3 : 1;
    this.notifyPropertyChange('currentState', this._currentState);
  }

  private getTitleFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Page web';
    }
  }
}