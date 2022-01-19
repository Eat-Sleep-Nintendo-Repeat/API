var nodemailer = require('nodemailer');
const config = require("../../../config.json")
const fs = require("fs")
const path = require("path")

exports.sendmail = (memberdb, mail) => {

    //generate PDF File
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({autoFirstPage: false, size: "A4"});
    // doc.pipe(res);

    doc.addPage({margin: 30});

    doc.registerFont("regular", path.resolve("./routes/api/usemyvoice/email-data/Cairo-Regular.ttf"))
    doc.registerFont("bold", path.resolve("./routes/api/usemyvoice/email-data/Cairo-Bold.ttf"))

    doc.font("bold").fontSize(17).text("Einverständniserklärung zur Nutzung von Stimmenaufnahmen und Nutzerinformationen", {underline: true})
    doc.font("regular").fontSize(13).text(`zwischen Eat, Sleep, Nintendo, Repeat vertreten durch Dustin David Meyer (im folgenden als Vertreter genannt), und dem Nutzer und/oder Verwalter des Discord Accounts mit der ID "${memberdb.id}" (im folgenden ${memberdb.informations.name} genannt)`, {lineGap: -10})
    doc.text("\n")
    
    doc.font("bold").fontSize(15).text(`Gegenstand:`, {lineGap: -10})
    doc.font("regular").fontSize(13).text(`Stimmenaufnahmen und Nutzerinformationen wie Name, Diskriminator und Profilbild des Discord Accounts im Jahre ${new Date().getFullYear()}`, {lineGap: -10})
    doc.text("\n")
    
    doc.font("bold").fontSize(15).text(`Verwendungszweck:`, {lineGap: -10})
    doc.font("regular").fontSize(13).text(`Veröffentlichung für diverse Mediengattungen. Diese wären Plattformen wie YouTube oder Twitch.`, {lineGap: -10})
    doc.text("\n")

    doc.font("bold").fontSize(15).text(`Widerruf:`, {lineGap: -10})
    doc.font("regular").fontSize(13).text(`Ein Widerruf kann jederzeit und mit sofortiger Wirkung für die Zukunft erfolgen. Dieser ist auf folgenden Wegen einzureichen:`, {lineGap: -10})
    doc.list([
    `Email: support@eat-sleep-nintendo-repeat.eu`,
    `Über das Webinterface über das die Einverständniserklärung akzeptiert wurde`
    ], {bulletRadius: 3})
    doc.text("\n")

    doc.font("bold").fontSize(15).text(`Erklärung:`, {lineGap: -10})
    doc.font("regular").fontSize(13).text(`${memberdb.informations.name} erklärt sein/ihr Einverständnis mit der Verwendung der Aufnahmen seiner/ihrer Person in Form von Audio für die oben beschriebenen Zwecke. Eine Verwendung der Audio Aufnahmen fuer andere, als die beschriebenen Zwecke oder ein Inverkehrbringen durch Ueberlassung der Aufnahmen an Dritte, ist unzulaessig. Diese Einwilligung ist freiwillig. Diese Einwilligung kann jederzeit mit Wirkung für die Zukunft über die oben beschriebenen Wege widerrufen werden.`, {lineGap: -10})
    doc.text("\n")

    doc.font("regular").fontSize(13).text(`Digitale Signatur ${memberdb.informations.name}:`, {lineGap: -10})
    doc.font("bold").fontSize(13).text(`${new Date().toLocaleDateString("DE-de")} ${memberdb.usemyvoice.signature}`, {lineGap: -10})
    doc.text("\n")

    doc.font("regular").fontSize(13).text(`Signatur Vertreter:`)
    doc.image(`${path.resolve("./routes/api/usemyvoice/email-data/Unterschrift.png")}`, {width: 200})

    doc.end()

    



var transporter = nodemailer.createTransport(config.emailservice);

  var mailOptions = {
    from: `"Eat, Sleep, Nintendo, Repeat" <${config.emailservice.auth.user}>`,
    to: mail,
    subject: 'Einverständniserklärung zur Nutzung von Stimmenaufnahmen',
    html: `<p>Hey ${memberdb.informations.name}! In den Anhängen dieser Email findest du die von dir akzeptierte Einverständniserklärung zur Nutzung von Stimmenaufnahmen. Diese Email wurde dir geschickt, da du beim Prozzess der Einwilligung um eine Email mit der Kopie gebeten hattest. In der angehangenen PFD findest du alle Infos zur Vereinbarung.</p>`,
    attachments: [
      {
      filename: 'Einverständniserklärung.pdf',
      content: doc,
    }
  ],
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}