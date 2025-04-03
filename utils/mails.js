const nodeMailer = require("nodemailer");
const mailFuncs = {}


mailFuncs.sendResetPasswordEmail = (to, password) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `New Password`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                         <p>Dear Travel Partner,</p>
                                           <p>We wanted to inform you that your password has been successfully reset.</p>
                                           <p>Your new password is: <b>${password}</b></p>
                                           <p>For security reasons, we recommend that you log in and change this password as soon as possible.</p>
                                            <br>
                                           <p>If you encounter any issues or need further assistance, please do not hesitate to contact us.</p>
                                           <br>
                                           Regards,<br>
                                           Team TDO DXB
</div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendOTPEmail = (to, otp) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Email Verification OTP: ${otp}`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your email verification OTP: ${otp}.</p>
                                            <p> Please verify your otp. </p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.signUpMail = (to) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Registration Successful`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>We have received your request.</p>
                                            <p> Please wait while we verify your details. </p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.FlightBookAutoTriggerMail = (bookingID,airline,flightNumber,sectors,departureDateTime,arrivalDateTime,departureAirport,arrivalAirport,pnr,passengerName,numberOfPassengers) => {

    let email = 'Flights.backend@traveldealsonline.ae';
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `New Flight Booking Notification - Booking ID: ${bookingID}`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                            <p>A new flight booking has been successfully confirmed. Please find the details below:</p>
                                            <p><strong>Booking Details:</strong></p>
                                            <ul>
                                                <li><strong>Booking ID:</strong> ${bookingID}</li>
                                                <li><strong>Airline:</strong> ${airline}</li>
                                                <li><strong>Flight Number:</strong> ${flightNumber}</li>
                                                <li><strong>Sectors:</strong> ${sectors}</li>
                                                <li><strong>Departure Date & Time:</strong> ${departureDateTime}</li>
                                                <li><strong>Arrival Date & Time:</strong> ${arrivalDateTime}</li>
                                                <li><strong>Departure Airport:</strong> ${departureAirport}</li>
                                                <li><strong>Arrival Airport:</strong> ${arrivalAirport}</li>
                                                <li><strong>PNR:</strong> ${pnr}</li>
                                            </ul>
                                            <p><strong>Passenger Information:</strong></p>
                                            <ul>
                                                <li><strong>Passenger Name(s):</strong> ${passengerName}</li>
                                                <li><strong>Number of Passengers:</strong> ${numberOfPassengers}</li>
                                            </ul>
                                            <br>
                                            <p>Best Regards,</p>
                                            <p>Team TDO DXB</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };;

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.signUpAutoTrigger = async (detailsArray) => {
    // console.log("Agent Details", detailsArray);

    if (!detailsArray || !detailsArray.length || !detailsArray[0]) {
        console.error("Invalid or empty details array.");
        return;
    }

    const details = detailsArray[0];
    console.log(details)
    const email = 'onboarding@traveldealsonline.ae'; // Fetch email from environment variables
    const mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const {
        establishment_name,
        company_trade_license,
        address,
        nature_of_business,
        area,
        emirates,
        director1_name,
        director1_nationality,
        director1_passport_number,
        director1_email,
        director1_mobile,
        banker_name,
        branch_location,
        account_number,
        current_business_volume,
        iata_accredited
    } = details;

    const maskedPassportNumber = `${director1_passport_number.slice(0, 2)}****${director1_passport_number.slice(-2)}`;
    const maskedAccountNumber = `${account_number.slice(0, 2)}****${account_number.slice(-2)}`;

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `New Travel Agent Onboarding - ${establishment_name}`,
        html: `
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                            <p><strong>New Travel Agent Registration</strong></p>
                                            <p>Details of the newly registered travel agent are as follows:</p>
                                            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;color:rgb(34,34,34)">
                                                <tr><td><strong>Establishment Name:</strong></td><td>${establishment_name}</td></tr>
                                                <tr><td><strong>Trade License:</strong></td><td>${company_trade_license}</td></tr>
                                                <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
                                                <tr><td><strong>Nature of Business:</strong></td><td>${nature_of_business}</td></tr>
                                                <tr><td><strong>Area:</strong></td><td>${area}</td></tr>
                                                <tr><td><strong>Emirates:</strong></td><td>${emirates}</td></tr>
                                                <tr><td><strong>Director Name:</strong></td><td>${director1_name}</td></tr>
                                                <tr><td><strong>Nationality:</strong></td><td>${director1_nationality}</td></tr>
                                                <tr><td><strong>Passport Number:</strong></td><td>${maskedPassportNumber}</td></tr>
                                                <tr><td><strong>Director Email:</strong></td><td>${director1_email}</td></tr>
                                                <tr><td><strong>Director Mobile:</strong></td><td>${director1_mobile}</td></tr>
                                                <tr><td><strong>Banker Name:</strong></td><td>${banker_name}</td></tr>
                                                <tr><td><strong>Branch Location:</strong></td><td>${branch_location}</td></tr>
                                                <tr><td><strong>Account Number:</strong></td><td>${maskedAccountNumber}</td></tr>
                                                <tr><td><strong>Business Volume:</strong></td><td>${current_business_volume}</td></tr>
                                                <tr><td><strong>IATA Accredited:</strong></td><td>${iata_accredited}</td></tr>
                                            </table>
                                            <br>
<!--                                            <p>Please review the details and proceed with the verification process.</p>-->
                                            <br>Regards,<br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    try {
        await mailer.sendMail(options);
        console.log("Internal notification email sent successfully");
    } catch (err) {
        console.error("Error sending email:", err.message);
    }
};

mailFuncs.sendPasswordEmail = (to, password) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Activation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your Account has been Activated</p>
                                            <p> Please Use below credentials. </p>
                                            <p>Email - ${to}</p>
                                            <p>Password - ${password}</p>
                                            <p>Url - <a href="http://traveldealsonline.ae">traveldealsonline.ae</a></p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendDeactivationEmail = (to) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Deactivation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your Account has been Deactivated.</p>
                                            <p> Please Contact Mid Office for further Assistance. </p>
                                            
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendActivationEmail = (to) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Activation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your Account has been Activated.</p>
                                            <p> Please Login to your Account Now. </p>
                                            
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendPasswordEmailDist = (to, password,name) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Activation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear ${name},</p>
                                            <p>Your Account has been Activated</p>
                                            <p> Please Use below credentials. </p>
                                            <p>Email - ${to}</p>
                                            <p>Password - ${password}</p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendConfirmationToDistributor = (to, agency_email, agency_name) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Activation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Distributor,</p>
                                            <p>A new Agent has been added to your Network.</p>
                                            <p>Please check below information. </p>
                                            <p>Agency Name - ${agency_name}</p>
                                            <p>Email - ${agency_email}</p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendFPOtp = (to, otp) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `OTP for Reset Password`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your OTP for Reset Password is : ${otp}.</p>
                                            <p> Please verify your otp. </p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendSuspendEmail = (to) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Account Suspended`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Travel Partner,</p>
                                            <p>Your Account has been Suspended.</p>
                                            <p> Please Contact Mid Office for further Assistance. </p>
                                            
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.walletAcceptRequest = (to,t_id) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Wallet Request Accepted`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Agent,</p>
                                            <p>Your wallet request has been <strong>accepted for Transaction ID: ${t_id}</strong>.</p>
                                            
                                            <p>Thank you for your request!</p><br>
                                            
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.WalletLoadNotificationMail = (agentName, agentID, amount, transactionID, dateTime) => {

    let email = 'accounts@traveldealsonline.ae'; // Replace with the accounts team's email
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Wallet Load Notification - Agent: ${agentName}`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                            <p>Dear Accounts Team,</p>
                                            <p>This is to inform you that a wallet load has been processed. Please find the details below:</p>
                                            <p><strong>Transaction Details:</strong></p>
                                            <ul>
                                                <li><strong>Agent Name:</strong> ${agentName}</li>
                                                <li><strong>Agent ID:</strong> ${agentID}</li>
                                                <li><strong>Amount Loaded:</strong> ${amount}</li>
                                                <li><strong>Transaction ID:</strong> ${transactionID}</li>
                                                <li><strong>Date & Time:</strong> ${dateTime}</li>
                                            </ul>
                                            <p>Best Regards,</p>
                                            <p>Team TDO DXB</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Wallet Load Notification email sent successfully");
        }
    });
};

