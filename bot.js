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
        bot.sendMessage(ADMIN_ID, "✅ يوسف، دخلت للسيرفر وبدأت الاستعراض! 🕺");
    });

    // === نظام الحركات الاحترافية (Anti-AFK Pro) ===
    mcBot.on('spawn', () => {
        console.log('🤖 BalaBot بدأ المهرجان...');
        
        setInterval(() => {
            if (mcBot.entity) {
                // 1. يطفر
                mcBot.setControlState('jump', true);
                setTimeout(() => mcBot.setControlState('jump', false), 500);

                // 2. يضرب (بوكس بالهوا)
                mcBot.swingArm();

                // 3. يمشي يمنة ويسرة
                mcBot.setControlState('left', true);
                setTimeout(() => {
                    mcBot.setControlState('left', false);
                    mcBot.setControlState('right', true);
                    setTimeout(() => mcBot.setControlState('right', false), 500);
                }, 500);

                // 4. يباوع يمنة ويسرة (تغيير زاوية الكاميرا)
                const currentYaw = mcBot.entity.yaw;
                mcBot.look(currentYaw + 0.5, mcBot.entity.pitch);
                setTimeout(() => mcBot.look(currentYaw - 0.5, mcBot.entity.pitch), 1000);
            }
        }, 20000); // يسوي هالحركات كل 20 ثانية حتى يضل نشط
    });

    mcBot.on('end', async () => {
        bot.sendMessage(ADMIN_ID, "⚠️ البوت فصل! دا أحاول أشغل السيرفر وأرجع...");
        if (await controlMagma('start')) {
            setTimeout(initMinecraftBot, 120000); 
        }
    });

    mcBot.on('error', (err) => console.log('MC Error:', err.message));
};

setTimeout(initMinecraftBot, 5000); 

const app = express();
app.get('/', (req, res) => res.send('Bala Bot is Dancing!'));
app.listen(process.env.PORT || 3000);
