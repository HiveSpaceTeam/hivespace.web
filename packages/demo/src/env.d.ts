/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'jsvectormap' {
    const jsVectorMap: any
    export default jsVectorMap
}

declare module 'jsvectormap/dist/maps/world' {
    const world: any
    export default world
}

declare module 'quill-image-uploader' {
    const ImageUploader: any
    export default ImageUploader
}
