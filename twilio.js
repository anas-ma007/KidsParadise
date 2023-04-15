// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAb1a79e713574eea89d1c6d31935dc5f4";
const client = require("twilio")(accountSid, authToken);

// client.verify.v2
//   .services(verifySid)
//   .verifications.create({ to: "+919562421392", channel: "sms" })
//   .then((verification) => console.log(verification.status))
//   .then(() => {
//     const readline = require("readline").createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     readline.question("Please enter the OTP:", (otpCode) => {
//       client.verify.v2
//         .services(verifySid)
//         .verificationChecks.create({ to: "+919562421392", code: otpCode })
//         .then((verification_check) => console.log(verification_check.status))
//         .then(() => readline.close());
//     });
//   });



module.exports = {
    sendSms(phone_number) {
        /* client.messages
        .create({ body: otp, from: '+', to: "+"+phone_number })
          */
        client.verify.v2.services(verifySid)
            .verifications
            .create({ to: "+91" + phone_number, channel: 'sms' })
            .then(verification => console.log(verification.sid))
            .catch((error) => {
                console.log(error);
            })
    },

    sendSmsChecking(otp, phone_number) {
        return client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: "+91" + phone_number, code: otp })
            .then(verification_check => {
                if (verification_check.status == "approved") {
                    console.log(verification_check.status, "true");
                    let result = true
                    return result
                } else {
                    console.log(verification_check.status, "false");
                    let result = false
                    return result
                }
            })
            .catch((error) => {
                console.error(error);

            })
    }
}