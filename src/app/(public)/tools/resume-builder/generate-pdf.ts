import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ResumeData } from "./resume-builder-form";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const COLORS = {
  primary: rgb(0.1, 0.2, 0.45),
  text: rgb(0.15, 0.15, 0.15),
  muted: rgb(0.4, 0.4, 0.4),
  line: rgb(0.75, 0.78, 0.82),
};

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateResumePdf(data: ResumeData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  // Helper to draw text
  function drawText(
    text: string,
    x: number,
    yPos: number,
    options: { font?: typeof fontRegular; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    const { font = fontRegular, size = 10, color = COLORS.text } = options;
    page.drawText(text, { x, y: yPos, size, font, color });
  }

  // Helper to draw a horizontal line
  function drawLine(yPos: number) {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness: 0.5,
      color: COLORS.line,
    });
  }

  // Helper for section heading
  function drawSectionHeading(title: string) {
    y -= 20;
    drawText(title.toUpperCase(), MARGIN, y, { font: fontBold, size: 11, color: COLORS.primary });
    y -= 6;
    drawLine(y);
    y -= 12;
  }

  // ===== NAME =====
  const nameSize = 22;
  const nameWidth = fontBold.widthOfTextAtSize(data.fullName, nameSize);
  drawText(data.fullName, (PAGE_WIDTH - nameWidth) / 2, y, {
    font: fontBold,
    size: nameSize,
    color: COLORS.primary,
  });
  y -= 18;

  // ===== CONTACT INFO (centered) =====
  const contactParts: string[] = [];
  if (data.phone) contactParts.push(data.phone);
  if (data.email) contactParts.push(data.email);
  if (data.address) contactParts.push(data.address);
  const contactLine = contactParts.join("  |  ");
  const contactWidth = fontRegular.widthOfTextAtSize(contactLine, 9);
  drawText(contactLine, (PAGE_WIDTH - contactWidth) / 2, y, { size: 9, color: COLORS.muted });
  y -= 8;

  drawLine(y);
  y -= 4;

  // ===== CAREER OBJECTIVE =====
  if (data.objective.trim()) {
    drawSectionHeading("Career Objective");
    const lines = wrapText(data.objective.trim(), fontRegular, 10, CONTENT_WIDTH);
    for (const line of lines) {
      drawText(line, MARGIN, y, { size: 10 });
      y -= 14;
    }
  }

  // ===== EDUCATION =====
  const validEdu = data.education.filter((e) => e.degree.trim());
  if (validEdu.length > 0) {
    drawSectionHeading("Education");
    for (const edu of validEdu) {
      const degreeText = edu.degree + (edu.percentage ? ` — ${edu.percentage}` : "");
      drawText(degreeText, MARGIN, y, { font: fontBold, size: 10 });
      if (edu.year) {
        const yearWidth = fontRegular.widthOfTextAtSize(edu.year, 9);
        drawText(edu.year, PAGE_WIDTH - MARGIN - yearWidth, y, { size: 9, color: COLORS.muted });
      }
      y -= 14;
      if (edu.institution) {
        drawText(edu.institution, MARGIN, y, { size: 9, color: COLORS.muted });
        y -= 14;
      }
      y -= 4;
    }
  }

  // ===== WORK EXPERIENCE =====
  const validExp = data.experience.filter((e) => e.title.trim() || e.company.trim());
  if (validExp.length > 0) {
    drawSectionHeading("Work Experience");
    for (const exp of validExp) {
      const titleText = exp.title || "Untitled Role";
      drawText(titleText, MARGIN, y, { font: fontBold, size: 10 });
      if (exp.duration) {
        const durWidth = fontRegular.widthOfTextAtSize(exp.duration, 9);
        drawText(exp.duration, PAGE_WIDTH - MARGIN - durWidth, y, { size: 9, color: COLORS.muted });
      }
      y -= 14;
      if (exp.company) {
        drawText(exp.company, MARGIN, y, { size: 9, color: COLORS.muted });
        y -= 14;
      }
      if (exp.description.trim()) {
        const descLines = wrapText(exp.description.trim(), fontRegular, 9, CONTENT_WIDTH - 10);
        for (const line of descLines) {
          drawText(`• ${line}`, MARGIN + 5, y, { size: 9 });
          y -= 13;
        }
      }
      y -= 4;
    }
  }

  // ===== SKILLS =====
  if (data.skills.trim()) {
    drawSectionHeading("Skills");
    const skillLines = wrapText(data.skills.trim(), fontRegular, 10, CONTENT_WIDTH);
    for (const line of skillLines) {
      drawText(line, MARGIN, y, { size: 10 });
      y -= 14;
    }
  }

  // ===== LANGUAGES =====
  if (data.languages.trim()) {
    drawSectionHeading("Languages");
    drawText(data.languages.trim(), MARGIN, y, { size: 10 });
    y -= 14;
  }

  // ===== HOBBIES =====
  if (data.hobbies.trim()) {
    drawSectionHeading("Hobbies");
    drawText(data.hobbies.trim(), MARGIN, y, { size: 10 });
    y -= 14;
  }

  return doc.save();
}
