const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

const BOT_TOKEN = '7727782261:AAGB_rGpclD59UGwB9RxyZTh8PGXjzI8oKg';
const ADMIN_ID  = 1255909521;
const API_KEY   = 'ptlc_3uKPO5PiG5CXlPwsKnNB15y98Q75KVpCjW0UCeUVnRM';
const SERVER_ID = '62a15848-3684-442a-b55a-d8cbf5105e62';
const PANEL_URL = 'https://panel.magmanode.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// منع توقف البوت عند حدوث أخطاء في النت
process.on('unhandledRejection', (reason) => console.log('⚠️ خطأ بالنت:', reason));

const controlMagma = async (action) => {
    try {
        const response = await axios.post(`${PANEL_URL}/api/client/servers/${SERVER_ID}/power`, 
            { signal: action }, 
            { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' } }
        );
        return response.status === 204;
    } catch (e) { return false; }
};

const initMinecraftBot = () => {
    const mcBot = mineflayer.createBot({
        host: 'gold.magmanode.com',
        port: 27891,
        username: 'BalaBot',
        version: '1.21.11'
    });

    mcBot.on('login', () => {
        bot.sendMessage(ADMIN_ID, "✅ يوسف، دخلت للسيرفر وكل شي لوز!");
    });

    mcBot.on('end', async () => {
        bot.sendMessage(ADMIN_ID, "⚠️ السيرفر طفى! دا أحاول أشغله...");
        if (await controlMagma('start')) {
            setTimeout(initMinecraftBot, 120000); 
        }
    });

    mcBot.on('error', (err) => console.log('MC Error:', err.message));
};

// تشغيل الـ AFK بوت
setTimeout(initMinecraftBot, 5000); 

// إعداد Railway
const app = express();
app.get('/', (req, res) => res.send('Bala Bot Running!'));
app.listen(process.env.PORT || 3000);