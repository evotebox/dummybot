const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const {leave} = Stage;
const Emoji = require('node-emoji');
const TelegrafI18n = require('telegraf-i18n');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const path = require('path');


/////////////////////////////// Language Picker Scene
const language = new Scene('language');
language.enter((ctx) => {
    console.log("[INFO] - start command, choosing language");
    ctx.reply('Tria idioma / Selecciona idioma', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Valencià', 'va'),
            m.callbackButton('Castellano', 'es')
        ])))
});


language.on('callback_query', ctx => {
    let answer = ctx.callbackQuery.data;
    if (answer === 'es') {
        ctx.answerCbQuery("Castellano");
        console.log("[INFO] - Changing to Spanish via callback");
        ctx.i18n.locale('es');
        ctx.scene.enter('greeter');

    } else if (answer === 'va') {
        ctx.answerCbQuery("Valencià");
        console.log("[INFO] - Changing to Catalan via callback");
        ctx.i18n.locale('va');
        ctx.scene.enter('greeter');

    }

});
///////////////////////////////


/////////////////////////////// Greeter Scene
const greeter = new Scene('greeter');
greeter.enter((ctx) => {
    console.log("[INFO] - start command - user: " + ctx.from.first_name);
    ctx.reply(Emoji.emojify(ctx.i18n.t('greeting', {
        user_name: ctx.from.first_name
    })))

});
///////////////////////////////


// Create scene manager
const stage = new Stage();
stage.command('cancelar', leave());


// Scene registration
stage.register(language);
stage.register(greeter);


const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const i18n = new TelegrafI18n({
    useSession: true,
    defaultLanguage: 'es',
    allowMissing: true,
    directory: path.resolve(__dirname, 'locales')
});


bot.catch((err) => {
    console.log('[ERROR] - ', err)
});

bot.use(session());
bot.use(i18n.middleware());
bot.use(stage.middleware());

console.log("[INFO] - Init...");

bot.command('start', (ctx) => {
    console.log("[INFO] - Start command");
    ctx.scene.enter('language')

});


bot.startPolling();