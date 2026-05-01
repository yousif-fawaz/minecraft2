const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

// --- إعدادات الحماية والمعلومات ---
const BOT_TOKEN = '7727782261:AAGB_rGpclD59UGwB9RxyZTh8PGXjzI8oKg'; // غيره بعد التجربة!
const ADMIN_ID  = 1255909521;
const API_KEY   = 'ptlc_3uKPO5PiG5CXlPwsKnNB15y98Q75KVpCjW0UCeUVnRM'; // غيره فوراً!
const SERVER_ID = '62a15848-3684-442a-b55a-d8cbf5105e62';
const PANEL_URL = 'https://panel.magmanode.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
let isRestarting = false; // حتى لا يكرر طلب التشغيل أكثر من مرة

process.on('unhandledRejection', (reason) => console.log('⚠️ خطأ بالنت:', reason));

// --- دالة التحكم بالسيرفر (الفزعة) ---
const controlMagma = async (action) => {
    try {
        console.log(`📡 جاري إرسال أمر [${action}] للسيرفر...`);
        const response = await axios.post(`${PANEL_URL}/api/client/servers/${SERVER_ID}/power`, 
            { signal: action }, 
            { 
                headers: { 
                    'Authorization': `Bearer ${API_KEY}`, 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                } 
            }
        );
        console.log(`✅ استجابة السيرفر: ${response.status}`);
        return response.status >= 200 && response.status < 300;
    } catch (e) { 
        if (e.response) {
            console.log(`❌ السيرفر رفض الطلب (خطأ ${e.response.status}):`, e.response.data);
        } else {
            console.log('❌ فشل الاتصال بالـ API:', e.message);
        }
        return false; 
    }
};

// --- دالة إعادة الاتصال الذكية ---
const handleRestart = async () => {
    if (isRestarting) return;
    isRestarting = true;

    console.log('🔄 بدأت عملية إعادة التشغيل الفورية...');
    bot.sendMessage(ADMIN_ID, "⚠️ يوسف، البوت فصل أو السيرفر طفى! دا أحاول أفزعله هسة...");

    const success = await controlMagma('start');
    if (success) {
        bot.sendMessage(ADMIN_ID, "⏳ تم إرسال أمر التشغيل بنجاح. راح أنتظر دقيقتين حتى يفتح السيرفر.");
        setTimeout(() => {
            isRestarting = false;
            initMinecraftBot();
        }, 120000); // ينتظر دقيقتين
    } else {
        bot.sendMessage(ADMIN_ID, "❌ فشلت في تشغيل السيرفر تلقائياً. شيك اللوحة يمعود!");
        setTimeout(() => { isRestarting = false; }, 30000); // يحاول مرة ثانية ورا 30 ثانية
    }
};

// --- تشغيل بوت الماينكرافت ---
const initMinecraftBot = () => {
    console.log('🤖 جاري محاولة الدخول للسيرفر...');
    const mcBot = mineflayer.createBot({
        host: 'gold.magmanode.com',
        port: 27891,
        username: 'BalaBot',
        version: '1.21.11' // تأكد من إصدار السيرفر
    });

    mcBot.on('login', () => {
        bot.sendMessage(ADMIN_ID, "✅ يوسف، دخلت للسيرفر وبدأت الاستعراض! 🕺");
        isRestarting = false;
    });

    mcBot.on('spawn', () => {
        console.log('🕺 BalaBot بدأ المهرجان والحركات...');
        
        // نظام الحركات (Anti-AFK)
        const moveInterval = setInterval(() => {
            if (mcBot.entity) {
                mcBot.setControlState('jump', true);
                setTimeout(() => mcBot.setControlState('jump', false), 500);
                mcBot.swingArm();
                
                // حركة عشوائية لليمين واليسار
                const dir = Math.random() > 0.5 ? 'left' : 'right';
                mcBot.setControlState(dir, true);
                setTimeout(() => mcBot.setControlState(dir, false), 500);
            }
        }, 20000);

        mcBot.once('end', () => clearInterval(moveInterval));
    });

    // أحداث الفصل بجميع أنواعها
    mcBot.on('end', () => {
        console.log('🔌 انفصل الاتصال بالسيرفر (End)');
        handleRestart();
    });

    mcBot.on('kicked', (reason) => {
        console.log('🚫 البوت انطرد من السيرفر:', reason);
        handleRestart();
    });

    mcBot.on('error', (err) => {
        console.log('🔥 صار خطأ تقني بالبوت:', err.message);
        if (err.code === 'ECONNREFUSED') {
            handleRestart();
        }
    });
};

// --- البدء بالعمل ---
// نطلب تشغيل السيرفر أول ما يشتغل السكربت حتى نضمن إنه صاحي
const startApp = async () => {
    console.log('🚀 تشغيل نظام بالة بوت...');
    await controlMagma('start');
    setTimeout(initMinecraftBot, 10000); // يدخل ورا 10 ثواني من أمر التشغيل
};

startApp();

// سيرفر Express لإبقاء البوت شغال (أهمية قصوى لـ Northflank أو غيرها)
const app = express();
app.get('/', (req, res) => res.send('Bala Bot is Dancing! 🕺'));
app.listen(process.env.PORT || 3000, () => {
    console.log(`🌐 سيرفر الويب شغال على بورت ${process.env.PORT || 3000}`);
});
