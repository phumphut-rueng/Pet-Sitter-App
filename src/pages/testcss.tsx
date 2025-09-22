export default function ThemeSanity() {
  return (

    
    <main className="p-6 space-y-8 bg-bg text-text min-h-screen">
      {/* Header */}
      <header className="space-y-2">
        <div className="display text-brand">Pet Sitter</div>
        <p className="h3 text-muted">Design System Sanity Test</p>
        <p className="caption">ทดสอบทุกสี ทุกฟอนต์ ทุก token ที่ทำมา</p>
      </header>

      {/* Typography Test */}
      <section className="space-y-2">
        <h2 className="h2">🔤 Typography (Satoshi + Noto Thai)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="display">Display 88/96</div>
            <div className="h1">H1 56/64</div>
            <div className="h2">H2 36/44</div>
            <div className="h3">H3 24/32</div>
            <div className="h4">H4 20/28</div>
            <p className="body">Body 1 18/26</p>
            <p className="body-sm text-muted-text">Body 2 16/28 (muted)</p>
            <p className="caption">Body 3 14/24 (caption)</p>
          </div>
          <div>
            <div className="display">แสดงผล</div>
            <div className="h1">หัวข้อใหญ่</div>
            <div className="h2">หัวข้อรอง</div>
            <div className="h3">หัวข้อย่อย</div>
            <div className="h4">หัวข้อเล็ก</div>
            <p className="body">เนื้อหาปกติ</p>
            <p className="body-sm text-muted-text">เนื้อหาเล็ก (เทา)</p>
            <p className="caption">คำอธิบาย</p>
          </div>
        </div>
      </section>

      {/* Base Surfaces */}
      <section className="space-y-3">
        <h2 className="h2">🎨 Base Surfaces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded border border-border bg-bg text-text">bg-bg / text-text</div>
          <div className="p-3 rounded border border-border bg-muted text-muted-text">bg-muted / text-muted-text</div>
          <div className="p-3 rounded border border-border bg-card text-card-foreground">
            bg-card / text-card-foreground
          </div>
          <div className="p-3 rounded border border-border bg-background text-foreground">
            legacy: bg-background / text-foreground
          </div>
          <div className="p-3 rounded border border-border bg-primary text-primary-foreground">
            legacy: bg-primary / text-primary-foreground
          </div>
          <div className="p-3 rounded border border-border bg-secondary text-secondary-foreground">
            legacy: bg-secondary / text-secondary-foreground
          </div>
        </div>
      </section>

      {/* Brand & Focus Ring Test */}
      <section className="space-y-3">
        <h2 className="h2">🧡 Brand + Focus Ring Test</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-brand text-brand-text px-4 py-2 rounded-md">
            Primary (brand)
          </button>
          <button className="bg-brand-light text-brand-dark px-4 py-2 rounded-md">
            Brand light
          </button>
          <button className="bg-brand-bg text-brand-dark px-4 py-2 rounded-md border border-border">
            Brand background
          </button>
          <button className="px-4 py-2 rounded-md bg-white text-text border border-border ring-2 ring-brand ring-offset-2 ring-offset-bg focus:outline-none">
            Focus me (Tab → เห็นส้ม)
          </button>
        </div>
      </section>

      {/* Orange Scale Complete */}
      <section className="space-y-3">
        <h2 className="h2">🍊 Orange Scale (Complete)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="p-3 rounded bg-orange-6 text-white text-center">
            <div className="font-bold">orange-6</div>
            <div className="text-xs">#E44A0C</div>
          </div>
          <div className="p-3 rounded bg-orange-5 text-white text-center">
            <div className="font-bold">orange-5</div>
            <div className="text-xs">#FF7037</div>
          </div>
          <div className="p-3 rounded bg-orange-4 text-white text-center">
            <div className="font-bold">orange-4</div>
            <div className="text-xs">#FF986F</div>
          </div>
          <div className="p-3 rounded bg-orange-3 text-orange-6 text-center">
            <div className="font-bold">orange-3</div>
            <div className="text-xs">#FFB899</div>
          </div>
          <div className="p-3 rounded bg-orange-2 text-orange-6 text-center">
            <div className="font-bold">orange-2</div>
            <div className="text-xs">#FFD5C2</div>
          </div>
          <div className="p-3 rounded bg-orange-1 text-orange-6 text-center">
            <div className="font-bold">orange-1</div>
            <div className="text-xs">#FFF1EC</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded bg-orange text-white text-center">
            <div className="font-bold">orange (alias)</div>
            <div className="text-xs">= orange-5</div>
          </div>
          <div className="p-3 rounded bg-orange-50 text-orange-6 text-center">
            <div className="font-bold">orange-50</div>
            <div className="text-xs">= orange-bg</div>
          </div>
        </div>
      </section>

      {/* Gray Scale */}
      <section className="space-y-3">
        <h2 className="h2">⚪ Gray Scale</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          <div className="p-3 rounded bg-gray-9 text-white text-center">
            <div className="font-bold">gray-9</div>
            <div className="text-xs">#3A3B46</div>
          </div>
          <div className="p-3 rounded bg-gray-7 text-white text-center">
            <div className="font-bold">gray-7</div>
            <div className="text-xs">#5B5D6F</div>
          </div>
          <div className="p-3 rounded bg-gray-6 text-white text-center">
            <div className="font-bold">gray-6</div>
            <div className="text-xs">#7B7E8F</div>
          </div>
          <div className="p-3 rounded bg-gray-4 text-gray-9 text-center">
            <div className="font-bold">gray-4</div>
            <div className="text-xs">#AEB1C3</div>
          </div>
          <div className="p-3 rounded bg-gray-2 text-gray-9 text-center">
            <div className="font-bold">gray-2</div>
            <div className="text-xs">#DCDFED</div>
          </div>
          <div className="p-3 rounded bg-gray-1 text-gray-9 text-center">
            <div className="font-bold">gray-1</div>
            <div className="text-xs">#F6F6F9</div>
          </div>
          <div className="p-3 rounded bg-white text-gray-9 border border-border text-center">
            <div className="font-bold">white</div>
            <div className="text-xs">#FFFFFF</div>
          </div>
        </div>
      </section>

      {/* Text Colors */}
      <section className="space-y-3">
        <h2 className="h2">📝 Text Colors</h2>
        <div className="space-y-2">
          <p className="text-text">text-text (default)</p>
          <p className="text-muted-text">text-muted-text (gray-6)</p>
          <p className="text-brand">text-brand (orange-5)</p>
          <p className="text-gray-9">text-gray-9</p>
          <p className="text-gray-7">text-gray-7</p>
          <p className="text-gray-6">text-gray-6</p>
        </div>
      </section>

      {/* Accent Colors & Backgrounds */}
      <section className="space-y-3">
        <h2 className="h2">✨ Accent Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-2">
            <div className="p-3 rounded bg-yellow text-white text-center font-bold">Yellow</div>
            <div className="p-3 rounded bg-yellow-bg text-yellow text-center">yellow-bg + text-yellow</div>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded bg-blue text-white text-center font-bold">Blue</div>
            <div className="p-3 rounded bg-blue-bg text-blue text-center">blue-bg + text-blue</div>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded bg-green text-white text-center font-bold">Green</div>
            <div className="p-3 rounded bg-green-bg text-green text-center">green-bg + text-green</div>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded bg-pink text-white text-center font-bold">Pink</div>
            <div className="p-3 rounded bg-pink-bg text-pink text-center">pink-bg + text-pink</div>
          </div>
        </div>
        <div className="p-3 rounded bg-red text-white text-center font-bold">Red (no background variant)</div>
      </section>

      {/* Brown Scale */}
      <section className="space-y-3">
        <h2 className="h2">🤎 Brown Scale</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          <div className="p-3 rounded text-white text-center" style={{ background: "var(--color-brown-700)" }}>
            <div className="font-bold">brown-700</div>
            <div className="text-xs">#8B4513</div>
          </div>
          <div className="p-3 rounded text-white text-center" style={{ background: "var(--color-brown-600)" }}>
            <div className="font-bold">brown-600</div>
            <div className="text-xs">#A0522D</div>
          </div>
          <div className="p-3 rounded text-white text-center" style={{ background: "var(--color-brown-500)" }}>
            <div className="font-bold">brown-500</div>
            <div className="text-xs">#CD853F</div>
          </div>
          <div className="p-3 rounded text-brown-700 text-center" style={{ background: "var(--color-brown-400)" }}>
            <div className="font-bold">brown-400</div>
            <div className="text-xs">#DEB887</div>
          </div>
          <div className="p-3 rounded text-brown-700 text-center" style={{ background: "var(--color-brown-300)" }}>
            <div className="font-bold">brown-300</div>
            <div className="text-xs">#F5DEB3</div>
          </div>
          <div className="p-3 rounded text-brown-700 text-center" style={{ background: "var(--color-brown-200)" }}>
            <div className="font-bold">brown-200</div>
            <div className="text-xs">#FAF0E6</div>
          </div>
          <div className="p-3 rounded text-brown-700 text-center" style={{ background: "var(--color-brown-100)" }}>
            <div className="font-bold">brown-100</div>
            <div className="text-xs">#FDF8F0</div>
          </div>
        </div>
      </section>

      {/* Status Colors */}
      <section className="space-y-3">
        <h2 className="h2">📊 Status Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded bg-waiting text-white text-center font-bold">Waiting</div>
          <div className="p-3 rounded bg-success text-white text-center font-bold">Success</div>
          <div className="p-3 rounded bg-pending text-white text-center font-bold">Pending</div>
          <div className="p-3 rounded bg-active text-white text-center font-bold">Active</div>
          <div className="p-3 rounded bg-canceled text-white text-center font-bold">Canceled</div>
          <div className="p-3 rounded bg-approved text-white text-center font-bold">Approved</div>
          <div className="p-3 rounded bg-rejected text-white text-center font-bold">Rejected</div>
        </div>

        {/* Text variants */}
        <div className="space-y-1">
          <p className="text-success">✅ text-success</p>
          <p className="text-waiting">⏳ text-waiting</p>
          <p className="text-pending">🔄 text-pending</p>
          <p className="text-error">❌ text-error</p>
        </div>
      </section>

      {/* Pet Colors */}
      <section className="space-y-3">
        <h2 className="h2">🐾 Pet Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded bg-dog text-white text-center font-bold">
            🐕 Dog<br />
            <span className="text-xs">(orange-5)</span>
          </div>
          <div className="p-3 rounded bg-cat text-white text-center font-bold">
            🐱 Cat<br />
            <span className="text-xs">(gray-7)</span>
          </div>
          <div className="p-3 rounded bg-bird text-white text-center font-bold">
            🐦 Bird<br />
            <span className="text-xs">(blue)</span>
          </div>
          <div className="p-3 rounded bg-rabbit text-white text-center font-bold">
            🐰 Rabbit<br />
            <span className="text-xs">#A3E635</span>
          </div>
        </div>
      </section>

      {/* Social Colors */}
      <section className="space-y-3">
        <h2 className="h2">📱 Social Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded bg-facebook text-white text-center font-bold">Facebook</div>
          <div className="p-3 rounded bg-google-blue text-white text-center font-bold">Google Blue</div>
          <div className="p-3 rounded bg-google-green text-white text-center font-bold">Google Green</div>
          <div className="p-3 rounded bg-google-red text-white text-center font-bold">Google Red</div>
          <div className="p-3 rounded bg-google-yellow text-white text-center font-bold">Google Yellow</div>
        </div>
      </section>

      {/* Spacing & Shadows */}
      <section className="space-y-3">
        <h2 className="h2">📏 Spacing & Effects</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-sm bg-muted shadow-sm text-center">
            <div className="font-bold">Small</div>
            <div className="text-xs">rounded-sm + shadow-sm</div>
          </div>
          <div className="p-4 rounded bg-muted shadow-md text-center">
            <div className="font-bold">Medium</div>
            <div className="text-xs">rounded + shadow-md</div>
          </div>
          <div className="p-4 rounded-lg bg-muted shadow-lg text-center">
            <div className="font-bold">Large</div>
            <div className="text-xs">rounded-lg + shadow-lg</div>
          </div>
        </div>
      </section>

      {/* Real Component Examples */}
      <section className="space-y-3">
        <h2 className="h2">🧩 Real Component Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pet Card */}
          <div className="bg-orange-bg border border-orange-2 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-dog rounded-full flex items-center justify-center text-white font-bold">🐕</div>
              <div>
                <div className="h4 text-orange-6">มิลค์</div>
                <div className="caption text-muted-text">สุนัขโกลเด้น รีทรีฟเวอร์</div>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-1 rounded bg-success text-white caption font-bold">Available</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-blue-bg border border-blue rounded-lg p-4">
            <div className="h4 text-blue mb-2">Booking Status</div>
            <div className="flex items-center justify-between">
              <span className="body-sm">รอการยืนยัน</span>
              <span className="px-3 py-1 rounded bg-waiting text-white caption font-bold">Waiting</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8">
        <div className="caption text-muted-text">
          🎉 Pet Sitter Design System - ทุกสีและ token ทำงานปกติ!
        </div>

        <p className="body text-ink">Don’t have any account?</p>

      </footer>
    </main>
  );
  
}