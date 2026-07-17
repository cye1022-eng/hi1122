import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { ProductionRecord, LineTarget } from '../types';
import { saveAs } from 'file-saver';

export const generateWordReport = async (
  records: ProductionRecord[],
  targets: Record<string, LineTarget>,
  summary: any
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "주간 생산 실적 보고서 (Weekly Production Report)",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `보고서 생성일: ${new Date().toLocaleDateString()}`,
                bold: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "1. 종합 현황 (Total Overview)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `전체 생산 달성률: ${summary.totalAchievement}%`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "2. 라인별 상세 실적 (Performance by Line)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  "라인명", "목표", "실적", "불량", "달성률"
                ].map(text => new TableCell({
                  children: [new Paragraph({ text, bold: true })],
                })),
              }),
              ...Object.keys(summary.lineStats).map(line => {
                const stat = summary.lineStats[line];
                return new TableRow({
                  children: [
                    line,
                    stat.target.toString(),
                    stat.actual.toString(),
                    stat.defects.toString(),
                    `${stat.achievement}%`
                  ].map(text => new TableCell({
                    children: [new Paragraph({ text })],
                  })),
                });
              }),
            ],
          }),
          new Paragraph({
            text: "3. 주요 이상 항목 (Critical Issues)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...summary.warnings.map((w: string) => new Paragraph({
            text: `• ${w}`,
            bullet: { level: 0 },
          })),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Weekly_Report_${new Date().toISOString().split('T')[0]}.docx`);
};
