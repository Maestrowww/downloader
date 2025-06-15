export interface BrowserState {
  currentUrl: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  progress: number;
}

export interface HistoryItem {
  url: string;
  title: string;
  timestamp: Date;
}