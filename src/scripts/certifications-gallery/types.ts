export type GalleryAnchorElement = HTMLAnchorElement & {
  dataset: DOMStringMap & {
    pswpSrc?: string;
    pswpWidth?: string;
    pswpHeight?: string;
    pswpCaption?: string;
  };
};

export type GallerySlide = {
  src: string;
  width: number;
  height: number;
  element: GalleryAnchorElement;
};
