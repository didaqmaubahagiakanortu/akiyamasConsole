export function Hero({ image }: { image: string }) {
    return (
        <div className="relative overflow-hidden">
            <img src={image} alt="Hero" className="rounded-xl aspect-4/1 object-cover" />
            <div className="absolute inset-0 flex flex-col m-2 justify-self-end">
                <h1 className="text-5xl text-shadow-lg text-shadow-fuchsia-500">
                    秋山のコンソル
                </h1>
            </div>
            <div className="absolute inset-0 flex flex-col m-2 justify-end">
                <h1 className="text-5xl font-spectral text-shadow-lg text-shadow-fuchsia-500">
                    Akiyama's Console
                </h1>
            </div>
        </div>
    )
}