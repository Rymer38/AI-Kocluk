import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// File storage configuration for user accounts
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: 'usr-admin',
        username: 'admin',
        email: 'ekicia926@gmail.com',
        passwordHash: 'admin123',
        role: 'admin',
        createdAt: '2026-07-21',
      },
      {
        id: 'usr-student-1',
        username: 'Ahmet_YKS2027',
        email: 'ahmet@yks.com',
        passwordHash: '123456',
        role: 'student',
        createdAt: '2026-07-20',
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
  }
}

function getUsersFromFile() {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsersToFile(users: any[]) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Lazy initializer for Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'DUMMY_KEY_FOR_INIT',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// User Persistence API Endpoints
app.get('/api/users', (req, res) => {
  const users = getUsersFromFile();
  res.json({ users });
});

app.post('/api/users', (req, res) => {
  const body = req.body;
  const existingUsers = getUsersFromFile();

  if (Array.isArray(body)) {
    saveUsersToFile(body);
    return res.json({ success: true, users: body });
  }

  if (body && body.users && Array.isArray(body.users)) {
    saveUsersToFile(body.users);
    return res.json({ success: true, users: body.users });
  }

  const newUser = body;
  if (!newUser || (!newUser.username && !newUser.id)) {
    return res.status(400).json({ error: 'Geçersiz kullanıcı verisi.' });
  }

  const exists = existingUsers.some(
    (u: any) =>
      u.id === newUser.id ||
      (newUser.username && u.username.toLowerCase() === newUser.username.trim().toLowerCase())
  );

  let updated;
  if (exists) {
    updated = existingUsers.map((u: any) =>
      u.id === newUser.id || (newUser.username && u.username.toLowerCase() === newUser.username.trim().toLowerCase())
        ? { ...u, ...newUser }
        : u
    );
  } else {
    updated = [...existingUsers, newUser];
  }

  saveUsersToFile(updated);
  res.json({ success: true, users: updated });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const users = getUsersFromFile();

  const updated = users.map((u: any) => (u.id === id ? { ...u, ...updateData } : u));
  saveUsersToFile(updated);
  res.json({ success: true, users: updated });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const users = getUsersFromFile();
  const updated = users.filter((u: any) => u.id !== id);
  saveUsersToFile(updated);
  res.json({ success: true, users: updated });
});

// Gemini Multimodal Vision API Endpoint for Analyzing Wrong Question Photo
app.post('/api/ai/analyze-wrong-question-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', examTitle = 'TYT Denemesi' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Görsel verisi eksik.' });
    }

    const ai = getGeminiAI();

    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
Sen YKS ve TYT soru analizi uzmanı bir yapay zekasın.
Aşağıda öğrencinin "${examTitle}" deneme sınavından fotoğrafını çektiği yanlış veya boş bıraktığı bir soru görseli bulunmaktadır.

Görseli detaylıca incele ve şu bilgileri tespit ederek JSON formatında döndür:
1. "subjectKey": Ders kategorisi. Yalnızca şu 4 değerden biri olmalıdır: 'matematik' | 'turkce' | 'fen' | 'sosyal'.
2. "topic": Sorunun tam alt konusu (Örn: "Köklü Sayılar", "Paragrafta Ana Düşünce", "Üçgenlerde Eşlik ve Benzerlik", "Optik ve Kırılma", "Mol Kavramı", "Tarih Bilimine Giriş" vb.).
3. "questionText": Görseldeki soru metninin kısa ve net özeti / soru kökü.
4. "correctAnswerText": Sorunun adım adım ayrıntılı doğru çözümü ve şık cevabı.
5. "notes": Öğrencinin bir daha bu hatayı yapmaması için unutmaması gereken 1 cümlelik altın ipucu / püf nokta notu.

JSON FORMATI (Başka hiçbir metin yazma, sadece bu JSON nesnesini döndür):
{
  "subjectKey": "matematik",
  "topic": "Köklü Sayılar",
  "questionText": "Sorunun özeti...",
  "correctAnswerText": "Adım adım çözüm açıklaması...",
  "notes": "Püf nokta ipucu..."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        promptText,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    let result = {};
    try {
      result = JSON.parse(response.text || '{}');
    } catch {
      result = {};
    }

    res.json({ analysis: result });
  } catch (err: any) {
    console.error('Analyze Wrong Question Image Error:', err);
    res.status(500).json({
      error: 'Fotoğraf analiz edilirken bir hata oluştu.',
      details: err?.message || 'Görsel okunamadı',
    });
  }
});

