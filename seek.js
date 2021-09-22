const
    music = require('../music');

module.exports = 
{
    text_name: ['seek'],
    voice_name: [],
    description: 'Начинает текущий трек с указаного времени. Формат 8:30 или 1:32:09.', 
    args_text(args, message) 
    {
        music.seek(args[0]);
        message.delete();
    },
    args_voice(voiceMessage, args){}
}