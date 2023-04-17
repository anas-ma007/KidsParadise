// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFYSID;
const client = require("twilio")(accountSid, authToken);


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
    },


    sendOtpForForgotPass(phone_number) {
        /* client.messages
        .create({ body: otp, from: '+', to: "+"+phone_number })
          */
        client.verify.v2.services(verifySid)
            .verifications
            .create({ to: "+91" + phone_number, channel: 'sms' })
            .then((verification) => {
                console.log(verification.sid);
                console.log("otp send succesfully")
            })
            .catch((error) => {
                console.log('otp send error');
                console.log(error);
            })
    },
    verifyOtpForForgotPass(phone_number, otp) {
        console.log(phone_number);
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