// API Routes

// 1. Exam AI Analysis Route
app.post('/api/ai/analyze-exam', async (req, res) => {
  try {
    const { examRecord, targetGoal } = req.body;
    if (!examRecord) {
      return res.status(400).json({ error: 'Deneme verisi eksik.' });
    }

    const ai = getGeminiAI();
    const prompt = `
Sen Türkiye YKS (Yükseköğretim Kurumları Sınavı) ve TYT (Temel Yeterlilik Testi) alanında uzmanlaşmış kıdemli bir YKS Derece Koçusun.
Aşağıda bir öğrencinin yeni çözdüğü TYT deneme sınavı sonuçları bulunmaktadır.

Sınav Adı: ${examRecord.title}
Tarih: ${examRecord.date}
Toplam Net: ${examRecord.totalNet} (Doğru: ${examRecord.totalCorrect}, Yanlış: ${examRecord.totalWrong}, Boş: ${examRecord.totalEmpty})
Tahmini TYT Puanı: ${examRecord.estimatedScore}
Öğrencinin Hedef Net'i: ${targetGoal?.targetNet || 95} (${targetGoal?.targetDepartment || 'Hedef Bölüm'}, ${targetGoal?.targetUniversity || 'Üniversite'})

Ders Bazında Detaylar:
- Türkçe Net: ${examRecord.subjects.turkce.net} / 40 (Süre: ${examRecord.subjects.turkce.timeSpentMinutes || 40} dk)
- Sosyal Net: ${examRecord.subjects.sosyal.net} / 20 (Süre: ${examRecord.subjects.sosyal.timeSpentMinutes || 15} dk)
- Temel Matematik Net: ${examRecord.subjects.matematik.net} / 40 (Süre: ${examRecord.subjects.matematik.timeSpentMinutes || 60} dk)
- Fen Bilimleri Net: ${examRecord.subjects.fen.net} / 20 (Süre: ${examRecord.subjects.fen.timeSpentMinutes || 20} dk)

Öğrencinin Notu: "${examRecord.notes || 'Yok'}"

Lütfen öğrenciye hitaben motive edici, yapıcı ve doğrudan uygulanabilir detaylı bir analiz raporu hazırla.
Raporda şunları belirt:
1. Genel Başarı Değerlendirmesi ve Hedefe Yakınlık Durumu
2. En Çok Net Kaybettiren 3 Kritik Konu / Soru Tipi
3. Zaman Yönetimi ve Turlama Taktiği Tavsiyeleri
4. Netleri +5-10 Puan Arttırmak İçin Sonraki Haftanın 3 Altın Stratejisi

Anlatım dili samimi, yapıcı, profesyonel YKS koçu tarzında Türkçe olsun. Formatlama için Markdown kullan (kalın başlıklar, maddeler).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    console.error('Exam Analysis Error:', err);
    res.status(500).json({
      error: 'AI analizi oluşturulurken bir hata oluştu.',
      details: err?.message || 'Bilinmeyen hata',
    });
  }
});

// 2. Generate Dynamic Weekly Study Plan Route
app.post('/api/ai/generate-study-plan', async (req, res) => {
  try {
    const { weakTopics, targetNet, currentNet } = req.body;
    const ai = getGeminiAI();

    const prompt = `
Sen YKS ders programı hazırlama uzmanısın. Öğrencinin zayıf olduğu konular şunlardır:
${JSON.stringify(weakTopics || ['Geometri Üçgenler', 'Fizik Optik', 'Matematik Problemler'])}

Mevcut Net: ${currentNet || 75}, Hedef Net: ${targetNet || 95}.

Lütfen önümüzdeki 7 gün (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar) için tam dengeli bir haftalık çalışma programı oluştur.
Zayıf konulara öncelik ver ama genel tekrar ve branş denemesi takvimini de aksatma.

DÖNDÜRÜLECEK JSON FORMATI:
[
  {
    "day": "Pazartesi",
    "timeSlot": "Sabah (09:00 - 12:00)",
    "subjectKey": "matematik",
    "topic": "Geometri: Üçgenler ve Açılar",
    "description": "Katlama soruları video izle ve 30 soru çöz",
    "priority": "Yüksek",
    "estimatedMinutes": 90
  }
]

subjectKey değerleri yalnızca şunlar olabilir: 'turkce' | 'sosyal' | 'matematik' | 'fen'.
day değerleri: 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar'.
timeSlot değerleri: 'Sabah (09:00 - 12:00)' | 'Öğle (13:00 - 17:00)' | 'Akşam (18:00 - 22:00)'.
priority değerleri: 'Yüksek' | 'Orta' | 'Düşük'.
Sadece geçerli bir JSON dizisi döndür.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let tasks = [];
    try {
      tasks = JSON.parse(response.text || '[]');
    } catch {
      tasks = [];
    }

    res.json({ tasks });
  } catch (err: any) {
    console.error('Study Plan Generation Error:', err);
    res.status(500).json({ error: 'Program oluşturulurken hata oluştu.' });
  }
});

