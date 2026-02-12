export type JournalEntry = {
    puasa: boolean;
    sholat_subuh: boolean;
    sholat_zuhur: boolean;
    sholat_ashar: boolean;
    sholat_maghrib: boolean;
    sholat_isya: boolean;
    tadarus: boolean;
};

export type AttendanceLog = {
    session_type: string;
};

export const POINT_VALUES = {
    JOURNAL: {
        PUASA: 50,
        SHOLAT: 10, // Per prayer
        TADARUS: 20
    },
    ATTENDANCE: {
        SUBUH: 50,
        TARAWIH: 50,
        KEGIATAN_HARIAN: 30
    },
    STREAK: {
        BONUS_3: 30,   // 3 hari berturut
        BONUS_7: 100,  // 7 hari berturut
        BONUS_14: 250, // 14 hari berturut
        BONUS_21: 500, // 21 hari berturut
        BONUS_30: 1000 // 30 hari full!
    }
};

export const BADGES = [
    { name: 'Pemula', minParams: 0, icon: '🌱', color: 'text-slate-400', bg: 'from-slate-400/20 to-slate-500/10' },
    { name: 'Pejuang Subuh', minParams: 200, icon: '🌅', color: 'text-sky-400', bg: 'from-sky-400/20 to-sky-500/10' },
    { name: 'Rajin Ibadah', minParams: 500, icon: '⭐', color: 'text-yellow-400', bg: 'from-yellow-400/20 to-yellow-500/10' },
    { name: 'Sahabat Quran', minParams: 1000, icon: '📖', color: 'text-emerald-400', bg: 'from-emerald-400/20 to-emerald-500/10' },
    { name: 'Bintang Masjid', minParams: 1800, icon: '🕌', color: 'text-amber-500', bg: 'from-amber-400/20 to-amber-500/10' },
    { name: 'Pendekar Puasa', minParams: 2800, icon: '⚔️', color: 'text-red-400', bg: 'from-red-400/20 to-red-500/10' },
    { name: 'Super Muslim', minParams: 4000, icon: '🦸', color: 'text-violet-400', bg: 'from-violet-400/20 to-violet-500/10' },
    { name: 'Juara Ramadhan', minParams: 5500, icon: '🏆', color: 'text-yellow-300', bg: 'from-yellow-300/20 to-amber-400/10' },
    { name: 'Legenda', minParams: 7500, icon: '👑', color: 'text-amber-300', bg: 'from-amber-300/20 to-yellow-400/10' },
];

export function calculateJournalPoints(entry: JournalEntry | null): number {
    if (!entry) return 0;

    let points = 0;
    if (entry.puasa) points += POINT_VALUES.JOURNAL.PUASA;
    if (entry.tadarus) points += POINT_VALUES.JOURNAL.TADARUS;

    if (entry.sholat_subuh) points += POINT_VALUES.JOURNAL.SHOLAT;
    if (entry.sholat_zuhur) points += POINT_VALUES.JOURNAL.SHOLAT;
    if (entry.sholat_ashar) points += POINT_VALUES.JOURNAL.SHOLAT;
    if (entry.sholat_maghrib) points += POINT_VALUES.JOURNAL.SHOLAT;
    if (entry.sholat_isya) points += POINT_VALUES.JOURNAL.SHOLAT;

    return points;
}

export function calculateAttendancePoints(logs: AttendanceLog[]): number {
    return logs.reduce((total, log) => {
        switch (log.session_type) {
            case 'subuh': return total + POINT_VALUES.ATTENDANCE.SUBUH;
            case 'tarawih': return total + POINT_VALUES.ATTENDANCE.TARAWIH;
            case 'kegiatan_harian': return total + POINT_VALUES.ATTENDANCE.KEGIATAN_HARIAN;
            default: return total;
        }
    }, 0);
}

