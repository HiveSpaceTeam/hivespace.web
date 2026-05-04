declare module 'jsvectormap'
declare module 'quill-image-uploader' {
  interface ImageUploaderOptions {
    upload: (file: File) => Promise<string>
    onError?: (error: Error) => void
    [key: string]: unknown
  }

  class ImageUploader {
    constructor(quill: unknown, options: ImageUploaderOptions)
  }

  export default ImageUploader
}
