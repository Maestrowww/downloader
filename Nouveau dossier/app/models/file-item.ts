export interface FileItem {
  id: string;
  name: string;
  size: string;
  itemCount?: number;
  type: 'folder' | 'file';
  icon: string;
}