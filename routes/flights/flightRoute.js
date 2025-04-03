const express = require('express');
const flightController=require("../../controllers/flights/flightController")
const routes = express.Router()
const {verify}=require('jsonwebtoken')
const adminController = require("../../controllers/admin/admin.controller");


const authorizeAgentHTTP = (req, res, next) => {
    console.log(req.cookies.agentAuthToken)
    if (!req.cookies.agentAuthToken) {
        return res.redirect("/agent-login")
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
// routes.get("/", flightController.searchPage)
routes.get("/bookFlight", flightController.bookFlight)
routes.post("/makeSearchingSession",authorizeAgentHTTP, flightController.makeSearchingSession)
routes.post("/allCities", flightController.allCities)
// routes.get("/flightResults", flightController.flightResults)
routes.post("/flightResults", flightController.flightResultsApi)
routes.post("/AirSell", flightController.AirSell);
routes.post("/AirSell-2Way", flightController.AirSellTwoWay);
routes.post("/ticket",authorizeAgentHTTP, flightController.ticket)
routes.post("/hold",authorizeAgentHTTP, flightController.hold)
// routes.post("/getAllFlights",flightController.GetAllFlights)
// ___________________________________________________________

routes.get("/",authorizeAgentHTTP, flightController.searchPage)

routes.get("/flightResults",authorizeAgentHTTP, flightController.flightResults)
// routes.get("/searchResults",authorizeAgentHTTP, flightController.searchResults);
routes.post("/getAllFlights",authorizeAgentHTTP, flightController.getAllFlights);
routes.post("/getAllFlightsRound",authorizeAgentHTTP, flightController.getAllFlightsRound);
routes.get("/book", authorizeAgentHTTP, flightController.book);
routes.get("/bookbook", authorizeAgentHTTP, flightController.bookbook);
routes.get("/checkout/:tp",authorizeAgentHTTP,flightController.Checkout)
routes.get("/flightCheckout",authorizeAgentHTTP,flightController.flightCheckout)
routes.get('/viewTicket/:bookingId', authorizeAgentHTTP, flightController.viewTicket)
routes.post('/fetchTicketDetails', authorizeAgentHTTP, flightController.fetchTicketDetails)
routes.get('/viewTicketedBookings',authorizeAgentHTTP,flightController.ViewTicketedBookings)
routes.get('/viewFailedBookings',authorizeAgentHTTP,flightController.ViewFailedBookings)
routes.get('/viewHoldBookings',authorizeAgentHTTP,flightController.ViewHoldBookings)
routes.get('/viewReleasedBookings',authorizeAgentHTTP,flightController.ViewReleasedBookings)
routes.post('/goToCheckout', authorizeAgentHTTP, flightController.goToCheckout)
routes.post('/razorpay-options', authorizeAgentHTTP, flightController.showRazorPayWindow);
routes.post("/flightPaymentSuccess/:insId/:tx/:payType/:gCharge",authorizeAgentHTTP, flightController.Success);
routes.get("/flightPaymentSuccess/:insId/:tx/:payType/:gCharge",authorizeAgentHTTP, flightController.Success);
routes.get("/getTicketedBookings",authorizeAgentHTTP,flightController.GetTicketedBookings)
routes.get("/getTicketedBookingsDetails/:booking_id",authorizeAgentHTTP,flightController.GetTicketedBookingsDetails)

routes.get("/getHoldBookings",authorizeAgentHTTP,flightController.GetHoldBookings)
routes.get("/getHoldBookingsDetails/:booking_id",authorizeAgentHTTP,flightController.GetHoldBookingsDetails)

routes.get('/airlines',authorizeAgentHTTP,adminController.GetAirlines)
routes.get('/airports',authorizeAgentHTTP,adminController.GetAirports)

routes.post("/addFlightSearchData",authorizeAgentHTTP,flightController.AddFlightSearchData)

routes.get("/roundFlightResults",authorizeAgentHTTP, flightController.RoundFlightResults)
routes.get('/returnFixedBook',authorizeAgentHTTP, flightController.returnFixedBook)
routes.get('/returnFixedBook-Book',authorizeAgentHTTP, flightController.returnFixedBooking)

// new routes

routes.get("/ticket_booking_details/:id", authorizeAgentHTTP,  flightController.ticket_booking_details)
routes.post('/getTicketDetails', authorizeAgentHTTP, flightController.getTicketDetails)
routes.get("/failed_booking_details/:id", authorizeAgentHTTP,  flightController.failed_booking_details)
routes.get("/hold_booking_details/:id", authorizeAgentHTTP,  flightController.hold_booking_details)
routes.get("/released_booking_details/:id", authorizeAgentHTTP,  flightController.released_booking_details)
routes.get("/ticket/:id/:type", authorizeAgentHTTP,  flightController.ticket_new)
routes.post('/ticketedBookings', authorizeAgentHTTP, flightController.getTicketedBookings);
routes.post('/failedBookings', authorizeAgentHTTP, flightController.getFailedBookings);
routes.post('/holdBookings', authorizeAgentHTTP, flightController.getHoldBookings);
routes.post('/releasedBookings', authorizeAgentHTTP, flightController.getReleasedBookings);
routes.post('/sector_cancel', authorizeAgentHTTP, flightController.sector_cancel)
routes.post('/partial_cancel', authorizeAgentHTTP, flightController.partial_cancel)
routes.post('/releaseBooking', authorizeAgentHTTP, flightController.release_booking)
routes.post('/confirmBooking',authorizeAgentHTTP, flightController.confirm_hold)
routes.post('/lastMinMarkup', authorizeAgentHTTP, flightController.lastMinMarkup) 
routes.get('/agentDetails/:agent', authorizeAgentHTTP, flightController.agentData)
module.exports=routes
