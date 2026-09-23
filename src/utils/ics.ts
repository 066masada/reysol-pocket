import type { Fixture, TicketSale } from '../types';
import { COMPETITIONS } from '../data/competitions';
import { getClub } from '../data/clubs';
import { STADIUMS } from '../data/stadiums';
import { kickoffDate, SALE_LABEL } from './fixtures';
import { pad2 } from './date';

const toUtc = (d: Date) =>
  `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;

const toDateOnly = (d: Date) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** 1試合分の .ics テキスト */
export const fixtureToIcs = (f: Fixture): string => {
  const comp = COMPETITIONS[f.competition];
  const home = getClub(f.home);
  const away = getClub(f.away);
  const stadium = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
  const start = kickoffDate(f);
  const summary = `${home.short} vs ${away.short}（${comp.short} ${f.round}）`;
  const desc = [comp.name, f.note, f.dateLabel ? `日程: ${f.dateLabel}` : undefined].filter(Boolean).join('\n');

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Reysol Pocket//JA', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${f.id}@reysol-pocket`,
    `DTSTAMP:${toUtc(new Date())}`,
  ];
  if (f.timeTBD) {
    lines.push(`DTSTART;VALUE=DATE:${toDateOnly(start)}`);
  } else {
    lines.push(`DTSTART:${toUtc(start)}`);
    lines.push(`DTEND:${toUtc(new Date(start.getTime() + 2 * 60 * 60 * 1000))}`);
  }
  lines.push(`SUMMARY:${esc(summary)}`);
  if (desc) lines.push(`DESCRIPTION:${esc(desc)}`);
  if (stadium) lines.push(`LOCATION:${esc(`${stadium.name} ${stadium.address}`)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
};

/** チケット販売開始のリマインダー（開始15分前にアラーム） */
export const saleToIcs = (f: Fixture, sale: TicketSale): string => {
  const comp = COMPETITIONS[f.competition];
  const home = getClub(f.home);
  const away = getClub(f.away);
  const start = new Date(sale.at);
  const summary = `【チケット】${SALE_LABEL[sale.type]} ${home.short} vs ${away.short}`;
  const ko = kickoffDate(f);
  const desc = [
    `${comp.name} ${f.round}`,
    `試合: ${ko.getFullYear()}年${ko.getMonth() + 1}月${ko.getDate()}日`,
    f.ticketUrl ?? '',
  ].filter(Boolean).join('\n');

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Reysol Pocket//JA', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${f.id}-${sale.type}@reysol-pocket`,
    `DTSTAMP:${toUtc(new Date())}`,
    `DTSTART:${toUtc(start)}`,
    `DTEND:${toUtc(new Date(start.getTime() + 30 * 60 * 1000))}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(desc)}`,
    f.ticketUrl ? `URL:${f.ticketUrl}` : '',
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', `DESCRIPTION:${esc(summary)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
};

const download = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadIcs = (f: Fixture) => download(fixtureToIcs(f), `${f.id}.ics`);

export const downloadSaleIcs = (f: Fixture, sale: TicketSale) =>
  download(saleToIcs(f, sale), `${f.id}-${sale.type}.ics`);