// 3. AI YKS Coach Chat Route
app.post('/api/ai/coach-chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const ai = getGeminiAI();

    const systemInstruction = `
Sen "YKS Koçu AI" adlı, Türkiye YKS (TYT/AYT) sınavına hazırlanan öğrencilere rehberlik eden arkadaş canlısı, samimi ve son derece uzman bir derece koçusun.
Öğrencinin Mevcut Durumu:
- Son TYT Net Ortalaması: ${userContext?.avgNet || 80}
- Hedef Net: ${userContext?.targetNet || 95} (${userContext?.targetDepartment || 'Hedef Bölüm'})
- En Çok Zorlandığı Konular: ${userContext?.weakTopics?.join(', ') || 'Geometri, Fizik Optik'}

Görevin:
1. Öğrencinin YKS ile ilgili sorularına net, taktiksel, motive edici yanıtlar ver.
2. Turlama taktiği, paragraf çözme teknikleri, süre yönetimi, kaygı kontrolü, deneme analizi yapma yöntemleri ve konu çalışma tavsiyeleri sun.
3. Cevaplarını Türkçe ve Markdown formatında sun. Çok uzun ve sıkıcı paragraflardan kaçın, maddeler ve vurgular kullan.
`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const response = await chat.sendMessage({
      message: lastMessage?.text || 'Merhaba hocam, bana tavsiye verir misiniz?',
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Coach Chat Error:', err);
    res.status(500).json({ error: 'Yapay zeka yanıt veremedi.' });
  }
});

// 4. Generate Interactive Practice Quiz Route
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { subjectKey, topic, count = 3 } = req.body;
    const ai = getGeminiAI();

    const prompt = `
Lütfen YKS TYT sınav seviyesine uygun, "${topic}" konusu için tam ${count} adet yeni nesil test sorusu hazırla.
Soru metni açık, şıklar (A, B, C, D, E) çeldiricileri kuvvetli olsun. Her sorunun doğru cevabının indeksi (0=A, 1=B, 2=C, 3=D, 4=E) ve anlaşılır çözümlü açıklaması bulunsun.

JSON ŞEMASI DÖNDÜR:
[
  {
    "questionText": "Soru metni...",
    "subjectKey": "${subjectKey || 'matematik'}",
    "topic": "${topic}",
    "options": ["Şık A", "Şık B", "Şık C", "Şık D", "Şık E"],
    "correctIndex": 1,
    "explanation": "Açıklamalı detaylı soru çözümü..."
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let questions = [];
    try {
      questions = JSON.parse(response.text || '[]');
    } catch {
      questions = [];
    }

    res.json({ questions });
  } catch (err: any) {
    console.error('Generate Quiz Error:', err);
    res.status(500).json({ error: 'Quiz üretilemedi.' });
  }
});

// Start Express Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
