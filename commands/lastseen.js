// This command will reply with the last seen time for specified user

exports.run = async (client, message, args, level) => { 

  args = args.map(function(x){ return x.toLowerCase() });
  const moment = require("moment"),
        table = require('easy-table');
  try {
  var hasData=false,
      scoreTable = new table,
      guildDB = message.guild,
      members = [],
      errors = '';

  args.forEach(function(arg, argNum) {
    errors += `arg ${argNum}: ${arg}\n`; // Debug
    if (arg.indexOf("<@&") >= 0) { //target is a ROLE
      singleTarget = false;
      const roleID = arg.replace("<@&","").replace(">","");
      if (!message.guild.roles.has(roleID)) {
        errors += "Role not found! Maybe i can't mention it...\n";
        return true; //Skip to next member of args
      }
      message.guild.roles.get(roleID).members.forEach(function(targetDB, targetID){
        members[targetID] = targetDB;
      });
    }
    else if (arg.indexOf("<@") >= 0 ) { //target is a USER
      var targetID = arg.replace("<@","").replace(">","");
      var targetDB = client.userDB.get(targetID) || {username: targetID, lastSeen: false}
      if (!targetDB.lastSeen) {
        errors += `I have never seen ${targetDB.username}.\n`;
        return true; //Skip to next member of args
      }
      if (message.author.id === targetID) {
        errors += "Do you need a mirror ???\n";
      } else {
        errors += `Showing member: ${arg}\n`; //Debug
      }
      members[targetID] = targetDB;
    } else if (arg.trim() == 'all') {
      errors += `Showing all: ${arg}\n`; //Debug
      members = guildDB.members.array();
    } else {
      errors += `I do not recognize the argument: ${arg}\n`;
    }

  });

  members.forEach(function (targetDB, targetID, mapObj){
    if (targetID != process.env.DISCORD_BOT_ID) {
      targetDB = client.userDB.get(targetID) || targetDB || {lastSeen: false}
      if (targetDB.lastSeen) {
        let timeDiff = Math.round((Date.now() - targetDB.lastSeen) / 360000) / 10; //One 10 outside the round() call so we have a single decimal
        scoreTable.cell('User', targetDB.username);
        let lastSeenString = timeDiff ? `${timeDiff} hours ago` : "just now...";
        //if(targetDB.timeOffset) lastSeen += " at "+moment(Date.now() + (targetDB.timeOffset * 3600000)).format("YY-MM-DD, HH:mm");
        scoreTable.cell('LastSeen', timeAgo);
        scoreTable.cell('timestamp', targetDB.lastSeen, function(){return '';}) //This empty printer callback with will hide this column and give it zero width
        if (targetDB.timeOffset)
          scoreTable.cell('LocalTime', moment(Date.now() + (targetDB.timeOffset * 3600000)).format("MMM DD, HH:mm"));
        scoreTable.newRow();
      } else {
        errors += `Haven't seen ${targetID}`;
      }
    }
  });  
  if (!scoreTable.rows.length) return message.reply(errors+"No data found");
  else return message.reply(`${errors}Last seen time for everyone of ${args.join(', ')}:\n` + "```" + scoreTable.sort('timestamp|des').toString()+"```"); 
  } catch (error) { return message.reply(`${error}`); }
};
               
exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["seen"],
  permLevel: "User"
};

exports.help = {
  name: "lastseen",
  category: "Miscelaneous",
  description: "What is the last time a corp member was seen?",
  usage: "lastseen [@user|role @role|all]."
};
