
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import XLSX from "xlsx";

// อ่านไฟล์ Excel จาก Downloads
const excelPath = path.join(
    os.homedir(),
    "Downloads",
    "แบบฝึกหัดบทที่2_เฉลย.xlsx"
);

if (!fs.existsSync(excelPath)) {
    console.error("ไม่พบไฟล์ Excel:", excelPath);
    process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
});

if (rows.length === 0) {
    console.error("ไม่พบข้อมูลข้อสอบใน Excel");
    process.exit(1);
}

const normalize = (value) =>
    String(value ?? "").trim().replace(/\s+/g, " ");

const questions = rows.map((row, index) => {
    const question = normalize(row["คำถาม"]);
    const options = [
        normalize(row["ตัวเลือก ก"]),
        normalize(row["ตัวเลือก ข"]),
        normalize(row["ตัวเลือก ค"]),
        normalize(row["ตัวเลือก ง"]),
    ];

    const letter = normalize(row["เฉลย"])
        .replace(/^ข้อ\s*/, "")
        .replace(/[.)、]/g, "");

    const letterIndex = ["ก", "ข", "ค", "ง"].indexOf(letter);

    const correctText = normalize(row["คำตอบที่ถูก"]);
    const textIndex = options.findIndex(
        (option) => option === correctText
    );

    const answer =
        letterIndex !== -1 ? letterIndex : textIndex;

    if (!question || options.some((option) => !option) ||
        answer < 0 || answer > 3) {
        throw new Error(
            `ตรวจสอบข้อมูลข้อที่ ${index + 1}: คำถาม ตัวเลือก หรือเฉลยไม่ครบ`
        );
    }

    return {
        id: index + 1,
        question,
        options,
        answer,
    };
});

// สร้างโฟลเดอร์ data และบันทึก JSON
const outputDir = path.join(process.cwd(), "data");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "questions.json");

fs.writeFileSync(
    outputPath,
    JSON.stringify(questions, null, 2),
    "utf8"
);

console.log(`แปลงข้อสอบสำเร็จ ${questions.length} ข้อ`);
console.log("บันทึกไฟล์ไว้ที่:", outputPath);
