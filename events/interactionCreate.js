
const { SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalBuilder,Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder } = require('discord.js');

const axios = require('axios');
const Sequelize = require('sequelize');
const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const SCverifV2 = require('../models/SCVerifV2');
const bot = require('../src/botMain');



const cm = new ModalBuilder()
  .setCustomId('completesubmission')
  .setTitle('Close submission');
    const closeInput = new TextInputBuilder()
    .setCustomId('reviewlink')
    .setLabel("REVIEW LINK:")
    .setStyle(TextInputStyle.Short);
    const closeRow = new ActionRowBuilder().addComponents(closeInput);

cm.addComponents(closeRow);

const submissionModal = new ModalBuilder()
  .setCustomId('submissionmodal')
  .setTitle('Submission Modal');
    const ytInput = new TextInputBuilder()
    .setCustomId('ytlink')
    .setLabel("UNLISTED YOUTUBE LINK:")
    .setStyle(TextInputStyle.Short);
    const armoryInput = new TextInputBuilder()
      .setCustomId('armory')    
      .setLabel("ARMORY LINK:") 
      .setPlaceholder('https://worldofwarcraft.blizzard.com/en-gb/character/eu/ravencrest/mýstíc')
      .setStyle(TextInputStyle.Short);
    const emailInput = new TextInputBuilder()
      .setCustomId('email')
      .setLabel("SKILL-CAPPED EMAIL:")
      .setStyle(TextInputStyle.Short);
    const improvementInput = new TextInputBuilder()
      .setCustomId('improvementinput')
      .setLabel("What are you looking to focus on and improve?")
      .setStyle(TextInputStyle.Paragraph);
    
  const ytRow = new ActionRowBuilder().addComponents(ytInput);
  const submissionRow = new ActionRowBuilder().addComponents(armoryInput);
  const emailRow = new ActionRowBuilder().addComponents(emailInput);
  const improvementRow = new ActionRowBuilder().addComponents(improvementInput);

  submissionModal.addComponents(ytRow, submissionRow, emailRow, improvementRow);

async function verifyEmailExists(email, pass) {
  console.log(email, pass)
  let verifStatus = "Nothing changed"
  console.log("Verifying Email")
  const response = await axios.post('https://www.skill-capped.com/lol/api/new/loginv2', { email:email, password: pass})
  console.log(response.data.data.fsData.user)
  if (response.data.success == false) { 
    return(false, "Wrong email or password")
  }

  switch(response.data.data.fsData.user.role) {
    case "SC_ROLE_PAID_USER":
      verifStatus = (true, "User has active account")
      break;
    case "SC_ROLE_FREE_USER":
      verifStatus =(false, "User has free account")
      break;
    case "SC_ROLE_STAFF":
      verifStatus =(true, "This user is staff")
      break;

    case "SC_ROLE_ADMIN":
      verifStatus =(true, "This user is admin")
      break;
    default:
      console.log("Honestly dont even know how we got here")
      break;
  }
  return verifStatus
}

async function addToSCDB(userID, email, tag, interaction) {
  try {

  
  const [account, created ] = await SCverifV2.findOrCreate({ where:{  userEmail: email },
    userID: userID,
    userEmail: email,
    userTag: tag}).catch(err=>{
      switch(err.errors[0].message) {
        case "userID must be unique":
          interaction.reply({content:"This account is already in use!", ephemeral:true})
          break;
        case "userEmail must be unique":
          interaction.reply({content:"This account is already in use!", ephemeral:true})
          break;
        default:
          interaction.reply({content:"You have not been verified due to technical reasons. Contact staff", ephemeral:true})
         break;
      }})



      console.log(created, account)
      if(created) {
        giveRoleToUser(interaction)
        interaction.reply({content:"Your account has been verified!", ephemeral:true})
      }
      else if (account.userID == interaction.user.id && email == account.userEmail) {
        giveRoleToUser(interaction)
        interaction.reply({content: "You have been verified to an existing account", ephemeral:true})
        return
      }
      else {
        interaction.reply({content: "This account is already in use!", ephemeral:true})
      }
    
    
  } catch (err) {
    console.log(err)
    await interaction.reply({content:"something failed, contact staff", ephemeral:true})
  }
  
}

