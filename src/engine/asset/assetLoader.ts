export class AssetLoader {
    private promises = new Map<string, Promise<HTMLImageElement>>();
    private resolved = new Map<string, HTMLImageElement>();

    load(url: string): Promise<HTMLImageElement> {
        const existing = this.promises.get(url);
        if (existing) return existing;

        const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.resolved.set(url, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });

        this.promises.set(url, promise);
        return promise;
    }

    get(url: string): HTMLImageElement | undefined {
        return this.resolved.get(url);
    }

    preload(urls: string[]): Promise<HTMLImageElement[]> {
        return Promise.all(urls.map(url => this.load(url)));
    }
}

export const assetLoader = new AssetLoader();
