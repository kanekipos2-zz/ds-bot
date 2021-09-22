const 
    fs = require('fs');

var commands = [];

function text_cmd(cmd, args, message)
{
    for(let i of commands)
    {
        for(let i2 of i.text_name)
        {
            if(i2 == cmd)
            {
                i.run_text(args, message);
                return;
            }
        }
    }
    message.channel.send('Нет такой команды.').then(message => {
        setTimeout(function(){message.delete()} , 4000)
    })
    message.delete();
    return;
}

function voice_cmd(voiceMessage)
{
    var content = voiceMessage.content.toLowerCase();
    //if(!content.startsWith('nano') && !content.startsWith('nana') && !content.startsWith('нано') && !content.startsWith('нана') && !content.startsWith('надо')) return;
    //content = content.slice(5);
    for(let i of commands)
    {
        for(let i2 of i.voice_name)
        {
            if(content.startsWith(i2))
            {
                i.run_voice(voiceMessage, content.slice(i2.length+1).split(' '));
                return;
            }
        }
    }
}

function registerCommands()
{
    const commandsFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for(const command of commandsFiles)
    {
        let f = require(`./commands/${command}`);
        commands.push({text_name: f.text_name, voice_name: f.voice_name, description: f.description, run_text: f.args_text, run_voice: f.args_voice});
    }
    return;
}

module.exports.exec = {text_cmd, voice_cmd};
module.exports.registerCommands = registerCommands;
module.exports.commands = commands;