/**
 * 从 数学408-6月 / 7-8月 日表解析任务 → calendar/public/data/tasks.json
 * 运行：node scripts/parse-schedule.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const YEAR = 2026;

const EN_PLACEHOLDER = [
  { subject: 'english', text: '50新词 + 100复习（5500词计划）' },
  { subject: 'english', text: '阅读精读 1 篇或限时1篇' },
];

const LIGHT_KEYWORDS = ['复盘', '休息', '轻量'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateKey(m, d) {
  return `${YEAR}-${pad(m)}-${pad(d)}`;
}

function parseDurationHours(text) {
  const m = text.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})/);
  if (m) {
    const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    return Math.max(0.25, (end - start) / 60);
  }
  if (/上午|下午/.test(text) && !/:/.test(text)) return 1.5;
  if (/加量|全面|总复习/.test(text)) return 1.5;
  if (/计算|20题|15题|10题/.test(text)) return 0.5;
  return 1;
}

function detectSubject(line) {
  if (/^\*\*数学/.test(line) || /^数学[：:]/.test(line)) return 'math';
  if (/^\*\*408/.test(line) || /^408/.test(line)) return '408';
  if (/^\*\*英语/.test(line) || /^英语/.test(line)) return 'english';
  if (/^\*\*政治/.test(line)) return 'politics';
  if (/数学[：:]/.test(line)) return 'math';
  if (/408[：:]/.test(line)) return '408';
  return null;
}

function parseDayHeader(line) {
  const m = line.match(/^###\s+(\d{1,2})\.(\d{1,2})/);
  if (m) return { m: +m[1], d: +m[2], endM: +m[1], endD: +m[2] };
  const range = line.match(/^###\s+(\d{1,2})\.(\d{1,2})\s*[–-]\s*(\d{1,2})\.(\d{1,2})/);
  if (range) return { m: +range[1], d: +range[2], endM: +range[3], endD: +range[4] };
  return null;
}

function expandDates(startM, startD, endM, endD) {
  const dates = [];
  let m = startM,
    d = startD;
  const end = new Date(YEAR, endM - 1, endD);
  let cur = new Date(YEAR, m - 1, d);
  while (cur <= end) {
    dates.push({ m: cur.getMonth() + 1, d: cur.getDate() });
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function addTask(days, dateStr, task) {
  if (!days[dateStr]) days[dateStr] = { tasks: [], light: false };
  days[dateStr].tasks.push({
    id: `${dateStr}-${days[dateStr].tasks.length}`,
    ...task,
    duration: task.duration ?? parseDurationHours(task.text),
  });
}

function parseMarkdownFile(filePath, days) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  let currentDates = [];
  let subject = 'math';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    if (line.startsWith('|') && line.includes('日期')) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith('|') && !line.includes('---')) {
      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length >= 2 && /^\d/.test(cols[0])) {
        const dateCell = cols[0];
        const rangeCell = dateCell.match(/(\d{1,2})\.(\d{1,2})[–-](\d{1,2})\.(\d{1,2})/);
        if (rangeCell) {
          const ds = expandDates(+rangeCell[1], +rangeCell[2], +rangeCell[3], +rangeCell[4]);
          const mathText = cols[1] || '';
          const four08Text = cols[2] || cols[1];
          for (const { m, d } of ds) {
            const key = dateKey(m, d);
            if (mathText && mathText !== '—' && !/^\|/.test(mathText)) {
              addTask(days, key, { subject: 'math', text: `[数学] ${mathText}` });
            }
            if (four08Text && four08Text !== '—' && cols.length >= 3) {
              addTask(days, key, { subject: '408', text: `[408] ${four08Text}` });
            }
          }
        } else {
          const single = dateCell.match(/^(\d{1,2})\.(\d{1,2})$/);
          if (single) {
            const key = dateKey(+single[1], +single[2]);
            if (cols[1]) addTask(days, key, { subject: 'math', text: `[数学] ${cols[1]}` });
            if (cols[2]) addTask(days, key, { subject: '408', text: `[408] ${cols[2]}` });
          }
        }
      }
      continue;
    }
    if (inTable && line.startsWith('##')) inTable = false;

    const header = parseDayHeader(line);
    if (header) {
      currentDates = expandDates(header.m, header.d, header.endM, header.endD);
      if (LIGHT_KEYWORDS.some((k) => line.includes(k))) {
        for (const { m, d } of currentDates) {
          const key = dateKey(m, d);
          if (!days[key]) days[key] = { tasks: [], light: false };
          days[key].light = true;
        }
      }
      subject = 'math';
      continue;
    }

    const sub = detectSubject(line);
    if (sub) {
      subject = sub;
      continue;
    }

    const taskM = line.match(/^- \[ \]\s*(.+)$/);
    if (taskM && currentDates.length) {
      const text = taskM[1].replace(/\*\*/g, '').trim();
      let taskSubject = subject;
      if (/^数学[：:]/.test(text)) taskSubject = 'math';
      else if (/^408[：:]/.test(text)) taskSubject = '408';
      else if (/^英语/.test(text)) taskSubject = 'english';

      for (const { m, d } of currentDates) {
        addTask(days, dateKey(m, d), {
          subject: taskSubject,
          text,
          duration: parseDurationHours(text),
        });
      }
      continue;
    }

  }
}

function addEnglishPlaceholders(days) {
  for (const key of Object.keys(days)) {
    const hasEng = days[key].tasks.some((t) => t.subject === 'english');
    if (!hasEng && key >= '2026-05-26' && key <= '2026-12-19') {
      for (const t of EN_PLACEHOLDER) {
        addTask(days, key, { ...t, duration: 0.5 });
      }
    }
  }
}

function addPoliticsFrom1011(days) {
  for (const key of Object.keys(days)) {
    if (key >= '2026-10-11') {
      addTask(days, key, {
        subject: 'politics',
        text: '政治：肖1000/冲刺（≥1.5h）',
        duration: 1.5,
      });
    }
  }
}

function mathPhaseForDate(dateStr) {
  if (dateStr < '2026-06-20') return 'basic';
  if (dateStr <= '2026-07-09') return 'round2';
  if (dateStr <= '2026-08-31') return 'intensive';
  if (dateStr <= '2026-10-10') return 'exam';
  return 'sprint';
}

const days = {};
parseMarkdownFile(path.join(root, '数学408-6月每日细表.md'), days);
parseMarkdownFile(path.join(root, '数学408-7-8月每日细表.md'), days);
addEnglishPlaceholders(days);
addPoliticsFrom1011(days);

const out = {
  year: YEAR,
  startDate: '2026-05-26',
  endDate: '2026-12-19',
  days: Object.fromEntries(
    Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [
        k,
        {
          light: v.light,
          mathPhase: mathPhaseForDate(k),
          tasks: v.tasks.map((t, i) => ({
            ...t,
            id: `${k}-t${i}`,
          })),
        },
      ])
  ),
};

const outDir = path.join(root, 'calendar', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tasks.json'), JSON.stringify(out, null, 2));
console.log(`Wrote ${Object.keys(out.days).length} days to calendar/public/data/tasks.json`);
