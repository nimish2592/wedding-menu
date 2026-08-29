import jsPDF from 'jspdf';
import { MealType, MenuMeta, MEAL_TYPES } from '../types';

interface ExportMealData {
  date: string;
  meal: MealType;
  selection: Record<string, string[]>;
  gridName: string | null;
}

const ACCENT = [139, 90, 43] as const;
const DARK = [40, 30, 20] as const;
const LIGHT_BG = [253, 248, 240] as const;
const DIVIDER = [220, 195, 155] as const;

function drawPageBg(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...LIGHT_BG);
  doc.rect(0, 0, w, h, 'F');
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, w - 16, h - 16);
  doc.setLineWidth(0.2);
  doc.rect(10, 10, w - 20, h - 20);
}

function drawHeader(doc: jsPDF, meta: MenuMeta, y: number): number {
  const w = doc.internal.pageSize.getWidth();
  const cx = w / 2;

  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...ACCENT);
  doc.text(meta.event_name || 'Wedding Menu', cx, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 100, 80);
  doc.text(meta.venue || '', cx, y, { align: 'center' });
  y += 6;

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(cx - 40, y, cx + 40, y);
  y += 4;

  return y;
}

function drawMealSection(
  doc: jsPDF,
  data: ExportMealData,
  startY: number,
  isFirst: boolean
): number {
  const w = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = startY;

  if (!isFirst) {
    doc.addPage();
    drawPageBg(doc);
    y = 20;
  }

  doc.setFillColor(...ACCENT);
  doc.roundedRect(margin, y, w - margin * 2, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const headerText = `${data.date}  ·  ${data.meal}${data.gridName ? `  (${data.gridName})` : ''}`;
  doc.text(headerText, margin + 4, y + 7);
  y += 14;

  const categories = Object.entries(data.selection).filter(([, items]) => items.length > 0);

  if (categories.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(160, 140, 120);
    doc.text('No selections for this meal.', margin + 4, y + 5);
    return y + 12;
  }

  const colWidth = (w - margin * 2 - 8) / 2;
  const halfCount = Math.ceil(categories.length / 2);
  const leftCats = categories.slice(0, halfCount);
  const rightCats = categories.slice(halfCount);

  function drawCol(cats: typeof categories, xOff: number) {
    let cy = y;
    for (const [cat, items] of cats) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...ACCENT);
      doc.text(cat, xOff, cy);
      cy += 4.5;

      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.2);
      doc.line(xOff, cy, xOff + colWidth - 4, cy);
      cy += 2.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      for (const item of items) {
        const lines = doc.splitTextToSize(`• ${item}`, colWidth - 6);
        doc.text(lines, xOff + 2, cy);
        cy += lines.length * 4.5;
      }
      cy += 3;
    }
    return cy;
  }

  const leftEnd = drawCol(leftCats, margin);
  const rightEnd = drawCol(rightCats, margin + colWidth + 8);
  y = Math.max(leftEnd, rightEnd);

  return y + 4;
}

export function generateMenuPDF(
  meta: MenuMeta,
  meals: ExportMealData[]
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  drawPageBg(doc);
  let y = 18;
  y = drawHeader(doc, meta, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(160, 140, 120);
  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Generated on ${now}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  y += 8;

  const orderedMeals: ExportMealData[] = [];
  for (const date of [...new Set(meals.map((m) => m.date))]) {
    for (const mealType of MEAL_TYPES) {
      const found = meals.find((m) => m.date === date && m.meal === mealType);
      if (found) orderedMeals.push(found);
    }
  }

  orderedMeals.forEach((mealData, idx) => {
    y = drawMealSection(doc, mealData, y, idx === 0);
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 160, 130);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.text(`Page ${i} of ${pageCount}`, pw / 2, ph - 10, { align: 'center' });
    doc.text(meta.event_name || 'Wedding Menu', pw - 18, ph - 10, { align: 'right' });
  }

  const filename = `${(meta.event_name || 'wedding-menu').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}
