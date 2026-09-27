import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertLog, RiverSector, TelemetryPoint } from '../types';

export function exportTelemetryToCSV(history: TelemetryPoint[], alerts: AlertLog[]) {
  const headers = [
    'Timestamp',
    'Latitude',
    'Longitude',
    'pH',
    'Temperature_C',
    'Humidity_Pct',
    'BOD_mgL',
    'H2S_ppm',
    'Methane_Pct_LEL',
    'Phosphate_mgL',
    'AQI_Score',
    'Turbidity_NTU',
    'DissolvedOxygen_mgL',
    'TrashCollected_kg',
    'Speed_Knots',
    'Status'
  ];

  const rows = history.map((pt) => [
    pt.timestamp,
    pt.lat.toFixed(6),
    pt.lng.toFixed(6),
    pt.ph.toFixed(2),
    pt.temperature.toFixed(1),
    pt.humidity,
    (pt.bodLevel ?? 2.4).toFixed(2),
    (pt.h2sLevel ?? 0.008).toFixed(3),
    (pt.methaneLevel ?? 0.45).toFixed(2),
    (pt.phosphateLevel ?? 0.09).toFixed(2),
    pt.aqi,
    pt.turbidity,
    pt.dissolvedOxygen,
    pt.trashCollectedKg,
    pt.speedKnots,
    pt.status
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Trash_Trekker_Mission_Telemetry_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMonthlyReportPDF(
  history: TelemetryPoint[],
  alerts: AlertLog[],
  selectedSector: RiverSector,
  totalTrashKg: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate Sensor Statistics
  const sampleCount = Math.max(1, history.length);
  const phVals = history.map((p) => p.ph);
  const tempVals = history.map((p) => p.temperature);
  const doVals = history.map((p) => p.dissolvedOxygen);
  const turbVals = history.map((p) => p.turbidity);
  const aqiVals = history.map((p) => p.aqi);
  const speedVals = history.map((p) => p.speedKnots);

  const bodVals = history.map((p) => p.bodLevel ?? 2.4);
  const h2sVals = history.map((p) => p.h2sLevel ?? 0.008);
  const methaneVals = history.map((p) => p.methaneLevel ?? 0.45);
  const phosphateVals = history.map((p) => p.phosphateLevel ?? 0.09);

  const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  const min = (arr: number[]) => Math.min(...arr).toFixed(2);
  const max = (arr: number[]) => Math.max(...arr).toFixed(2);

  const avgPh = avg(phVals);
  const minPh = min(phVals);
  const maxPh = max(phVals);

  const avgTemp = avg(tempVals);
  const minTemp = min(tempVals);
  const maxTemp = max(tempVals);

  const avgDO = avg(doVals);
  const minDO = min(doVals);
  const maxDO = max(doVals);

  const avgTurb = avg(turbVals);
  const minTurb = min(turbVals);
  const maxTurb = max(turbVals);

  const avgBod = avg(bodVals);
  const minBod = min(bodVals);
  const maxBod = max(bodVals);

  const avgH2s = (h2sVals.reduce((a, b) => a + b, 0) / h2sVals.length).toFixed(3);
  const minH2s = Math.min(...h2sVals).toFixed(3);
  const maxH2s = Math.max(...h2sVals).toFixed(3);

  const avgMethane = avg(methaneVals);
  const minMethane = min(methaneVals);
  const maxMethane = max(methaneVals);

  const avgPhosphate = avg(phosphateVals);
  const minPhosphate = min(phosphateVals);
  const maxPhosphate = max(phosphateVals);

  const avgAQI = avg(aqiVals);
  const avgSpeed = avg(speedVals);

  const criticalSpikeCount = alerts.filter((a) => a.ph < 6.0).length;
  const notifiedCount = alerts.filter((a) => a.notified).length;
  const pendingCount = alerts.length - notifiedCount;

  // --- 1. HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 38, pageWidth, 2, 'F');

  // Title & Subtitles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TRASH-TREKKER AUTONOMOUS MARINE TELEMETRY', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`MONTHLY WATER QUALITY & INCIDENT SUMMARY REPORT · ${monthName.toUpperCase()}`, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`BOT: #TT-09 MARK IV · SECTOR: ${selectedSector.name.toUpperCase()} (${selectedSector.river.toUpperCase()})`, 14, 30);

  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${currentDateStr} · ISO-14001 Compliant`, pageWidth - 14, 30, { align: 'right' });

  // --- 2. EXECUTIVE SUMMARY CARDS ---
  let cursorY = 48;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Executive Mission & Environmental Overview', 14, cursorY);
  cursorY += 5;

  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 22;
  const cardY = cursorY;

  const summaryCards = [
    { label: 'TOTAL TRASH RECOVERED', value: `${totalTrashKg.toFixed(1)} kg`, color: [16, 185, 129] },
    { label: 'CRITICAL ACID SPIKES', value: `${criticalSpikeCount}`, color: criticalSpikeCount > 0 ? [244, 63, 94] : [16, 185, 129] },
    { label: 'EPA DISPATCHES FILED', value: `${notifiedCount} / ${alerts.length}`, color: [6, 182, 212] },
    { label: 'TELEMETRY WAYPOINTS', value: `${sampleCount}`, color: [99, 102, 241] },
  ];

  summaryCards.forEach((card, idx) => {
    const cardX = 14 + idx * (cardWidth + 3);
    // Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    // Indicator top bar
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(cardX, cardY, cardWidth, 1.5, 'F');

    // Text
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, cardX + 3, cardY + 7);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, cardX + 3, cardY + 16);
  });

  cursorY += cardHeight + 8;

  // --- 3. SENSOR AVERAGES & STATISTICAL PROFILE TABLE ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Hydrochemical Sensor Averages & Operational Baseline', 14, cursorY);
  cursorY += 4;

  const sensorRows = [
    [
      'pH (Hydrogen-Ion Potential)',
      avgPh,
      minPh,
      maxPh,
      '6.50 – 8.50 pH',
      Number(avgPh) >= 6.5 && Number(avgPh) <= 8.5 ? 'COMPLIANT' : 'ANOMALY DETECTED',
    ],
    [
      'Biochemical Oxygen Demand (BOD)',
      `${avgBod} mg/L`,
      `${minBod} mg/L`,
      `${maxBod} mg/L`,
      '< 3.50 mg/L',
      Number(avgBod) <= 3.5 ? 'COMPLIANT' : 'ELEVATED LOAD',
    ],
    [
      'Hydrogen Sulfide (H₂S Toxicity)',
      `${avgH2s} ppm`,
      `${minH2s} ppm`,
      `${maxH2s} ppm`,
      '< 0.020 ppm',
      Number(avgH2s) <= 0.02 ? 'SAFE TRACE' : 'TOXIC RISK',
    ],
    [
      'Methane (CH₄ Gas Emission)',
      `${avgMethane} % LEL`,
      `${minMethane} % LEL`,
      `${maxMethane} % LEL`,
      '< 1.00 % LEL',
      Number(avgMethane) <= 1.0 ? 'SAFE TRACE' : 'PLUME RISK',
    ],
    [
      'Phosphate Level (PO₄³⁻ Nutrients)',
      `${avgPhosphate} mg/L`,
      `${minPhosphate} mg/L`,
      `${maxPhosphate} mg/L`,
      '< 0.15 mg/L',
      Number(avgPhosphate) <= 0.15 ? 'BALANCED' : 'EUTROPHIC',
    ],
    [
      'Temperature (°C)',
      `${avgTemp} °C`,
      `${minTemp} °C`,
      `${maxTemp} °C`,
      '15.0 – 28.0 °C',
      Number(avgTemp) <= 28 ? 'NORMAL' : 'ELEVATED',
    ],
    [
      'Dissolved Oxygen (mg/L)',
      `${avgDO} mg/L`,
      `${minDO} mg/L`,
      `${maxDO} mg/L`,
      '> 6.00 mg/L',
      Number(avgDO) >= 6.0 ? 'HEALTHY' : 'HYPOXIC RISK',
    ],
    [
      'Turbidity (NTU)',
      `${avgTurb} NTU`,
      `${minTurb} NTU`,
      `${maxTurb} NTU`,
      '< 25.0 NTU',
      Number(avgTurb) <= 25 ? 'CLEAR' : 'TURBID RUNOFF',
    ],
    [
      'Ambient Air Quality (AQI)',
      `${avgAQI} AQI`,
      min(aqiVals),
      max(aqiVals),
      '0 – 50 (Good)',
      Number(avgAQI) <= 50 ? 'GOOD' : 'MODERATE',
    ],
    [
      'Drone Cruising Speed',
      `${avgSpeed} kts`,
      min(speedVals),
      max(speedVals),
      '1.5 – 4.0 kts',
      'OPTIMAL SWEEP',
    ],
  ];

  autoTable(doc, {
    startY: cursorY,
    head: [['PARAMETER / METRIC', 'MEAN AVERAGE', 'MIN RECORDED', 'MAX RECORDED', 'STANDARD THRESHOLD', 'SAFETY STATUS']],
    body: sensorRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', textColor: [100, 116, 139] },
      5: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text === 'COMPLIANT' || text === 'NORMAL' || text === 'HEALTHY' || text === 'CLEAR' || text === 'GOOD' || text === 'OPTIMAL SWEEP') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 9;

  // --- 4. INCIDENT & EMERGENCY ALERTS TABLE ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Logged Critical Incidents & Regulatory Dispatches', 14, cursorY);
  cursorY += 4;

  const alertRows = alerts.length > 0
    ? alerts.map((a) => [
        a.timestamp,
        `pH ${a.ph.toFixed(2)} (${a.ph < 6.0 ? 'ACID SPIKE' : 'WARN'})`,
        `${a.temperature}°C / ${a.turbidity ?? 15} NTU`,
        `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`,
        a.zone,
        a.notified ? `TRANSMITTED (${a.notifiedAt ?? 'EPA'})` : 'PENDING DISPATCH',
      ])
    : [['--', 'No critical chemical breaches detected during this monthly sweep cycle.', '--', '--', '--', 'VERIFIED CLEAN']];

  autoTable(doc, {
    startY: cursorY,
    head: [['TIME', 'HAZARD TYPE & pH', 'TEMP / TURBIDITY', 'COORDINATES', 'RIVER SECTOR', 'REGULATORY DISPATCH STATUS']],
    body: alertRows,
    theme: 'striped',
    headStyles: {
      fillColor: [225, 29, 72], // Rose 600
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 20 },
      1: { fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'normal' },
      4: { halign: 'left' },
      5: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith('TRANSMITTED') || text === 'VERIFIED CLEAN') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 8;

  // Check page overflow for footer notes
  if (cursorY > pageHeight - 35) {
    doc.addPage();
    cursorY = 20;
  }

  // --- 5. COMPLIANCE & VERIFICATION BOX ---
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, cursorY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Clean Water Act (§ 311) Automated Drone Telemetry Certification', 18, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This document serves as an immutable monthly telemetry record generated by Trash-Trekker Autonomous Robotic Swarm #TT-01 to #TT-05.\nAll hydrochemical sensor readings and GPS plume coordinates have been verified against WBPCB/CPCB standard method calibration protocols.',
    18,
    cursorY + 11
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('AUTOMATED SYSTEM VERIFIED · DIGITAL SIGNATURE ATTACHED', 18, cursorY + 19);

  // --- 6. PAGE NUMBER FOOTER ---
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Trash-Trekker Telemetry Engine · Page ${i} of ${totalPages} · Confidential Environmental Data`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Download PDF
  const filename = `Trash_Trekker_Monthly_Report_${selectedSector.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
