const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6792150794:AAHyXQmKcwSxYJfmLdCNSSxDLo9C43qnZoQ';

const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors());

const WebAppUrl = 'https://gogoshawty-bot.surge.sh';

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(
            chatId,
            'Ниже появится кнопка для заполнения формы',
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: 'Заполнить форму',
                                web_app: { url: WebAppUrl + '/form' },
                            },
                        ],
                    ],
                },
            }
        );
        await bot.sendMessage(
            chatId,
            'Заходи в интернет магазин по кнопке ниже',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Сделать заказ',
                                web_app: { url: WebAppUrl },
                            },
                        ],
                    ],
                },
            }
        );
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(
                    chatId,
                    'Всю информацию вы получите в этом чате'
                );
            }, 3000);
        } catch (error) {
            console.log(error);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text:
                    'Поздравляем с покупкой, вы приобрели товар на сумму ' +
                    totalPrice,
            },
        });
        return res.status(200);
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {
                message_text: 'Не удалось приобрести товар',
            },
        });
        return res.status(500).json({});
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log('server started on port ' + PORT));
