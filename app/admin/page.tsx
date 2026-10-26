
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type ExamQuestion = {
    question: string;
    options: string[];
    answer: number;
    correctText: string;
};

export default function AdminPage() {
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [message, setMessage] = useState("");

    async function handleFileUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                sheet,
                { defval: "" }
            );

            const importedQuestions: ExamQuestion[] = rows.map((row) => {
                const correctLetter = String(row["เฉลย"])
                    .trim()
                    .toUpperCase();

                const answerMap: Record<string, number> = {
                    ก: 0,
                    ข: 1,
                    ค: 2,
                    ง: 3,
                };

                return {
                    question: String(row["คำถาม"]).trim(),
                    options: [
                        String(row["ตัวเลือก ก"]).trim(),
                        String(row["ตัวเลือก ข"]).trim(),
                        String(row["ตัวเลือก ค"]).trim(),
                        String(row["ตัวเลือก ง"]).trim(),
                    ],
                    answer: answerMap[correctLetter] ?? -1,
                    correctText: String(row["คำตอบที่ถูก"]).trim(),
                };
            }).filter(
                (question) =>
                    question.question !== "" &&
                    question.options.every((option) => option !== "") &&
                    question.answer !== -1
            );

            setQuestions(importedQuestions);

            localStorage.setItem(
                "examQuestions",
                JSON.stringify(importedQuestions)
            );
            setMessage(
                `อ่านข้อสอบสำเร็จ ${importedQuestions.length} ข้อ`
            );
        } catch {
            setMessage("อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบไฟล์ Excel");
            setQuestions([]);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-900">
                    นำเข้าข้อสอบ
                </h1>

                <p className="mt-2 text-slate-600">
                    เลือกไฟล์ Excel ที่มีคำถาม ตัวเลือก และเฉลย
                </p>

                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                    <label className="block font-medium">
                        ไฟล์ข้อสอบ Excel (.xlsx, .xls)
                    </label>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="mt-3 block w-full rounded-lg border p-3"
                    />

                    {message && (
                        <p className="mt-4 font-medium text-blue-700">
                            {message}
                        </p>
                    )}
                </div>

                {questions.length > 0 && (
                    <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            ตัวอย่างข้อสอบที่อ่านได้
                        </h2>

                        {questions.map((question, index) => (
                            <div
                                key={index}
                                className="mt-5 border-b pb-5 last:border-b-0"
                            >
                                <p className="font-semibold">
                                    {index + 1}. {question.question}
                                </p>

                                {question.options.map((option, optionIndex) => (
                                    <p key={optionIndex} className="mt-1 text-slate-600">
                                        {["ก", "ข", "ค", "ง"][optionIndex]}. {option}
                                    </p>
                                ))}

                                <p className="mt-2 text-green-700">
                                    เฉลย: {["ก", "ข", "ค", "ง"][question.answer]}
                                    {" — "}
                                    {question.correctText}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
