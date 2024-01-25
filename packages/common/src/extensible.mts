export type Extensible<B, V> = B & { [name: string]: V };
export type WeakExtensible<B> = Extensible<B, any>;
