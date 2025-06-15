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
    // Clean and validate URL
    let cleanUrl = url.trim();
    
    // Add protocol if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = 'https://' + cleanUrl;
      } else {
        // Google search for non-URL queries
        cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanUrl)}`;
      }
    }

    this.setLoading(true);
    this._currentState.currentUrl = cleanUrl;
    
    // Simulate loading with realistic timing
    const loadingTime = Math.random() * 1000 + 500; // 500-1500ms
    
    // Update progress during loading
    let progress = 0.1;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 0.2;
      if (progress < 0.9) {
        this._currentState.progress = progress;
        this.notifyPropertyChange('currentState', this._currentState);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(progressInterval);
      this.addToHistory(cleanUrl, this.getTitleFromUrl(cleanUrl));
      this.setLoading(false);
      this.updateNavigationState();
    }, loadingTime);

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
    
    // Simulate refresh with progress
    let progress = 0.2;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 0.3;
      if (progress < 0.9) {
        this._currentState.progress = progress;
        this.notifyPropertyChange('currentState', this._currentState);
      }
    }, 80);

    setTimeout(() => {
      clearInterval(progressInterval);
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
    // Remove forward history if navigating from middle of history
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
    
    // Limit history to 100 items
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
    this._currentState.progress = loading ? 0.1 : 1;
    
    if (!loading) {
      // Small delay to show 100% progress
      setTimeout(() => {
        this._currentState.progress = 0;
        this.notifyPropertyChange('currentState', this._currentState);
      }, 200);
    }
    
    this.notifyPropertyChange('currentState', this._currentState);
  }

  private getTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Special cases for common sites
      if (domain.includes('google.com')) {
        if (url.includes('/search')) {
          return 'Recherche Google';
        }
        return 'Google';
      } else if (domain.includes('youtube.com')) {
        return 'YouTube';
      } else if (domain.includes('facebook.com')) {
        return 'Facebook';
      } else if (domain.includes('twitter.com')) {
        return 'Twitter';
      }
      
      // Capitalize first letter of domain
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Page web';
    }
  }
}