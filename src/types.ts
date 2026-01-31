export type MemoryBookType = 'Lớp học' | 'Phòng ban' | 'Nhóm';

export interface Photo {
  id: string;
  file?: File; // Optional because File objects can't be serialized to localStorage
  preview: string;
  note: string;
  prompt: string;
}

// Layout types for photo groups (similar to Facebook)
export type PhotoLayout = 
  | 'single'           // 1 ảnh: full width
  | 'two-horizontal'  // 2 ảnh: ngang (2 cột)
  | 'two-vertical'    // 2 ảnh: dọc (2 hàng)
  | 'three-left'      // 3 ảnh: 1 lớn trái, 2 nhỏ phải
  | 'three-right'     // 3 ảnh: 2 nhỏ trái, 1 lớn phải
  | 'three-top'       // 3 ảnh: 1 lớn trên, 2 nhỏ dưới
  | 'three-bottom'    // 3 ảnh: 2 nhỏ trên, 1 lớn dưới
  | 'four-grid';      // 4 ảnh: grid 2x2

export interface PhotoPage {
  id: string;
  photos: Photo[]; // 1-4 photos
  layout: PhotoLayout;
  note: string; // Text note for this page
}

export interface MemoryBook {
  id: string;
  name: string;
  type: MemoryBookType;
  pages: PhotoPage[]; // Changed from photos to pages
  createdAt: Date;
}

// Single template: image on one side, text on the other
export type TemplateType = 'journal';
