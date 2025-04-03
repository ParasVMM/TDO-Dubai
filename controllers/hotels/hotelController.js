const hotelController = {}
const hotelServices = require('../../services/hotels/hotelService');
const connectToDatabase = require("../../db/connection");
const moment = require('moment');
require('moment-timezone')
const agentServices = require("../../services/client/index.services");


hotelController.Search = async (req, res) => {
    if (req.agent.SubUser_email) {
        res.render("hotels/searchPage", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    } else {
        res.render("hotels/searchPage", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

hotelController.SuccessBookings = async (req, res) => {
    if (req.agent.SubUser_email) {
        res.render("hotels/viewSuccessTickets", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    } else {
        res.render("hotels/viewSuccessTickets", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

hotelController.CancelledBookings = async (req, res) => {
    if (req.agent.SubUser_email) {
        res.render("hotels/viewCancelledTicket", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    } else {
        res.render("hotels/viewCancelledTicket", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

hotelController.SuccessBookingDetails = async (req, res) => {
    let {id} =req.params;
    if (req.agent.SubUser_email) {
        res.render("hotels/hotel_success_details", {agentEmail: req.agent.agentEmail, userType: req.agent.userType, id:id})
    } else {
        res.render("hotels/hotel_success_details", {agentEmail: req.agent.agentEmail, userType: req.agent.userType , id:id})
    }
}

hotelController.CancelBookingDetails = async (req, res) => {
    let {id} =req.params;
    if (req.agent.SubUser_email) {
        res.render("hotels/hotel_cancel_details", {agentEmail: req.agent.agentEmail, userType: req.agent.userType, id:id})
    } else {
        res.render("hotels/hotel_cancel_details", {agentEmail: req.agent.agentEmail, userType: req.agent.userType , id:id})
    }
}

hotelController.HotelsData = async (req, res) => {
    if (req.agent.SubUser_email) {
        res.render("hotels/hotelResults", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    } else {
        res.render("hotels/hotelResults", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

hotelController.HotelInfo = async (req, res) => {
    let {id} = req.params
    if (req.agent.SubUser_email) {
        res.render("hotels/hotelDetail", {id: id, agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    } else {
        res.render("hotels/hotelDetail", {id: id, agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

hotelController.SearchHotels = async (req, res) => {
    try {
        let requestData;
        let correlationId = req.body.correlationId || null;
        const agentMarkupData = await hotelController.getAgentMarkup(req, res)
        console.log(agentMarkupData)

        // **Format 2: Check if the request contains searchQuery**
        if (req.body.searchQuery) {
            const {searchQuery, destinationCountryCode} = req.body;
            const {checkinDate, checkoutDate, roomInfo, searchCriteria} = searchQuery;

            const missingFields = [];
            if (!checkinDate) missingFields.push("checkinDate");
            if (!checkoutDate) missingFields.push("checkoutDate");
            if (!roomInfo || !Array.isArray(roomInfo) || roomInfo.length === 0) {
                missingFields.push("roomInfo (must be a non-empty array)");
            }
            if (!searchCriteria) missingFields.push("searchCriteria");

            if (searchCriteria) {
                if (!searchCriteria.city) missingFields.push("searchCriteria.city");
                if (!searchCriteria.currency) missingFields.push("searchCriteria.currency");
                // if (!searchCriteria.nationality) missingFields.push("searchCriteria.nationality");
            }

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: true,
                    message: `Missing or invalid fields: ${missingFields.join(", ")}`
            });
            }

            // Normalize room data
            const occupancies = roomInfo.map(room => ({
                numOfAdults: room.numberOfAdults || 0,
                childAges: Array.isArray(room.childAge) ? room.childAge : []
            }));

            requestData = {
                channelId: "uae-test-channel",
                culture: "en-us",
                currency: searchCriteria.currency,
                checkIn: checkinDate,
                checkOut: checkoutDate,
                occupancies: occupancies,
                LocationID: searchCriteria.city,
                nationality: "IN",
                countryOfResidence: "IN",
                destinationCountryCode: destinationCountryCode,
                radiusInKM: 50,
            };
        } else {
            // *Format 1: Handle the standard format*
            const {cityName, cityId, checkIn, checkOut, LocationID, rooms, destinationCountryCode} = req.body;

            const missingFields = [];
            if (!cityName) missingFields.push("cityName");
            if (!cityId) missingFields.push("cityId");
            if (!checkIn) missingFields.push("checkIn");
            if (!checkOut) missingFields.push("checkOut");
            if (!LocationID) missingFields.push("LocationID");
            if (!destinationCountryCode) missingFields.push("destinationCountryCode");
            if (!rooms) missingFields.push("rooms");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: true,
                    message: `Missing required fields: ${missingFields.join(", ")}`
            });
            }

            // Normalize rooms data
            let roomList;
            try {
                roomList = typeof rooms === "string" ? JSON.parse(rooms) : (Array.isArray(rooms) ? rooms : []);
            } catch (error) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid format for 'rooms'. Ensure it's a valid JSON array."
                });
            }

            if (!Array.isArray(roomList) || roomList.length === 0) {
                return res.status(400).json({
                    error: true,
                    message: "Rooms data is required and should be a non-empty array."
                });
            }

            const occupancies = roomList.map(room => ({
                numOfAdults: room.adults || 0,
                childAges: Array.isArray(room.childrenAges) ? room.childrenAges : []
            }));

            requestData = {
                channelId: "uae-test-channel",
                culture: "en-us",
                currency: "AED",
                checkIn: checkIn,
                checkOut: checkOut,
                occupancies: occupancies,
                LocationID: LocationID,
                nationality: "IN",
                countryOfResidence: "IN",
                destinationCountryCode: destinationCountryCode,
                radiusInKM: 50
            };
        }

        // Call service function to get hotel data
        const mergedHotelData = await hotelServices.getMergedHotelData(requestData, correlationId);
        console.log("---")

        for (const hotel of mergedHotelData.data.hotels) {
            let markupAmount = 0;

            for (const markup of agentMarkupData) {
                console.log(markup)
                if (markup['trip_type'] === "All") {
                    if (markup['markup_type'] === "Fixed") {
                        markupAmount = parseFloat(markup['markup_amount']) || 0;
                    } else
                    if (markup['markup_type'] === "Percentage") {
                        const totalRate = parseFloat(hotel.rate?.Rateinfo?.totalRate) || 0;
                        markupAmount = (totalRate * parseFloat(markup['markup_amount']) / 100) || 0;
                    }
                }
            }

            // *New Rate Calculation*
            const originalRate = parseFloat(hotel.rate?.Rateinfo?.totalRate) || 0;
            const newRate = originalRate + markupAmount;

            // *Add new fields to hotel data*
            hotel.rate.Rateinfo["markup_amount"] = markupAmount.toFixed(3);
            hotel.rate.Rateinfo["amount_afterMarkup"] = newRate.toFixed(3);
        }


        if (mergedHotelData.success) {
            res.status(200).json({
                success: true,
                data: mergedHotelData.data,
                correlationId: correlationId
            });
        } else {
            res.status(500).json({
                error: true,
                message: mergedHotelData.message,
                correlationId: correlationId
            });
        }

    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({
            error: true,
            message: err.message,
            correlationId: req.body?.correlationId || null
        });
    }
};

hotelController.hotelSearchResults = async (req, res) => {
    let connection;
    try {
        const {q} = req.body;
        console.log("Search Query:", q);

        connection = await connectToDatabase();

        // Generate correlationId
        const correlationId = `${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        //console.log("Correlation ID:", correlationId);

        let data = await hotelServices.hotelSearchArea(connection, q, correlationId);
        //console.log("Data Received:", data);

        return res.json({
            correlationId,
            data
        });
    } catch (err) {
        //console.log("Error:", err);
        res.json({
            error: true,
            message: err.message,
            correlationId
        });
    } finally {
        if (connection) connection.release();
    }
};

hotelController.InsertSearchingSession = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();

        const {
            traceId, token, correlationId, formData1, formData2, markupValue,
            markupType, applyOn, searchObject, travelAgentTripType,
            travelAgentMarkupType, travelAgentMarkupAmount
        } = req.body;

        let parsedData = null;
        let cityId, checkIn, checkOut, rooms, destinationCountryCode;

        console.log("formData1:", formData1);
        console.log("formData2:", formData2);

        // Step 1: Try formData2 first (Higher Priority)
        if (formData2 && formData2.trim() !== "") {
            try {
                parsedData = JSON.parse(formData2);
                if (parsedData && parsedData.searchQuery) {
                    cityId = parsedData.searchQuery.searchCriteria?.city || null;
                    checkIn = parsedData.searchQuery.checkinDate || null;
                    checkOut = parsedData.searchQuery.checkoutDate || null;
                    rooms = parsedData.searchQuery.roomInfo || [];
                    destinationCountryCode = parsedData.destinationCountryCode || null;
                }
            } catch (error) {
                console.error("Error parsing formData2:", error.message);
                return res.status(400).json({success: false, message: "Invalid JSON in formData2"});
            }
        }

        // Step 2: If formData2 is empty or missing values, try formData1
        if ((!cityId || !checkIn || !checkOut || rooms.length === 0) && formData1 && formData1.trim() !== "") {
            try {
                parsedData = JSON.parse(formData1);
                if (parsedData) {
                    cityId = parsedData.cityId || parsedData.LocationID || null;
                    checkIn = parsedData.checkIn || null;
                    checkOut = parsedData.checkOut || null;
                    rooms = parsedData.rooms || [];
                    destinationCountryCode = parsedData.destinationCountryCode || null;
                }
            } catch (error) {
                console.error("Error parsing formData1:", error.message);
                return res.status(400).json({success: false, message: "Invalid JSON in formData1"});
            }
        }

        // Step 3: Validate extracted fields
        if (!cityId || !checkIn || !checkOut || rooms.length === 0) {
            return res.status(400).json({success: false, message: "Missing required fields in formData"});
        }

        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss");
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() ||
            req.connection?.remoteAddress || req.socket?.remoteAddress;
        let {agentEmail, agentId} = req.agent;

        const inserted_session = await hotelServices.hotelSearchingSession_insert(
            connection, cityId, checkIn, checkOut, rooms, correlationId,
            destinationCountryCode, token, traceId, time, clientIp,
            agentId, agentEmail, searchObject, formData1, formData2
        );

        console.log(inserted_session);

        if (inserted_session.success) {
            res.status(200).json({success: true, correlationId});
        } else {
            res.status(500).json({
                success: false,
                message: inserted_session.message
            });
        }
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({
            error: true,
            message: err.message,
            correlationId: req.body?.correlationId || null
        });
    } finally {
        if (connection) {
            await connection.release();  // Ensure connection is closed
        }
    }
};

hotelController.fetchHotel_Rooms_Rate = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();
        const {correlationId} = req.body;
        if (!correlationId) {
            return res.status(400).json({error: true, message: "correlationId is required"});
        }
        const agentMarkupData = await hotelController.getAgentMarkup(req, res)

        const search_data = await hotelServices.fetch_search_sessionData(connection, correlationId);

        if (!search_data.success) {
            return res.status(404).json({error: true, message: search_data.message});
        }

        const {searchToken, hotelid} = search_data.data;

        if (!searchToken || !hotelid) {
            return res.status(400).json({error: true, message: "Missing required search data"});
        }

        const room_rate_data = await hotelServices.roomAndRate(correlationId, searchToken, hotelid);

        if (room_rate_data.error) {
            return res.status(500).json({error: true, message: room_rate_data.message});
        }

        const {
            recommendations = [],
            CancellationPolicy = [],
            rooms = [],
            rates = [],
            standardizedRooms = []
        } = room_rate_data.hotel;

        // Mapping Recommendations to Rates and Standardized Rooms
        const recomData = recommendations.map(rec => {
            // Get related rates
            const relatedRates = rates.filter(rate => rec.rates.includes(rate.id));

            // Extract roomIds from relatedRates
            const roomIds = relatedRates.flatMap(rate =>
                rate.occupancies ? rate.occupancies.map(occ => occ.roomId) : []
            );
            // console.log(rooms[0]['name'])
            // console.log("Room IDs:", roomIds);
            const getRooms = rooms.filter(policy => policy.id == roomIds) || {}
            // console.log(x)


            // Map standardized rooms to their corresponding rates
            const relatedStandardizedRooms = standardizedRooms
                .map(room => {
                    const mappedRates = room.mappedRoomRates.filter(mappedRate =>
                        relatedRates.some(rate => mappedRate.rateId === rate.id)
                    );
                    return mappedRates.length ? {...room, mappedRoomRates: mappedRates} : null;
                })
                .filter(room => room !== null);

            for (const hotel of relatedRates) {
                console.log("----")
                console.log(hotel.Rateinfo.totalRate)
                let markupAmount = 0;

                for (const markup of agentMarkupData) {
                    if (markup['trip_type'] === "All") {
                        if (markup['markup_type'] === "Fixed") {
                            markupAmount = parseFloat(markup['markup_amount']) || 0;
                        } else if (markup['markup_type'] === "Percentage") {
                            const totalRate = parseFloat(hotel.Rateinfo.totalRate) || 0;  // Direct access to totalRate
                            markupAmount = (totalRate * parseFloat(markup['markup_amount']) / 100) || 0;
                        }
                    }
                }

                // *New Rate Calculation*
                const originalRate = parseFloat(hotel.Rateinfo.totalRate) || 0;  // Direct totalRate reference
                const newRate = originalRate + markupAmount;

                // *Add new fields to hotel data*
                relatedRates.forEach(rate => {
                    hotel.Rateinfo["markup_amount"] = markupAmount.toFixed(3);
                    hotel.Rateinfo["amount_afterMarkup"] = newRate.toFixed(3);
                });

            }



            return {
                id: rec.id,
                cancelPolicy: CancellationPolicy.find(policy => policy.RecommendationId === rec.id) || {},
                Rates: relatedRates,
                StandardizedRooms: relatedStandardizedRooms,
                rooms: getRooms
            };
        });

        res.status(200).json({
            success: true,
            recomData, search_data
            // room_rate_data
        });

    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({error: true, message: err.message});
    } finally {
        if (connection) await connection.release();
    }
};

hotelController.hotelReview = async (req, res) => {
    let {rt, h, amt} = req.params
    if (req.agent.SubUser_email) {
        res.render("hotels/HotelReview", {
            roomType: rt,
            hotel: h,
            rate: amt,
            agentEmail: req.agent.agentEmail,
            userType: req.agent.userType
        })
    } else {
        res.render("hotels/HotelReview", {
            roomType: rt,
            hotel: h,
            rate: amt,
            agentEmail: req.agent.agentEmail,
            userType: req.agent.userType
        })
    }
}

hotelController.priceCheck = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();
        const { hotelUniqueId, optionId, rate } = req.body;
        const correlationId = hotelUniqueId;
        const recommendationId = optionId;

        if (!correlationId) {
            return res.status(400).json({ error: true, message: "correlationId is required" });
        }

        // Fetch agent markup data
        const agentMarkupData = await hotelController.getAgentMarkup(req, res);

        // Fetch search session data
        const search_data = await hotelServices.fetch_search_sessionData(connection, correlationId);
        console.log("-------------------------------------------------------------------------------------------------");

        if (!search_data.success) {
            return res.status(404).json({ error: true, message: search_data.message });
        }

        const { searchToken, hotelid } = search_data.data;
        if (!searchToken || !hotelid) {
            return res.status(400).json({ error: true, message: "Missing required search data" });
        }

        // Call priceCheck API
        const room_rate_data = await hotelServices.priceCheck(correlationId, searchToken, hotelid, recommendationId);

        // Validate API response
        if (!room_rate_data?.hotel?.rates || room_rate_data.hotel.rates.length === 0) {
            return res.status(500).json({ error: true, message: "Error fetching price details" });
        }

        console.log(room_rate_data.hotel.rates);

        let latestAPIPrice = 0;

        // Iterate through room rates and apply markup
        for (const rateInfo of room_rate_data.hotel.rates) {
            let totalRate = parseFloat(rateInfo?.Rateinfo?.totalRate) || 0;
            let markupAmount = 0;

            for (const markup of agentMarkupData) {
                console.log(markup);

                if (markup['trip_type'] === "All") {
                    if (markup['markup_type'] === "Fixed") {
                        markupAmount += parseFloat(markup['markup_amount']) || 0;
                    } else if (markup['markup_type'] === "Percentage") {
                        markupAmount += (totalRate * parseFloat(markup['markup_amount']) / 100) || 0;
                    }
                }
            }

            // Calculate new rate after markup
            const newRate = totalRate + markupAmount;

            // Add markup details to rateInfo object
            rateInfo.Rateinfo["markup_amount"] = markupAmount.toFixed(3);
            rateInfo.Rateinfo["amount_afterMarkup"] = newRate.toFixed(3);
            rateInfo.Rateinfo["latestAPIPrice"] = totalRate.toFixed(3);

            // Set latest API price to be compared with user-provided rate
            latestAPIPrice = newRate.toFixed(3);
        }

        // Compare user-provided rate with API rate
        const formattedUserRate = parseFloat(rate).toFixed(3);

        if (formattedUserRate !== latestAPIPrice) {
            return res.status(200).json({
                success: true,
                priceChangeAlert: "Price has changed, please verify the latest price.",
                latestPrice: latestAPIPrice,
                search_data,
                room_rate_data,
            });
        } else {
            return res.status(200).json({
                success: true,
                search_data,
                room_rate_data,
            });
        }

    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ error: true, message: err.message });
    } finally {
        if (connection) await connection.release();
    }
};

hotelController.goToCheckout = async (req, res) => {
    let connection;
    //console.log(req.body);

    try {
        connection = await connectToDatabase();

        const { CorrelationId, bookingData, SearchData,Amount,SearchingData,TravelAgentMarkup,AfterMarkup } = req.body;

        // Ensure bookingData is parsed
        let parsedBookingData = typeof bookingData === "string" ? JSON.parse(bookingData) : bookingData;
        let parsedSearchData = typeof SearchData === "string" ? JSON.parse(SearchData) : SearchData;
        let parsedSearchingData = typeof SearchingData === "string" ? JSON.parse(SearchingData) : SearchingData;
        console.log(parsedSearchingData)
        let bookingId = parsedBookingData.bookingId;
        let roomTravellerInfo = JSON.stringify(parsedBookingData.roomTravellerInfo); // Extract roomTravellerInfo

        const [check] = await hotelServices.check(connection,bookingId)
        if(check.length > 0){
            return res.status(500).json({
                error: true,
                message: "Already Existed Booking",
                correlationId: req.body?.correlationId || null
            });
        }

        const inserted_session = await hotelServices.hotelBookingSession(
            connection, CorrelationId, parsedSearchData , bookingId, roomTravellerInfo,Amount,parsedSearchingData,TravelAgentMarkup,AfterMarkup
        );
        res.status(200).json({ success: true, bookingId });
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({
            error: true,
            message: err.message,
            correlationId: req.body?.correlationId || null
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

hotelController.PaymentGateway = async (req,res) => {
    let {id,tp} = req.params
    if (req.agent.SubUser_email) {
        res.render("hotels/PaymentGate", {
            traceId:1,
            total:tp,
            bookingId: id,
            agentEmail: req.agent.agentEmail,
            userType: req.agent.userType
        })
    } else {
        res.render("hotels/PaymentGate", {
            traceId:1,
            total:tp,
            bookingId: id,
            agentEmail: req.agent.agentEmail,
            userType: req.agent.userType
        })
    }
}

hotelController.showRazorPayWindow = async (req, res) => {
    console.log(req.body)
    const  tx = new Date().getTime().toString();
    const { finalAmt, name, email, gCharge, contact, paymentMethod, payType, insId ,bookingId} = req.body;
    // console.log(data)
    if(paymentMethod === "wallet")
    {
        console.log("oye")
        console.log(req.body)
        let connection
        try {
            let {agentId} = req.agent
            const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
            connection = await connectToDatabase();
            let [getWalletId]=await agentServices.getWalletId(connection,agentId)
            let [result] = await agentServices.addWalletDetails(connection, getWalletId[0].id,'Debit',finalAmt,time,'Wallet','Hotel Booked','self')
            let [data] = await hotelServices.paymentStatus(connection,bookingId)

            res.redirect(`/hotels/hotelPaymentSuccess/${insId}/${tx}/${paymentMethod}/${gCharge}/${bookingId}`);
        } catch (e) {
            console.log('-----', e.message)
            res.redirect(`/hotels/hotelPaymentFail/${insId}/${tx}/${paymentMethod}/${bookingId}`)
        } finally {
            if (connection) connection.release();  // Return the connection to the pool
        }
    }
    else
    {
        console.log("oye1")
        const options = {
            key: 'rzp_test_VWMHIe8lj7h1ib', // Use environment variable
            amount: parseInt(finalAmt)*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: "INR",
            name: "Travel Deals Online", // your business name
            description: "Test Transaction",
            image: "https://www.traveldealsonline.com/Content/images/logo.png",
            prefill: {
                "name": `${name}`, //your customer's name
                "email": `${email}`,
                "contact": `${contact}` //Provide the customer's phone number for better conversion rates
            },
            config: {
                display: {
                    blocks: {
                        banks: {
                            name: `Pay via ${paymentMethod}`,
                            instruments: [
                                {
                                    method: `${payType}`
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
            callback_url: `${process.env.CALL_BACK_URL}/flights/flightPaymentSuccess/${insId}/${tx}/${paymentMethod}/${gCharge}`,

            notes: {
                address: "Razorpay Corporate Office"
            },
            theme: {
                color: "#ff0000"
            }
        };
        res.json(options);
    }
};

hotelController.Success = async (req, res) => {
    let connection;
    try {
        console.log(req.params)
        let {insId,tx,payType,gCharge,bookingId}= req.params;
        let {agentEmail}=req.agent
        connection = await connectToDatabase();

        let [recordset] = await hotelServices.success(connection, bookingId);

        if (recordset.length === 0) {
            res.json({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
            console.log("data", recordset[0]);
            res.render("hotels/hotelPaymentSuccess",{agentEmail: agentEmail,  userType: req.agent.userType, insId: insId, tx: tx, gCharge : gCharge , payType: payType, test1: JSON.stringify(recordset[0])})
        }

    }
    catch (err)
    {
        res.json({error: true, message: err, recordset: []});
    }finally {
        if(connection){
            connection.release()
        }
    }

}

hotelController.AllSuccessBookings = async (req, res) => {
    let connection;
    try {
        console.log(req.agent)
        let{agentEmail}=req.agent
        const connection = await connectToDatabase();

        let [recordset] = await hotelServices.getSuccessBookings(connection,agentEmail);

        if (recordset.length === 0) {
            res.send({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
            res.send({error: false, message: "data mil gya", recordset: recordset});
        }

    }
    catch (err)
    {
        console.log(err)
        res.json({error: true, message: err, recordset: []});

    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

hotelController.AllCancelledBookings = async (req, res) => {
    let connection;
    try {
        console.log(req.agent)
        let{agentEmail}=req.agent
        const connection = await connectToDatabase();

        let [recordset] = await hotelServices.getCancelBookings(connection,agentEmail);

        if (recordset.length === 0) {
            res.send({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
            res.send({error: false, message: "data mil gya", recordset: recordset});
        }

    }
    catch (err)
    {
        console.log(err)
        res.json({error: true, message: err, recordset: []});

    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

hotelController.false_hotelBooking = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();
        const { id } = req.body;
        const { agentId, agentEmail } = req.agent;

        const booking_session = await hotelServices.getHotelBooking_session(connection, id);
        if (!booking_session) return res.status(400).json({ success: false, message: "Booking session not found" });

        const agentInfo = await hotelServices.agentInfo(connection, agentId);
        const agent_mobileNo = agentInfo?.data?.mobile || '';

        const { bookingId,correlationId,searchData, roomTravellerInfo, paymentStatus, searchingData } = booking_session.data;
        if (!searchingData || !searchingData.data) return res.status(400).json({ success: false, message: "Invalid searching data" });

        const { hotel, token } = searchData;
        const { checkin, checkout, formData1, formData2, staticContent } = searchingData.data;

        const static_content = JSON.parse(staticContent || '{}');
        const { name: hotel_name, contact = {} } = static_content.staticContent || {};
        const { address: hotel_address} = contact;
        const hotel_phone=contact['phones'][0]
        const meal_basics = static_content.options || [];

        let formData = formData1 || formData2;
        if (!formData) return res.status(400).json({ success: false, message: "Form data is missing" });
        formData = typeof formData === "string" ? JSON.parse(JSON.parse(formData)) : formData;

        if (!Array.isArray(formData.rooms)) return res.status(400).json({ success: false, message: "Invalid room data" });

        const totalAdults = formData.rooms.reduce((sum, room) => sum + (room.adults || 0), 0);
        const totalChildren = formData.rooms.reduce((sum, room) => sum + (room.children || 0), 0);
        const totalPax = totalAdults + totalChildren;
        const totalChildAge = formData.rooms

        if (!hotel?.rates?.length) return res.status(400).json({ success: false, message: "Rates data is missing" });

        const { totalRate, baseRate, taxes, FinalPrice, publishedRate } = hotel.rates[0]?.Rateinfo || {};
        const { TDSDeductedAmount = 0, SupplierCommission = 0 } = hotel.rates[0]?.agentCommission || {};
        const totalTaxes = taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0;

        const user_panNumber = roomTravellerInfo.flatMap(room => room.travellerInfo).map(traveller => traveller.pan).find(Boolean) || null;
        const hotel_id = hotel.id;
        const supplier = "Riya Supplier";

        const inserted_session = await hotelServices.hotelBooking_insert(
            connection, agentEmail, paymentStatus, hotel_name, hotel_id, checkin, checkout, totalRate, baseRate,
            totalTaxes, SupplierCommission, TDSDeductedAmount, FinalPrice, publishedRate, totalPax, totalAdults,
            totalChildren, supplier, agent_mobileNo, user_panNumber, null, hotel_address, hotel_phone, meal_basics,correlationId
        );
        if (!inserted_session.success) return res.status(500).json({ success: false, message: inserted_session.message });

        const booking_id = inserted_session.bookingId;
        const childAgesArray = totalChildAge.map(room => room.childrenAges).flat()
        console.log("Extracted Child Ages: ", childAgesArray);
        let childAgeIndex = 0 ;
        for (const room of roomTravellerInfo) {
            for (const guest of room.travellerInfo) {
                let childAge = null;
                if (guest.pt === "CHILD" && childAgeIndex < childAgesArray.length) {
                    childAge = parseInt(childAgesArray[childAgeIndex], 10);
                    console.log(childAge)
                    childAgeIndex++;
                }

                await hotelServices.insertBookingDetails(
                    connection,
                    booking_id,
                    guest.pt || "Adult",   // paxType
                    guest.ti || "",        // salutation
                    guest.fN || "",        // firstName
                    guest.lN || "",        // lastName
                    childAge,              // childAge
                    guest.passport || null // passportNumber
                );
            }
        }

        if (!roomTravellerInfo?.length) return res.status(400).json({ success: false, message: "Room traveller info is missing" });

        const uniqueClientBookingId = `false-${generateUniqueClientBookingId()}`;

        const roomConfirmation = roomTravellerInfo.map((room, index) => ({
            rateId: hotel.rates[index]?.id,
            roomId: hotel.rooms[index]?.id,
            providerConfirmationNumber: `PROV-${Math.floor(Math.random() * 100000)}`,
        hotelConfirmationNumber: null,
            cancellationToken: null
    }));

        try {
            const bookingStatus = "Confirmed";
            const demoResponse = {
                token, bookingStatus, bookingId, ClientBookingId: uniqueClientBookingId, roomConfirmation,
                providerConfirmationNumber: `PROV-${Math.floor(Math.random() * 100000)}`,
            hotelConfirmationNumber: null, cancellationToken: "VE5IQVBJMDAwMDUyNjd8", additionalInformation: null, error: null
            };

            // await hotelServices.hotelBooking_update(connection, bookingId, demoResponse, bookingStatus, booking_id);
            // await hotelServices.hotel_booking_session(connection, bookingId, bookingStatus, demoResponse);
            //


            if (demoResponse.status === 200) {
                await hotelServices.hotelBooking_update(connection, demoResponse['bookingId'],demoResponse,demoResponse['bookingStatus'],booking_id);
                await hotelServices.hotel_booking_session(connection, demoResponse['bookingId'],demoResponse['bookingStatus'],demoResponse,id);
            }else{
                await hotelServices.hotelBooking_update(connection, demoResponse['bookingId'],demoResponse,demoResponse['bookingStatus'],booking_id);
                await hotelServices.hotel_booking_session(connection, demoResponse['bookingId'],demoResponse['bookingStatus'],demoResponse,id);
            }
            return res.status(200).json({ success: true, bookingData: demoResponse });

        } catch (error) {
            await hotelServices.hotelBooking_update(connection, bookingId, error.message, "Fail", booking_id);
            await hotelServices.hotel_booking_session(connection, bookingId, error.message, "Fail",id);
            return res.status(500).json({ error: true, message: error.message });
        }
    } catch (error) {
        console.error("Controller Error:", error.message);
        return res.status(500).json({ error: true, message: error.message });
    } finally {
        if (connection) await connection.release();
    }
};

hotelController.Booking = async (req, res) => {
    let connection;
    try {
        connection = await connectToDatabase();
        const { id } = req.body;
        const { agentId, agentEmail } = req.agent;

        const booking_session = await hotelServices.getHotelBooking_session(connection, id);
        if (!booking_session) return res.status(400).json({ success: false, message: "Booking session not found" });

        const agentInfo = await hotelServices.agentInfo(connection, agentId);
        const agent_mobileNo = agentInfo?.data?.mobile || "";

        const { bookingId,searchData, roomTravellerInfo, paymentStatus, searchingData, correlationId ,markupAddedByAgent,aftermarkupAddedByAgent_amount } = booking_session.data;
        if (!searchingData || !searchingData.data) return res.status(400).json({ success: false, message: "Invalid searching data" });

        const { hotel, token } = searchData;
        const { checkin, checkout, formData1, formData2, staticContent } = searchingData.data;

        let static_content = {};
        try {
            static_content = JSON.parse(staticContent || "{}");
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid static content data" });
        }

        const { name: hotel_name, contact = {} } = static_content.staticContent || {};
        const { address: hotel_address, phones: hotel_phone } = contact;
        const meal_basics = static_content.options || [];

        let formData = formData1 || formData2;
        if (!formData) return res.status(400).json({ success: false, message: "Form data is missing" });

        try {
            formData = typeof formData === "string" ? JSON.parse(JSON.parse(formData)) : formData;
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid form data" });
        }

        if (!Array.isArray(formData.rooms)) return res.status(400).json({ success: false, message: "Invalid room data" });

        const totalAdults = formData.rooms.reduce((sum, room) => sum + (room.adults || 0), 0);
        const totalChildren = formData.rooms.reduce((sum, room) => sum + (room.children || 0), 0);
        const totalPax = totalAdults + totalChildren;
        const totalChildAge=formData.rooms

        console.log("totalChildAge:- ", totalChildAge);


        if (!hotel?.rates?.length) return res.status(400).json({ success: false, message: "Rates data is missing" });

        const rates = hotel.rates || [];
        const rooms = hotel.rooms || [];

        const { totalRate, baseRate, taxes, FinalPrice, publishedRate } = rates[0]?.Rateinfo || {};
        const { TDSDeductedAmount = 0, SupplierCommission = 0 } = rates[0]?.agentCommission || {};
        const totalTaxes = taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0;

        const user_panNumber = roomTravellerInfo.flatMap(room => room.travellerInfo).map(traveller => traveller.pan).find(Boolean) || null;
        const hotel_id = hotel.id;
        const supplier = "Riya Supplier";

        const inserted_session = await hotelServices.hotelBooking_insert(
            connection,
            agentEmail,
            paymentStatus,
            hotel_name,
            hotel_id,
            checkin,
            checkout,
            totalRate,
            baseRate,
            totalTaxes,
            SupplierCommission,
            TDSDeductedAmount,
            FinalPrice,
            publishedRate,
            totalPax,
            totalAdults,
            totalChildren,
            supplier,
            agent_mobileNo,
            user_panNumber,
            null,
            hotel_address,
            hotel_phone,
            meal_basics,correlationId,markupAddedByAgent,aftermarkupAddedByAgent_amount
        );
        if (!inserted_session.success) return res.status(500).json({ success: false, message: inserted_session.message });

        const booking_id = inserted_session.bookingId;
        const uniqueClientBookingId = `${generateUniqueClientBookingId()}`;

        const childAgesArray = (totalChildAge || []).map(room => room.childrenAges || []).flat();
        console.log("Extracted Child Ages: ", childAgesArray);


        for (let roomIndex = 0; roomIndex < roomTravellerInfo.length; roomIndex++) {
            const room = roomTravellerInfo[roomIndex];
            let childAgeIndex = 0; // Reset for each room

            for (const guest of room.travellerInfo) {
                let childAge = null;

                if (guest.pt === "CHILD" && childAgeIndex < rates[roomIndex]?.occupancies[0]?.childAges.length) {
                    childAge = rates[roomIndex]?.occupancies[0]?.childAges[childAgeIndex] || null;
                    console.log("Child Age:", childAge);
                    childAgeIndex++; // Increment only for children
                }

                await hotelServices.insertBookingDetails(
                    connection,
                    booking_id,
                    guest.pt || "Adult",    // paxType
                    guest.ti || "",         // salutation
                    guest.fN || "",         // firstName
                    guest.lN || "",         // lastName
                    childAge,               // childAge (only assigned for children)
                    guest.passport || null  // passportNumber
                );
            }
        }



        //console.log(roomTravellerInfo[0])
        //console.log(roomTravellerInfo[1])
        const formattedResponse = {
            "rateIds": rates.map(rate => rate.id),
            "specialRequests": [],
            "roomsAllocations": roomTravellerInfo.map((room, index) => {
                let FormattedChildAgeIndex = 0; // Reset for each room

                return {
                    "roomId": rooms[index]?.id || rooms[0]?.id || null,
                    "rateId": rates[index]?.id || null,
                    "guests": room.travellerInfo.map((guest) => {
                        let age = 0; // Default for adults

                        if (guest.pt === "CHILD") {
                            console.log(rates[index]?.occupancies[0]?.childAges[FormattedChildAgeIndex]);
                            age = rates[index]?.occupancies[0]?.childAges[FormattedChildAgeIndex] || 0;
                            FormattedChildAgeIndex++; // Increment only for children
                        }

                        console.log(age);
                        return {
                            "type": guest.pt || "Adult",
                            "title": guest.ti || "",
                            "firstName": guest.fN || "",
                            "lastName": guest.lN || "",
                            "middleName": guest.middleName || null,
                            "suffix": guest.suffix || null,
                            "age": age, // Corrected age logic
                            "email": guest.email || null,
                            "panCardNumber": guest.pan || null,
                            "panCardName": guest.panName || null,
                            "Passport": guest.passport || null,
                            "PhoneNumber": guest.phoneNumber || null,
                            "IsLeadPax": guest.isLeadPax || false,
                            "IsPanCardRequired": guest.isPanCardRequired || false
                        };
                    })
                };
            }),
            "ClientBookingId": uniqueClientBookingId,
            "HotelId": hotel_id || "",
            "token": token || ""
        };


        console.log("Final Formatted Response:", JSON.stringify(formattedResponse, null, 2));

        //console.log("Formatted Response:", formattedResponse.roomsAllocations[0].guests);

        try{
            const hotelBookingResponse = await hotelServices.hotelBooking(correlationId, formattedResponse);
            console.log("pratham")
            console.log(hotelBookingResponse)
            //console.log(hotelBookingResponse.status)
            if (!hotelBookingResponse.error) {
                const updateResult = await hotelServices.hotelBooking_update(
                    connection,
                    hotelBookingResponse.data.bookingId,
                    hotelBookingResponse.data,
                    hotelBookingResponse.data.bookingStatus,
                    booking_id
                );

                const sessionResult = await hotelServices.hotel_booking_session(
                    connection,
                    hotelBookingResponse.data.bookingId,
                    hotelBookingResponse.data.bookingStatus,
                    hotelBookingResponse.data,
                    id
                );

                if (!updateResult || !sessionResult) {
                    throw new Error("Database operation failed");
                }

                await connection.commit(); // Commit only if both queries succeed
                return res.status(200).json({ success: true, message: booking_session });
            }
            else {
                const updateFail = await hotelServices.hotelBooking_update(
                    connection,
                    hotelBookingResponse.data.bookingId,
                    hotelBookingResponse.data,
                    "Failed",
                    booking_id
                );

                const sessionFail = await hotelServices.hotel_booking_session(
                    connection,
                    hotelBookingResponse.data.bookingId,
                    "Failed",
                    hotelBookingResponse.data,
                    id
                );

                if (!updateFail || !sessionFail) {
                    throw new Error("Failed to log failed booking state");
                }

                await connection.commit();
                return res.json({ error: true, message: formattedResponse });
            }
        }catch (e) {
            await connection.rollback();
            await hotelServices.hotelBooking_update(connection, bookingId, e.message, "Fail", booking_id);
            await hotelServices.hotel_booking_session(connection, bookingId, "Fail",e.message,id);
            return res.status(500).json({ error: true, message: e.message });
        }

    } catch (error) {
        console.error("Controller Error:", error.message);
        return res.status(500).json({ error: true, message: error.message });
    } finally {
        if (connection) connection.release(); // ✅ Ensure the connection is released properly
    }
};

function generateUniqueClientBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChars = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `${randomChars}-${timestamp}-${randomNumber}`;
}

hotelController.TicketDetails = async (req,res) => {
    let connection;
    try {
        console.log(req.body)
        let{bookingId}=req.body
        const connection = await connectToDatabase();

        let [recordset] = await hotelServices.getSuccessBookingDetail(connection,bookingId);

        if (recordset.length === 0) {
            res.send({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
            let [result] = await hotelServices.getSuccessBookingDetail1(connection,bookingId);
            res.send({error: false, message: "data mil gya", recordset: recordset,info:result});
        }

    }
    catch (err)
    {
        console.log(err)
        res.json({error: true, message: err, recordset: []});

    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

hotelController.Print = async (req,res) => {
    console.log(req.params)
    const data = {
        id: req.params.id,
        type : 'ai',
        agentEmail:req.agent.agentEmail
    };
    res.render("hotels/hotelTicket",data)
}

hotelController.Cancel=async (req,res)=>{
    let connection;
    try{
        connection = await connectToDatabase();
        const { bookingId } = req.params;
        console.log(bookingId)
        const bookingData = await hotelServices.bookingData(connection, bookingId);
        const correlationId=bookingData['data']['correlationId']
        console.log(correlationId)
        const bookingCancel = await hotelServices.BookingCancel(bookingId, correlationId);
        console.log(bookingCancel)
        if (bookingCancel.error === null){
            await hotelServices.hotelBooking_CancellationUpdate(connection, bookingCancel['bookingId'],bookingCancel['bookingStatus'],bookingCancel);
            await connection.commit();
            return res.json({ success: true, message:"Booking Cancelled Successfully"});
        }
        else{
            await hotelServices.hotelBooking_CancellationUpdate2(connection, bookingCancel['bookingId'],bookingCancel['bookingStatus'],bookingCancel);
            await connection.commit();
            return res.json({ error: true,message:bookingCancel.Message});
        }
    }catch (error) {
        console.error("Controller Error:", error.message);
        return res.status(500).json({error: true, message: error.message});
    } finally {
        if (connection) await connection.release();
    }
}

hotelController.getAgentMarkup = async (req, res) => {
    let connection;
    try {
        let {agentId} = req.agent;
        connection = await connectToDatabase(); // Get DB connection

        // Fetch markup details for the agent where plan_type is "Hotel"
        const query = `SELECT * FROM tdo_dubai.travelagent_markup_flight WHERE travel_agent_id = ? AND plan_type = ?`;
        const [data] = await connection.execute(query, [agentId, 'Hotel']);

        return data;

    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({
            error: true,
            message: err.message
        });
    }finally {
        if(connection){
            connection.release()
        }
    }
}

module.exports = hotelController;