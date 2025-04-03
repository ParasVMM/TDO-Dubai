const express = require('express');
const indexController=require("../../controllers/client/index.controller")
const agentController = require("../../controllers/client/agent.controller");
const routes = express.Router()
const {verify}=require('jsonwebtoken')
const adminController = require("../../controllers/admin/admin.controller");


const authorizeAgentHTTP = (req, res, next) => {
    console.log(req.cookies.agentAuthToken)
    if (!req.cookies.agentAuthToken) {
        return res.redirect("/")
        // return res.json({responseCode: 440, message: 'Invalid Session'})
    }

    let token = req.cookies.agentAuthToken
    let secret = process.env.JWT_SECRET
    try {
        req.agent = verify(token, secret)
        next()
    } catch (error) {
        return res.send({responseCode: 1, message: 'Token Missing'})
    }
}
routes.get('/login_demo',(req,res)=>{
    res.render('agent/login_demo')
})
routes.get('/ui',(req,res)=>{
    res.render('agent/FlightWorthUI')
})
routes.get('/search',(req,res)=>{
    res.render('agent/searchPage')
})
routes.get('/round',(req,res)=>{
    res.render('agent/roundCustom')
})
routes.get('/readymade',(req,res)=>{
    res.render('agent/FWRoundReadymade')
})
routes.get('/cone',(req,res)=>{
    res.render('agent/cleartrip_oneway')
})
routes.get('/cround',(req,res)=>{
    res.render('agent/cleartrip_roundTrip')
})
routes.get('/cbook',(req,res)=>{
    res.render('agent/cleartrip_book_page')
})
routes.post("/check",indexController.Check)
routes.get("/agentRegister", indexController.Register)
routes.get("/terms-condition", indexController.TermsCondition)
routes.post("/add_agents", indexController.addAgents)
routes.post("/verify-otps", indexController.VerifyAgentOTP)
routes.get("/contactUs", indexController.contactUs)
routes.get("/aboutUs", indexController.aboutUs)
routes.get("/", indexController.Home)
routes.get("/verify-otp", indexController.verify_otp)
routes.get("/ThankYou", indexController.ThankYou)
// routes.get("/agent-login", indexController.AgentLogin)
routes.post("/agent-login",indexController.CheckLogin)
routes.get("/agent-dashboard", authorizeAgentHTTP,indexController.AgentDashboard)
routes.get("/get-otp/:id", indexController.GetOtp)

routes.get("/privacy-policy", indexController.PrivacyPolicy)
routes.get("/refund-policy", indexController.RefundPolicy)
routes.get("/statutory-disclaimer", indexController.StatutoryDisclaimer)
routes.get("/forgotPasswordPage",indexController.ForgotPasswordPage)
routes.get("/logout",authorizeAgentHTTP,indexController.Logout)
routes.get("/changePassword", authorizeAgentHTTP,indexController.changePassword)
routes.post('/change-password',authorizeAgentHTTP,indexController.ChangePassword)
routes.post("/getFPOtp",indexController.GetFPOtp)
routes.post("/verifyFPOtp",indexController.VerifyFPOtp)
routes.get("/agent-profile",authorizeAgentHTTP,indexController.agentProfile)
routes.get("/getAgentData",authorizeAgentHTTP,indexController.GetAgentData)
routes.post('/upload-profile-logo',authorizeAgentHTTP,indexController.UploadPhoto)
routes.get('/check-logs',authorizeAgentHTTP,indexController.LogsPage)
routes.get('/getLogData',authorizeAgentHTTP,indexController.GetLogData)
routes.post('/get-assistance-data',authorizeAgentHTTP,indexController.get_assistance_data)
routes.get('/flight-search',authorizeAgentHTTP,indexController.GetFlightSearch)
routes.get('/Verify-Staff/:id',indexController.VerifyStaff)

routes.get('/fare-types',indexController.GetFare)
routes.get('/carriers',authorizeAgentHTTP,indexController.GetCarrier)
routes.post('/add-agent-markup',authorizeAgentHTTP,indexController.AddAgentMarkup)

routes.get('/Get_markup_details',authorizeAgentHTTP,indexController.getAgentMarkup)

routes.get("/setting",authorizeAgentHTTP, indexController.Setting)
routes.get("/agent_markup_flight",authorizeAgentHTTP, indexController.agent_markup_flight)
routes.get("/add-agent_markup_flight",authorizeAgentHTTP, indexController.add_agent_markup_flight)
routes.put('/update-agent-markup',indexController.UpdateAgentMarkup)
routes.delete('/delete-agent-markup/:id',indexController.DeleteAgentMarkup)
routes.get('/show_flight_search_log',authorizeAgentHTTP,indexController.show_flight_search_log)
routes.get('/get-search-log',authorizeAgentHTTP,indexController.GetSearchLog)
routes.get('/getBalance',authorizeAgentHTTP,indexController.GetBalance)
routes.get('/activityLog',authorizeAgentHTTP,indexController.activityLog)
routes.get('/getActivityData',authorizeAgentHTTP,indexController.getActivityData)
routes.get('/walletSummary',authorizeAgentHTTP,indexController.WalletSummary)
routes.get('/getWalletSummary',authorizeAgentHTTP,indexController.GetWalletSummary)
routes.post('/getWalletSummaryByDates',authorizeAgentHTTP,indexController.GetWalletSummaryByDates)
routes.post('/addWalletRequest',authorizeAgentHTTP,indexController.AddWalletRequest)
routes.get('/add_walletMID',authorizeAgentHTTP,indexController.add_walletMID)
routes.get('/GetAgentWalletRequest',authorizeAgentHTTP,indexController.GetAgentWalletRequest)

routes.post('/addWalletDetails',authorizeAgentHTTP,indexController.AddWalletDetails)


routes.get('/agentWallet',authorizeAgentHTTP,indexController.agentWallet)
routes.post('/fetchGatewayCharges',authorizeAgentHTTP,indexController.fetchGatewayCharges)
routes.post('/topup-options',authorizeAgentHTTP,indexController.topUp_options)
routes.post("/agent/topUpSuccess",authorizeAgentHTTP, indexController.topUpSuccess);
routes.post("/agentWalletTopUp",authorizeAgentHTTP, indexController.agentWalletTopUp);

// ___________________________________________________________

// Agent SubUser
routes.get("/manage-subUser", authorizeAgentHTTP, indexController.manageSub_user)
routes.get("/subUser_log", authorizeAgentHTTP, indexController.SubUser_log)
// routes.get("/getSubUserLogData", authorizeAgentHTTP, indexController.getSubUserLogData)
routes.post("/user-action", authorizeAgentHTTP, indexController.user_action)
routes.get("/read-users", authorizeAgentHTTP, indexController.read_users)
routes.post("/user-status/:id", authorizeAgentHTTP, indexController.user_status)
routes.post("/user-resetPassword/:id", authorizeAgentHTTP, indexController.user_resetPassword)
routes.get('/subUser_changePassword',authorizeAgentHTTP,indexController.subuser_changePassword)
routes.post("/user-update", authorizeAgentHTTP, indexController.user_update)


module.exports=routes
