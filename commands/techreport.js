// Hades star Technology Level
// This command will calculate the tech level for all users

exports.run = async (client, message, args, level) => { 

  args = args.map(x => x.toLowerCase());
  const table = require('easy-table');
  try {
  var hasData=false,
      errors = '';
      members = new Map(),
      reportTables = new Array(),
      techLists = new Array(),
      argSection = 'users';
    
  args.forEach(function(arg) {
    if ('|' == arg.trim()) {
      argSection = 'techIDs';
      techLists[techLists.length] = new Map(); //Initialize a new tech list
    } else if ('techIDs' == argSection) {
      //TODO refactor this to use a common tech parsing script
      //errors += client.ParseTechArg(arg, techLists[techLists.length], client.config.hadesTech); 
      let techID = client.normalizeTechName(arg);
      if (client.config.hadesTech[techID]) {
        techLists[techLists.length - 1].set(techID, arg); // add a tech plus the arg as a label for our table
      } else if (client.config.hadesTechSize[techID]) {
        client.config.hadesTech.forEach((techValue, techKey) => {
          if (client.config.hadesTech[techKey].group == techID) {
            techLists[techLists.length - 1].set(techKey, techKey); // add all techs from group
          }
        });
      } else {
        errors += `Cannot find tech to match ${arg}\n`;
      }
    } else if ('users' == argSection) {
      //TODO refactor this to use a common member parsing script
      //errors += client.ParseMembersArg(arg, members, message.guild);//members is passed by refernce-by-value so it can be updated
      //errors += `arg ${argNum}: ${arg}\n`; // Debug
      if (arg.indexOf("<@&") >= 0) { //target is a ROLE
        const roleID = arg.replace("<@&","").replace(">","");
        if (!message.guild.roles.has(roleID)) {
          errors += "Role not found! Maybe i can't mention it...\n";
          return true; //Skip to next member of args
        }
        message.guild.roles.get(roleID).members.forEach(function(targetDB, targetID){
          members.set(targetID, targetDB);
        });
      }
      else if (arg.indexOf("<@") >= 0 ) { //target is a USER
        var targetID = arg.replace("<@","").replace(">","").replace("!","");
        var targetDB = client.userDB.get(targetID);// || {username: targetID, lastSeen: false}
//         if (!targetDB.lastSeen) {
//           errors += `I have no records for ${targetDB.username}.\n`;
//           return true; //Skip to next member of args
//         }
        if (message.author.id === targetID) {
          //errors += "Do you need a mirror ???\n"; //Debug
        } else {
          //errors += `Showing member: ${arg}\n`; //Debug
        }
        members.set(targetID, targetDB);
      } else if (arg.trim() == 'all') {
        //errors += `Showing all: ${arg}\n`; //Debug
        message.guild.members.forEach(function(targetDB, targetID){
          members.set(targetID, targetDB);
        });
      } else {
        errors += `I do not recognize the User argument: ${arg}\n`;
      }
    } else {
      errors += `Invalid argument section: ${argSection}\n`;
    }
  });
    
  if (members.size < 1) {
    errors += `Unable to find any matching users\n`;
    
  }
    
  if (techLists.length < 1 || techLists[0].size < 1) {
    errors += `Unable to find any matching technologies\n`;
  }
  
  techLists.forEach( (techMap, techIndex) => {
    let report = new table;
    errors += `Processing techlist number ${techIndex}\n`; // Debug
    
    members.forEach( (targetDB, targetID) => {
      let allTech = client.hsTech.get(targetID) || client.hsTech.get('!'+targetID);
//       if (!allTech)   return errors += client.hsTech.map( (val, key) => {
//         return `Id ${targetID} doesn't match ${key}\n`; // Debug
//       }).join('');
      if (!allTech)   return errors += `No tech found for user ${targetID}\n`; // Debug
      if (!targetDB)  return errors += `No record found for user ${targetID}\n`; // Debug
      //errors += `Processing memberID ${targetID}\n`; // Debug
      let techScore = 0;
      report.cell('name',targetDB.username);
      
      techMap.forEach( (techLabel, techID) => {
        //errors += `Processing ${techID} for memberID ${targetID}\n`; // Debug
        let techLevel = Number( allTech[techID] ) || 0;
        if (client.config.hadesTech[techID]) {
          techScore += client.config.hadesTech[techID].levels[techLevel - 1] || 0;
        } else {
          errors += `Invalid techID ${techID}\n`;
        }
        report.cell(techLabel, techLevel);
      });
      report.cell('score', techScore);
      report.newRow();
    });
    if (report.rows.length < 1) {
      //errors += `Empty report, skipping\n`; // Debug
    } else {
      reportTables[reportTables.length] = report;
      //errors += `Added report table number ${reportTables.length} with  ${reportTables[reportTables.length - 1].rows.length} rows \n`; // Debug
    }
  });

  if (reportTables.length < 1) return message.reply(`${errors}No data found.`);
  else return message.reply(`Tech Reports:\n${errors}${"```"}${
    reportTables
      .map( report  => report.rows.length ? report.sort('score|des').toString() : '' ) //get the report texts
      .filter( output => output != '') // remove empty reports
      .join("``` \n ```") // put each report in it's own code block                 
    + "```"
  }`);
  } catch (error) { return message.reply(`There was an error: ${error}\n${errors}`); } 
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["tr"],
  permLevel: "User"
};

exports.help = {
  name: "techreport",
  category: "Hades Star",
  description: "Show a report on one or more users/roles and their one or more technologies (run multiple reports on the same users by them by another |".
  "\n  Example: techreport all | ships".
  "\n  Example: techreport @nickname @roleName | miner genesis crunch | bs batt passive emp salv,
  usage: "techreport (all or @role or @user)... | (techID or techGroup)... [| (techId or techGroup)...]..."
};
