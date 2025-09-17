export default function ThemeSanity() {
    return (
      <main className="p-6 space-y-8">
        {/* Typography */}
        <section className="space-y-2">
          <div className="display">Display 88/96</div>
          <div className="h1">H1 56/64</div>
          <div className="h2">H2 36/44</div>
          <div className="h3">H3 24/32</div>
          <div className="h4">H4 20/28</div>
          <p className="body">Body 1 18/26</p>
          <p className="body-sm text-muted">Body 2 16/28 (muted)</p>
          <p className="caption">Body 3 14/24 (caption)</p>
        </section>
  
        {/* Base surfaces (สั้น + legacy) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded border border-border bg-bg text-text">bg-bg / text-text</div>
          <div className="p-3 rounded border border-border bg-muted text-muted">bg-muted / text-muted</div>
          <div className="p-3 rounded border border-border bg-background text-foreground">
            legacy: bg-background / text-foreground
          </div>
        </section>
  
        {/* Brand + Ring */}
        <section className="flex flex-wrap items-center gap-3">
          <button className="bg-brand text-brand-text px-4 py-2 rounded-md ring-2 ring">
            Primary (brand)
          </button>
          <button className="bg-orange-light text-text px-4 py-2 rounded-md border border-border">
            Orange light
          </button>
          <button className="px-4 py-2 rounded-md bg-white text-text border border-border ring-2 ring ring-offset-2 ring-offset-bg">
            Focus me (Tab มาที่ปุ่มนี้ → เห็นส้ม)
          </button>
        </section>
  
        {/* Gray scale (สั้น) */}
        <section className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="p-3 rounded bg-gray-9 text-white">gray-9</div>
          <div className="p-3 rounded bg-gray-7 text-white">gray-7</div>
          <div className="p-3 rounded bg-gray-6 text-white">gray-6</div>
          <div className="p-3 rounded bg-gray-4">gray-4</div>
          <div className="p-3 rounded bg-gray-2">gray-2</div>
          <div className="p-3 rounded bg-gray-1">gray-1</div>
        </section>
  
        {/* Text gray */}
        <section className="space-y-1">
          <p className="text-gray-6">text-gray-6 (ตามชุดนี้)</p>
          {/* ถ้าคุณเพิ่ม alias gray-60/grey-60 ใน @theme จะใช้สองบรรทัดล่างนี้ได้ด้วย */}
          {/* <p className="text-gray-60">text-gray-60 (alias)</p>
          <p className="text-grey-60">text-grey-60 (alias)</p> */}
        </section>
  
        {/* Accents (พื้นอ่อน + ตัวเข้ม) */}
        <section className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-yellow-bg text-yellow">Yellow</span>
          <span className="px-2 py-1 rounded bg-blue-bg text-blue">Blue</span>
          <span className="px-2 py-1 rounded bg-green-bg text-green">Green</span>
          <span className="px-2 py-1 rounded bg-pink-bg text-pink">Pink</span>
        </section>
  
        {/* Brown scale (ถ้าอยากเช็คที่เพิ่มไว้) */}
        <section className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          <div className="p-3 rounded text-white" style={{ background: "var(--color-brown-700)" }}>brown-700</div>
          <div className="p-3 rounded text-white" style={{ background: "var(--color-brown-600)" }}>brown-600</div>
          <div className="p-3 rounded text-white" style={{ background: "var(--color-brown-500)" }}>brown-500</div>
          <div className="p-3 rounded" style={{ background: "var(--color-brown-400)" }}>brown-400</div>
          <div className="p-3 rounded" style={{ background: "var(--color-brown-300)" }}>brown-300</div>
          <div className="p-3 rounded" style={{ background: "var(--color-brown-200)" }}>brown-200</div>
          <div className="p-3 rounded" style={{ background: "var(--color-brown-100)" }}>brown-100</div>
        </section>
      </main>
    );
  }