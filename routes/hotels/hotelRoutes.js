const express = require('express');
const hotelController=require("../../controllers/hotels/hotelController")
const routes = express.Router()
const {verify}=require('jsonwebtoken')
const flightController = require("../../controllers/flights/flightController");

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

routes.get("/search-page",authorizeAgentHTTP,hotelController.Search)
routes.post("/search-hotels",authorizeAgentHTTP,hotelController.SearchHotels)
routes.get("/hotelResults",authorizeAgentHTTP,hotelController.HotelsData)
routes.post("/hotelSearchPlaces",authorizeAgentHTTP, hotelController.hotelSearchResults)
routes.post("/insertSearchingSession",authorizeAgentHTTP,hotelController.InsertSearchingSession)
routes.get("/hotel-details/:id",authorizeAgentHTTP,hotelController.HotelInfo)
routes.post("/fetch-hotel-info",authorizeAgentHTTP,hotelController.fetchHotel_Rooms_Rate)
routes.get("/hotel-review/:rt/:h/:amt",authorizeAgentHTTP,hotelController.hotelReview);
routes.post("/getHotelReview",authorizeAgentHTTP,hotelController.priceCheck);
routes.post('/goToCheckout',authorizeAgentHTTP, hotelController.goToCheckout);
routes.get('/hotelCheckout/:id/:tp',authorizeAgentHTTP, hotelController.PaymentGateway);
routes.post('/razorpay-options', authorizeAgentHTTP, hotelController.showRazorPayWindow);
routes.get("/hotelPaymentSuccess/:insId/:tx/:payType/:gCharge/:bookingId",authorizeAgentHTTP, hotelController.Success);
routes.post("/hotel-booking",authorizeAgentHTTP, hotelController.Booking);
routes.get("/success-bookings",authorizeAgentHTTP,hotelController.SuccessBookings)
routes.get("/cancelled-bookings",authorizeAgentHTTP,hotelController.CancelledBookings)
routes.post("/all-success-bookings",authorizeAgentHTTP,hotelController.AllSuccessBookings)
routes.post("/all-cancelled-bookings",authorizeAgentHTTP,hotelController.AllCancelledBookings)
routes.get("/success-bookings-details/:id",authorizeAgentHTTP,hotelController.SuccessBookingDetails)
routes.get("/cancel-bookings-details/:id",authorizeAgentHTTP,hotelController.CancelBookingDetails)
routes.post("/false-hotel-booking",authorizeAgentHTTP,hotelController.false_hotelBooking)
routes.post("/getHotelTicketDetails",authorizeAgentHTTP,hotelController.TicketDetails)
routes.get("/print-ticket/:id",authorizeAgentHTTP,hotelController.Print)
routes.get("/cancel-hotel-ticket/:bookingId",authorizeAgentHTTP,hotelController.Cancel)



module.exports = routes;
