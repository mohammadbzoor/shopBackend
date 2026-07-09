/* eslint-disable import/no-extraneous-dependencies */
const nodemailer=require('nodemailer')
// Nodemailer
const sendEmail=async (options)=>{
    // 1) Create transporter (sercice that will send email "gmail","mailgun","mialtrap", sendGrid)
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        secure:true,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // 2) Define email options (like from , to , subject, email content) 
  const mailOpts = {
    from: `E-shop App <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // optional
  };
    // 3)Send Email
    await transporter.sendMail(mailOpts);

}

module.exports=sendEmail;