const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/*const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", 
    port: 587,                     
    secure: false,                 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});*/

const sendWelcomeEmail = async (userEmail, firstName) => {
    const mailOptions = {
        from: `"Learning Path" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Benvenuto in Learning Path! 🎉',
        text: `Ciao ${firstName},\n\nBenvenuto nella nostra piattaforma! La tua registrazione è avvenuta con successo.\n\nBuon apprendimento!`,
        html: `
            <h3>Ciao ${firstName},</h3>
            <p>Benvenuto nella nostra piattaforma! La tua registrazione è avvenuta con successo.</p>
            <p>Siamo felici di averti a bordo.</p>
            <br>
            <p><i>Everience</i></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email di benvenuto inviata con successo a: ${userEmail}`);
    } catch (error) {
        console.error('Errore durante l\'invio dell\'email di benvenuto:', error);
    }
};

module.exports = { sendWelcomeEmail };