"use client";

import { useEffect, useState } from "react";

type ExamQuestion = {
    question: string;
    options: string[];
    answer: number;
    correctText?: string;
};

const sampleQuestions: ExamQuestion[] = [
    {
        question: "OSI Model มีกี่ชั้น?",
        options: ["4 ชั้น", "5 ชั้น", "7 ชั้น", "8 ชั้น"],
        answer: 2,
    },
    {
        question: "โปรโตคอลใดใช้สำหรับเปิดเว็บไซต์ทั่วไป?",
        options: ["HTTP", "FTP", "SMTP", "SSH"],
        answer: 0,
    },
    {
        question: "อุปกรณ์ใดใช้เชื่อมต่อเครือข่ายต่างเครือข่าย?",
        options: ["Keyboard", "Router", "Monitor", "Printer"],
        answer: 1,
    },
];

const EXAM_DURATION = 30 * 60;

export default function ExamPage() {
    const [questions, setQuestions] =
        useState<ExamQuestion[]>(sampleQuestions);
    const [loaded, setLoaded] = useState(false);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

    // โหลดข้อสอบที่นำเข้าจากหน้า Admin
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

    // ระบบจับเวลาถอยหลัง
    useEffect(() => {
        if (submitted || !loaded) return;

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
    }, [submitted, loaded]);

    if (!loaded) {
        return (
            <main className="min-h-screen bg-slate-100 p-6">
                <p className="text-center text-slate-600">
                    กำลังโหลดข้อสอบ...
                </p>
            </main>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const question = questions[current];

    const score = questions.filter(
        (q, index) => answers[index] === q.answer
    ).length;

    if (submitted) {
        return (
            <main className="min-h-screen bg-slate-100 p-6">
                <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-slate-900">
                        ผลการสอบ
                    </h1>

                    <p className="mt-6 text-xl text-slate-900">
                        คุณได้ {score} / {questions.length} คะแนน
                    </p>

                    <p className="mt-3 text-slate-600">
                        {timeLeft === 0
                            ? "หมดเวลาสอบ ระบบส่งข้อสอบให้อัตโนมัติ"
                            : "คุณส่งข้อสอบเรียบร้อยแล้ว"}
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
                        ข้อที่ {current + 1} จาก {questions.length} ข้อ
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
                            onClick={() =>
                                setCurrent((previous) => previous + 1)
                            }
                            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                        >
                            ข้อถัดไป
                        </button>
                    ) : (
                        <button
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