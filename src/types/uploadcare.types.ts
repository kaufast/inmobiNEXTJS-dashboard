/**
 * TypeScript type definitions for Uploadcare file objects
 */

export interface UploadcareFileInfo {
  uuid: string;
  name: string;
  size: number;
  mimeType: string;
  isImage: boolean;
  isStored: boolean;
  done: boolean;
  failed: boolean;
  isRemoved: boolean;
  cdnUrl: string;
  cdnUrlModifiers: string | null;
  originalUrl: string;
  originalFilename: string;
  imageInfo?: UploadcareImageInfo;
  videoInfo?: UploadcareVideoInfo;
  contentInfo?: UploadcareContentInfo;
  metadata?: Record<string, any>;
  appData?: Record<string, any>;
}

export interface UploadcareImageInfo {
  width: number;
  height: number;
  format: string;
  colorMode: string;
  orientation: number | null;
  dpi: number | null;
  geoLocation: {
    latitude: number;
    longitude: number;
  } | null;
  datetimeOriginal: string | null;
  sequence: boolean;
}

export interface UploadcareVideoInfo {
  duration: number;
  format: string;
  bitrate: number;
  audioCodec: string | null;
  videoCodec: string;
  frameRate: number;
  width: number;
  height: number;
}

export interface UploadcareContentInfo {
  mime: {
    mime: string;
    type: string;
    subtype: string;
  };
  image?: UploadcareImageInfo;
  video?: UploadcareVideoInfo;
}

export interface UploadcareGroup {
  uuid: string;
  datetime_created: string;
  datetime_stored: string | null;
  files_count: number;
  cdn_url: string;
  url: string;
  files: UploadcareFileInfo[];
}

export interface UploadcareWidgetFileInfo {
  uuid: string;
  name: string;
  size: number;
  mimeType: string;
  cdnUrl: string;
  cdnUrlModifiers?: string;
  originalUrl: string;
  originalFilename: string;
  imageInfo?: {
    width: number;
    height: number;
    format?: string;
  };
  sourceInfo?: {
    source: string;
    file?: any;
  };
}

export interface UploadcareWidgetOptions {
  publicKey: string;
  multiple?: boolean;
  multipleMax?: number;
  multipleMin?: number;
  imagesOnly?: boolean;
  previewStep?: boolean;
  imageShrink?: string;
  imageResize?: string;
  tabs?: string;
  effects?: string;
  locale?: string;
  clearable?: boolean;
  cdnBase?: string;
  secureSignature?: string;
  secureExpire?: string;
  value?: string;
  systemDialog?: boolean;
}

export interface UploadcareWidgetAPI {
  openDialog: () => void;
  reloadInfo: () => void;
  getInput: () => HTMLInputElement;
  submit: () => void;
  validators: any[];
  onChange: (callback: (file: any) => void) => void;
  onUploadComplete: (callback: (info: UploadcareWidgetFileInfo) => void) => void;
  onDialogOpen: (callback: () => void) => void;
  onDialogClose: (callback: () => void) => void;
  onTabChange: (callback: (tabName: string) => void) => void;
  onProgress: (callback: (progress: number) => void) => void;
  value: (value?: string) => string | void;
  disabled: (state?: boolean) => boolean | void;
}

export interface UploadcareError {
  message: string;
  code?: string;
  details?: any;
}