// Calculate streak (consecutive days with journal entries)
export function calculateStreak(journalDates: string[]): number {
    if (journalDates.length === 0) return 0;

    const sorted = [...journalDates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Start counting from today or yesterday
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diffDays = (prev.getTime() - curr.getTime()) / 86400000;

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export function getStreakBonus(streak: number): number {
    if (streak >= 30) return POINT_VALUES.STREAK.BONUS_30;
    if (streak >= 21) return POINT_VALUES.STREAK.BONUS_21;
    if (streak >= 14) return POINT_VALUES.STREAK.BONUS_14;
    if (streak >= 7) return POINT_VALUES.STREAK.BONUS_7;
    if (streak >= 3) return POINT_VALUES.STREAK.BONUS_3;
    return 0;
}

export function getStreakMilestones(streak: number) {
    const milestones = [
        { days: 3, label: '3 Hari', emoji: '🔥', reached: streak >= 3 },
        { days: 7, label: '7 Hari', emoji: '💪', reached: streak >= 7 },
        { days: 14, label: '14 Hari', emoji: '🌟', reached: streak >= 14 },
        { days: 21, label: '21 Hari', emoji: '🚀', reached: streak >= 21 },
        { days: 30, label: 'Full!', emoji: '👑', reached: streak >= 30 },
    ];
    return milestones;
}

export function getBadge(totalPoints: number) {
    return BADGES.slice().reverse().find(b => totalPoints >= b.minParams) || BADGES[0];
}

export function getNextBadge(totalPoints: number) {
    return BADGES.find(b => totalPoints < b.minParams);
}

export const DAILY_QUOTES = [
    "Puasa itu perisai dari api neraka. Semangat ya! 🛡️",
    "Sholat adalah tiang agama. Jangan lupa sholat 5 waktu! 🕌",
    "Senyummu kepada saudaramu adalah sedekah 😊",
    "Barangsiapa berpuasa Ramadhan karena iman, diampuni dosanya ✨",
    "Makan sahur itu ada keberkahannya 🍚",
    "Sebaik-baik kalian adalah yang mempelajari Al-Quran 📖",
    "Kebersihan itu sebagian dari iman 🧹",
    "Allah bersama orang-orang yang sabar 💪",
    "Doa orang yang berpuasa tidak akan ditolak 🤲",
    "Berbuat baik kepada tetangga itu sunnah 🏘️",
    "Sedekah tidak mengurangi harta 💰",
    "Bacalah Quran, ia akan menjadi syafaat bagimu 📿",
    "Saling memaafkan itu indah 🤝",
    "Orang kuat bukan yang menang gulat, tapi yang menahan marah 🧘",
    "Tarawih berjamaah pahalanya berlipat! 🌙",
    "Niatkan semua amalan karena Allah 💎",
    "Bersyukurlah, niscaya Aku tambah nikmat-Ku 🙏",
    "Jaga lisan dari kata-kata yang buruk 🤫",
    "Setiap kebaikan kecil tetap dihitung Allah ⚖️",
    "Tahajud adalah sholat paling utama setelah wajib 🌃",
    "Berbagi makanan berbuka itu pahala besar! 🥤",
    "Istiqomah lebih baik dari seribu karamah 📈",
    "Jadilah anak sholeh/sholehah, doakan orangtua 💝",
    "Sampaikanlah dariku walau satu ayat 🌍",
    "Orang beriman itu ramah dan mudah senyum 😄",
    "Puasa melatih kita menjadi pribadi yang sabar 🎯",
    "Malam Lailatul Qadar lebih baik dari 1000 bulan 🌟",
    "Ramadhan adalah bulan penuh rahmat dan ampunan 🌈",
    "Jaga shahum, jaga sholat, jaga akhlak! 💯",
    "Alhamdulillah, kita masih diberi kesempatan Ramadhan 🎉"
];

export function getDailyQuote() {
    const today = new Date().getDate();
    return DAILY_QUOTES[today % DAILY_QUOTES.length];
}