mailFuncs.AdminWalletCreditNotificationMail = (adminName, agentName, agentID, amount, remarks, dateTime) => {
    let email = 'accounts@traveldealsonline.ae'; // Replace with the accounts team's email
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Wallet Credit Notification - Agent: ${agentName}`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                            <p>Dear Accounts Team,</p>
                                            <p>This is to inform you that the Staff has credited the wallet of an agent. Please find the details below:</p>
                                            <p><strong>Credit Details:</strong></p>
                                            <ul>
                                                <li><strong>Staff Name:</strong> ${adminName}</li>
                                                <li><strong>Agent Name:</strong> ${agentName}</li>
                                                <li><strong>Agent ID:</strong> ${agentID}</li>
                                                <li><strong>Amount Credited:</strong> ${amount}</li>
                                                <li><strong>Remarks:</strong> ${remarks || 'N/A'}</li>
                                                <li><strong>Date & Time:</strong> ${dateTime}</li>
                                            </ul>
                                            <p>Best Regards,</p>
                                            <p>Team TDO DXB</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Admin Wallet Credit Notification email sent successfully");
        }
    });
};

mailFuncs.walletRejectRequest = (to,t_id) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `Wallet Request Rejected`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Agent,</p>
                                            <p>Your wallet request has been <strong>rejected for Transaction ID: ${t_id}</strong>.</p>
                                            <p>Please contact support for further information.</p>
                                            <br><br>
                                            Regards,
                                            <br>Team TDO DXB
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}

mailFuncs.sendMailSubUser = (to,password,agentEmail,agentName) => {

    let email = to;
    console.log(to,password,agentEmail,agentName)
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `New User Signup Confirmation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;font-weight:normal;color:rgb(34,34,34)">
                                            <p>Dear Team,</p>
                                            <p>You has been added by Travel Agent named ${agentName} ,(${agentEmail}), Your login details are as follows</p>
                                            
                                            <br><br>
                                            
                                            <table border="1" cellpadding="10" cellspacing="0">
  
  <tr>
    <th>Email Id</th>
    <td>${email}</td>
  </tr>
  <tr>
    <th>Password</th>
    <td>${password}</td>
  </tr>
  <tr>
    <th>Login URL - </th>
    <td><a href="http://traveldealsonline.ae">traveldealsonline.ae</a></td>
  </tr>
</table>

                                            
                                          
                                            Thanks and regards,
                                            <br>TDO DXB
                                            <br>Unit of Golden Gateways LLC
                                        </div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}


