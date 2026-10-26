
export default function ExamsPage() {
    const exams = [
        {
            id: 1,
            title: "เครือข่ายคอมพิวเตอร์",
            questions: 20,
            duration: 30,
        },
    ];

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-slate-900">
                    รายการข้อสอบ
                </h1>

                <p className="mt-2 text-slate-600">
                    เลือกข้อสอบที่ต้องการทำ
                </p>

                <div className="mt-8 grid gap-4">
                    {exams.map((exam) => (
                        <div
                            key={exam.id}
                            className="rounded-xl bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-xl font-semibold">
                                {exam.title}
                            </h2>

                            <p className="mt-3 text-slate-600">
                                จำนวน {exam.questions} ข้อ
                            </p>

                            <p className="text-slate-600">
                                เวลา {exam.duration} นาที
                            </p>

                            <a
                                href={`/exams/${exam.id}`}
                                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            >
                                เริ่มทำข้อสอบ
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
