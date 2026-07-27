import type { HeroProps } from '../types';

/** 05 — Tipográfico: palavra enorme + palavra de destaque + legenda. Texto puro. */
export default function HeroTypographic({ bigWord, accentWord, caption }: HeroProps) {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:py-28">
            <h1 className="font-heading text-6xl font-bold leading-[0.95] tracking-tight text-ink sm:text-8xl">
                {bigWord}
                {accentWord && (
                    <>
                        <br />
                        <span className="text-primary">{accentWord}</span>
                    </>
                )}
            </h1>
            {caption && <p className="max-w-md text-lg text-muted">{caption}</p>}
        </section>
    );
}
