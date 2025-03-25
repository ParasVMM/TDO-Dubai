const hotelServices = {}
const axios = require('axios');
const {json} = require("express");
const config = require('../../config/credentials')['development'];

hotelServices.hotelSearchArea = async (connection, searchQuery, correlationId) => {
    // console.log(searchQuery, correlationId)
    const apiUrl = `${config.searchList}${searchQuery}`;
    const headers = {
        "correlationId": correlationId,  // Use dynamically generated correlationId
        "AccountId": process.env.hotel_AccountId,
        "APIKEY": process.env.hotel_APIKEY
    };

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: headers
        });


        const data = await response.json();
        console.log("response data:", data); // Log the actual data received
        return data;

    } catch (error) {
        console.error("Error fetching hotel search results:", error.message);
        return error.message;
    }
};

const headers = (correlationId) => ({
    "correlationId": correlationId,
    "AccountId": process.env.hotel_AccountId,
    "APIKEY": process.env.hotel_APIKEY,
    "Content-Type": "application/json"
});

const fetchAvailabilityBlocking = async (requestData, correlationId) => {
    try {
        const API_URL = `${config.AvailabilityBlocking}`
            // console.log(requestData)
        const response = await axios.post(API_URL, requestData, {headers: headers(correlationId)});
         console.log(response.data)
        return {success: true, data: response.data};
    } catch (error) {
        console.error("AvailabilityBlocking API Error:", error.message);
        return {success: false, message: error.message};
    }
};

const fetchStaticContent = async (requestData, correlationId) => {
    try {
        const API_URL = `${config.GetStaticContent}`;
        const staticContentRequest = {
            "channelId": process.env.hotel_channelId,
            "culture": "en-US",
            "destinationCountryCode": requestData.destinationCountryCode,
            "filterBy": null,
            "contentFields": [
                "basic",
                "all",
                "facilities",
                "nearByAttractions",
                "policies",
                "images",
                "reviews",
                "descriptions",
                "neighbourhoods",
                "fees",
                "masterfacilities",
                "rooms",
                "CheckInCheckOut",
                "basiccurated"
            ],
            "providerPreferences": null,
            "radiusInKM": requestData.radiusInKM,
            "hotelIds": null,
            "providerIds": null,
            "LocationID": requestData.LocationID,
            "distanceFrom": null,
            "size": 8000,
            "circularRegion": null
        };

        const response = await axios.post(API_URL, staticContentRequest, {headers: headers(correlationId)});
        return {success: true, data: response.data};
    } catch (error) {
        console.error("GetStaticContent API Error:", error.message);
        return {success: false, message: error.message};
    }
};

hotelServices.getMergedHotelData = async (requestData, correlationId) => {
    // Fetch AvailabilityBlocking Data
    const availabilityData = await fetchAvailabilityBlocking(requestData, correlationId);
    console.log("Availabe",availabilityData.data.hotels);
    if (!availabilityData.success) {
        return { success: false, message: "Hotel not found due to unavailable availability data." };
    }

    // Fetch StaticContent Data
    const staticContentData = await fetchStaticContent(requestData, correlationId);
    console.log(staticContentData.data.hotels)
    if (!staticContentData.success) {
        return { success: false, message: "Hotel not found due to unavailable static content data." };
    }

    // Convert GetStaticContent hotels into a Map for quick lookup
    const staticContentMap = new Map(staticContentData.data.hotels.map(hotel => [hotel.id, hotel]));

    // Merge AvailabilityBlocking data with matching StaticContent data
    const mergedHotels = availabilityData.data.hotels
        .filter(hotel => staticContentMap.has(hotel.id)) // Ensure only fully matched hotels are included
        .map(hotel => ({
            ...hotel, // Keep all details from AvailabilityBlocking API
            staticContent: staticContentMap.get(hotel.id) // Add static content
        }));

    // If no hotels remain after merging, return an error
    if (mergedHotels.length === 0) {
        return { success: false, message: "No hotels available after merging data." };
    }

    // Construct final response
    return {
        success: true,
        data: {
            token: availabilityData.data.token,
            currency: availabilityData.data.currency,
            hotels: mergedHotels
        }
    };
};

