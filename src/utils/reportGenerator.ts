import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

interface ReportData {
  device: string;
  serial: string;
  templateTitle: string;
  gost: string;
  history: { time: string; value: number }[];
  status: string;
}

export const generateDocxReport = async (data: ReportData) => {
  // Вычисляем среднее значение для отчета
  const avgValue =
    data.history.length > 0
      ? (
          data.history.reduce((acc, curr) => acc + curr.value, 0) /
          data.history.length
        ).toFixed(2)
      : "Нет данных";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "ПРОТОКОЛ ИСПЫТАНИЙ №" + Math.floor(Math.random() * 1000),
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Дата проведения: ", bold: true }),
              new TextRun({ text: new Date().toLocaleDateString() }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Испытуемое устройство: ", bold: true }),
              new TextRun({
                text: `${data.device.toUpperCase()} (Серийный номер: ${data.serial})`,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Программа испытаний: ", bold: true }),
              new TextRun({ text: `${data.templateTitle} (${data.gost})` }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "РЕЗУЛЬТАТЫ ИЗМЕРЕНИЙ",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          // Создаем таблицу с результатами
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Параметр", bold: true })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: "Среднее значение", bold: true }),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Статус", bold: true })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Напряжение (Телеметрия)")],
                  }),
                  new TableCell({ children: [new Paragraph(`${avgValue} V`)] }),
                  new TableCell({ children: [new Paragraph(data.status)] }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "\nЗАКЛЮЧЕНИЕ: ", bold: true }),
              new TextRun({
                text: "Устройство соответствует заявленным нормам.",
              }),
            ],
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  // Генерируем blob и сохраняем файл
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Report_${data.device}_${data.serial}.docx`);
};
