
"use client";

import { useEffect, useRef, useState } from "react";
import questionsData from "@/data/questions.json";

type ExamQuestion = {
    question: string;
    options: string[];
    answer: number;
    correctText?: string;
};

const EXAM_DURATION = 30 * 60;
const EXAM_TITLE = "เครือข่ายคอมพิวเตอร์";

export default function ExamPage() {
    const [questions, setQuestions] =
        useState<ExamQuestion[]>(questionsData as ExamQuestion[]);
    const [loaded, setLoaded] = useState(false);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

    // ข้อมูลผู้สอบ
    const [studentName, setStudentName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [started, setStarted] = useState(false);
    const [historyRow, setHistoryRow] = useState<number | null>(null);
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState("");

    // สถานะการบันทึกผลสอบ
    const [historyStatus, setHistoryStatus] = useState<
        "waiting" | "saving" | "saved" | "error"
    >("waiting");
    const [historyError, setHistoryError] = useState("");
    const finishSaved = useRef(false);

    // โหลดข้อสอบจากหน้า Admin ถ้ามี
    useEffect(() => {
        try {
            const saved = localStorage.getItem("examQuestions");

            if (saved) {
                const imported = JSON.parse(saved) as ExamQuestion[];

                if (
                    Array.isArray(imported) &&
                    imported.length > 0 &&
                    imported.every(
                        (q) =>
                            typeof q.question === "string" &&
                            Array.isArray(q.options) &&
                            q.options.length === 4 &&
                            Number.isInteger(q.answer) &&
                            q.answer >= 0 &&
                            q.answer < 4
                    )
                ) {
                    setQuestions(imported);
                }
            }
        } catch {
            console.error("ไม่สามารถอ่านข้อมูลข้อสอบได้");
        }

        setLoaded(true);
    }, []);

    // เริ่มสอบและบันทึกข้อมูลผู้สอบก่อน
    async function handleStartExam(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (starting || started) return;

        const name = studentName.trim();
        const id = studentId.trim();

        if (!name || !id) {
            setStartError("กรุณากรอกชื่อและรหัสนักศึกษา");
            return;
        }

        setStarting(true);
        setStartError("");

        try {
            const response = await fetch("/api/exam-history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "start",
                    name,
                    studentId: id,
                    examTitle: EXAM_TITLE,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || result.message || "บันทึกข้อมูลผู้สอบไม่สำเร็จ"
                );
            }

            if (!Number.isInteger(result.rowNumber)) {
                throw new Error("ไม่ได้รับเลขแถวจาก Google Sheets");
            }

            setStudentName(name);
            setStudentId(id);
            setHistoryRow(result.rowNumber);
            setStarted(true);
        } catch (error) {
            setStartError(
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถเริ่มสอบได้ กรุณาลองใหม่"
            );
        } finally {
            setStarting(false);
        }
    }

    const score = questions.filter(
        (q, index) => answers[index] === q.answer
    ).length;

    // ตัวจับเวลาจะเริ่มหลังจากบันทึกข้อมูลผู้สอบสำเร็จ
    useEffect(() => {
        if (!loaded || !started || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    clearInterval(timer);
                    setSubmitted(true);
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loaded, started, submitted]);

    // บันทึกเวลาส่งและคะแนนเมื่อส่งข้อสอบหรือหมดเวลา
    useEffect(() => {
        if (
            !submitted ||
            !started ||
            historyRow === null ||
            finishSaved.current
        ) {
            return;
        }

        finishSaved.current = true;

        async function saveResult() {
            setHistoryStatus("saving");

            try {
                const response = await fetch("/api/exam-history", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "submit",
                        rowNumber: historyRow,
                        score,
                    }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error || result.message || "บันทึกคะแนนไม่สำเร็จ"
                    );
                }

                setHistoryStatus("saved");
            } catch (error) {
                setHistoryStatus("error");
                setHistoryError(
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถบันทึกผลสอบได้"
                );
            }
        }

        void saveResult();
    }, [submitted, started, historyRow, score]);

    if (!loaded) {
        return (
            <main className="min-h-screen bg-slate-100 p-6">
                <p className="text-center text-slate-600">
                    กำลังโหลดข้อสอบ...
                </p>
            </main>
        );
    }

    // หน้ากรอกข้อมูลก่อนเริ่มสอบ
    if (!started) {
        return (
            <main className="min-h-screen bg-slate-100 p-6">
                <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">
                        ข้อมูลผู้เข้าสอบ
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {EXAM_TITLE}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        จำนวน {questions.length} ข้อ · เวลา 30 นาที
                    </p>

                    <form
                        onSubmit={handleStartExam}
                        className="mt-6 space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="studentName"
                                className="mb-2 block font-medium text-slate-800"
                            >
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                id="studentName"
                                type="text"
                                autoComplete="name"
                                required
                                value={studentName}
                                onChange={(event) =>
                                    setStudentName(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
                                placeholder="กรอกชื่อ-นามสกุล"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studentId"
                                className="mb-2 block font-medium text-slate-800"
                            >
                                รหัสนักศึกษา
                            </label>
                            <input
                                id="studentId"
                                type="text"
                                autoComplete="off"
                                required
                                value={studentId}
                                onChange={(event) =>
                                    setStudentId(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
                                placeholder="กรอกรหัสนักศึกษา"
                            />
                        </div>

                        {startError && (
                            <p className="text-sm text-red-600" role="alert">
                                {startError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={starting}
                            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
                        >
                            {starting ? "กำลังบันทึกข้อมูล..." : "เริ่มทำข้อสอบ"}
                        </button>

                        <a
                            href="/exams"
                            className="block text-center text-blue-700 hover:underline"
                        >
                            กลับไปรายการข้อสอบ
                        </a>
                    </form>
                </div>
            </main>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const question = questions[current];

    if (submitted) {
        return (
            <main className="min-h-screen bg-slate-100 p-6">
                <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-slate-900">
                        ผลการสอบ
                    </h1>

                    <p className="mt-6 text-slate-900">
                        ผู้เข้าสอบ: {studentName}
                    </p>

                    <p className="mt-2 text-slate-900">
                        รหัสนักศึกษา: {studentId}
                    </p>

                    <p className="mt-6 text-xl font-bold text-slate-900">
                        คุณได้ {score} / {questions.length} คะแนน
                    </p>

                    <p className="mt-3 text-slate-600">
                        {timeLeft === 0
                            ? "หมดเวลาสอบ ระบบส่งข้อสอบให้อัตโนมัติ"
                            : "คุณส่งข้อสอบเรียบร้อยแล้ว"}
                    </p>

                    <p className="mt-4 text-sm" role="status">
                        {historyStatus === "saving" &&
                            "กำลังบันทึกผลสอบลง Google Sheets..."}
                        {historyStatus === "saved" &&
                            "บันทึกประวัติการสอบเรียบร้อยแล้ว"}
                        {historyStatus === "error" &&
                            `บันทึกผลสอบไม่สำเร็จ: ${historyError}`}
                    </p>

                    <a
                        href="/exams"
                        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
                    >
                        กลับไปรายการข้อสอบ
                    </a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                        ผู้สอบ: {studentName}
                    </p>

                    <p
                        className={`rounded-lg px-4 py-2 font-bold ${timeLeft <= 60
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                    >
                        เวลาเหลือ {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </p>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                    ข้อที่ {current + 1} จาก {questions.length} ข้อ
                </p>

                <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                            width: `${((current + 1) / questions.length) * 100
                                }%`,
                        }}
                    />
                </div>

                <h1 className="mt-8 text-2xl font-bold text-slate-900">
                    {question.question}
                </h1>

                <div className="mt-6 space-y-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() =>
                                setAnswers((previous) => {
                                    const next = [...previous];
                                    next[current] = index;
                                    return next;
                                })
                            }
                            className={`w-full rounded-xl border p-4 text-left ${answers[current] === index
                                    ? "border-blue-600 bg-blue-50 text-blue-800"
                                    : "border-slate-200 text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            {["ก", "ข", "ค", "ง"][index]}. {option}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-between gap-3">
                    <button
                        type="button"
                        disabled={current === 0}
                        onClick={() =>
                            setCurrent((previous) => previous - 1)
                        }
                        className="rounded-lg border px-5 py-3 text-slate-900 disabled:opacity-40"
                    >
                        ข้อก่อนหน้า
                    </button>

                    {current < questions.length - 1 ? (
                        <button
                            type="button"
                            onClick={() =>
                                setCurrent((previous) => previous + 1)
                            }
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                        >
                            ข้อถัดไป
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSubmitted(true)}
                            className="rounded-lg bg-green-600 px-5 py-3 text-white"
                        >
                            ส่งข้อสอบ
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
