import { Observable } from '@nativescript/core';
import { DownloadItem } from '../models/download-item';
import { FileItem } from '../models/file-item';
import { TopSite } from '../models/top-site';

export class DataService extends Observable {
  private static _instance: DataService;

  static getInstance(): DataService {
    if (!DataService._instance) {
      DataService._instance = new DataService();
    }
    return DataService._instance;
  }

  getDownloads(): DownloadItem[] {
    return [
      // No downloads initially - "Aucun contenu"
    ];
  }

  getTopSites(): TopSite[] {
    return [
      {
        id: '1',
        name: 'Google',
        url: 'https://google.com',
        icon: '🌐',
        color: '#4285F4'
      },
      {
        id: '2',
        name: 'YouTube',
        url: 'https://youtube.com',
        icon: '▶️',
        color: '#FF0000'
      },
      {
        id: '3',
        name: 'Facebook',
        url: 'https://facebook.com',
        icon: '📘',
        color: '#1877F2'
      },
      {
        id: '4',
        name: 'Twitter',
        url: 'https://twitter.com',
        icon: '🐦',
        color: '#1DA1F2'
      }
    ];
  }

  getFiles(): FileItem[] {
    return [
      {
        id: '1',
        name: 'Rap Us',
        size: '223,2 MB',
        itemCount: 20,
        type: 'folder',
        icon: '📁'
      }
    ];
  }
}