mailFuncs.sendResetPasswordEmailSubUser = (to, password) => {

    let email = to;
    let mailer = nodeMailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD // Removed space before password
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: `New Password Confirmation`,
        html: `<table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0px;background:rgb(242,242,242)" width="100%">
            <tbody>
                <tr>
                    <td style="padding:30px 20px" valign="top">
                        <table cellpadding="0" cellspacing="0" style="margin:0px auto" width="90%">
                            <tbody>
                                <tr>
                                    <td valign="top" style="border:1px solid rgb(218,218,218);background-color:rgb(255,255,255);padding:30px">
                                        <div style="font-family:lucida grande,lucida sans,lucida sans unicode,arial,helvetica,verdana,sans-serif;font-size:14px;line-height:24px;color:rgb(34,34,34)">
                                         <p>Dear Travel Sub-Partner,</p>
                                           <p>We wanted to inform you that your password has been successfully reset.</p>
                                           <p>Your new password is: <b>${password}</b></p>
                                           <br>
                                           Thanks and Regards,<br>
                                           Team TDO DXB <br>
                                           Unit of Golden Gateways LLC
</div>
                                    </td>
                                </tr>
                                <tr> <td style="padding-top:5px" valign="top">  </td> </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>`
    };

    mailer.sendMail(options, (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent successfully");
        }
    });
}
module.exports = mailFuncs