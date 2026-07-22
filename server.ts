import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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
