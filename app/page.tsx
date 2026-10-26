
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">
          Exam System
        </h1>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
          เข้าสู่ระบบ
        </button>
      </nav>

      <section className="mx-auto mt-20 max-w-5xl">
        <h2 className="text-4xl font-bold text-slate-900">
          ระบบข้อสอบออนไลน์
        </h2>

        <p className="mt-4 text-slate-600">
          ทดสอบความรู้ของคุณได้ทุกที่ทุกเวลา
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            เครือข่ายคอมพิวเตอร์
          </h3>

          <p className="mt-2 text-slate-600">
            จำนวน 20 ข้อ · วิชาคอมพิวเตอร์
          </p>

          <button className="mt-5 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            เริ่มทำข้อสอบ
          </button>
        </div>
      </section>
    </main>
  );
}
