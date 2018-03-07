// *** HadesBotty stuff ***

module.exports = (client) => {

  // *** userDB stores user information
  client.checkUserDB = (client, message) => {
    if (message.channel.type !=='text') return;
    const settings = client.settings.get(message.guild.id);
    
    // For ease of use in commands and functions, attach the current userDB to the message object
    message.userDB = client.userDB.get(message.author.id) || {username: message.author.username};

    // ** Points system
    if (!message.userDB[message.guild.id]) 
      message.userDB[message.guild.id] = {name: message.guild.name, level: 0, points: 0, commands: 0 };
    if (message.content.indexOf(settings.prefix) === 0) 
      message.userDB[message.guild.id].commands++;
    else
      message.userDB[message.guild.id].points++;
    const curLevel = Math.floor(0.1 * Math.sqrt(message.userDB[message.guild.id].points));
    if (message.userDB[message.guild.id].level < curLevel) {
      //message.reply(`You've leveled up to chat level **${curLevel}**!`);
      message.userDB[message.guild.id].level = curLevel;
    }

    message.userDB.lastSeen = Date.now();
    message.guild.fetchMember(message.author.id)
      .then(result => message.userDB.username = result.displayName)
      .then(client.userDB.set(message.author.id, message.userDB)); //Update into client to permanetly store in levelDB 

    //client.logger.debug("> "+JSON.stringify(message.userDB));
  };
  
  client.normalizeTechName = (name) => {
    switch(name.toLowerCase()) {
      case "ts":
      case "trans":
      case "transport":
         return "transp";
      case "mine":
         return "miner";
      case "battleship":
      case "battle":
         return "bs";
      case "cargo":
      case "cb":
         return "cargobay";
      case "shipmentcomputer":
      case "comp":
      case "sc":
         return "computer";
      case "tboost":
         return "tradeboost";
         return "rush"; //can't reach
      case "tburst":
         return "tradeburst";
      case "sa":
      case "autoship":
      case "auto":
      case "pilot":
      case "shipmentautopilot":
         return "autopilot";
      case "off":
         return "offload";
      case "shipmentbeam":
      case "sbeam":
      case "sb":
         return "beam";
         return "entrust";//can't reach
         return "recall";//can't reach
      case "hb":
      case "hydrogenbay":
         return "hydrobay";
      case "mb":
      case "mboost":
         return "miningboost";
         return "enrich";
      case "rm":
      case "remotemining":
         return "remote";
      case "upload":
      case "hu":
         return "hydroupload";
      case "mu":
      case "munity":
         return "miningunity";
         return "crunch";//can't reach
         return "genesis";//can't reach
      case "batt":
         return "battery";
         return "laser";
      case "massbatt":
      case "massbattery":
         return "mass";
      case "duallaser":
      case "dualaser":
         return "dual";
         return "barrage";//can't reach
      case "alphashield":
         return "alpha";
      case "deltashield":
      case "dshield":
      case "ds":
         return "delta";
      case "passiveshield":
      case "pshield":
      case "ps":
         return "passive";
      case "omegashield":
      case "oshield":
      case "os":
         return "omega";
      case "mirrorshield":
      case "mshield":
      case "ms":
         return "mirror";
      case "areashield":
      case "ashield":
      case "as":
         return "area";
         return "emp";//can't reach
      case "tel":
      case "tele":
         return "teleport";
      case "rse":
      case "extender":
      case "redstarextender":
         return "rsextender";
      case "remoterepair":
      case "remoterep":
      case "remrepair":
      case "remrep":
      case "rr":
      case "rep":
         return "repair";
      case "timewarp":
      case "tw":
      case "twarp":
         return "warp";
         return "unity";//can't reach
      case "sanc":
      case "sanct":
         return "sanctuary";
         return "stealth";//can't reach
      case "fort":
         return "fortify";
         return "impulse";//can't reach
      case "alpharocket":
      case "arocket":
      case "rock":
      case "rockets":
         return "rocket";
      case "salv":
         return "salvage";
      case "supp":
         return "suppress";
      case "dest":
         return "destiny";
         return "barrier";//can't reach
      case "veng":
      case "venge":
         return "vengeance";
         return "leap";//can't reach
      default:
        break;
    }
    return name.toLowerCase()
  }
};