hotelServices.hotelSearchingSession_insert = async (connection, cityId, checkIn, checkOut, roomInfo, correlationId, destinationCountryCode, searchToken, hotelId, currentDateTime, clientIp, agentId, agentEmail, staticContent, formData1, formData2) => {
    try {
        // Convert JSON objects to strings (if provided)
        const staticContentString = staticContent ? JSON.stringify(staticContent) : null;
        const formDataString1 = formData1 ? JSON.stringify(formData1) : null;
        const formDataString2 = formData2 ? JSON.stringify(formData2) : null;

        // Check if correlationId already exists
        const [existingRecords] = await connection.execute(
            `SELECT searchingSessionId FROM hotel_searching_session WHERE correlationId = ?`,
            [correlationId]
    );

        if (existingRecords.length > 0) {
            // Update existing record
            const [updateResult] = await connection.execute(
                `UPDATE hotel_searching_session 
                 SET cityid = ?, checkin = ?, checkout = ?, roominfo = ?, 
                     destinationCountryCode = ?, searchToken = ?, hotelid = ?, 
                     current_date_time = ?, client_ip = ?, agentId = ?, agentEmail = ?, 
                     staticContent = ?, formData1 = ?, formData2 = ?
                 WHERE correlationId = ?`,
                [
                    cityId, checkIn, checkOut, roomInfo, destinationCountryCode,
                    searchToken, hotelId, currentDateTime, clientIp, agentId, agentEmail,
                    staticContentString, formDataString1, formDataString2, correlationId
                ]
            );

            return {
                success: true,
                message: "Hotel searching session updated successfully.",
                updatedId: existingRecords[0].searchingSessionId
            };
        } else {
            // Insert new record
            const [insertResult] = await connection.execute(
                `INSERT INTO hotel_searching_session (
                    cityid, checkin, checkout, roominfo, correlationId,
                    destinationCountryCode, searchToken, hotelid, 
                    current_date_time, client_ip, agentId, agentEmail, 
                    staticContent, formData1, formData2
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cityId, checkIn, checkOut, roomInfo, correlationId,
                    destinationCountryCode, searchToken, hotelId,
                    currentDateTime, clientIp, agentId, agentEmail,
                    staticContentString, formDataString1, formDataString2
                ]
            );

            return {
                success: true,
                message: "Hotel searching session inserted successfully.",
                insertedId: insertResult.insertId
            };
        }
    } catch (error) {
        console.error("Database Error:", error.message);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.fetch_search_sessionData = async (connection, correlationId) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM hotel_searching_session WHERE correlationId = ?`, [correlationId]);

        if (rows.length === 0) {
            return { success: false, message: "No data found for the given correlationId" };
        }

        console.log("Fetched session data:", rows[0]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error("fetchSearchSessionData Error:", error.message);
        return { success: false, message: error.message };
    }
};

hotelServices.roomAndRate = async (correlationId, hotelToken, hotelid) => {
    const apiUrl = `${config.GetRoomsAndRate}`;
    const headers = {
        "Content-Type": "application/json",
        "correlationId": correlationId,
        "AccountId": process.env.hotel_AccountId,
        "APIKEY": process.env.hotel_APIKEY
    };

    const body = JSON.stringify({
        token: hotelToken,
        HotelId: hotelid
    });

    try {
        const response = await fetch(apiUrl, { method: "POST", headers, body });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Hotel Room & Rate Response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching hotel roomAndRate results:", error.message);
        return { error: true, message: error.message };
    }
};

hotelServices.priceCheck = async (correlationId, hotelToken, hotelId, recommendationId) => {
    const apiUrl = `${config.priceCheck}?token=${hotelToken}&hotelId=${hotelId}&recommendationId=${recommendationId}`;
    const headers = {
        "Content-Type": "application/json",
        "correlationId": correlationId,
        "AccountId": process.env.hotel_AccountId,
        "APIKEY": process.env.hotel_APIKEY
    };

    try {
        const response = await fetch(apiUrl, { method: "GET", headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Hotel Room & Rate Response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching hotel roomAndRate results:", error.message);
        return { error: true, message: error.message };
    }
};

hotelServices.check = async (connection, traceId) => {
    console.log(`${traceId} -------`)
    return connection.execute(`select * from hotel_booking_session where bookingId= ?`, [traceId]);
}

hotelServices.hotelBookingSession = async (connection, CorrelationId, SearchData, bookingId, roomTravellerInfo,Amount, data,TravelAgentMarkup,AfterMarkup) => {
    try {
        return connection.execute(
            `INSERT INTO hotel_booking_session (bookingId, correlationId, bookingData, roomTravellerInfo,searchData,amount,searchingData,markupAddedByAgent,aftermarkupAddedByAgent_amount) 
             VALUES (?, ?, ?, ?, ?, ?, ?,? ,?)`,
            [bookingId, CorrelationId, '0',roomTravellerInfo,SearchData,Amount,data,TravelAgentMarkup,AfterMarkup]
        );
    } catch (error) {
        console.error("Database Error:", error.message);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.success = async (connection, traceId) => {
    console.log(`${traceId} -------`)
    return connection.execute(`select * from hotel_booking_session where bookingId= ?`, [traceId]);
}

hotelServices.paymentStatus = async (connection,id) => {
    return connection.execute(`update hotel_booking_session set paymentStatus = 'Success' where bookingId= ?`, [id]);
}

hotelServices.getSuccessBookings = async (connection,agentId) => {
    return connection.execute(`SELECT * from hotel_booking where agentEmail = '${agentId}' and booking_status = 'Confirmed'`);
}

hotelServices.getCancelBookings = async (connection,agentId) => {
    return connection.execute(`SELECT * from hotel_booking where agentEmail = '${agentId}' and booking_status = 'Cancelled'`);
}

hotelServices.getSuccessBookingDetail = async (connection,Id) => {
    return connection.execute(`SELECT * from hotel_booking where api_booking_id = '${Id}'`);
}

hotelServices.getSuccessBookingDetail1 = async (connection,Id) => {
    return connection.execute(`SELECT * from hotel_booking_session where bookingId = '${Id}'`);
}

hotelServices.getHotelBooking_session = async (connection, id) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM hotel_booking_session WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return { success: false, message: "No data found for the given correlationId" };
        }

        // console.log("Fetched session data:", rows[0]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error("fetchSearchSessionData Error:", error.message);
        return { success: false, message: error.message };
    }
};

hotelServices.agentInfo = async (connection, id) => {
    try {
        const [rows] = await connection.execute(`SELECT mobile FROM agents WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return { success: false, message: "No data found for the given correlationId" };
        }

        // console.log("Fetched session data:", rows[0]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error("fetchSearchSessionData Error:", error.message);
        return { success: false, message: error.message };
    }
};

hotelServices.hotelBooking_insert = async (connection, agentEmail, paymentStatus, hotelName, Hotelid, checkIN, checkOut, totalAmount, baseAmount, totalTaxes, supplierCommission, tdsDeductedAmount, final_amount, published_rate, totalPax, totalAdult, totalChild, supplier, user_phoneNumber, user_passport_number, user_pan_number, hotel_address, hotel_phone,meal_basics,corelationId,markupAddedByAgent,aftermarkupAddedByAgent_amount) => {
    try {
        const sql = `
            INSERT INTO hotel_booking (
                agentEmail, booking_DateTime, paymentStatus, hotelName, Hotelid, checkIN, 
                checkOut, totalAmount, baseAmount, totalTaxes, supplierCommission, 
                tdsDeductedAmount, final_amount, published_rate, totalPax, totalAdult, 
                totalChild, supplier, user_phoneNumber, user_passport_number, user_pan_number, 
                hotel_address, hotel_phone, meal_basics,correlationId,markupAddedByAgent,after_markupAddedByAgent_amount
            ) 
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)
        `;

        const values = [
            agentEmail, paymentStatus, hotelName, Hotelid, checkIN, checkOut, totalAmount,
            baseAmount, totalTaxes, supplierCommission, tdsDeductedAmount, final_amount,
            published_rate, totalPax, totalAdult, totalChild, supplier, user_phoneNumber,
            user_passport_number, user_pan_number, hotel_address, hotel_phone, meal_basics,corelationId,markupAddedByAgent,aftermarkupAddedByAgent_amount
        ];

        // Execute the query
        const [result] = await connection.execute(sql, values);
        return {
            success: true,
            message: "Booking successfully inserted",
            bookingId: result.insertId
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.hotelBooking_update = async (connection, api_booking_id, responseJSON, booking_status, booking_id) => {
    try {
        console.log("api_booking_id:", api_booking_id);
        console.log("responseJSON:", responseJSON);
        console.log("booking_status:", booking_status);
        console.log("booking_id:", booking_id);

        if (!booking_id) {  // Checks for null, undefined, or empty values
            return {
                success: false,
                message: "No booking"
            };
        }

        let sql = `
            UPDATE hotel_booking 
            SET api_booking_id = ?, responseJSON = ?, booking_status = ?
            WHERE id = ?
        `;

        const values = [api_booking_id, JSON.stringify(responseJSON), booking_status, booking_id];

        // Execute the query
        const [result] = await connection.execute(sql, values);
        console.log("SQL Execution Result:", result);

        if (result.affectedRows > 0) {
            console.log("Booking updated successfully:", booking_id);
            return {
                success: true,
                message: "Booking updated successfully",
                bookingId: booking_id
            };
        } else {
            return {
                success: false,
                message: "No booking found with the given ID"
            };
        }
    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.hotel_booking_session = async (connection, bookingId, bookingStatus, booking_response, Id) => {
    try {
        console.log("Updating hotel booking session:", { bookingId, bookingStatus, booking_response, Id });

        if (!bookingId) {  // Handles null, undefined, or empty values
            return {
                error: true,
                message: "Booking Id is null or invalid"
            };
        }

        const sql = `
            UPDATE hotel_booking_session 
            SET bookingStatus = ?, booking_response = ?, bookingId = ?
            WHERE id = ?
        `;

        const values = [bookingStatus, JSON.stringify(booking_response), bookingId, Id];

        // Execute the query
        const [result] = await connection.execute(sql, values);
        console.log("SQL Execution Result:", result);

        if (result.affectedRows > 0) {
            console.log("Booking session updated successfully:", bookingId);
            return {
                success: true,
                message: "Booking session updated successfully"
            };
        } else {
            console.warn("No booking session found with the given ID:", Id);
            return {
                success: false,
                message: "No booking session found with the given ID"
            };
        }
    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.hotelBooking = async (correlationId, formattedResponse) => {
    console.log(correlationId);
    console.log(JSON.stringify(formattedResponse, null, 2)); // Log formatted JSON

    const apiUrl = `${config.HotelBooking}`;
    const headers = {
        "correlationId": correlationId,
        "AccountId": process.env.hotel_AccountId,
        "APIKEY": process.env.hotel_APIKEY,
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(formattedResponse) // Ensure JSON format
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Hotel Booking Response:", data);
        return {error:false ,data:data};
    } catch (error) {
        console.error("Error fetching hotel booking results:", error.message);
        return { error: true, message: error.message };
    }
};

hotelServices.bookingData = async (connection, bookingId) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM hotel_booking WHERE api_booking_id = ?`, [bookingId]);
        if (rows.length === 0) {
            return { success: false, message: "No data found for the given correlationId" };
        }

        // console.log("Fetched session data:", rows[0]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error("fetchSearchSessionData Error:", error.message);
        return { success: false, message: error.message };
    }
};

hotelServices.BookingCancel = async (bookingId, correlationId) => {
    console.log(bookingId);
    console.log(correlationId);

    let key = {
        "bookingId": bookingId
    }
    const apiUrl = `${config.BookingCancel}`;
    const headers = {
        "correlationId": correlationId,
        "AccountId": process.env.hotel_AccountId,
        "APIKEY": process.env.hotel_APIKEY,
        "Content-Type": "application/json"
    };
    console.log(headers)
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(key)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Hotel Booking Response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching hotel booking results:", error.message);
        return { error: true, message: error.message };
    }
};

// hotelServices.hotelBooking_CancellationUpdate = async (connection, api_booking_id, booking_status,responseJSON) => {
//     try {
//         const sql = `
//             UPDATE hotel_booking
//             SET  cancellationResponse = ?, booking_status = ?
//             WHERE api_booking_id = ?
//         `;
//
//         const values = [JSON.stringify(responseJSON), booking_status,api_booking_id];
//
//         // Execute the query
//         const [result] = await connection.execute(sql, values);
//
//         if (result.affectedRows > 0) {
//             console.log("Booking updated successfully:", api_booking_id);
//             return {
//                 success: true,
//                 message: "Booking Cancelled  successfully",
//                 bookingId: api_booking_id
//             };
//         } else {
//             return {
//                 success: false,
//                 message: "No booking found with the given ID"
//             };
//         }
//     } catch (error) {
//         console.error("Database Error:", error);
//         return {
//             success: false,
//             message: "Database operation failed: " + error.message
//         };
//     }
// };

hotelServices.hotelBooking_CancellationUpdate = async (connection, api_booking_id, booking_status, responseJSON) => {
    try {
        const sql = `
            UPDATE hotel_booking 
            SET cancellationResponse = ?, booking_status = ?
            WHERE api_booking_id = ?
        `;

        // Ensure responseJSON is a valid JSON string
        const values = [JSON.stringify(responseJSON), booking_status, api_booking_id];

        console.log("Executing SQL:", sql);
        console.log("With Values:", values);

        // Execute the query
        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            console.log("Booking updated successfully:", api_booking_id);
            return {
                success: true,
                message: "Booking Cancelled successfully",
                bookingId: api_booking_id
            };
        } else {
            return {
                success: false,
                message: "No booking found with the given ID"
            };
        }
    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.hotelBooking_CancellationUpdate2 = async (connection, api_booking_id, booking_status,responseJSON) => {
    try {

        const sql = `
            UPDATE hotel_booking 
            SET  cancellationResponse = ?
            WHERE api_booking_id = ?
        `;

        const values = [JSON.stringify(responseJSON),api_booking_id];

        // Execute the query
        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            console.log("Booking updated successfully:", api_booking_id);
            return {
                success: true,
                message: "Booking Cancelled  successfully",
                bookingId: api_booking_id
            };
        } else {
            return {
                success: false,
                message: "No booking found with the given ID"
            };
        }
    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
};

hotelServices.insertBookingDetails = async (connection, bId, paxType, salutation, firstName, lastName, childAge, passportNumber) => {
    try {
        const sql = `
            INSERT INTO hotel_bookingdetails (
                bId, paxType, salutation, firstName, lastName, childAge, passportNumber   
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            bId, paxType, salutation, firstName, lastName, childAge, passportNumber,
        ];

        // Execute the query
        const [result] = await connection.execute(sql, values);
        return {
            success: true,
            message: "Booking successfully inserted"
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            success: false,
            message: "Database operation failed: " + error.message
        };
    }
}
module.exports = hotelServices;