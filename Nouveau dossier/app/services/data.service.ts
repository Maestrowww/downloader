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
      {
        id: '1',
        name: 'Document_exemple.pdf',
        size: '2.5 MB',
        progress: 100,
        status: 'completed'
      },
      {
        id: '2',
        name: 'Image_vacances.jpg',
        size: '1.8 MB',
        progress: 100,
        status: 'completed'
      }
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
      },
      {
        id: '2',
        name: 'Documents',
        size: '45,8 MB',
        itemCount: 12,
        type: 'folder',
        icon: '📁'
      },
      {
        id: '3',
        name: 'Photos',
        size: '1,2 GB',
        itemCount: 156,
        type: 'folder',
        icon: '📁'
      },
      {
        id: '4',
        name: 'Vidéos',
        size: '3,4 GB',
        itemCount: 8,
        type: 'folder',
        icon: '📁'
      },
      {
        id: '5',
        name: 'Rapport_2024.pdf',
        size: '2,1 MB',
        type: 'file',
        icon: '📄'
      }
    ];
  }

  addDownload(download: DownloadItem): void {
    // Logique pour ajouter un téléchargement
    console.log('Téléchargement ajouté:', download.name);
  }

  removeDownload(downloadId: string): void {
    // Logique pour supprimer un téléchargement
    console.log('Téléchargement supprimé:', downloadId);
  }

  addFile(file: FileItem): void {
    // Logique pour ajouter un fichier
    console.log('Fichier ajouté:', file.name);
  }

  removeFile(fileId: string): void {
    // Logique pour supprimer un fichier
    console.log('Fichier supprimé:', fileId);
  }
}