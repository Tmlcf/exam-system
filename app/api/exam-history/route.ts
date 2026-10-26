
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const url = process.env.GOOGLE_APPS_SCRIPT_URL;
        const secret = process.env.EXAM_HISTORY_SECRET;

        if (!url || !secret) {
            return NextResponse.json(
                { error: "ยังไม่ได้ตั้งค่า Google Apps Script ใน .env.local" },
                { status: 500 }
            );
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({
                ...body,
                secret,
            }),
            cache: "no-store",
        });

        const result = await response.json();

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || "บันทึกประวัติไม่สำเร็จ" },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Exam history error:", error);

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการบันทึกประวัติ" },
            { status: 500 }
        );
    }
}
