const
    music = require('../music');

module.exports = 
{
    text_name: ['skip'],
    voice_name: ['skip', 'скип', 'скрипай', 'пропусти'],
    description: 'Пропустает трек.', 
    args_text(args, message) 
    {
        music.skip();
        message.delete();
    },
    args_voice(voiceMessage, args)
    {
        music.skip();
    }
}