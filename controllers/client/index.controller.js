const indexController = {};
const agentServices = require("../../services/client/index.services")
const moment = require("moment");
require("moment-timezone")
const mailFuncs = require('../../utils/mails');
const connectToDatabase = require("../../db/connection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const smsFuncs = require("../../utils/sms");
const {sign} = require("jsonwebtoken");
const adminService = require("../../services/admin/admin.service");
const {log} = require("console");
const whatsappMessage = require("../admin/whatsappMessage")


function generatePassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

indexController.changePassword = async (req, res) => {
    if(req.agent.SubUser_email){
        res.render('agent/agent_changePassword', {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render('agent/agent_changePassword', {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.PrivacyPolicy = async (req, res) => {
    res.render('agent/privacy_policy')
}
indexController.RefundPolicy = async (req, res) => {
    res.render('agent/refundPolicy')
}
indexController.StatutoryDisclaimer = async (req, res) => {
    res.render('agent/refund_policy')
}
indexController.Register = (req, res) => {
    res.render("agent/Register");
};
indexController.AgentDashboard = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/Dashboard", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType});
    }else{
        res.render("agent/Dashboard", {agentEmail: req.agent.agentEmail, userType: req.agent.userType});
    }
};
indexController.AgentLogin = (req, res) => {
    res.render("agent/login");
}
indexController.LogsPage = async (req, res) => {
    if(req.agent.SubUser_email){
        res.render('agent/logs', {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render('agent/logs', {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.ForgotPasswordPage = async (req, res) => {
    res.render('agent/forgetPassword')
}
indexController.ChangeFP = async (req, res) => {
    res.render('agent/forgetchangePassword')
}
indexController.TermsCondition = (req, res) => {
    res.render("agent/terms_condition");
};
indexController.Home = (req, res) => {
    res.render("agent/login")
}
indexController.aboutUs = (req, res) => {
    res.render("agent/about")
}
indexController.contactUs = (req, res) => {
    res.render("agent/contact")
}
indexController.ThankYou = (req, res) => {
    res.render("agent/ThankYou")
}
indexController.agentProfile = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/agent-profile", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/agent-profile", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.verify_otp = (req, res) => {
    res.render("agent/verifyOTP");
};
indexController.CheckLoginOld = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase()
        let {Email, Password} = req.body;
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        // console.log(req.body);
        let [data] = await agentServices.checkLogin(connection, Email)
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
        let remarks = "login"
        if (data.length === 0) {
            let status = "Fail (Invalid Email)"
            let [checkEmail] = await agentServices.checkEmail(connection, Email, status, remarks, time, clientIp)
            return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Email."})
        } else {
            if (data[0].status === "0") {
                let sname = data[0].establishment_name
                let id = data[0].id
                let status = "Fail (Account Not Active)"
                let [accountNotActive] = await agentServices.accountNotActive(connection, sname, Email, status, remarks, time, id, clientIp)
                return res.send({
                    responseCode: 1,
                    error: false,
                    warning: true,
                    message: "Your Account is not activated yet."
                })
            } else {
                let hashPassword = data[0].password
                let isMatch = await bcrypt.compare(Password, hashPassword);
                if (!isMatch) {
                    let id = data[0].id
                    let sname = data[0].establishment_name
                    let status = "Fail (Invalid Password)"
                    let [invalidPassword] = await agentServices.invalidPassword(connection, sname, Email, status, remarks, time, id, clientIp)
                    return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Password."})
                } else {
                    let agentId = data[0]['id']
                    let agentEmail = data[0]['email']
                    let agentName = data[0]['establishment_name']

                    // console.log(process.env.JWT_SECRET)

                    const jwtToken = sign(
                        {
                            agentId,
                            agentEmail,
                            agentName,

                        }, process.env.JWT_SECRET, {expiresIn: "1d"}
                    )
                    res.cookie('agentAuthToken', jwtToken, {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                        httpOnly: true
                    });
                    // await adminService.createLog(JWT_ADMINID, JWT_ADMINEMAIL, "Login Successful")
                    let sname = data[0].establishment_name
                    let status = "Success"
                    let id = data[0].id
                    let [loginSuccess] = await agentServices.loginSuccess(connection, sname, Email, status, remarks, time, id, clientIp)
                    return res.send({
                        responseCode: 2, error: false, warning: false, message: "Login Successful", data: {
                            displayName: agentName,
                            email: agentEmail
                        }
                    });
                }
            }
        }
    } catch (e) {
        // await adminService.createLog(0, req.body.email_mobile, 'JWT Error')
        // console.log('-----', e.message)
        return res.send({
            responseCode: 1,
            error: true,
            warning: false,
            message: "Error Occurred - " + e.message
        });
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

indexController.CheckLogin = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();

        console.log(req.body);
        let {Email, Password} = req.body;
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        //let clientIp = '12345'
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss");
        let remarks = "login";

        // Check if email belongs to an agent
        let [data] = await agentServices.checkLogin(connection, Email);
        if (data.length === 0) {
            // Check if it's a sub-user
            let [data1] = await agentServices.checkSubUserLogin(connection, Email);
            if (data1.length === 0) {
                let status = "Fail (Invalid Email)";
                await agentServices.checkEmail(connection, Email, status, remarks, time, clientIp);
                return res.json({responseCode: 1, error: false, warning: true, message: "Invalid Email."});
            }
            else if (data1[0]['status'] === 'inactive') {
                let status = "Fail (Account Not Active)";
                await agentServices.subUserLog(connection, data1[0]['email'], status, remarks, time, data1[0]['id'], clientIp);
                return res.json({
                    responseCode: 1,
                    error: false,
                    warning: true,
                    message: "Your Account is not activated yet."
                });
            }
            else {
                // Sub-user login attempt
                let hashPassword = data1[0].password;
                let isMatch = await bcrypt.compare(Password, hashPassword);

                if (!isMatch) {
                    let status = "Fail (Invalid Password)";
                    await agentServices.subUserLog(connection, data1[0].email, status, remarks, time, data1[0]['id'], clientIp);
                    return res.json({responseCode: 1, error: false, warning: true, message: "Invalid Password."});
                } else {
                    // Fetch agent details for the sub-user
                    let [agentData] = await agentServices.checkLogin(connection, data1[0].travelAgent);
                    if (!agentData || agentData.length === 0) {
                        return res.json({responseCode: 1, error: true, warning: true, message: "Agent not found."});
                    } else {
                        // Successful sub-user login
                        const jwtToken = sign(
                            {
                                userId: data1[0].id,
                                SubUser_email: data1[0].email,
                                SubUser_Name: `${data1[0].firstName} ${data1[0].lastName}`,
                                userType: data1[0].type,
                                agentId: agentData[0].id,
                                agentName: agentData[0].establishment_name,
                                agentEmail: data1[0].travelAgent
                            },
                            process.env.JWT_SECRET,
                            {expiresIn: "1d"}
                        );

                        res.cookie('agentAuthToken', jwtToken, {
                            maxAge: 24 * 60 * 60 * 1000, // 24 hours
                            httpOnly: true
                        });
                        let status = "Success";
                        await agentServices.subUserLog(connection, data1[0].email, status, remarks, time, data1[0]['id'], clientIp);
                        return res.json({
                            responseCode: 2,
                            error: false,
                            warning: false,
                            message: "Login Successful",
                            data: {
                                SubUser_Name: `${data1[0].firstName} ${data1[0].lastName}`,
                                SubUser_email: data1[0].email,
                                Flag: data1[0].flag,
                                token: jwtToken
                            }
                        });
                    }
                }
            }
        }
        else {
            // Agent login attempt
            if (data[0].status === "0") {
                let status = "Fail (Account Not Active)";
                await agentServices.accountNotActive(connection, data[0].establishment_name, Email, status, remarks, time, data[0].id, clientIp);
                return res.json({
                    responseCode: 1,
                    error: false,
                    warning: true,
                    message: "Your Account is not activated yet."
                });
            }
            else {
                let hashPassword = data[0].password;
                let isMatch = await bcrypt.compare(Password, hashPassword);

                if (!isMatch) {
                    let status = "Fail (Invalid Password)";
                    console.log(status)
                   let [getm] =  await agentServices.invalidPassword(connection, data[0].establishment_name, Email, status, remarks, time, data[0].id, clientIp);
                    console.log(getm)
                    return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Password."});
                } else {
                    // Successful agent login
                    const jwtToken = sign(
                        {
                            userId: data[0].id,
                            agentEmail: data[0].email,
                            userType: "Travel agent",
                            agentId: data[0].id,
                            agentName: data[0].establishment_name
                        },
                        process.env.JWT_SECRET,
                        {expiresIn: "1d"}
                    );

                    res.cookie('agentAuthToken', jwtToken, {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours
                        httpOnly: true
                    });
                    let status = "Success";
                    await agentServices.invalidPassword(connection, data[0].establishment_name, Email, status, remarks, time, data[0].id, clientIp);
                    return res.send({
                        responseCode: 2,
                        error: false,
                        warning: false,
                        message: "Login Successful",
                        data: {
                            displayName: data[0].establishment_name,
                            email: data[0].email,
                            Flag:data[0].flag,
                            token: jwtToken
                        }
                    });
                }
            }
        }
    } catch (e) {
        // await adminService.createLog(0, req.body.email_mobile, 'JWT Error')
         console.log('-----', e.message)
        return res.send({
            responseCode: 1,
            error: true,
            warning: false,
            message: "Error Occurred - " + e.message
        });
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

// ________________________________________________________________________

indexController.Logout = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();
        let {agentName, agentEmail, agentId} = req.agent
        // let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        const clientIp = req.clientIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(clientIp)
        let status = "Success"
        let remarks = "logout"
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
        let [logout] = await agentServices.logout(connection, agentName, agentEmail, status, remarks, time, agentId, clientIp)
        res.clearCookie("agentAuthToken")
        res.redirect('/')
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.UploadPhoto = async (req, res) => {
    let connection
    try {
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        let {agentEmail, agentId} = req.agent
        connection = await connectToDatabase();
        let {profileLogo} = req.files
        let serverPath = `public/upload/agent-profile-logo/${agentId}_${profileLogo.name}`
        let DBPath = `/upload/agent-profile-logo/${agentId}_${profileLogo.name}`
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
        let remarks = "Update Profile_Logo"
        profileLogo.mv(serverPath, async (error) => {

            if (error) {
                return res.json({error: error.message})
            } else {
                let [result] = await agentServices.updatePhoto(connection, agentId, DBPath)
                let [changeLogoSuccess] = await agentServices.agentActivityLog(connection, agentEmail, remarks, time, agentId, clientIp)


                return res.send({
                    responseCode: 2,
                    error: false,
                    warning: false,
                    message: "Logo Updated Successfully."
                })
            }
        })
    } catch (e) {
        console.log('----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

indexController.GetAgentData = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();
        // console.log(req.agent)
        let {agentId} = req.agent
        let [result] = await agentServices.GetAgentData(connection, agentId)
        // console.log(result)

        return res.send({
            responseCode: 2,
            error: false,
            warning: false,
            data: result
        })
    } catch (e) {
        // console.log('----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.addAgents = async (req, res) => {

    let connection

    try {

        // console.log(req.body)
        var director2_mobile = req.body.mobileId2 ? "971" + req.body.mobileId2 : '';

        // console.log(director2_mobile);

        connection = await connectToDatabase();

        const {signatory_type} = req.body

        const {director_2} = req.body

        let newPassportCountryFile, newEmiratesIdFile;

        let newPassportCountry;

        var director2_passport_expiry;

        var EmiratesIdValidity2;

        var iataAccreditedFileDP;

        var PassportCountryFile2DP;

        var EmiratesIdFile2DP;


        let {

            uploadLicense,

            PassportCountryFile1,

            EmiratesIdFile1,

            iataAccreditedFile,

            PassportCountryFile2,

            EmiratesIdFile2,

        } = req.files;


        if (signatory_type === 'Director 1') {

            newPassportCountryFile = PassportCountryFile1

            newEmiratesIdFile = EmiratesIdFile1

        }


        if (signatory_type === 'New Signatory') {

            newPassportCountryFile = req.files.newPassportCountryFile

            newEmiratesIdFile = req.files.newEmiratesIdFile


        }

        // ___________________________________________

        if (signatory_type === 'Director 1') {

            newPassportCountry = req.body.PassportCountry1;

        } else if (signatory_type === 'New Signatory') {

            newPassportCountry = req.body.newPassportCountry;

        }


        if (director_2 !== 'false') {

            director2_passport_expiry = req.body.PassportExpiryDate2;

            EmiratesIdValidity2 = req.body.EmiratesIdValidity2;

        } else if (director_2 === 'false') {

            // console.log("Director 2 is not involved");

            director2_passport_expiry = null;

            EmiratesIdValidity2 = null;

        }


        // ___________________________________________

        const generateUniqueId = () => {

            return Math.floor(Date.now() + Math.random() * 1000);

        }


        // Generate unique IDs for each file

        let uploadLicenseId = generateUniqueId();

        let PassportCountryFile1Id = generateUniqueId();

        let EmiratesIdFile1Id = generateUniqueId();

        let PassportCountryFile2Id = generateUniqueId();

        let EmiratesIdFile2Id = generateUniqueId();

        let newPassportCountryFileId = generateUniqueId();

        let newEmiratesIdFileId = generateUniqueId();

        let iataAccreditedFileId = generateUniqueId();


        const {iataAccredited} = req.body

        if (iataAccredited === 'Yes') {

            let iataAccreditedFileSP = `public/upload/documents/${iataAccreditedFileId}_${iataAccreditedFile.name}`

            iataAccreditedFileDP = `/upload/documents/${iataAccreditedFileId}_${iataAccreditedFile.name}`


            iataAccreditedFile.mv(iataAccreditedFileSP, (error) => {

                if (error) {

                    return res.json({error: error.message})

                }

            })

        } else {

            //console.log("No")

            iataAccreditedFileDP = 'null'


        }

        if (director_2 !== 'false') {

            let PassportCountryFile2SP = `public/upload/documents/${PassportCountryFile2Id}_${PassportCountryFile2.name}`

            let EmiratesIdFile2SP = `public/upload/documents/${EmiratesIdFile2Id}_${EmiratesIdFile2.name}`


            PassportCountryFile2DP = `/upload/documents/${PassportCountryFile2Id}_${PassportCountryFile2.name}`

            EmiratesIdFile2DP = `/upload/documents/${EmiratesIdFile2Id}_${EmiratesIdFile2.name}`


            PassportCountryFile2.mv(PassportCountryFile2SP, (error) => {

                if (error) {

                    return res.json({error: error.message})

                }

            })

            EmiratesIdFile2.mv(EmiratesIdFile2SP, (error) => {

                if (error) {

                    return res.json({error: error.message})

                }

            })

        } else if (director_2 === 'false') {

            PassportCountryFile2DP = 'null'

            EmiratesIdFile2DP = 'null'


        }

        // let x=new Date().getTime()


        let uploadLicenseSP = `public/upload/documents/${uploadLicenseId}_${uploadLicense.name}`

        let PassportCountryFile1SP = `public/upload/documents/${PassportCountryFile1Id}_${PassportCountryFile1.name}`

        let EmiratesIdFile1SP = `public/upload/documents/${EmiratesIdFile1Id}_${EmiratesIdFile1.name}`

        let newPassportCountryFileSP = `public/upload/documents/${newPassportCountryFileId}_${newPassportCountryFile.name}`

        let newEmiratesIdFileSP = `public/upload/documents/${newEmiratesIdFileId}_${newEmiratesIdFile.name}`

        let uploadLicenseDP = `/upload/documents/${uploadLicenseId}_${uploadLicense.name}`

        let PassportCountryFile1DP = `/upload/documents/${PassportCountryFile1Id}_${PassportCountryFile1.name}`

        let EmiratesIdFile1DP = `/upload/documents/${EmiratesIdFile1Id}_${EmiratesIdFile1.name}`

        let newPassportCountryFileDP = `/upload/documents/${newPassportCountryFileId}_${newPassportCountryFile.name}`

        let newEmiratesIdFileDP = `/upload/documents/${newEmiratesIdFileId}_${newEmiratesIdFile.name}`


        uploadLicense.mv(uploadLicenseSP, (error) => {

            if (error) {

                return res.json({error: 'error'})

            }

        })


        PassportCountryFile1.mv(PassportCountryFile1SP, (error) => {

            if (error) {

                return res.json({error: error.message})

            }

        })


        EmiratesIdFile1.mv(EmiratesIdFile1SP, (error) => {

            if (error) {

                return res.json({error: error.message})

            }

        })


        newPassportCountryFile.mv(newPassportCountryFileSP, (error) => {

            if (error) {

                return res.json({error: error.message})

            }

        })

        newEmiratesIdFile.mv(newEmiratesIdFileSP, (error) => {

            if (error) {

                return res.json({error: error.message})

            }

        })


        // let allFiles=req.files

        // console.log("All Data",req.body)

        const {email, MobileNo, CountryCode} = req.body

        const mobile_number = CountryCode + MobileNo

        let [record] = await agentServices.verifyExistingAgent(connection, email, mobile_number)

        // console.log(record.length)

        if (record.length !== 0) {

            return res.json({error: true, message: 'Email and Mobile Number already Exists..'});

        } else {

            const date = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

            const alldata =

                {

                    establishment_name: req.body.nameEstablishment,

                    company_trade_license: req.body.tradeLicense,

                    company_trade_license_path: uploadLicenseDP,

                    address: req.body.address,

                    nature_of_business: req.body.natureOfBusiness,

                    area: req.body.area,

                    emirates: req.body.emirates,

                    email: req.body.email,

                    mobile: mobile_number,

                    director1_name: req.body.namePassport1,

                    director1_nationality: req.body.Nationality1,

                    director1_passport_issuing_country: req.body.PassportCountry1,

                    director1_passport_number: req.body.PassportNumber1,

                    director1_passport_expiry: req.body.PassportExpiryDate1,

                    director1_emirates_id_path: EmiratesIdFile1DP,

                    director1_emirates_passport_path: PassportCountryFile1DP,

                    director1_emirates_id_expiry: req.body.EmiratesIdValidity1,

                    director1_email: req.body.emailId1,

                    director1_mobile: req.body.mobileId1,

                    director1_emirates_id: req.body.EmiratesId1,


                    director2_name: req.body.namePassport2,

                    director2_nationality: req.body.Nationality2,

                    director2_passport_issuing_country: req.body.PassportCountry2,

                    director2_passport_number: req.body.PassportNumber2,

                    // director2_passport_expiry: req.body.director2_passport_expiry,

                    director2_passport_expiry: director2_passport_expiry,

                    director2_emirates_id: req.body.EmiratesId2,

                    director2_emirates_id_path: EmiratesIdFile2DP,

                    director2_emirates_passport_path: PassportCountryFile2DP,

                    director2_email: req.body.emailId2,

                    director2_mobile: director2_mobile,

                    director2_emirates_id_expiry: EmiratesIdValidity2,


                    authorized_person_name: req.body.newNamePassport,

                    authorized_person_nationality: req.body.newNationality,

                    authorized_person_passport_issuing_country: newPassportCountry,

                    authorized_person_passport_number: req.body.newPassportNumber,


                    authorized_person_passport_expiry: req.body.newPassportExpiryDate,

                    authorized_person_emirates_id: req.body.newEmiratesId,

                    authorized_person_emirates_id_path: newEmiratesIdFileDP,

                    authorized_person_emirates_passport_path: newPassportCountryFileDP,

                    authorized_person_emirates_id_expiry: req.body.newEmiratesIdValidity,

                    authorized_person_email: req.body.newEmailId,

                    authorized_person_mobile: req.body.newMobileId,


                    banker_name: req.body.bankerName,

                    branch_location: req.body.branchLocation,

                    account_number: req.body.accountNumber,

                    current_business_volume: req.body.businessVolume,

                    iata_accredited: req.body.iataAccredited,

                    iata_document_path: iataAccreditedFileDP,

                    email_for_invoice: req.body.email,

                    assisted_by: req.body.staffName,

                    assisted_by_details: req.body.staffId,

                    password: null,

                    status: 0,

                    createdOn: date,

                    createdBy: 'self',

                    verifiedBy: null

                }


            const datetime = moment().tz(process.env.TIME_ZONE).format('YYYY-MM-DD HH:mm:ss')

            let [result2] = await agentServices.addAgents(connection, alldata)

            // console.log(result2)

            const {insertId} = result2


            if (req.body.staffName.trim() !== "" && req.body.staffId.trim() !== "") {


                const [data] = await agentServices.getEmailMobile(connection, req.body.staffId);

                let email = data[0].email

                let mobile = data[0].mobile

                const [data1] = await agentServices.updateEmailMobile(connection, insertId, email, mobile);

            }

            // const insertId=148

            let result5 = await agentServices.prepaid_wallet(connection, insertId, datetime)


            let expireTime = moment().add(5, 'minutes').tz(process.env.TIME_ZONE).format('YYYY-MM-DD HH:mm:ss')

            const mobileOTP = crypto.randomInt(100000, 999999)

            const emailOTP = crypto.randomInt(100000, 999999)

            const result3 = await agentServices.sendOTPToAgentEmail(connection, email, emailOTP, datetime, expireTime, insertId)

            const result4 = await agentServices.sendOTPToAgentMobile(connection, mobile_number, mobileOTP, datetime, expireTime, insertId)

            await mailFuncs.sendOTPEmail(email, emailOTP)

            if (CountryCode === '971') {
                await smsFuncs.sendSMS(mobile_number, mobileOTP)
            }

            await whatsappMessage.sendWhatsAppOTP(mobileOTP, mobile_number)

            await connection.commit()

            return res.send({

                error: false,

                message: 'Your Data has been Saved Successfully, Please Verify Your Email and Phone Number.',

                id: insertId

            })

        }


    } catch (e) {

        // await connection.rollback()

        console.log('----', e.message)

        return res.send({error: true, message: e.message})

    } finally {

        if (connection) connection.release();  // Return the connection to the pool

    }

}
indexController.VerifyAgentOTP = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();
        const {id, mobileOTP, emailOTP} = req.body
        let [verifyEmailOTP] = await agentServices.verifyEmailOTP(connection, emailOTP, id)
        let [verifyMobileOTP] = await agentServices.verifyMobileOTP(connection, mobileOTP, id)
        if (verifyEmailOTP.length === 0) {
            return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Email OTP."})
        } else if (verifyMobileOTP.length === 0) {
            return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Mobile OTP."})
        } else {
            let [details] = await agentServices.getAgentDetailsByID(connection, id)
            let email = details[0].email
            await mailFuncs.signUpMail(email)
            await mailFuncs.signUpAutoTrigger(details)
            await whatsappMessage.sendSignupMessage(details[0].establishment_name, details[0].mobile)

            return res.send({
                responseCode: 2,
                error: false,
                warning: false,
                message: "OTP has been verifies successfully."
            })
        }
    } catch (e) {
        // await connection.rollback()
        console.log('----', e.message)
        return res.send({error: true, message: e.message})
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.GetOtp = async (req, res) => {
    let connection
    // await connection.beginTransaction()
    try {
        connection = await connectToDatabase();
        let {id} = req.params
        let [result] = await agentServices.GetOtp(connection, id)
        // console.log(result[0].otp)

        return res.send({
            responseCode: 2,
            error: false,
            warning: false,
            otp: result[0].otp
        })
    } catch (e) {
        // await connection.rollback()
        console.log('----', e.message)
        return res.send({error: true, message: e.message})
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.ChangePassword = async (req, res) => {
    let connection
    try {
        let {agentEmail, agentId} = req.agent
        let {oldPassword, newPassword} = req.body
        connection = await connectToDatabase();
        // let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;

        //console.log("client Ip",clientIp)

        let [result] = await agentServices.checkOldPassword(connection, agentId)
        if (req.agent.SubUser_email) {
            let {userId, SubUser_email} = req.agent
            let [sub] = await agentServices.checkOldPasswordSub(connection, userId)
            let hashOldPassword = sub[0].password
            let isMatch = await bcrypt.compare(oldPassword, hashOldPassword);
            const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
            let remarks = "Update Password"
            if (!isMatch) {
                return res.send({responseCode: 1, error: false, warning: true, message: "Old Password is not Correct."})
            } else {
                console.log(sub[0])
                let salt = await bcrypt.genSalt(10)
                let hashPassword = await bcrypt.hash(newPassword, salt)
                let result = await agentServices.updatePasswordSub(connection, userId, hashPassword)

                return res.send({
                    responseCode: 2,
                    error: false,
                    warning: false,
                    message: "Password Changed Successfully"
                })
            }
        }
        else {
            let hashOldPassword = result[0].password
            let isMatch = await bcrypt.compare(oldPassword, hashOldPassword);
            const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
            let remarks = "Update Password"
            if (!isMatch) {
                return res.send({responseCode: 1, error: false, warning: true, message: "Old Password is not Correct."})
            } else {
                let salt = await bcrypt.genSalt(10)
                let hashPassword = await bcrypt.hash(newPassword, salt)
                let result = await agentServices.updatePassword(connection, agentId, hashPassword)
                let [PasswordLog] = await agentServices.agentActivityLog(connection, agentEmail, remarks, time, agentId, clientIp)

                return res.send({
                    responseCode: 2,
                    error: false,
                    warning: false,
                    message: "Password Changed Successfully"
                })
            }
        }
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.GetFPOtp = async (req, res) => {
    let connection
    try {
        // console.log(req.body)
        const {Email} = req.body
        connection = await connectToDatabase();
        // const password = generatePassword(8);
        const otp = `${crypto.randomInt(100000, 999999)}`

        let [agentData] = await agentServices.readAgentByEmail(connection, Email)

        if (agentData.length === 0) {
            return res.send({responseCode: 1, error: false, warning: true, message: "Email Does Not Exist."});
        } else {
            let [data] = await agentServices.updateOtp(connection, otp, Email)
            await mailFuncs.sendFPOtp(Email, otp)


            return res.send({
                responseCode: 2,
                error: false,
                warning: false,
                message: "OTP has been Sent To Given Email Address."
            });
        }

    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.VerifyFPOtp = async (req, res) => {
    let connection
    try {
        // console.log(req.body)
        const {Email, otp} = req.body
        let otp1 = otp
        connection = await connectToDatabase();
        // const password = generatePassword(8);
        const password = generatePassword(8);
        let salt = await bcrypt.genSalt(10)
        let hashPassword = await bcrypt.hash(password, salt)
        let [agentData] = await agentServices.readAgentByEmail(connection, Email)

        if (agentData[0].otp !== otp1) {
            // console.log(agentData[0].otp)
            // console.log(otp1)
            return res.send({responseCode: 1, error: false, warning: true, message: "OTP does not Matched."});
        } else {

            let [data] = await agentServices.updatePasswordByEmail(connection, hashPassword, Email)
            await mailFuncs.sendResetPasswordEmail(Email, password)

            return res.send({
                responseCode: 2,
                error: false,
                warning: false,
                message: "Password has been sent successfully."
            });
        }

    } catch (e) {
        // console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}
indexController.GetLogData = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getLogData(connection, agentId)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.get_assistance_data = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getStaffData(connection, agentId)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};
indexController.GetFlightSearch = async (req, res) => {
    console.log(req.agent)
    let connection
    try {
        let {agentId} = req.agent
        let {agentEmail} = req.agent

        connection = await connectToDatabase();
        let [result] = await agentServices.getFlightSearch(connection, agentId)
        let [result1] = await agentServices.getFlightBook(connection, agentEmail)
        let [totalFlightRevenue] = await agentServices.getTotalFlightRevenue(connection, agentEmail)
        result[0].book_count = result1[0].book_count;
        result[0].totalFlightRevenue = totalFlightRevenue[0].totalFlightRevenue;
        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.VerifyStaff = async (req, res) => {
    let connection
    try {
        let {id} = req.params
        connection = await connectToDatabase();
        let [result] = await agentServices.verifyStaffId(connection, id)
        if (result.length === 0) {
            return res.send({responseCode: 1, error: false, warning: true, message: "No Staff Found"})
        } else {
            return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
        }

    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};
indexController.GetFare = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();
        let [result] = await agentServices.getFareData(connection)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.GetCarrier = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getCarrierData(connection, agentId)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.AddAgentMarkup = async (req, res) => {
    let connection
    try {
        console.log(req.body)
        let {agentId, agentEmail} = req.agent;
        let {plan_type, fare_type, trip_type, markup_type, deposit_value, airline} = req.body;
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss");
        connection = await connectToDatabase();

        // If the airline is an empty string, handle case 1
        if (airline === '') {
            let [result] = await agentServices.addMarkup1(connection, plan_type, trip_type, markup_type, deposit_value, agentId, agentEmail, time);
            return res.send({responseCode: 2, error: false, warning: false, message: "Markup Added Successfully"});
        }
        // If 'all' airlines are selected, handle case 2
        else {
            let [result] = await agentServices.addMarkup2(connection, plan_type, fare_type, trip_type, markup_type, deposit_value, airline, agentId, agentEmail, time);
            return res.send({responseCode: 2, error: false, warning: false, message: "Markup Added Successfully"});
        }
        // If a single airline is selected, ensure it is treated as a single ID, not split into characters
        // else if (typeof airline === 'string' && airline.length > 2) {
        //     // Single airline ID as string, handle as one item
        //     let [result] = await agentServices.addMarkup2(connection, plan_type, fare_type, trip_type, markup_type, deposit_value, airline, agentId, agentEmail, time);
        //     return res.send({ responseCode: 2, error: false, warning: false, message: "Markup Added Successfully" });
        // }

        // else {
        //     return res.send({ responseCode: 1, error: true, warning: true, message: "Invalid airline data" });
        // }
    } catch (e) {
        console.log('-----', e.message);
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.getAgentMarkup = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getMarkup(connection, agentId)
        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();
    }
};
indexController.Setting = (req, res) => {
    res.render("agent/setting", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
}

indexController.agent_markup_flight = (req, res) => {
    res.render("agent/agent_markup_flight", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
}
indexController.add_agent_markup_flight = (req, res) => {
    res.render("agent/add_agent_markup_flight", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
}
indexController.UpdateAgentMarkup = async (req, res) => {
    let connection
    try {
        let {markup_id, deposit_value} = req.body
        connection = await connectToDatabase();
        let [result] = await agentServices.updateAgentMarkup(connection, markup_id, deposit_value)
        return res.send({responseCode: 2, error: false, warning: false, message: "Markup Value Updated Successfully"});
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();
    }
};


indexController.DeleteAgentMarkup = async (req, res) => {
    let connection
    try {
        let {id} = req.params
        connection = await connectToDatabase();
        let [result] = await agentServices.deleteAgentMarkup(connection, id)
        return res.send({responseCode: 2, error: false, warning: false, message: "Markup Deleted Successfully"});
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();
    }
};

indexController.show_flight_search_log = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/show_search_flight_log", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/show_search_flight_log", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

indexController.GetSearchLog = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getSearchLog(connection, agentId)
        return res.send({responseCode: 2, error: false, warning: false, message: "Success", data: result});
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();
    }
};
indexController.Check = async (req, res) => {
    console.log(req.body)
}
indexController.GetBalance = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [walletId] = await agentServices.getWalletId(connection, agentId)
        console.log(walletId[0].id)
        let [checkCreditAmount] = await agentServices.checkCreditAmount(connection, walletId[0].id)
        let [checkDebitAmount] = await agentServices.checkDebitAmount(connection, walletId[0].id)
        let creditAmount = parseFloat(checkCreditAmount[0].total_credit)
        let debitAmount = parseFloat(checkDebitAmount[0].total_debit)
        let amount = creditAmount - debitAmount
        walletId[0].creditAmount = creditAmount;
        walletId[0].debitAmount = debitAmount
        walletId[0].balance = amount
        return res.send({responseCode: 2, error: false, warning: false, message: "Success", data: walletId});
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();
    }
};

indexController.activityLog = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/activity_logs", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/activity_logs", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.getActivityData = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.getActivityData(connection, agentId)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.WalletSummary = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/walletSummary", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/walletSummary", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.GetWalletSummary = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [data] = await agentServices.getWalletId(connection, agentId)
        let [result] = await agentServices.getWalletSummary(connection, data[0].id)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};
indexController.GetWalletSummaryByDates = async (req, res) => {
    let connection
    try {
        let {agentId} = req.agent
        let {fromDate, toDate} = req.body
        console.log(fromDate, toDate, agentId)
        connection = await connectToDatabase();
        let [data] = await agentServices.getWalletId(connection, agentId)
        let [result] = await agentServices.getWalletSummaryByDates(connection, data[0].id, fromDate, toDate)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};
indexController.AddWalletRequest = async (req, res) => {
    console.log(req.body)
    let connection
    try {
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        let {amount, deposit_date, p_mode, account, transaction_id, agent_remarks} = req.body
        console.log(req.body)
        let {agentId, agentEmail} = req.agent
        let status = 0
        connection = await connectToDatabase();
        // Check if the transaction ID already exists
        let [existingTransaction] = await agentServices.checkTransactionIdExists(connection, transaction_id);
        if (existingTransaction.length > 0) {
            return res.send({
                responseCode: 1,
                error: false,
                warning: true,
                message: "Transaction ID already exists."
            });
        } else {
            let {transaction_screenshot} = req.files
            const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
            let serverPath = `public/upload/payment_screenshot/${agentId}_${transaction_screenshot.name}`
            let DBPath = `/upload/payment_screenshot/${agentId}_${transaction_screenshot.name}`
            let remarks = "Request to Add Money"
            transaction_screenshot.mv(serverPath, async (error) => {
                if (error) {
                    return res.json({error: error.message})
                } else {
                    let [result] = await agentServices.addRequest(connection, agentId, amount, deposit_date, p_mode, account, transaction_id, agent_remarks, DBPath, status)
                    let [addWalletRequesLog] = await agentServices.agentActivityLog(connection, agentEmail, remarks, time, agentId, clientIp)
                    return res.send({
                        responseCode: 2,
                        error: false,
                        warning: false,
                        message: "Wallet request sent successfully."
                    })
                }
            })
        }
    } catch (e) {
        console.log('----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

indexController.add_walletMID = (req, res) => {
    res.render("agent/request_to_addMoney", {
        agentEmail: req.agent.agentEmail,
        agentName: req.agent.agentName, userType: req.agent.userType
    })
}

indexController.GetAgentWalletRequest = async (req, res) => {
    let connection
    try {
        console.log(req.body)
        let {agentId} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.AgentWalletRequest(connection, agentId)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.AddWalletDetails = async (req, res) => {
    console.log(req.body)
    let connection
    try {
        let {agentId} = req.agent
        let {amount, transaction_type, mode_of_payment} = req.body
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
        connection = await connectToDatabase();
        let [getWalletId] = await agentServices.getWalletId(connection, agentId)
        let [result] = await agentServices.addWalletDetails(connection, getWalletId[0].id, transaction_type, amount, time, mode_of_payment)

        return res.send({responseCode: 2, error: false, warning: false, message: "success"})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

indexController.agentWallet = (req, res) => {
    res.render("agent/agent_wallet", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
}

indexController.fetchGatewayCharges = async (req, res) => {
    let connection
    try {
        connection = await connectToDatabase();
        let [result] = await agentServices.fetchGatewayCharges(connection)
        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }

}

indexController.topUp_options = async (req, res) => {
    const tx = new Date().getTime().toString();

    let {agentName, agentEmail, agentMobile} = req.agent
    let {payment_option, total_amount, payType} = req.body
    payment_option = capitalizeFirstLetter(payment_option);
    let connection;
    try {
        connection = await connectToDatabase();

        // Razorpay payment options
        const options = {
            key: 'rzp_test_VWMHIe8lj7h1ib',
            amount: parseInt(total_amount) * 100,
            currency: "INR",
            name: "Travel Deals Online DXB",
            description: "Test Transaction",
            image: "/assets/img/TDO_logo1.png",

            // Prefill Razorpay form with customer details
            prefill: {
                "name": `${agentName}`,
                "email": `${agentEmail}`,
                "contact": `${agentMobile}`
            },
            // Payment method configuration
            config: {
                display: {
                    blocks: {
                        banks: {
                            name: `Pay via ${payment_option}`,
                            instruments: [
                                {
                                    method: `${payType}` // e.g., card, netbanking
                                }
                            ],
                        },
                    },
                    sequence: ['block.banks'],
                    preferences: {
                        show_default_blocks: false,
                    },
                },
            },

            // callback_url: ${process.env.CALL_BACK_URL}/agent/topupSuccess/${res.razorpay_payment_id}/${payment_option},
            callback_url: `/agent/topUpSuccess`,

            notes: {
                address: "Razorpay Corporate Office"
            },
            theme: {
                color: "#ff0000"
            }
        };
        res.json(options);


    } catch (e) {
        console.error("Error in topUp_options:", e.message);
        return res.status(500).send({responseCode: 1, error: true, warning: false, message: e.message});
    }finally {
        if (connection) connection.release();
    }
}

indexController.topUpSuccess = async (req, res) => {
    res.render("agent/topupSuccess", {
        agentEmail: req.agent.agentEmail,
        agentName: req.agent.agentName, userType: req.agent.userType
    })
}

indexController.agentWalletTopUp = async (req, res) => {

    //console.log(req.agent)
    let connection;
    const tx = new Date().getTime().toString();
    let {agentId, agentName, agentEmail, agentMobile} = req.agent
    let {amount, payment_option, processing_fee, total_amount, payType} = req.body
    payment_option = capitalizeFirstLetter(payment_option);

    let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
    try {
        connection = await connectToDatabase();
        let [walletId] = await agentServices.getWalletId(connection, agentId);
        let transaction_type = "Credit";
        let remarks = `By Payment Gateway. Processing fee: ${processing_fee}, Total amount: ${total_amount}`;
        let log_remarks = "Wallet TopUp (Success)"
        //
        let [result] = await agentServices.WalletTopUp(connection, walletId[0].id, transaction_type, amount, time, remarks, tx, payment_option, 'self');
        let [WalletLog] = await agentServices.agentActivityLog(connection, agentEmail, log_remarks, time, agentId, clientIp)
        mailFuncs.WalletLoadNotificationMail(agentName, agentId, amount, tx, time)
        return res.json({
            responseCode: 2,
            error: false,
            message: `Success - ${amount} added to your wallet.`
        });
    } catch (e) {
        console.error("Error in topUp_options:", e.message);
        return res.status(500).send({responseCode: 1, error: true, warning: false, message: e.message});
    }finally {
        if(connection){
            connection.release()
        }
    }
}

indexController.manageSub_user = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/manageUser", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/manageUser", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

indexController.user_action = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();

        // Extract request body and agent data
        const {firstName, lastName, mobile, email, userType, location, countryCode} = req.body;
        const {agentId, agentEmail, agentName} = req.agent;


        // Format the mobile number with the country code and set other default values
        const mobileNo = countryCode + mobile;
        const status = 'active';
        const travelAgent = agentEmail;
        const remarks = "Sub User Added";
        const password = `Tdo@${crypto.randomInt(1000, 9999)}`;
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")

        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Verify if the email or mobile already exists for agents or sub-agents
        const [existingAgentEmail] = await agentServices.verifyExistingAgentEmail(connection, email);
        if (existingAgentEmail.length !== 0) {
            return res.json({error: true, message: 'Email already exists for an agent.'});
        }

        const [existingAgentMobile] = await agentServices.verifyExistingAgentMobile(connection, mobileNo);
        if (existingAgentMobile.length !== 0) {
            return res.json({error: true, message: 'Mobile number already exists for an agent.'});
        }

        const [existingSubAgentEmail] = await agentServices.verifyExistingSubAgentEmail(connection, email);
        if (existingSubAgentEmail.length !== 0) {
            return res.json({error: true, message: 'Email already exists for a sub-agent.'});
        }

        const [existingSubAgentMobile] = await agentServices.verifyExistingSubAgentMobile(connection, mobileNo);
        if (existingSubAgentMobile.length !== 0) {
            return res.json({error: true, message: 'Mobile number already exists for a sub-agent.'});
        }
        let [insertData] = await agentServices.addSubAgents(connection, firstName, lastName, mobileNo, email, hashPassword, userType, status, travelAgent, location)
        let [SubUserLogoSuccess] = await agentServices.agentActivityLog(connection, agentEmail, remarks, time, agentId, clientIp)

        await mailFuncs.sendMailSubUser(email, password, agentEmail, agentName)
        await whatsappMessage.subUserLogin(mobileNo, email, password)
        await connection.commit()
        return res.send({
            error: false,
            message: 'New user successfully registered.'

        })
    } catch (error) {
        console.log('----', error.message);
        return res.json({error: true, message: error.message});
    } finally {
        // Release the connection back to the pool, if established
        if (connection) connection.release();
    }
};

indexController.read_users = async (req, res) => {
    let connection
    try {

        let {agentEmail} = req.agent
        connection = await connectToDatabase();
        let [result] = await agentServices.read_subUsers(connection, agentEmail)

        return res.send({responseCode: 2, error: false, warning: false, message: "success", data: result})
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

function capitalizeFirstLetter(string) {
    if (typeof string !== "string") return ""; // Return empty if input is not a string
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

indexController.user_status = async (req, res) => {
    let connection;
    try {
        const {status} = req.body;  // Extract status from request body
        const {id} = req.params;    // Extract user ID from request parameters
        const {agentId, agentEmail, agentName} = req.agent;
        const remarks = "Sub User Status Updated"

        // Connect to database
        connection = await connectToDatabase();
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")

        // Call the service to update the user status
        let [result] = await agentServices.updateUserStatus(connection, status, id);
        let [SubUserLogoSuccess] = await agentServices.agentActivityLog(connection, agentEmail, remarks, time, agentId, clientIp)


        // Return success response
        return res.send({
            responseCode: 2,
            error: false,
            warning: false,
            message: "The Sub-user status has been successfully updated."
        });
    } catch (e) {
        console.log('-----', e.message);
        // Return error response
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release(); // Release the database connection
    }
};

indexController.user_resetPassword = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();
        const {id} = req.params
        const password = `Tdo@${crypto.randomInt(1000, 9999)}`;
        let salt = await bcrypt.genSalt(10)
        let hashPassword = await bcrypt.hash(password, salt)
        let [subUserData] = await agentServices.readAgentByID(connection, id)

        if (subUserData.length === 0) {
            return res.send({responseCode: 1, error: false, warning: true, message: "Invalid Sub-User."});
        }
        // else if (subUserData[0]['status']==='')
        else {
            if (subUserData[0]['status'] === 'active') {
                let email = subUserData[0].email;
                let mobile = subUserData[0].mobileNo;
                // console.log(agentData[0].password)

                let [data] = await agentServices.updateResendPassword(connection, hashPassword, id)
                await mailFuncs.sendResetPasswordEmailSubUser(email, password)
                await whatsappMessage.subUserLogin(mobile,email,password)

                return res.send({
                    responseCode: 2,
                    error: false,
                    warning: false,
                    message: "Password has been Reset successfully."
                });
            } else {

                return res.send({
                    responseCode: 1,
                    error: false,
                    warning: true,
                    message: "Sub-user account is inactive."
                });
            }
        }
    } catch (e) {
        console.log('-----', e.message)
        return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

indexController.SubUser_log = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/SubUser_logIn_logOut", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/SubUser_logIn_logOut", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

indexController.subuser_changePassword = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("agent/subuser_changePassword", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("agent/subuser_changePassword", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
indexController.user_update =async (req,res)=>{
    let connection;
    try{
        console.log(req.body)
        const{u_user_id,u_firstName,u_lastName,u_mobileNo,u_email,u_type,u_location}=req.body
        connection = await connectToDatabase();
        let [result] = await agentServices.user_updated(connection, u_user_id,u_firstName,u_lastName,u_mobileNo,u_email,u_type,u_location)
        return res.send({responseCode: 2, error: false, warning: false, message: "User details updated successfully"});

    }catch (e) {
        console.log("Eror:",e.message)
        return res.send({
            responseCode: 1,
            error: true,
            warning: false,
            message: "Error Occurred - " + e.message
        });
    } finally {
        if (connection) connection.release(); // Return the connection to the pool
    }
}
module.exports = indexController;