async function giveRoleToUser(interaction) {
    if (interaction.guildId == "294958471953252353") { //WoW
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '🧨 Skill Capped Member'))
    }
    else {
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '💎・Infinity+'))
}
}


const regexTemplateFullLink = /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      try {

      
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
               
                
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: `${error}`, ephemeral: true });
            }
        }
    }
    
                    

        if(interaction.customId == "verificationmodal") {
            const email = interaction.fields.getTextInputValue("email")
            const password = interaction.fields.getTextInputValue("password")
            switch(await verifyEmailExists(email, password)) {
              case "Wrong email or password":
                await interaction.reply({content:"Email or password incorrect", ephmereal:true})
                break;
              case "User has active account":
                addToSCDB(interaction.user.id, email, interaction.user.tag, interaction)
                break;
              case "User has free account":
                await interaction.reply({content:"You dont seem to have an active subscription", ephmereal:true})
              break;
              
              case "This user is staff":
                addToSCDB(interaction.user.id, email, interaction.user.tag, interaction)
               
                break;
              case "This user is admin":
                addToSCDB(interaction.user.id, email, interaction.user.tag, interaction)
                
                break;
              default:
                await interaction.reply({content:"something went wrong, please contact staff", ephemeral:true})
            }
        }
        if(interaction.customId == "verificationbutton") {
          const verificationmodal = new ModalBuilder()
          .setCustomId('verificationmodal')
          .setTitle('Verification Modal');

          const emailInput = new TextInputBuilder()
              .setCustomId('email')
              .setLabel("What is your skill-capped email?")
              .setStyle(TextInputStyle.Short);
          const passwordInput = new TextInputBuilder()
              .setCustomId('password')
              .setLabel("What is your skill-capped password?")
              .setStyle(TextInputStyle.Short);
          const emailVerifRow = new ActionRowBuilder().addComponents(emailInput)
          const passVerifRow = new ActionRowBuilder().addComponents(passwordInput)
          verificationmodal.addComponents(emailVerifRow, passVerifRow);
          await interaction.showModal(verificationmodal);
        }
      if(interaction.customId == "submissionmodal") {
        await interaction.reply({content:"Processing...", ephemeral:true})
        const email = interaction.fields.getTextInputValue("email")
        const arm = interaction.fields.getTextInputValue("armory")
        
        console.log(interaction.fields.fields.get("armory").value, email, regexTemplateFullLink.test(arm))
        if(regexTemplateFullLink.test(arm)) {
          bot.emit("submitReview", interaction)
          
        }
        else {
          await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }

      try {
        if(interaction.customId == "submitreview") {
          await interaction.showModal(submissionModal);
        }
        if(interaction.customId == "claimsubmission") {
          bot.emit("claimReview", interaction)
        }
        if(interaction.customId == "rejectsubmission") {
          bot.emit("rejectReview", interaction)
        }
         if(interaction.customId.startsWith("completesubmission")) {
          
          let reviewlink = interaction.fields.getTextInputValue("reviewlink").catch(err => console.log("Failed with text", err))
          
          const forSpread = [
            {
            "range": `T${interaction.customId.replace("completesubmission-", "")}`, //Rating number
            "values": [
                [
                reviewlink
                ]
            ]
            }
        ]

          await main(forSpread)
        }
        if(/^rating\d-\d+/.test(interaction.customId)) {
          bot.emit("rateReview", interaction, "button")
        }
        if(interaction.customId.startsWith("delete-")) {
          bot.emit("completeReview", interaction)
        }
        if(interaction.customId.startsWith("closesubmission-")) {
          bot.emit("closeSubmission", interaction)
        }
        if(interaction.customId.startsWith("open-")) {
          bot.emit("openReview", interaction)
        }
        if(interaction.customId.startsWith("reviewratingmodal")) {
          bot.emit("rateReview", interaction, "modal")
        }
        if(interaction.customId.startsWith("clip-")) {
          bot.emit("mediaCollection", interaction)
        }
        

      } catch (err) {
        if(err.toString().startsWith("TypeError: Cannot read properties of undefined (reading 'startsWith')")) {
          console.log("Not review related")
        } else {
        console.log(err) }
      }
        



        
    } catch (err) {
      console.log("Failed somewhere during interaction : ", err, interaction.user.tag)
      await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
    }} }
    
    
