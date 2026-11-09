export function AboutScreen() {
  return (
    <article className="space-y-6 py-8 pr-12 pl-6">
      <img src="/logo.png" alt="remarkeble" className="mx-auto h-32 w-auto" />
      <p className="text-center font-serif text-[15px] leading-7">
        Discovering Hong Kong's local food culture, one story at a time.
      </p>
      <section className="space-y-2 border-t border-paper-deep pt-6">
        <h3 className="font-serif text-base font-bold">特別鳴謝</h3>
        <p className="font-serif text-sm leading-7">
          地圖來自{" "}
          <a href="https://openfreemap.org" target="_blank" rel="noreferrer" className="text-accent">
            OpenFreeMap
          </a>
          ，圖磚由{" "}
          <a href="https://openmaptiles.org" target="_blank" rel="noreferrer" className="text-accent">
            OpenMapTiles
          </a>{" "}
          繪製，資料來自{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-accent">
            OpenStreetMap
          </a>
          。
        </p>
      </section>
    </article>
  );
}
