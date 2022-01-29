const { WAConnection, MessageType, Mimetype, Presence } = require('@fillipe143/baileys');
const client = new WAConnection()
const fs = require('fs')

var chatbot = JSON.parse(fs.readFileSync('./db.json'));
client.logger.level = 'warn'
fs.existsSync('./token.json') && client.loadAuthInfo('./token.json')
client.on('open', () =>{
    const authInfo = client.base64EncodedAuthInfo()
    fs.writeFileSync('./token.json', JSON.stringify(authInfo, null, '\t'))
	console.log('Bot Online!')
})
client.on('chat-update', async(chatUpdate) => {
	if(!chatUpdate.messages || !chatUpdate.count || !chatUpdate.hasNewMessage || chatUpdate.key && chatUpdate.key.remoteJid == 'status@broadcast') return;
	  const dados = chatUpdate.messages.all()[0]
	  const info = dados.message;
	  const jid = dados.key.remoteJid;
	  const participant = dados.participant;
	  const isGroup = jid.endsWith('@g.us');
	  const id = isGroup ? participant : jid;
	  const type = Object.keys(info);
	  const message =
	    type == 'conversation' && info.conversation
	      ? info.conversation
	      : type == 'imageMessage' && info.imageMessage.caption
	        ? info.imageMessage.caption
	        : type == 'videoMessage' && info.videoMessage.caption
	          ? info.videoMessage.caption
	          : type == 'extendedTextMessage' && info.extendedTextMessage.text
	            ? info.extendedTextMessage.text
	            : type == 'buttonsResponseMessage' && info.buttonsResponseMessage.selectedDisplayText
	              ? info.buttonsResponseMessage.selectedDisplayText
	              : type == 'listResponseMessage' && info.listResponseMessage.title
	                ? info.listResponseMessage.title
	                : '';
	const textmark = info.extendedTextMessage && info.extendedTextMessage.contextInfo && info.extendedTextMessage.contextInfo.quotedMessage && info.extendedTextMessage.contextInfo.quotedMessage.conversation
		? info.extendedTextMessage.contextInfo.quotedMessage.conversation
			: info.buttonsMessage && info.buttonsMessage.contextInfo && info.buttonsMessage.contextInfo.quotedMessage && info.buttonsMessage.contextInfo.quotedMessage.conversation
				? info.buttonsMessage.contextInfo.quotedMessage.conversation : '';
	const reply = (text) => client.sendMessage(jid, text, MessageType.text, {quoted:dados})
	const command = message.slice(1).trim().split(/ +/).shift().toLowerCase();
	const text = message.substring(message.toLowerCase().indexOf(command) + command.length + 1,message.length);
	const args = text.trim().split(' ');
	if(chatbot[message])
	{
		reply(chatbot[message]);
		client.chatRead(jid);
		console.log('[CHATBOT] Respondida:', chatbot[message]);
	} else if(textmark)
	{
		chatbot[textmark] = message;
		client.chatRead(jid);
		fs.writeFileSync('./db.json', JSON.stringify(chatbot, null, '\t'))
		console.log('[CHATBOT] Aprendida:', message);
	}
})
client.connect()