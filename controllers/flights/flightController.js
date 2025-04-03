const flightController = {};
const moment = require("moment");
require("moment-timezone")
const connectToDatabase = require("../../db/connection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {sign} = require("jsonwebtoken");
const flightServices = require("../../services/flights/flights.services");
const axios = require('axios');
const adminService = require("../../services/admin/admin.service");
const mailFunc = require("../../utils/mails");
const agentServices = require("../../services/client/index.services");
const whatsappMessage = require("../admin/whatsappMessage")

flightController.searchPage = (req, res) => {
    console.log(req.agent)
    if(req.agent.SubUser_email){
        res.render("flights/searchPage", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/searchPage", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.bookFlight = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/bookFlight", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/bookFlight", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.bookFlight  = async(req,res) => {
    let tdate = req.session.tdate;
    let agentEmail = req.agent.agentEmail;
    let traceId = req.session.traceId;
    console.log("&&&&&&")
    console.log(req.session)

    const connection = await connectToDatabase();
    // const password = generatePassword(8);

    let [recordset] = await flightServices.bookFlight(connection, traceId, agentEmail);

        if (recordset.length === 0) {
            res.json({error: true, message: "data nhi mila", recordset: []});
        }
        else {


            res.render("flights/bookFlight",  {agentEmail: req.agent.agentEmail, markup: recordset[0].markupValue, data: recordset[0].searchObject, platformFee: recordset[0].platformFee, platformTax: recordset[0].platformTax, tdate, traceId : recordset[0].traceId})


        }

}


flightController.flightResults = (req, res) => {
    res.render("flights/searchResults",{agentEmail: req.agent.agentEmail, userType: req.agent.userType} )
}

flightController.roundFlightResults = (req, res) => {
    res.render("flights/roundtripSearchResults", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
}

flightController.AirSell = async(req,res) => {
    console.log(req.body);

    let {traceId, flightKey, adult, child, infant, flight} = req.body

    let flights = JSON.parse(flight)
    let response = '';

    let payload = ''

    try
    {

    let apiUrl = `http://trvlnxtgateway.parikshan.net/api/AirSell`;


     payload = {
        "trackID": `${traceId}`,
        "flightKeys": [
        `${flightKey}`
        ],
        "paxType": {
          "adult": adult,
          "child": child,
          "infant": infant
        },
        "flights": flights
      }

    response = await axios.post(apiUrl, payload,{
           headers: {
               'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
               'Content-Type': 'application/json'
           }
       });

      console.log(response);

      if(response.data.ResponseStatusType.Success === true)
      {
             res.json({error: false, ResponseStatus: 1, message : "AirSell Success", response: {response : response.data}})
      }
      else
      {
        res.json({error: true, ResponseStatus : 14, response : {response : response.data}})
      }

    }
    catch(e)
    {
        console.log(e)
        res.json({error: true, ResponseStatus : 14, response : e})
    }

}

flightController.AirSellTwoWay = async(req,res) => {
    console.log(req.body);

    let {traceId, flightKeyOnward,flightKeyReturn, adult, child, infant, flights} = req.body

    // let flights = flight
    let response = '';

    let payload = ''

    console.log("123")
    try
    {

        let apiUrl = `http://trvlnxtgateway.parikshan.net/api/AirSell`;


        //console.log("123")
        payload = {
            "trackID": `${traceId}`,
            "flightKeys":[
                `${flightKeyOnward}`,
                `${flightKeyReturn}`,
           ] ,
            "paxType": {
                "adult": adult,
                "child": child,
                "infant": infant
            },
            "flights": JSON.parse(flights)
        }

        console.log(payload)
        response = await axios.post(apiUrl, payload,{
            headers: {
                'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response);

        if(response.data.ResponseStatusType.Success === true)
        {
            res.json({error: false, ResponseStatus: 1, message : "AirSell Success", response: {response : response.data}})
        }
        else
        {
            res.json({error: true, ResponseStatus : 14, response : {response : response.data}})
        }

    }
    catch(e)
    {
        console.log(e)
        res.json({error: true, ResponseStatus : 14, response : e})
    }

}

flightController.ticket_old = async(req,res) => {
    console.log(req.body)
    let {agentId}=req.agent
    let {traceId, flight, sellKey, passengers, email, mobile, hold, revised, totalAdult, totalChild, totalInfant, riyaTrip} = req.body
    let response = '';
    let flights = JSON.parse(flight);
    let pax = JSON.parse(passengers);
    let connection
    let holdOption = (hold === "true") ? true : false;

    let revisedOption = (revised === "true") ? true : false;
    try
    {
        let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Booking`;
      response  = await axios.post(apiUrl, {
        "trackID": `${traceId}`,
        "sellKey": `${sellKey}`,
        "tripType": `${riyaTrip}`,
        "paymentMode": "1",
        "IsHold": false,
        "Isfarerevised": revisedOption,
        "paxType": {
          "adult": totalAdult,
          "child": totalChild,
          "infant": totalInfant
        },
        "flights": flights,
        "passengers": pax,
        "addressDetail": {
          "contactNumber": `${mobile}`,
          "emailId": `${email}`
        }
      },{
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
            'Content-Type': 'application/json'
        }
    });

    console.log(response);

    if(response.data.ResponseStatusType.Success === true)
    {
      
            // add to database all information

           
            try {
                let total_no_of_pax=parseInt(totalAdult)+parseInt(totalChild)+parseInt(totalInfant);
                let pnr=response.data.Flights[0].AirlinePNR
                let gdspnr = response.data.GDSPNR
                const booking_date_time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss")
                let response_json=response.data
                response_json=JSON.stringify(response_json)
                let total_base_fare = 0;
                let total_tax = 0;
                let total_gross_fare = 0;
                let total_net_fare = 0;
                
                response.data.Flights.forEach(flight => {
                    total_base_fare += flight.BasicFare;
                    total_tax += flight.TotalTax;
                    total_gross_fare += flight.GrossFare;
                    total_net_fare += flight.NetAmount;
                });
                
                console.log("Total Base Fare:", total_base_fare);
                console.log("Total Tax:", total_tax);
                console.log("Total Gross Fare:", total_gross_fare);
                console.log("Total Net Fare:", total_net_fare);
                console.log(total_no_of_pax,pnr,total_base_fare,total_tax,total_gross_fare,total_net_fare)
                console.log(response.data.Passengers[0].FirstName)
                connection = await connectToDatabase();

                let [addData] = await flightServices.addFlightBookingData(connection,agentId,total_no_of_pax,totalAdult,totalChild,totalInfant,gdspnr,booking_date_time,response_json,total_base_fare,total_tax,total_gross_fare,total_net_fare,pnr);
                let[getbookingId]=await flightServices.getBookingId(connection)
                let booking_id=getbookingId[0].booking_id
              
                for(let trip = 0; trip < response.data.Flights.length; trip++)
                {
                    let origin=response.data.Flights[trip].OriginDestination.Departure

                    let destination=response.data.Flights[trip].OriginDestination.Arrival
                    let flightNumber=response.data.Flights[trip].Segments[0].FlightNumber
                    let flightName=response?.data?.Flights?.[trip]?.Segments?.[0]?.Carrier || 'no'
                    let iataCode=response?.data?.Flights?.[trip]?.Segments?.[0]?.Carrier || 'no'
                    let departureDate=response.data.Flights[trip].OriginDestination.DepartureDateTime
                    let arrivalDate=response.data.Flights[trip].OriginDestination.ArrivalDateTime
                    let duration=response.data.Flights[trip].OriginDestination.TotalTime
                    let departureTerminal=response.data.Flights[trip].Segments[0].DepartureTerminal
                    let arrivalTerminal=response.data.Flights[trip].Segments[0].ArrivalTerminal
                    let fareName=response.data.Flights[trip].FareName
                    let basicFare = response.data.Flights[trip].BasicFare
                    let totalTax = response.data.Flights[trip].TotalTax
                    let totalFare = response.data.Flights[trip].TotalFare
                    let netAmount = response.data.Flights[trip].NetAmount
                    let grossFare = response.data.Flights[trip].GrossFare
                    let airlinePNR = response.data.Flights[trip].AirlinePNR
                    let flightKey = response.data.Flights[trip].FlightKey
                    let baggage = `${response?.data?.Flights?.[trip]?.Segments[0]?.Baggages?.[0]?.Weight || '15'}${response?.data?.Flights?.[trip]?.Segments?.[0]?.Baggages?.[0]?.Unit || 'KG'}`
                    let cabinBaggage = response.data.Flights[trip].Segments[0].CabinBaggage
                 
                for(let i=0; i<response.data.Passengers.length; i++){
                    let passengerInfo=response.data.Passengers[i]
                    let title=passengerInfo.Title
                    let firstName=passengerInfo.FirstName
                    let lastName=passengerInfo.LastName
                    let paxType=passengerInfo.PaxType
                    let dateOfBirth=passengerInfo.DateOfBirth
                    let passportNo=passengerInfo.PassportDetail.PassportNo
                    let passportExpiry=passengerInfo.PassportDetail.PassportExpiry
                    let passportIssueCountry=passengerInfo.PassportDetail.PassportIssueCountry
                    let barcodes=passengerInfo.BarCodes[trip]
                    barcodes=JSON.stringify(barcodes)
                    let bookingStatus="Ticketed"
                    let ticketStatus="Ticketed"
                    let[addBookingDetails]=await flightServices.addFlightBookingDetails(connection,booking_id,title,firstName,lastName,paxType,dateOfBirth,passportNo,passportExpiry,passportIssueCountry,barcodes,origin,destination,flightNumber,flightName,iataCode,departureDate,arrivalDate,duration,departureTerminal,arrivalTerminal,fareName,bookingStatus,ticketStatus)
                }
                let[addTrip]=await flightServices.addTrip(connection,booking_id,origin,destination,departureDate,arrivalDate,duration,basicFare,totalTax,totalFare,netAmount,grossFare,airlinePNR,baggage,cabinBaggage, departureTerminal, arrivalTerminal, flightKey, fareName, iataCode)
              
            }
                res.json({error: false, response: response.data, message: "Ticket Successfully", bookingNo : booking_id})
            } catch (e) {
                console.log('-----', e.message)
                return res.send({responseCode: 1, error: true, warning: false, message: "Error Occurred - " + e.message});
            }
            finally {
                if (connection) connection.release();  // Return the connection to the pool
            }


            // res.json({error: false, response: response.data.response, message: "Ticket Successfully"})
    }
    else
    {
        res.json({error: true, response: response.data, message: "Ticket Failed"})
    }
    }
    catch(e)
    {
        console.log(e);
        res.json({error: true, response: response.data, message: e.message})
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
}


}


flightController.ticket = async (req, res) => {
    // console.log("Agent",req.agent)
    let tt;
    let agent_email = req.agent.agentEmail;
    let company_id = "my compnay";
    let agent_name = req.agent.agentName;
    let agent_Id = req.agent.agentId;


    let transaction;
    // console.log("Body",req.body);

    let {
        traceId,
        bookingData,
        trips,
        allPax,
        segmentsArray,
        flight,
        sellKey,
        passengers,
        email,
        mobile,
        hold,
        revised,
        totalAdult,
        totalChild,
        totalInfant,
        riyaTrip,
        otherData
    } = req.body

    let response = '';

    let holdOption = (hold === "true") ? true : false;

    let revisedOption = (revised === "true") ? true : false;

    let otherDataParsed = JSON.parse(otherData);
    let bookingDataParsed = JSON.parse(bookingData);
    let passengerDataParsed = JSON.parse(allPax);
    let tripsParsed = JSON.parse(trips);
    let flights = JSON.parse(flight);
    let pax = JSON.parse(passengers);

    let origin = otherDataParsed.origin
    let destination = otherDataParsed.destination


    const apiUrl = 'http://trvlnxtgateway.parikshan.net/api/Booking';
    try {

        transaction = await connectToDatabase();

        let [agentData] = await agentServices.GetAgentData(transaction, agent_Id);
        // console.log(agentData[0].mobile)
        //console.log(tripsParsed[0])
        //console.log(bookingDataParsed)
        //console.log(flights[0].segments[0].arrivalDateTime);
        //console.log(flights[flights.length - 1].segments[flights[flights.length - 1].segments.length - 1].arrivalDateTime);
        console.log(pax)
        let agent_phone_no = agentData[0].mobile;
        let airline_name = tripsParsed[0].airline_name
        let flight_number = tripsParsed[0].flight_number
        let departure = flights[0].departureDateTime
        let arrival = flights[flights.length - 1].segments[flights[flights.length - 1].segments.length - 1].arrivalDateTime
        let departureAirport = tripsParsed[0].departure_airport_name
        let arrivalAirport = tripsParsed[0].arrival_airport_name
        let sector = `${flights[0].departure} - ${flights[0].arrival}`
        let totalPassenger = bookingDataParsed.total_no_of_pax
        let amount = bookingDataParsed.agent_amount
// For Departure
        let departureDate = new Date(departure);

// Extract components for departure
        let depYear = departureDate.getFullYear();
        let depMonth = String(departureDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let depDay = String(departureDate.getDate()).padStart(2, '0');
        let depHours = String(departureDate.getHours()).padStart(2, '0');
        let depMinutes = String(departureDate.getMinutes()).padStart(2, '0');

// Format departure date-time to "DD-MM-YYYY HH:mm"
        let formattedDeparture = `${depDay}-${depMonth}-${depYear} ${depHours}:${depMinutes}`;
        let TravelDate = `${depDay}-${depMonth}-${depYear}`;

// For Arrival
        let arrivalDate = new Date(arrival);

// Extract components for arrival
        let arrYear = arrivalDate.getFullYear();
        let arrMonth = String(arrivalDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let arrDay = String(arrivalDate.getDate()).padStart(2, '0');
        let arrHours = String(arrivalDate.getHours()).padStart(2, '0');
        let arrMinutes = String(arrivalDate.getMinutes()).padStart(2, '0');

// Format arrival date-time to "DD-MM-YYYY HH:mm"
        let formattedArrival = `${arrDay}-${arrMonth}-${arrYear} ${arrHours}:${arrMinutes}`;


        const passengerNames = pax.map(pax => {
            return `${pax.title} ${pax.firstName} ${pax.lastName}`.trim();
        });

        // console.log(passengerNames);


        // Join the names into a single string separated by commas
        const passengerNamesString = passengerNames.join(', ');


        const handleApiCall = async (url, payload, header) => {
            try {
                const response = await axios.post(url, payload, header);
                return response;
            } catch (error) {
                console.error(`Error calling ${url}:`, error.message);
                return {
                    "Response": {
                        "B2B2BStatus": false,
                        "Error": {
                            "ErrorCode": 0,
                            "ErrorMessage": error.message
                        },
                        "ResponseStatus": 0,
                        "TraceId": `${traceId}`,
                        "Response": null
                    }
                }; // Default error response
            }
        };


        const header = {
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                'Content-Type': 'application/json'
            }
        }

        const payload = {
            "trackID": `${traceId}`,
            "sellKey": `${sellKey}`,
            "tripType": `${riyaTrip}`,
            "paymentMode": "1",
            "IsHold": false,
            "Isfarerevised": revisedOption,
            "paxType": {
                "adult": totalAdult,
                "child": totalChild,
                "infant": totalInfant
            },
            "flights": flights,
            "passengers": pax,
            "addressDetail": {
                "contactNumber": `${mobile}`,
                "emailId": `${email}`
            }
        };

        try {
            const ticketResponse = await handleApiCall(apiUrl, payload, header);

            // Ensure the response is valid before accessing ResponseStatus
            if (ticketResponse?.data?.Response?.ResponseStatus === 1) {
                response = ticketResponse; // Success response
            } else {
                response = ticketResponse; // Push failure response for tracking
            }
        } catch (error) {
            console.error('Error in LCC ticket API call:', error);
            response = {
                Response: {
                    B2B2BStatus: false,
                    Error: {
                        ErrorCode: error?.response?.status || 500,
                        ErrorMessage: error?.message || 'API request failed'
                    },
                    ResponseStatus: 0,
                    TraceId: traceId,
                    Response: null
                }
            }; // Default error response
        }


        let isDomestic = 1;

        //console.log(response.data);

        if (response?.data?.ResponseStatusType?.Success === true) {

            let ticketStatus = 'SUCCESS';


            let apiSource = 'RIYA';
            let apiBookingId = response?.data?.OrderId || 'Not found';
            let bookingResponseJson = JSON.stringify(response.data);
            let ticketResponseJson = JSON.stringify(response.data);
            let remarks = '';
            let PNR = response?.data?.Flights[0].AirlinePNR

            let GDSPNR = response?.data?.GDSPNR || null
            let hold_til_date = response?.data?.HoldDate || null


            let tokenId = response?.data?.TrvlnxtPNR || 'test'

            let pp = 0;

            if (req.agent.SubUser_email) {
                let sub_email = req.agent.SubUser_email;
                let bookingId = await insertTicketBookingData1(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "123456", "wallet", "Success", remarks, 0, ticketStatus, 'D', tokenId, agent_phone_no, isDomestic, agent_name, sub_email,hold_til_date,GDSPNR)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = response?.data?.Flights?.[trip]?.AirlinePNR || 'TNAR12W7FP'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)
                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        pp++;

                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]
                        let wytkt = `${bookingId}${pax}${pp}`
                        let pax_id = pax;
                        let ticketNo = response.data.Passengers[pax].TicketNumber
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, wytkt, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }

                let [sub] = await agentServices.SubAgent(transaction,sub_email)
                let subMobile = sub[0].mobileNo
                let subName = `${sub[0].firstName} ${sub[0].lastName}`
                await whatsappMessage.flightSuccessBooking(agent_phone_no, agent_name, bookingId, airline_name, flight_number, sector, formattedDeparture, formattedArrival, departureAirport, arrivalAirport, PNR, passengerNamesString, totalPassenger)
                await whatsappMessage.flightSuccessBooking(subMobile, subName, bookingId, airline_name, flight_number, sector, formattedDeparture, formattedArrival, departureAirport, arrivalAirport, PNR, passengerNamesString, totalPassenger)
                mailFunc.FlightBookAutoTriggerMail(bookingId,airline_name,flight_number,sector,formattedDeparture,formattedArrival,departureAirport,arrivalAirport,PNR,passengerNamesString,totalPassenger)
                res.json({
                    error: false,
                    "response": response.data,
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id
                });
            }
            else {
                let bookingId = await insertTicketBookingData(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "123456", "wallet", "Success", remarks, 0, ticketStatus, 'D', tokenId, agent_phone_no, isDomestic, agent_name,hold_til_date,GDSPNR)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = response?.data?.Flights?.[trip]?.AirlinePNR || 'TNAR12W7FP'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)

                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        pp++;

                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]
                        let wytkt = `${bookingId}${pax}${pp}`
                        let pax_id = pax;
                        let ticketNo = response.data.Passengers[pax].TicketNumber
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, wytkt, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }

                mailFunc.FlightBookAutoTriggerMail(bookingId,airline_name,flight_number,sector,formattedDeparture,formattedArrival,departureAirport,arrivalAirport,PNR,passengerNamesString,totalPassenger)
                await whatsappMessage.flightSuccessBooking(agent_phone_no, agent_name, bookingId, airline_name, flight_number, sector, formattedDeparture, formattedArrival, departureAirport, arrivalAirport, PNR, passengerNamesString, totalPassenger)

                res.json({
                    error: false,
                    "response": response.data,
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id
                });
            }

        }
        else {
            let ticketStatus = 'Failed';

            let apiSource = 'Not Processed';
            let apiBookingId = 'Not Processed';
            let bookingResponseJson = JSON.stringify(response.data);
            let ticketResponseJson = JSON.stringify(response.data);
            let remarks = response?.data?.ResponseStatusType?.Message || 'Ticket Failed'
            let tokenId = traceId

            if (req.agent.SubUser_email) {
                let sub_email = req.agent.SubUser_email;
                let bookingId = await insertTicketBookingData1(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "12344", "wallet", "Success", remarks, 0, ticketStatus, 'D', tokenId, agent_phone_no, isDomestic, agent_name, sub_email,null,null)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = 'Not Processed'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)

                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]

                        let ticketNo = 'Not Processed'
                        let pax_id = 'Not Processed'
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, ticketNo, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }

                let [sub] = await agentServices.SubAgent(transaction,sub_email)
                let subMobile = sub[0].mobileNo
                let subName = `${sub[0].firstName} ${sub[0].lastName}`
                await whatsappMessage.flightFailedBooking(agent_phone_no, agent_name,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)
                await whatsappMessage.flightFailedBooking(subMobile, subName,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)

                res.json({
                    error: true,
                    "ResponseStatus": 2,
                    "response": response?.data || [],
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id,
                    "message": remarks
                });
            }
            else{
                let bookingId = await insertTicketBookingData(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "12344", "wallet", "Success", remarks, 0, ticketStatus, "D", tokenId, agent_phone_no, isDomestic, agent_name,null,null)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = 'Not Processed'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)

                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]

                        let ticketNo = 'Not Processed'
                        let pax_id = 'Not Processed'
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, ticketNo, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }


                //  await flightMails.failedBooking(bookingId);
                await whatsappMessage.flightFailedBooking(agent_phone_no, agent_name,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)


                res.json({
                    error: true,
                    "ResponseStatus": 2,
                    "response": response?.data || [],
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id,
                    "message": remarks
                });
            }
        }

    } catch (e) {
        console.log(e);
    } finally {
        if (transaction) transaction.release();  // Return the connection to the pool
    }
}

flightController.hold = async(req,res) => {
    let tt;
    let agent_email = req.agent.agentEmail;
    let company_id = "my compnay";
    let agent_name = req.agent.agentName;
    let agent_Id = req.agent.agentId;
    let transaction ;
    console.log(req.body);


    let {traceId, bookingData, trips, allPax, segmentsArray, flight, sellKey, passengers, email, mobile, hold, revised, totalAdult, totalChild, totalInfant, riyaTrip, otherData} = req.body

    let response = '';

    let holdOption = (hold === "true") ? true : false;

    let revisedOption = (revised === "true") ? true : false;

    let otherDataParsed = JSON.parse(otherData);
    let bookingDataParsed = JSON.parse(bookingData);
    let passengerDataParsed = JSON.parse(allPax);
    let tripsParsed = JSON.parse(trips);
    let flights = JSON.parse(flight);
    let pax = JSON.parse(passengers);

    let origin = otherDataParsed.origin
    let destination = otherDataParsed.destination


    const apiUrl = 'http://trvlnxtgateway.parikshan.net/api/Booking';
    try {

        transaction = await connectToDatabase();

        let [agentData] = await agentServices.GetAgentData(transaction, agent_Id);

        let agent_phone_no = agentData[0].mobile;
        let airline_name = tripsParsed[0].airline_name
        let flight_number = tripsParsed[0].flight_number
        let departure = flights[0].departureDateTime
        let arrival = flights[flights.length - 1].segments[flights[flights.length - 1].segments.length - 1].arrivalDateTime
        let departureAirport = tripsParsed[0].departure_airport_name
        let arrivalAirport = tripsParsed[0].arrival_airport_name
        let sector = `${flights[0].departure} - ${flights[flights.length - 1].arrival}`
        let totalPassenger = bookingDataParsed.total_no_of_pax
        let amount = bookingDataParsed.agent_amount
        // For Departure
        let departureDate = new Date(departure);

        // Extract components for departure
        let depYear = departureDate.getFullYear();
        let depMonth = String(departureDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let depDay = String(departureDate.getDate()).padStart(2, '0');
        let depHours = String(departureDate.getHours()).padStart(2, '0');
        let depMinutes = String(departureDate.getMinutes()).padStart(2, '0');

        // Format departure date-time to "DD-MM-YYYY HH:mm"
        let formattedDeparture = `${depDay}-${depMonth}-${depYear} ${depHours}:${depMinutes}`;
        let TravelDate = `${depDay}-${depMonth}-${depYear}`;

        // For Arrival
        let arrivalDate = new Date(arrival);

        // Extract components for arrival
        let arrYear = arrivalDate.getFullYear();
        let arrMonth = String(arrivalDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let arrDay = String(arrivalDate.getDate()).padStart(2, '0');
        let arrHours = String(arrivalDate.getHours()).padStart(2, '0');
        let arrMinutes = String(arrivalDate.getMinutes()).padStart(2, '0');

        // Format arrival date-time to "DD-MM-YYYY HH:mm"
        let formattedArrival = `${arrDay}-${arrMonth}-${arrYear} ${arrHours}:${arrMinutes}`;


        const passengerNames = pax.map(pax => {
            return `${pax.title} ${pax.firstName} ${pax.lastName}`.trim();
        });

        // console.log(passengerNames);


        // Join the names into a single string separated by commas
        const passengerNamesString = passengerNames.join(', ');

        const handleApiCall = async (url, payload, header) => {
            try {
                const response = await axios.post(url, payload, header);
                return response;
            } catch (error) {
                console.error(`Error calling ${url}:`, error.message);
                return {
                    "Response": {
                        "B2B2BStatus": false,
                        "Error": {
                            "ErrorCode": 0,
                            "ErrorMessage": error.message
                        },
                        "ResponseStatus": 0,
                        "TraceId": `${traceId}`,
                        "Response": null
                    }
                }; // Default error response
            }
        };


        const header = {
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                'Content-Type': 'application/json'
            }
        }

        const payload = {
            "trackID": `${traceId}`,
            "sellKey": `${sellKey}`,
            "tripType": `${riyaTrip}`,
            "paymentMode": "1",
            "IsHold": true,
            "Isfarerevised": revisedOption,
            "paxType": {
                "adult": totalAdult,
                "child": totalChild,
                "infant": totalInfant
            },
            "flights": flights,
            "passengers": pax,
            "addressDetail": {
                "contactNumber": `${mobile}`,
                "emailId": `${email}`
            }
        };

        try {
            const ticketResponse = await handleApiCall(apiUrl, payload, header);

            // Ensure the response is valid before accessing ResponseStatus
            if (ticketResponse?.data?.Response?.ResponseStatus === 1) {
                response = ticketResponse; // Success response
            } else {
                response = ticketResponse; // Push failure response for tracking
            }
        } catch (error) {
            console.error('Error in LCC ticket API call:', error);
            response = {
                Response: {
                    B2B2BStatus: false,
                    Error: {
                        ErrorCode: error?.response?.status || 500,
                        ErrorMessage: error?.message || 'API request failed'
                    },
                    ResponseStatus: 0,
                    TraceId: traceId,
                    Response: null
                }
            }; // Default error response
        }


        let isDomestic = 1;

        console.log(response);

        if(response?.data?.ResponseStatusType?.Success === true)
        {

            let ticketStatus = 'HOLD';


            let apiSource = 'RIYA';
            let apiBookingId = response?.data?.OrderId || 'Not found';
            let bookingResponseJson = JSON.stringify(response.data);
            let ticketResponseJson = JSON.stringify(response.data);
            let remarks = '';


            let GDSPNR = response?.data?.GDSPNR || null

            let tokenId = response?.data?.TrvlnxtPNR || 'test'

            let hold_til_date = response?.data?.HoldDate || null
            let pnr = response?.data?.Flights?.[0]?.AirlinePNR || 'TNAR12W7FP'


            let pp = 0;

            if (req.agent.SubUser_email) {
                let sub_email = req.agent.SubUser_email;
                let bookingId = await insertTicketBookingData1(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "123456", "wallet", "Success", remarks, 0, ticketStatus, 'D', tokenId, agent_phone_no, isDomestic, agent_name, sub_email,hold_til_date,GDSPNR)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = response?.data?.Flights?.[trip]?.AirlinePNR || 'TNAR12W7FP'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)
                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        pp++;

                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]
                        let wytkt = `${bookingId}${pax}${pp}`
                        let pax_id = pax;
                        let ticketNo = response.data.Passengers[pax].TicketNumber
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, wytkt, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }

                let [sub] = await agentServices.SubAgent(transaction,sub_email)
                let subMobile = sub[0].mobileNo
                let subName = `${sub[0].firstName} ${sub[0].lastName}`
                await whatsappMessage.flightHoldBooking(agent_phone_no,agent_name,bookingId,airline_name,flight_number,sector,formattedDeparture,formattedArrival,pnr,hold_til_date)
                await whatsappMessage.flightHoldBooking(subMobile,subName,agent_name,bookingId,airline_name,flight_number,sector,formattedDeparture,formattedArrival,pnr,hold_til_date)
                res.json({
                    error: false,
                    "response": response.data,
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id
                });
            }

            else {
                let bookingId =  await insertTicketBookingData(transaction,bookingDataParsed,apiSource,apiBookingId,bookingResponseJson,ticketResponseJson,agent_email,company_id, "123456", "wallet","Success",remarks,0,ticketStatus,'D', tokenId, agent_phone_no, isDomestic, agent_name, hold_til_date, GDSPNR)

                for(let trip =0; trip<tripsParsed.length; trip++) {
                    let pnr = response?.data?.Flights?.[trip]?.AirlinePNR || 'TNAR12W7FP'
                    let sector_id =   await insertTicketSectorDetails(transaction,bookingId,tripsParsed[trip],pnr)
                    for(let seg = 0; seg<tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId,tripsParsed[trip].segments[seg])
                    }

                    for(let pax = 0; pax<passengerDataParsed.length; pax++)
                    {
                        pp++;

                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]
                        let wytkt = `${bookingId}${pax}${pp}`
                        let pax_id = pax;
                        let ticketNo = response.data.Passengers[pax].TicketNumber
                        let booking_detail_id = await insertTicketPassengerData(transaction,bookingId,passengerDataParsed[pax],ticketNo,ticketStatus,ticketStatus,"15KG","7KG",remarks,wytkt, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction,booking_detail_id,passengerDataParsed[pax].ssr)
                    }

                }

                await whatsappMessage.flightHoldBooking(agent_phone_no,agent_name,bookingId,airline_name,flight_number,sector,formattedDeparture,formattedArrival,pnr,hold_til_date)

                res.json({
                    error : false,
                    "response": response.data,
                    "TraceId" : traceId,
                    "bookingId" : bookingDataParsed.trace_id
                });
            }

        }
        else {
            let ticketStatus = 'Failed';

            let apiSource = 'Not Processed';
            let apiBookingId = 'Not Processed';
            let bookingResponseJson = JSON.stringify(response.data);
            let ticketResponseJson = JSON.stringify(response.data);
            let remarks = response?.data?.ResponseStatusType?.Message || 'Ticket Failed'
            let tokenId = traceId

            if (req.agent.SubUser_email) {
                let sub_email = req.agent.SubUser_email;
                let bookingId = await insertTicketBookingData1(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "12344", "wallet", "Success", remarks, 0, ticketStatus, 'D', tokenId, agent_phone_no, isDomestic, agent_name, sub_email,null,null)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = 'Not Processed'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)

                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]

                        let ticketNo = 'Not Processed'
                        let pax_id = 'Not Processed'
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, ticketNo, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }

                let [sub] = await agentServices.SubAgent(transaction,sub_email)
                let subMobile = sub[0].mobileNo
                let subName = `${sub[0].firstName} ${sub[0].lastName}`
                await whatsappMessage.flightFailedBooking(agent_phone_no, agent_name,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)
                await whatsappMessage.flightFailedBooking(subMobile, subName,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)

                res.json({
                    error: true,
                    "ResponseStatus": 2,
                    "response": response?.data || [],
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id,
                    "message": remarks
                });
            }
            else{
                let bookingId = await insertTicketBookingData(transaction, bookingDataParsed, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agent_email, company_id, "12344", "wallet", "Success", remarks, 0, ticketStatus, "D", tokenId, agent_phone_no, isDomestic, agent_name,null,null)

                for (let trip = 0; trip < tripsParsed.length; trip++) {
                    let pnr = 'Not Processed'
                    let sector_id = await insertTicketSectorDetails(transaction, bookingId, tripsParsed[trip], pnr)

                    for (let seg = 0; seg < tripsParsed[trip].segments.length; seg++) {
                        await insertTicketSegmentData(transaction, sector_id, bookingId, tripsParsed[trip].segments[seg])
                    }

                    for (let pax = 0; pax < passengerDataParsed.length; pax++) {
                        let paxFare = tripsParsed[trip].paxPrice[passengerDataParsed[pax].pax_type]

                        let ticketNo = 'Not Processed'
                        let pax_id = 'Not Processed'
                        let booking_detail_id = await insertTicketPassengerData(transaction, bookingId, passengerDataParsed[pax], ticketNo, ticketStatus, ticketStatus, "15KG", "7KG", remarks, ticketNo, pax_id, sector_id, paxFare)
                        await insertSSRData(transaction, booking_detail_id, passengerDataParsed[pax].ssr)
                    }

                }


                //  await flightMails.failedBooking(bookingId);
                await whatsappMessage.flightFailedBooking(agent_phone_no, agent_name,bookingId,airline_name,formattedDeparture,TravelDate,passengerNamesString,"Success",amount)


                res.json({
                    error: true,
                    "ResponseStatus": 2,
                    "response": response?.data || [],
                    "TraceId": traceId,
                    "bookingId": bookingDataParsed.trace_id,
                    "message": remarks
                });
            }
        }

    }
    catch (e)
    {
        console.log(e);
    }
    finally {
        if (transaction) transaction.release();  // Return the connection to the pool
    }
}

flightController.flightResultsApi = async (req, res) => {
    let { from, to, travelDate, fare_type, adults, child, infants, ResultFareType } = req.body;
    console.log(req.body);

    try {

        let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;
        let response = await axios.post(apiUrl, { 
            "Departure": `${from}`, 
            "Arrival": `${to}`, 
            "departureDate": `${travelDate}T00:00:00`, 
            "cabin":"Y",
            "tripType":"O", 
            "preferredAirline": "", 
            "paxType": {
            "adult": adults,
            "child": child,
            "infant": infants
            },
            "stop": {
            "oneStop": false,
            "twoStop": false,
            "nonStop": false
            } 
            },{
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                    'Content-Type': 'application/json'
                }
            });

        req.session.tdate = travelDate;
        if(response.data.ResponseStatusType.Success === true)
            {
        res.json({"ResponseStatus": 1,
            "response": response.data,
            "TraceId":  response.data.TrackID})
        }
        else
        {
            res.json({"ResponseStatus": 2,
                "response": response.data,
                "TraceId":  ""})
        }
    } catch (e) {
        console.log(e)
        res.json({"ResponseStatus": 14, "response": e})
    }
}

flightController.getAllFlights = async (req, res) => {
    let connection;
    try {
        let markup = [];
        let OfferAgentMarkup = 0;
        let PublishAgentMarkup = 0;
        let OfferTDOMarkup = 0;
        let PublishTDOMarkup = 0;
        console.log(req.body)
        console.log(req.agent)

        connection = await connectToDatabase();
        let { from, to, travelDate, fare_type, adults, child, infants, ResultFareType } = req.body;

    
                let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;
              
                let flightClass = ""

                if (parseInt(fare_type) === 2) {
                    flightClass = "ECONOMY"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "FIRST CLASS"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "PREMIUM ECONOMY"
                } else {
                    flightClass = "BUSINESS"
                }

                const tboRequest = await axios.post(apiUrl, { 
                    "Departure": `${from}`, 
                    "Arrival": `${to}`, 
                    "departureDate": `${travelDate}T00:00:00`, 
                    "cabin":"Y",
                    "tripType":"O", 
                    "preferredAirline": "", 
                    "paxType": {
                    "adult": adults,
                    "child": child,
                    "infant": infants
                    },
                    "stop": {
                    "oneStop": false,
                    "twoStop": false,
                    "nonStop": false
                    } 
                    },{
                        headers: {
                            'Accept-Encoding': 'gzip, deflate',
                            'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                            'Content-Type': 'application/json'
                        }
                    });

    


                // Execute both requests concurrently and handle individual errors
                const [tboResponse] = await Promise.allSettled([tboRequest]);

                let parsedTBOData = [];


                // Check if Travelopedia API request was successful
                if (tboResponse.status === "fulfilled") {

                    if (tboResponse.value.data.ResponseStatusType.Success === true) {
                        // Assuming tboResponse.value.data.Response.Results[0] is your flights array

                        let {agentEmail} = req.agent
                        let [mark]  = await flightServices.AgentMarkup(connection,agentEmail)
                        let [mid] =  await flightServices.TdoMarkup(connection)

// Group flights by AirlineCode and FlightNumber
                        let groupedFlights = tboResponse.value.data.Journeys[0].Flights.reduce((acc, flight) => {
                          
                            let mySegments = flight.Segments;
                          
                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime =  flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal:    mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                Terminal:    mySegments[mySegments.length-1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length-1].Carrier,
                                airlineName:  mySegments[mySegments.length-1].Carrier,
                                FlightNumber:  mySegments[mySegments.length-1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });

                               let fare = flight.FareName;
                            

                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
    if (tax?.TaxCode === 'K3') {
        k3Tax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YQ') {
        yqTax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YR') {
        yrTax = tax?.TaxAmount;
    } else if (tax?.TaxAmount !== 'TotalTax') {
        // Sum other taxes excluding K3, YQ, YR, and TotalTax
        otherTaxesSum += tax?.TaxAmount;
    }
});


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }

                                if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


            
                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5/100).toFixed(2);

                            if (mark.length < 1) {
                                //console.log("zero");
                            } else if (mark[0].markup_type === "Percentage") {
                                //console.log("percentage");
                                let markupPercentage = mark[0].markup_amount / 100;
                                PublishAgentMarkup = flight.TotalFare * markupPercentage;
                                OfferAgentMarkup = flight.NetAmount * markupPercentage;
                            } else {
                                //console.log("fixed");
                                PublishAgentMarkup = mark[0].markup_amount;
                                OfferAgentMarkup = mark[0].markup_amount;
                            }

                            if (mid.length < 1) {
                                //console.log("zero");
                            } else{
                                //console.log("percentage");
                                let markupPercentage = mid[0].fees / 100;
                                PublishTDOMarkup = flight.TotalFare * markupPercentage;
                                OfferTDOMarkup = flight.NetAmount * markupPercentage;
                            }

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare) + parseFloat(PublishAgentMarkup) + PublishTDOMarkup,
                                Api_PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare: flight.NetAmount + OfferAgentMarkup + OfferTDOMarkup,
                                Api_OfferedFare: flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Original: flight.NetAmount,
                                Agent_Markup: OfferAgentMarkup,
                                TDO_Markup: OfferTDOMarkup,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});
                        




// Convert grouped flights object to array
                        parsedTBOData = Object.values(groupedFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });



                    }


                }

    
                // Combine parsed data
                const combinedResponse = {
                    ResponseStatus: 1,
                    data: [...parsedTBOData]
                };

                req.session.tdate = travelDate;

                res.json(combinedResponse);
      
    } catch (e) {
        console.log(e);
        res.json({
            ResponseStatus: 14,
            response: e.message
        });
    }finally {
        if(connection){
            connection.release();
        }
    }
};

flightController.getAllFlightsRoundOld = async (req, res) => {
    try {
        let markup = [];
        let agentMarkup = [];
        console.log(req.body)
        let { from, to, travelDate, travelReturnDate, fare_type, adults, child, infants, ResultFareType } = req.body;

    
                let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;
              
                let flightClass = ""

                if (parseInt(fare_type) === 2) {
                    flightClass = "ECONOMY"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "FIRST CLASS"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "PREMIUM ECONOMY"
                } else {
                    flightClass = "BUSINESS"
                }

                const tboRequest = await axios.post(apiUrl, { 
                    "Departure": `${from}`, 
                    "Arrival": `${to}`, 
                    "departureDate": `${travelDate}T00:00:00`, 
                    "arrivalDate": `${travelReturnDate}T00:00:00`, 
                    "cabin":"Y",
                    "tripType":"R", 
                    "preferredAirline": "", 
                    "paxType": {
                    "adult": adults,
                    "child": child,
                    "infant": infants
                    },
                    "stop": {
                    "oneStop": false,
                    "twoStop": false,
                    "nonStop": false
                    } 
                    },{
                        headers: {
                            'Accept-Encoding': 'gzip, deflate',
                            'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                            'Content-Type': 'application/json'
                        }
                    });

    


                // Execute both requests concurrently and handle individual errors
                const [tboResponse] = await Promise.allSettled([tboRequest]);

                let parsedTBOData = [];


                // Check if Travelopedia API request was successful
                if (tboResponse.status === "fulfilled") {

                    if (tboResponse.value.data.ResponseStatusType.Success === true) {
                        // Assuming tboResponse.value.data.Response.Results[0] is your flights array

// Group flights by AirlineCode and FlightNumber
                        let groupedFlights = tboResponse.value.data.Journeys[0].Flights.reduce((acc, flight) => {
                          
                            let mySegments = flight.Segments;
                          
                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime =  flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal:    mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                Terminal:    mySegments[mySegments.length-1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length-1].Carrier,
                                airlineName:  mySegments[mySegments.length-1].Carrier,
                                FlightNumber:  mySegments[mySegments.length-1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });

 
                               let fare = flight.FareName;
                            

                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
    if (tax?.TaxCode === 'K3') {
        k3Tax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YQ') {
        yqTax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YR') {
        yrTax = tax?.TaxAmount;
    } else if (tax?.TaxAmount !== 'TotalTax') {
        // Sum other taxes excluding K3, YQ, YR, and TotalTax
        otherTaxesSum += tax?.TaxAmount;
    }
});


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }

                                       if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


            
                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5/100).toFixed(2);

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare:  flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});

                               let groupedReturnFlights = tboResponse.value.data.Journeys[1].Flights.reduce((acc, flight) => {
                          
                            let mySegments = flight.Segments;
                          
                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime =  flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal:    mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length-1].OriginDestination.Arrival,
                                Terminal:    mySegments[mySegments.length-1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length-1].Carrier,
                                airlineName:  mySegments[mySegments.length-1].Carrier,
                                FlightNumber:  mySegments[mySegments.length-1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });

 
                               let fare = flight.FareName;
                            

                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
    if (tax?.TaxCode === 'K3') {
        k3Tax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YQ') {
        yqTax = tax?.TaxAmount;
    } else if (tax?.TaxCode === 'YR') {
        yrTax = tax?.TaxAmount;
    } else if (tax?.TaxAmount !== 'TotalTax') {
        // Sum other taxes excluding K3, YQ, YR, and TotalTax
        otherTaxesSum += tax?.TaxAmount;
    }
});


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }

                                       if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });
                                    
                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


            
                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5/100).toFixed(2);

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare:  flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});
                        




// Convert grouped flights object to array
                        let onwardFlights = Object.values(groupedFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });

                         let returnFlights = Object.values(groupedReturnFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });

                        parsedTBOData = {
                            onwardFlights,
                            returnFlights
                        }

                    }


                }

    
                // Combine parsed data
                const combinedResponse = {
                    ResponseStatus: 1,
                    response:{data:parsedTBOData},
                    data: parsedTBOData
                };

                req.session.tdate = travelDate;

                res.json(combinedResponse);
      
    } catch (e) {
        console.log(e);
        res.json({
            ResponseStatus: 14,
            response: e.message
        });
    }
};

flightController.getAllFlightsRound = async (req, res) => {
    try {
        let markup = [];
        let PublishAgentMarkup = 0;
        let OfferAgentMarkup = 0;
        let OfferTDOMarkup = 0;
        let PublishTDOMarkup = 0;
        console.log(req.body)
        let {from, to, travelDate, travelReturnDate, fare_type, adults, child, infants, ResultFareType} = req.body;

        let connection;

        try {
            const connection = await connectToDatabase();
            const [country] = await flightServices.GetCountry(connection, from, to)
            console.log("Region", country);
            console.log(country[0]?.JourneyType);

            if (country[0]?.JourneyType === 'I') {


                let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;

                let flightClass = ""

                if (parseInt(fare_type) === 2) {
                    flightClass = "ECONOMY"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "FIRST CLASS"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "PREMIUM ECONOMY"
                } else {
                    flightClass = "BUSINESS"
                }

                const requestData = {
                    "Departure": `${from}`,
                    "Arrival": `${to}`,
                    "departureDate": `${travelDate}T00:00:00`,
                    "arrivalDate": `${travelReturnDate}T00:00:00`,
                    "cabin": "Y",
                    "tripType": "R",
                    "preferredAirline": "",
                    "paxType": {
                        "adult": adults,
                        "child": child,
                        "infant": infants
                    },
                    "stop": {
                        "oneStop": false,
                        "twoStop": false,
                        "nonStop": false
                    }
                };

                const requestHeaders = {
                    'Accept-Encoding': 'gzip, deflate',
                    'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                    'Content-Type': 'application/json'
                };

                console.log('Request Data:', JSON.stringify(requestData, null, 2)); // Pretty-print JSON
                console.log('Request Headers:', requestHeaders);

                const tboRequest = await axios.post(apiUrl, {
                    "Departure": `${from}`,
                    "Arrival": `${to}`,
                    "departureDate": `${travelDate}T00:00:00`,
                    "arrivalDate": `${travelReturnDate}T00:00:00`,
                    "cabin": "Y",
                    "tripType": "R",
                    "preferredAirline": "",
                    "paxType": {
                        "adult": adults,
                        "child": child,
                        "infant": infants
                    },
                    "stop": {
                        "oneStop": false,
                        "twoStop": false,
                        "nonStop": false
                    }
                }, {
                    headers: {
                        'Accept-Encoding': 'gzip, deflate',
                        'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                        'Content-Type': 'application/json'
                    }
                });


                // Execute both requests concurrently and handle individual errors
                const [tboResponse] = await Promise.allSettled([tboRequest]);

                let parsedTBOData = [];

                console.log(tboResponse);

                // Check if Travelopedia API request was successful
                if (tboResponse.status === "fulfilled") {

                    if (tboResponse.value.data.ResponseStatusType.Success === true) {
                        // Assuming tboResponse.value.data.Response.Results[0] is your flights array

                        let {agentEmail} = req.agent
                        let [mark]  = await flightServices.AgentMarkup(connection,agentEmail)
                        let [mid] =  await flightServices.TdoMarkup(connection)

// Group flights by AirlineCode and FlightNumber
                        let groupedFlights = tboResponse.value.data.Journeys[0].Flights.reduce((acc, flight) => {

                            let mySegments = flight.Segments;

                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime = flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal: mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                Terminal: mySegments[mySegments.length - 1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length - 1].Carrier,
                                airlineName: mySegments[mySegments.length - 1].Carrier,
                                FlightNumber: mySegments[mySegments.length - 1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });


                            let fare = flight.FareName;


                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
                            flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
                                if (tax?.TaxCode === 'K3') {
                                    k3Tax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YQ') {
                                    yqTax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YR') {
                                    yrTax = tax?.TaxAmount;
                                } else if (tax?.TaxAmount !== 'TotalTax') {
                                    // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                    otherTaxesSum += tax?.TaxAmount;
                                }
                            });


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }

                                if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                            }


                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5 / 100).toFixed(2);

                            if (mark.length < 1) {
                                //console.log("zero");
                            } else if (mark[0].markup_type === "Percentage") {
                                //console.log("percentage");
                                let markupPercentage = mark[0].markup_amount / 100;
                                PublishAgentMarkup = flight.TotalFare * markupPercentage;
                                OfferAgentMarkup = flight.NetAmount * markupPercentage;
                            } else {
                                //console.log("fixed");
                                PublishAgentMarkup = mark[0].markup_amount;
                                OfferAgentMarkup = mark[0].markup_amount;
                            }

                            if (mid.length < 1) {
                                //console.log("zero");
                            } else{
                                //console.log("percentage");
                                let markupPercentage = mid[0].fees / 100;
                                PublishTDOMarkup = flight.TotalFare * markupPercentage;
                                OfferTDOMarkup = flight.NetAmount * markupPercentage;
                            }

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare) + parseFloat(PublishAgentMarkup) + PublishTDOMarkup,
                                Api_PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare: flight.NetAmount + OfferAgentMarkup + OfferTDOMarkup,
                                Api_OfferedFare: flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Original: flight.NetAmount,
                                Agent_Markup: OfferAgentMarkup,
                                TDO_Markup: OfferTDOMarkup,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});

                        let groupedReturnFlights = tboResponse.value.data.Journeys[1].Flights.reduce((acc, flight) => {

                            let mySegments = flight.Segments;

                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime = flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal: mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                Terminal: mySegments[mySegments.length - 1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length - 1].Carrier,
                                airlineName: mySegments[mySegments.length - 1].Carrier,
                                FlightNumber: mySegments[mySegments.length - 1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });


                            let fare = flight.FareName;


                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
                            flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
                                if (tax?.TaxCode === 'K3') {
                                    k3Tax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YQ') {
                                    yqTax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YR') {
                                    yrTax = tax?.TaxAmount;
                                } else if (tax?.TaxAmount !== 'TotalTax') {
                                    // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                    otherTaxesSum += tax?.TaxAmount;
                                }
                            });


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }

                                if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5 / 100).toFixed(2);

                            if (mark.length < 1) {
                                //console.log("zero");
                            } else if (mark[0].markup_type === "Percentage") {
                                //console.log("percentage");
                                let markupPercentage = mark[0].markup_amount / 100;
                                PublishAgentMarkup = flight.TotalFare * markupPercentage;
                                OfferAgentMarkup = flight.NetAmount * markupPercentage;
                            } else {
                                //console.log("fixed");
                                PublishAgentMarkup = mark[0].markup_amount;
                                OfferAgentMarkup = mark[0].markup_amount;
                            }

                            if (mid.length < 1) {
                                //console.log("zero");
                            } else{
                                //console.log("percentage");
                                let markupPercentage = mid[0].fees / 100;
                                PublishTDOMarkup = flight.TotalFare * markupPercentage;
                                OfferTDOMarkup = flight.NetAmount * markupPercentage;
                            }

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare) + parseFloat(PublishAgentMarkup) + PublishTDOMarkup,
                                Api_PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare: flight.NetAmount + OfferAgentMarkup + OfferTDOMarkup,
                                Api_OfferedFare: flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Original: flight.NetAmount,
                                Agent_Markup: OfferAgentMarkup,
                                TDO_Markup: OfferTDOMarkup,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});


// Convert grouped flights object to array
                        let onwardFlights = Object.values(groupedFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });

                        let returnFlights = Object.values(groupedReturnFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });

                        parsedTBOData = {
                            onwardFlights,
                            returnFlights
                        }

                    }


                }


                // Combine parsed data
                const combinedResponse = {
                    ResponseStatus: 1,
                    response: {data: parsedTBOData},
                    data: parsedTBOData
                };

                req.session.tdate = travelDate;

                res.json(combinedResponse);
            }
            else {
                console.log("Its Domestic")
                let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;

                let flightClass = ""

                if (parseInt(fare_type) === 2) {
                    flightClass = "ECONOMY"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "FIRST CLASS"
                } else if (parseInt(fare_type) === 6) {
                    flightClass = "PREMIUM ECONOMY"
                } else {
                    flightClass = "BUSINESS"
                }


                ///  FOR ONE WAY  ----->>
                const tboRequest = await axios.post(apiUrl, {
                    "Departure": `${from}`,
                    "Arrival": `${to}`,
                    "departureDate": `${travelDate}T00:00:00`,
                    "cabin": "Y",
                    "tripType": "O",
                    "preferredAirline": "",
                    "paxType": {
                        "adult": adults,
                        "child": child,
                        "infant": infants
                    },
                    "stop": {
                        "oneStop": false,
                        "twoStop": false,
                        "nonStop": false
                    }
                }, {
                    headers: {
                        'Accept-Encoding': 'gzip, deflate',
                        'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                        'Content-Type': 'application/json'
                    }
                });


                // Execute both requests concurrently and handle individual errors
                const [tboResponse] = await Promise.allSettled([tboRequest]);

                let parsedTBOData = [];


                // Check if Travelopedia API request was successful
                if (tboResponse.status === "fulfilled") {

                    if (tboResponse.value.data.ResponseStatusType.Success === true) {
                        // Assuming tboResponse.value.data.Response.Results[0] is your flights array

                        let {agentEmail} = req.agent
                        let [mark]  = await flightServices.AgentMarkup(connection,agentEmail)
                        let [mid] =  await flightServices.TdoMarkup(connection)
// Group flights by AirlineCode and FlightNumber
                        let groupedFlights = tboResponse.value.data.Journeys[0].Flights.reduce((acc, flight) => {

                            let mySegments = flight.Segments;

                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime = flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal: mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                Terminal: mySegments[mySegments.length - 1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length - 1].Carrier,
                                airlineName: mySegments[mySegments.length - 1].Carrier,
                                FlightNumber: mySegments[mySegments.length - 1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });


                            let fare = flight.FareName;


                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
                            flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
                                if (tax?.TaxCode === 'K3') {
                                    k3Tax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YQ') {
                                    yqTax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YR') {
                                    yrTax = tax?.TaxAmount;
                                } else if (tax?.TaxAmount !== 'TotalTax') {
                                    // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                    otherTaxesSum += tax?.TaxAmount;
                                }
                            });


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }

                                if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5 / 100).toFixed(2);

                            if (mark.length < 1) {
                                //console.log("zero");
                            } else if (mark[0].markup_type === "Percentage") {
                                //console.log("percentage");
                                let markupPercentage = mark[0].markup_amount / 100;
                                PublishAgentMarkup = flight.TotalFare * markupPercentage;
                                OfferAgentMarkup = flight.NetAmount * markupPercentage;
                            } else {
                                //console.log("fixed");
                                PublishAgentMarkup = mark[0].markup_amount;
                                OfferAgentMarkup = mark[0].markup_amount;
                            }

                            if (mid.length < 1) {
                                //console.log("zero");
                            } else{
                                //console.log("percentage");
                                let markupPercentage = mid[0].fees / 100;
                                PublishTDOMarkup = flight.TotalFare * markupPercentage;
                                OfferTDOMarkup = flight.NetAmount * markupPercentage;
                            }

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare) + parseFloat(PublishAgentMarkup) + PublishTDOMarkup,
                                Api_PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare: flight.NetAmount + OfferAgentMarkup + OfferTDOMarkup,
                                Api_OfferedFare: flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Original: flight.NetAmount,
                                Agent_Markup: OfferAgentMarkup,
                                TDO_Markup: OfferTDOMarkup,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});


// Convert grouped flights object to array
                        parsedTBOData = Object.values(groupedFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });


                    }


                }

                const combinedResponse = {
                    ResponseStatus: 1,
                    data: [...parsedTBOData]
                };


                ///  FOR RETURN WAY  ----->>

                const tboRequest1 = await axios.post(apiUrl, {
                    "Departure": `${to}`,
                    "Arrival": `${from}`,
                    "departureDate": `${travelReturnDate}T00:00:00`,
                    "cabin": "Y",
                    "tripType": "O",
                    "preferredAirline": "",
                    "paxType": {
                        "adult": adults,
                        "child": child,
                        "infant": infants
                    },
                    "stop": {
                        "oneStop": false,
                        "twoStop": false,
                        "nonStop": false
                    }
                }, {
                    headers: {
                        'Accept-Encoding': 'gzip, deflate',
                        'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                        'Content-Type': 'application/json'
                    }
                });


                // Execute both requests concurrently and handle individual errors
                const [tboResponse1] = await Promise.allSettled([tboRequest1]);

                let parsedTBOData1 = [];


                // Check if Travelopedia API request was successful
                if (tboResponse1.status === "fulfilled") {

                    if (tboResponse1.value.data.ResponseStatusType.Success === true) {
                        // Assuming tboResponse.value.data.Response.Results[0] is your flights array

                        let {agentEmail} = req.agent
                        let [mark]  = await flightServices.AgentMarkup(connection,agentEmail)
                        let [mid] =  await flightServices.TdoMarkup(connection)
// Group flights by AirlineCode and FlightNumber
                        let groupedFlights = tboResponse1.value.data.Journeys[0].Flights.reduce((acc, flight) => {

                            let mySegments = flight.Segments;

                            let airlineCode = flight.ValidatingCarrier;
                            let airlineName = flight.SupplierName;
                            let flightNumber = mySegments[0].FlightNumber;
                            let stops = `${mySegments.length - 1} Stops`;
                            let key = `${airlineCode}_${flightNumber}`;
                            // Add segments to the grouped object
                            let deptTime = flight.OriginDestination.DepartureDateTime;
                            let ArrTime = flight.OriginDestination.ArrivalDateTime;

                            let formattedDuration = calculateDuration(deptTime, ArrTime);

                            let Origin = {
                                CityCode: mySegments[0].OriginDestination.Departure,
                                CityName: mySegments[0].OriginDestination.Departure,
                                AirportCode: mySegments[0].OriginDestination.Departure,
                                AirportName: mySegments[0].OriginDestination.Departure,
                                airlineCode: mySegments[0].Carrier,
                                airlineName: mySegments[0].Carrier,
                                Terminal: mySegments[0].DepartureTerminal,
                                FlightNumber: mySegments[0].FlightNumber,
                                DepDateTime: deptTime,
                                DepTime: convertToTime(deptTime),
                                DepDate: convertToDesiredFormat(deptTime),
                                Time: getTimeOfDay(deptTime)
                            }
                            let Destination = {
                                CityCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                CityName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportCode: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                AirportName: mySegments[mySegments.length - 1].OriginDestination.Arrival,
                                Terminal: mySegments[mySegments.length - 1].ArrivalTerminal,
                                airlineCode: mySegments[mySegments.length - 1].Carrier,
                                airlineName: mySegments[mySegments.length - 1].Carrier,
                                FlightNumber: mySegments[mySegments.length - 1].FlightNumber,
                                ArrDateTime: ArrTime,
                                ArrTime: convertToTime(ArrTime),
                                ArrDate: convertToDesiredFormat(ArrTime),
                                Time: getTimeOfDay(ArrTime)
                            }

                            if (!acc[key]) {
                                acc[key] = {
                                    Supplier: "RIYA",
                                    adults: adults,
                                    childs: child,
                                    infants: infants,
                                    formattedDuration: formattedDuration,
                                    Origin: Origin,
                                    Stops: stops,
                                    Destination: Destination,
                                    AirlineCode: airlineCode,
                                    AirlineName: airlineName,
                                    FlightNumber: flightNumber,
                                    Details: []
                                };
                            }


                            let flightDetails = [];
                            // Fix: Wrap the object in parentheses
                            let previousArrivalTime = null;

                            // Add segments
                            let segments = mySegments.map(segment => {
                                let layoverTime = 0;
                                // Calculate layover time only for segments after the first one
                                if (previousArrivalTime) {
                                    layoverTime = calculateDuration(previousArrivalTime, segment.OriginDestination.DepartureDateTime); // Add 1 to the calculated duration
                                }

                                // Update previous arrival time for the next iteration
                                previousArrivalTime = segment.OriginDestination.ArrivalDateTime;

                                flightClass = segment?.OriginDestination?.Cabin || 'Not Mentioned'


                                let obj = {
                                    ArrivalCityCode: segment.OriginDestination.Arrival,
                                    ArrivalCityName: segment.OriginDestination.Arrival,
                                    DepartureCityCode: segment.OriginDestination.Departure,
                                    DepartureCityName: segment.OriginDestination.Departure,
                                    flightClass: flightClass,
                                    Baggage: segment.Baggages,
                                    FlightNumber: segment.FlightNumber,
                                    CabinBaggage: segment.CabinBaggage,
                                    AirlineCode: segment.Carrier,
                                    AirlineName: segment.Carrier,
                                    DepartureAirportCode: segment.OriginDestination.Departure,
                                    ArrivalAirportCode: segment.OriginDestination.Arrival,
                                    DepartureAirportName: segment.OriginDestination.Departure,
                                    ArrivalAirportName: segment.OriginDestination.Arrival,
                                    DepDateTime: segment.OriginDestination.DepartureDateTime,
                                    ArrDateTime: segment.OriginDestination.ArrivalDateTime,
                                    DepTime: convertToTime(segment.OriginDestination.DepartureDateTime),
                                    ArrTime: convertToTime(segment.OriginDestination.ArrivalDateTime),
                                    DepDate: convertToDesiredFormat(segment.OriginDestination.DepartureDateTime),
                                    ArrDate: convertToDesiredFormat(segment.OriginDestination.ArrivalDateTime),
                                    Duration: calculateDuration(segment.OriginDestination.DepartureDateTime, segment.OriginDestination.ArrivalDateTime),
                                    LayoverTime: layoverTime || 0,
                                    DepartureTerminal: segment.DepartureTerminal,
                                    ArrivalTerminal: segment.ArrivalTerminal
                                }
                                flightDetails.push(obj);
                            });


                            let fare = flight.FareName;


                            let ResultIndex = flight.FlightKey

                            let k3Tax = 0, yqTax = 0, yrTax = 0, otherTaxesSum = 0;

// Loop through the TaxBreakup array
                            flight?.FlightPricingInfo?.FlightTaxDetails?.forEach(tax => {
                                if (tax?.TaxCode === 'K3') {
                                    k3Tax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YQ') {
                                    yqTax = tax?.TaxAmount;
                                } else if (tax?.TaxCode === 'YR') {
                                    yrTax = tax?.TaxAmount;
                                } else if (tax?.TaxAmount !== 'TotalTax') {
                                    // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                    otherTaxesSum += tax?.TaxAmount;
                                }
                            });


                            let adultFare = 0;
                            let childFare = 0;
                            let infantFare = 0;
                            let adultBaseFare = 0;
                            let childBasefare = 0;
                            let infantBaseFare = 0;
                            let adultTotaltax = 0;
                            let childTotalTax = 0;
                            let infantTotalTax = 0;
                            let adultk3Tax = 0, adultyqTax = 0, adultyrTax = 0, adultTaxesSum = 0;
                            let childk3Tax = 0, childyqTax = 0, childyrTax = 0, childTaxesSum = 0;
                            let infantk3Tax = 0, infantyqTax = 0, infantyrTax = 0, infantTaxesSum = 0;

                            for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

                                let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

                                if (paxFare.PaxType === 'ADT') {

                                    adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    adultBaseFare = parseFloat(paxFare.BasicFare);

                                    adultTotaltax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            adultk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            adultyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            adultyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            adultTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }

                                if (paxFare.PaxType === 'CHD') {

                                    childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    childBasefare = parseFloat(paxFare.BasicFare);

                                    childTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            childk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            childyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            childyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            childTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                                if (paxFare.PaxType === 'INF') {

                                    infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                                    infantBaseFare = parseFloat(paxFare.BasicFare);

                                    infantTotalTax = parseFloat(paxFare.TotalTax)

                                    paxFare?.PaxTaxDetails?.forEach(tax => {
                                        if (tax?.TaxCode === 'K3') {
                                            infantk3Tax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YQ') {
                                            infantyqTax = tax?.TaxAmount;
                                        } else if (tax?.TaxCode === 'YR') {
                                            infantyrTax = tax?.TaxAmount;
                                        } else if (tax?.TaxAmount !== 'TotalTax') {
                                            // Sum other taxes excluding K3, YQ, YR, and TotalTax
                                            infantTaxesSum += tax?.TaxAmount;
                                        }
                                    });

                                }
                            }

                            // let fareDifference = parseFloat(flight.Fare.PublishedFare) - parseFloat(flight.Fare.OfferedFare);

                            // let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

                            // let markup_value = 0, markup_percentage = 0;

                            // let journey_type = (markup?.[0]?.CountryCode === 'IN') ? 'Domestic' : 'International';


                            let commission = parseFloat(flight.GrossFare) - parseFloat(flight.NetAmount)

                            let tds = (parseInt(commission) === 0) ? 0 : (commission * 5 / 100).toFixed(2);

                            if (mark.length < 1) {
                                //console.log("zero");
                            } else if (mark[0].markup_type === "Percentage") {
                                //console.log("percentage");
                                let markupPercentage = mark[0].markup_amount / 100;
                                PublishAgentMarkup = flight.TotalFare * markupPercentage;
                                OfferAgentMarkup = flight.NetAmount * markupPercentage;
                            } else {
                                //console.log("fixed");
                                PublishAgentMarkup = mark[0].markup_amount;
                                OfferAgentMarkup = mark[0].markup_amount;
                            }

                            if (mid.length < 1) {
                                //console.log("zero");
                            } else{
                                //console.log("percentage");
                                let markupPercentage = mid[0].fees / 100;
                                PublishTDOMarkup = flight.TotalFare * markupPercentage;
                                OfferTDOMarkup = flight.NetAmount * markupPercentage;
                            }

                            let fareBreakup = {
                                BaseFare: flight.BasicFare,
                                totalTax: flight.TotalTax,
                                k3Tax: k3Tax,
                                yqTax: yqTax,
                                yrTax: yrTax,
                                otherTaxesSum: otherTaxesSum,
                                PublishedFare: parseFloat(flight.TotalFare) + parseFloat(PublishAgentMarkup) + PublishTDOMarkup,
                                Api_PublishedFare: parseFloat(flight.TotalFare),
                                CommissionEarned: commission,
                                TdsOnCommission: tds,
                                IncentiveEarned: 0,
                                OfferedFare: flight.NetAmount + OfferAgentMarkup + OfferTDOMarkup,
                                Api_OfferedFare: flight.NetAmount,
                                Discount: 0,
                                ServiceFee: 0,
                                OtherCharges: 0,
                                Original: flight.NetAmount,
                                Agent_Markup: OfferAgentMarkup,
                                TDO_Markup: OfferTDOMarkup,
                                Adult: {
                                    adultBaseFare: adultBaseFare,
                                    adultTotaltax: adultTotaltax,
                                    adultyqTax: adultyqTax,
                                    adultk3Tax: adultk3Tax,
                                    adultyrTax: adultyrTax,
                                    adultTaxesSum: adultTaxesSum
                                },
                                child: {
                                    childBaseFare: childBasefare,
                                    childTotalTax: childTotalTax,
                                    childyqTax: childyqTax,
                                    childk3Tax: childk3Tax,
                                    childyrTax: childyrTax,
                                    childTaxesSum: childTaxesSum
                                },
                                infant: {
                                    infantBaseFare: infantBaseFare,
                                    infantTotalTax: infantTotalTax,
                                    infantyqTax: infantyqTax,
                                    infantk3Tax: infantk3Tax,
                                    infantyrTax: infantyrTax,
                                    infantTaxesSum: infantTaxesSum
                                }
                            }

                            let Baggage = {
                                Baggage: `${mySegments[0].Baggage.Weight}-${mySegments[0].Baggage.Unit}`,
                                CabinBaggage: mySegments[0].CabinBaggage
                            }


                            acc[key].Details.push({
                                flightDetails,
                                fare: fare,
                                FareBreakup: fareBreakup,
                                Baggage: Baggage,
                                ResultIndex: ResultIndex
                            });


                            return acc;
                        }, {});


// Convert grouped flights object to array
                        parsedTBOData1 = Object.values(groupedFlights).map(group => {
                            return {
                                Supplier: group.Supplier,
                                adults: group.adults,
                                childs: group.childs,
                                infants: group.infants,
                                Stops: group.Stops,
                                TraceId: tboResponse1.value.data.TrackID,
                                totalDuration: group.formattedDuration,
                                Origin: group.Origin,
                                Destination: group.Destination,
                                AirlineCode: group.AirlineCode,
                                AirlineName: group.AirlineName,
                                FlightNumber: group.FlightNumber,
                                Segments: group.Details
                            };
                        });


                    }


                }

                const combinedResponse2 = {
                    ResponseStatus: 1,
                    data: [...parsedTBOData1]
                };


                req.session.tdate = travelDate;

                const finalResponse = {
                    ResponseStatus: 1,
                    Custom: 'YES',
                    data: {
                        onwardFlights: combinedResponse.data,
                        returnFlights: combinedResponse2.data
                    }
                };

                // Send the combined response
                res.json(finalResponse);
            }

        } catch (e) {
            console.log(e);
            return res.json({error: true, message: e.message});
        } finally {
            if (connection) connection.release();  // Return the connection to the pool
        }

    } catch (e) {
        console.log(e);
        res.json({
            ResponseStatus: 14,
            response: e.message
        });
    }
};

function calculateDuration(deptTime, arrTime) {
    const departure = new Date(deptTime);
    const arrival = new Date(arrTime);

    // Calculate the difference in milliseconds
    const durationMs = arrival - departure;

    // Convert milliseconds to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

function convertToTime(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Extract hours and minutes and format as "HH:MM"
    const hours = String(date.getHours()).padStart(2, '0');  // Pad with '0' if necessary
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Pad with '0' if necessary

    return `${hours}:${minutes}`;
}

function convertToDesiredFormat(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Format: "16 Sep, 2024"
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    return formattedDate;
}

function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);  // Get the number of full hours
    const minutes = totalMinutes % 60;  // Get the remaining minutes

    return { hours, minutes };
}

function getTimeOfDay(dateTimeString) {
    const date = new Date(dateTimeString);
    const hours = date.getHours();

    if (hours >= 0 && hours < 6) {
        return 'Night';
    } else if (hours >= 6 && hours < 12) {
        return 'Early Morning';
    } else if (hours >= 12 && hours < 17) {
        return 'Afternoon';
    } else if (hours >= 17 && hours < 21) {
        return 'Evening';
    } else {
        return 'Night';
    }
}

flightController.roundFlightResultsApi = async (req, res) => {
    let { from, to, travelDate, travelReturnDate, fare_type, adults, child, infants, ResultFareType } = req.body;
    console.log(req.body);

    try {

        let apiUrl = `http://trvlnxtgateway.parikshan.net/api/Availability`;
        let response = await axios.post(apiUrl, { 
            "Departure": `${from}`, 
            "Arrival": `${to}`, 
            "departureDate": `${travelDate}T00:00:00`,
            "arrivalDate": `${travelReturnDate}T00:00:00`, 
            "cabin":"Y",
            "tripType":"R", 
            "preferredAirline": "", 
            "paxType": {
            "adult": adults,
            "child": child,
            "infant": infants
            },
            "stop": {
            "oneStop": false,
            "twoStop": false,
            "nonStop": false
            } 
            },{
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                    'Content-Type': 'application/json'
                }
            });

        req.session.tdate = travelReturnDate;
        if(response.data.ResponseStatusType.Success === true)
            {
        res.json({"ResponseStatus": 1,
            "travelDate" : travelDate,
            "travelReturnDate" : travelReturnDate,
            "from" : from,
            "to" : to,
            "response": response.data,
            "TraceId":  response.data.TrackID})
        }
        else
        {
            res.json({"ResponseStatus": 2,
                "travelDate" : travelDate,
                "travelReturnDate" : travelReturnDate,
                "from" : from,
                "to" : to,
                "response": response.data,
                "TraceId":  ""})
        }
    } catch (e) {
        console.log(e)
        res.json({"ResponseStatus": 14,   "travelDate" : travelDate,
            "travelReturnDate" : travelReturnDate,
            "from" : from,
            "to" : to, "response": e})
    }
}

flightController.agentSearchLogs = async (req,res) => {
    console.log(req.body)
    let{agentId}=req.agent
    const { adults, child, infants, ResultFareType, travelDate, travelReturnDate, fare_type, from, to, trip } = req.body;
    let connection;
    try
    {
        const search_date_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        const connection = await connectToDatabase();

        const [data] = await flightServices.agentSearchLogs(connection,
            agentId,
           adults,
           child,
           infants,
           ResultFareType,
           travelDate,
           travelReturnDate,
           fare_type,
           from,
           to,
           trip,
           search_date_time
        );

        return res.json({error: false, message : "DATA inserted sUCCESSFULLY"});
    }
    catch(e)
    {
        console.log(e);
        return res.json({error: true, message : e.message});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.allCities = async (req, res) => {
    let connection
    try {
        const {q} = req.body

         connection = await connectToDatabase();
        // const password = generatePassword(8);

        let [data] = await flightServices.airlines(connection, q);
        console.log(data);
        return res.json({data});
    }
    catch (err)
    {
        console.log(err)
        res.json({error: true, message: err});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }

}

flightController.makeSearchingSession = async (req, res) => {
    let tdate = req.session.tdate;
    const agentEmail = req.agent.agentEmails;
let connection
    req.session.traceId = req.body.traceId;
    console.log(agentEmail);
    console.log(req.session.traceId)
    try {


        connection = await connectToDatabase();

        const [checkResult] = await flightServices.checkSearchingSession(connection,req.body.traceId,'nirbhay.sharmad@gmail.com')

        if (checkResult.length > 0) {
            // Update existing record

            const [data] = await flightServices.updateSearchingSession(connection,
                req.body.markup,
                JSON.stringify(req.body.book),
                req.body.platformFee,
                req.body.platformTax,
                JSON.stringify(req.body.returnBook),
                req.body.returnMarkup,
                req.body.returnId,
                req.body.traceId,
                agentEmail
            );
        } else {
            // Insert new record
            const [data] = await flightServices.insertSearchingSession(connection,
                agentEmail,
                req.body.traceId,
                req.body.markup,
                JSON.stringify(req.body.book),
                req.body.platformFee,
                req.body.platformTax,
                JSON.stringify(req.body.returnBook),
                req.body.returnMarkup,
                req.body.returnId
            );
        }



        req.session.test = req.body;
        res.status(200).send('Redirecting...');
    } catch (error) {
        // Handle error
        console.error('Error:', error);

        res.status(500).send('Internal Server Error');
    } finally {
        if(connection){
            connection.release()
        }
    }
};
//--------------------------------------------------------------------------


flightController.flightResults = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/searchResults",{agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/searchResults",{agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}
flightController.ViewTicketedBookings = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/ticketedBookings",{agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/ticketedBookings",{agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.ViewFailedBookings = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/failedBookings",{agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/failedBookings",{agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.ViewHoldBookings = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/holdBookings",{agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/holdBookings",{agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.ViewReleasedBookings = (req, res) => {
    if(req.agent.SubUser_email){
        res.render("flights/releasedBookings",{agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/releasedBookings",{agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}


flightController.Checkout=async (req,res)=>{
    let{tp}=req.params
    res.render("flights/flight_checkout",{traceId:1,total:tp})
}

flightController.book = async (req,res) => {
    let tdate = '13-05-2002';
    console.log(req.agent)
        if(req.agent.userType === 'Limited User'){
            return res.send({responseCode: 1, message: 'User Not Authorized'})
        }else{
            res.render("flights/flightBook", {markup: 1, book: 1, platformFee: 1, platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.agentEmail,userType:req.agent.userType})
        }
}
flightController.bookbook = async (req,res) => {
    let tdate = '13-05-2002';
    console.log(req.agent)
    if(req.agent.SubUser_email){
        res.render("flights/flightBook", {markup: 1, book: 1, platformFee: 1, platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.SubUser_email,userType:req.agent.userType})
    }else{
        res.render("flights/flightBook", {markup: 1, book: 1, platformFee: 1, platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.agentEmail,userType:req.agent.userType})
    }

}

flightController.Success = async (req, res) => {
    let connection;
    try {
        let {insId,tx,payType,gCharge}= req.params;
        let {agentEmail}=req.agent
         connection = await connectToDatabase();

        let [recordset] = await flightServices.success(connection, insId);

        if (recordset.length === 0) {
            res.json({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
                res.render("flights/flightPaymentSuccess",{agentEmail: agentEmail,  userType: req.agent.userType, insId: insId, tx: tx, gCharge : gCharge , payType: payType, test1: JSON.stringify(recordset[0].data)})

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

flightController.viewTicket = async(req,res) => {
    res.render('flights/printTicketWithoutPrice', {bookingId: req.params.bookingId})
}

flightController.fetchTicketDetails = async (req, res) => {
    let connection;
    try {
        let {bookingId}= req.body;

         connection = await connectToDatabase();

        let [recordset] = await flightServices.ticketDetaisl(connection, bookingId);

        if (recordset.length === 0) {
            res.json({error: true, message: "data nhi mila", recordset: []});
        }
        else
        {
            res.json({error: false, message: "data mil gya", recordset: recordset});
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

flightController.GetTicketedBookings = async (req, res) => {
    let connection;
    try {
        // let {bookingId}= req.body;
        let{agentId}=req.agent
         connection = await connectToDatabase();

        let [recordset] = await flightServices.getTicketedBookings(connection,agentId);

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

flightController.GetTicketedBookingsDetails = async (req, res) => {
    let connection;
    try {
        // let {bookingId}= req.body;
        let {booking_id}=req.params
        let{agentId}=req.agent
        connection = await connectToDatabase();

        let [recordset] = await flightServices.getTicketedBookingsDetails(connection,booking_id);

        if (recordset.length === 0) {
            res.send({error: true, message: "data nhi mila", data: []});
        }
        else
        {
            res.send({error: false, message: "data mil gya", data: recordset});
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

flightController.GetHoldBookings = async (req, res) => {
    let connection;
    try {
        // let {bookingId}= req.body;
        let{agentId}=req.agent
        connection = await connectToDatabase();

        let [recordset] = await flightServices.getHoldBookings(connection,agentId);

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

flightController.GetHoldBookingsDetails = async (req, res) => {
    let connection;
    try {
        // let {bookingId}= req.body;
        let {booking_id}=req.params
        let{agentId}=req.agent
        connection = await connectToDatabase();

        let [recordset] = await flightServices.getTicketedBookingsDetails(connection,booking_id);

        if (recordset.length === 0) {
            res.send({error: true, message: "data nhi mila", data: []});
        }
        else
        {
            res.send({error: false, message: "data mil gya", data: recordset});
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

flightController.AddFlightSearchData = async (req, res) => {
    console.log(req.body);
    let connection;
    try {
        // Extract data from request
        let clientIp = req.headers['x-forwarded-for']?.split(',').shift() || req.connection?.remoteAddress || req.socket?.remoteAddress;
        let { agentId } = req.agent;
        let { from, to, adult, child, infant, travel_date, return_date, fare_type } = req.body;

        // Determine journey type
        let journey_type = return_date ? "roundtrip" : "oneway";

        // Calculate total number of passengers
        let total_no_of_pax = parseInt(adult) + parseInt(child) + parseInt(infant);
        const time = moment().tz(process.env["TIME_ZONE"]).format("YYYY-MM-DD HH:mm:ss");

        // Establish connection to the database
        connection = await connectToDatabase();

        // Call service to add flight search data
        let [recordset] = await flightServices.addFlightSearchData(
            connection, agentId, from, to, total_no_of_pax, adult, child, infant,
            travel_date,return_date, journey_type, fare_type, time, clientIp
        );

        // Send response back to the client
        res.send({ error: false, message: "success", data: recordset });
    } catch (err) {
        console.error(err);
        res.json({ error: true, message: err.message, recordset: [] });
    } finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

flightController.showRazorPayWindow = async (req, res) => {
    console.log(req.body)
    const  tx = new Date().getTime().toString();
    const { finalAmt, name, email, gCharge, contact, CompanyId, paymentMethod, payType, insId } = req.body;
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
            let [result] = await agentServices.addWalletDetails(connection, getWalletId[0].id,'Debit',finalAmt,time,'Wallet','Flight Booked','self')

            res.redirect(`/flights/flightPaymentSuccess/${insId}/${tx}/${paymentMethod}/${gCharge}`);
        } catch (e) {
            console.log('-----', e.message)
            res.redirect(`/flights/flightPaymentFail/${insId}/${tx}/${paymentMethod}`)
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

flightController.flightCheckout = async (req,res)=>{

    console.log(req.session.test);
    res.render("flights/flight_checkout",req.session.test);
}

flightController.goToCheckout = async (req, res) => {
    console.log(req.body);
    let connection
    try {

        connection = await connectToDatabase();

        let [addData] = await flightServices.makeBookingSession(connection,req.body.traceId,JSON.stringify(req.body),req.body.trip);

        req.session.test = req.body;
        res.status(200).send('Redirecting...');
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.RoundFlightResults = (req, res) => {

    if(req.agent.SubUser_email){
        res.render("flights/roundSearchResults", {agentEmail: req.agent.SubUser_email, userType: req.agent.userType})
    }else{
        res.render("flights/roundSearchResults", {agentEmail: req.agent.agentEmail, userType: req.agent.userType})
    }
}

flightController.returnFixedBooking = async (req,res) => {
    let tdate = req.session.tdate;
    if(req.agent.SubUser_email){
        res.render("flights/roundFixedFlightBook", {markup: '1', book: '1', platformFee: '1', platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.SubUser_email,userType:req.agent.userType})
    }else{
        res.render("flights/roundFixedFlightBook", {markup: '1', book: '1', platformFee: '1', platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.agentEmail,userType:req.agent.userType})
    }
}

flightController.returnFixedBook = async (req,res) => {
    let tdate = req.session.tdate;
    if(req.agent.userType === 'Limited User'){
        return res.send({responseCode: 1, message: 'User Not Authorized'})
    }else{
        res.render("flights/roundFixedFlightBook", {markup: '1', book: '1', platformFee: '1', platformTax: 1, tdate, traceId : 1,agentEmail:req.agent.agentEmail,userType:req.agent.userType})
    }
}

const insertTicketBookingData = async (connection, bookingData, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agentEmail, companyId, transactionId, paymentType, paymentStatus, remarks, gatewayCharges, ticketStatus, journey, tokenId, agentPhoneNo, isDomestic, agent_name, holdDate, GDSPNR) => {
    const currentDateInIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const currentDateTimeInIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    let {
        total_no_of_pax,
        total_adult,
        total_child,
        total_infant,
        supplier,
        agent_amount,
        customer_amount,
        trip_type,
        platform_fee,
        platform_tax,
        trace_id,
        email_id,
        mobile_no,
        markup,
        agent_markup,
        commission,
        tds,
        total_ssr_amount
    } = bookingData;

    const sqlQuery = `
        INSERT INTO new_flight_booking (
            booking_date_time, total_no_of_pax, total_adult, total_child,
            total_infant, supplier, api_source, api_booking_id,
            agent_amount, customer_amount, booking_response_json,
            ticket_response_json, agent_email, company_id, transaction_id,
            payment_type, payment_status, trip_type, platform_fee, platform_tax,
            trace_id, remarks, gateway_charges, ticket_status,
            journey, token_id, agent_phone_no, email_id, mobile_no, is_domestic,
            markup, agent_markup, commission, tds, total_ssr_amount, agent_name, hold_date, GDSPNR
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        currentDateTimeInIST,
        total_no_of_pax,
        total_adult,
        total_child,
        total_infant,
        supplier,
        apiSource,
        apiBookingId,
        parseFloat(agent_amount) + parseFloat(gatewayCharges),
        parseFloat(customer_amount) + parseFloat(gatewayCharges),
        bookingResponseJson,
        ticketResponseJson,
        agentEmail,
        companyId,
        transactionId,
        paymentType,
        paymentStatus,
        trip_type,
        platform_fee,
        platform_tax,
        trace_id,
        remarks,
        gatewayCharges,
        ticketStatus,
        journey,
        tokenId,
        agentPhoneNo,
        email_id,
        mobile_no,
        isDomestic,
        markup,
        agent_markup,
        commission,
        tds,
        total_ssr_amount,
        agent_name,
        holdDate,
        GDSPNR
    ];

    console.log(sqlQuery)
    console.log(values)
    try {
        const [result] = await connection.execute(sqlQuery, values);
        return result.insertId; // MySQL returns the ID of the inserted row
    } catch (error) {
        console.error('Error inserting booking data:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

const insertTicketBookingData1 = async (connection, bookingData, apiSource, apiBookingId, bookingResponseJson, ticketResponseJson, agentEmail, companyId, transactionId, paymentType, paymentStatus, remarks, gatewayCharges, ticketStatus, journey, tokenId, agentPhoneNo, isDomestic, agent_name,sub_email) => {
    const currentDateInIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const currentDateTimeInIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    console.log("Data123")
    let {
        total_no_of_pax,
        total_adult,
        total_child,
        total_infant,
        supplier,
        agent_amount,
        customer_amount,
        trip_type,
        platform_fee,
        platform_tax,
        trace_id,
        email_id,
        mobile_no,
        markup,
        agent_markup,
        commission,
        tds,
        total_ssr_amount
    } = bookingData;

    const sqlQuery = `
        INSERT INTO new_flight_booking (
            booking_date_time, total_no_of_pax, total_adult, total_child,
            total_infant, supplier, api_source, api_booking_id,
            agent_amount, customer_amount, booking_response_json,
            ticket_response_json, agent_email, company_id, transaction_id,
            payment_type, payment_status, trip_type, platform_fee, platform_tax,
            trace_id, remarks, gateway_charges, ticket_status,
            journey, token_id, agent_phone_no, email_id, mobile_no, is_domestic,
            markup, agent_markup, commission, tds, total_ssr_amount, agent_name , subUser
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
    `;

    const values = [
        currentDateTimeInIST,
        total_no_of_pax,
        total_adult,
        total_child,
        total_infant,
        supplier,
        apiSource,
        apiBookingId,
        parseFloat(agent_amount) + parseFloat(gatewayCharges),
        parseFloat(customer_amount) + parseFloat(gatewayCharges),
        bookingResponseJson,
        ticketResponseJson,
        agentEmail,
        companyId,
        transactionId,
        paymentType,
        paymentStatus,
        trip_type,
        platform_fee,
        platform_tax,
        trace_id,
        remarks,
        gatewayCharges,
        ticketStatus,
        journey,
        tokenId,
        agentPhoneNo,
        email_id,
        mobile_no,
        isDomestic,
        markup,
        agent_markup,
        commission,
        tds,
        total_ssr_amount,
        agent_name,
        sub_email
    ];

    //console.log(sqlQuery)
    //console.log(values)

    // let [data] = await agentServices.checkSubUser(connection,agentEmail)
    // console.log(data.length)
    // if(data.length > 0){
    //     console.log(data)
    //     console.log("data")
    // }
    // else {
    try {
        const [result] = await connection.execute(sqlQuery, values);
        return result.insertId; // MySQL returns the ID of the inserted row
    } catch (error) {
        console.error('Error inserting booking data:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
    //}

};

const insertTicketPassengerData = async (connection, bookingId, passengerData, ticketNo, bookingStatus, ticketingStatus, checkInBaggage, cabinBaggage,remarks, wyTktNo, pax_id, sector_id, pax_fare) => {
    let {
        salutation,
        first_name,
        last_name,
        gender,
        pax_type,
        date_of_birth,
        address,
        country_code,
        cell_country_code,
        city,
        mobile_no,
        email_id,
        passport_no,
        passport_expiry,
        passport_issue_date,
        passport_issue_country_code,
        total_ssr_amount
    } = passengerData;

    let {
        markup_by_agent_per_pax,
        markup_per_pax,
        commission_per_pax,
        tds_per_pax,
        base_fare,
        total_tax,
        yq_tax,
        yr_tax,
        k3_tax,
        additional_tax,
        published_fare,
        service_fee,
        other_charges,
        transaction_fee
    } = pax_fare;

    const sqlQuery = `
        INSERT INTO new_flight_passengers (
            booking_id, salutation, first_name, last_name, gender, pax_type,
            ticket_no, date_of_birth, passport_no, passport_expiry, nationality,
            booking_status, ticketing_status, email_id, mobile_no, check_in_baggage,
            cabin_baggage, remarks, city, country_code, address, wy_tkt_no,
            markup_per_pax, commission_per_pax, tds_per_pax, base_fare, total_tax,
            stops, yq_tax, yr_tax, k3_tax, additional_tax, published_fare, service_fee,
            other_charges, transaction_fee, total_ssr_amount, pax_id, sector_id,
            markup_by_agent_per_pax
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        bookingId, salutation, first_name, last_name, gender, pax_type,
        ticketNo, date_of_birth, passport_no, passport_expiry, country_code,
        bookingStatus, ticketingStatus, email_id, mobile_no, checkInBaggage,
        cabinBaggage, remarks, city, country_code, address, wyTktNo,
        markup_per_pax, commission_per_pax, tds_per_pax, base_fare, total_tax,
        0, yq_tax, yr_tax, k3_tax, additional_tax, published_fare, service_fee,
        other_charges, transaction_fee, total_ssr_amount, pax_id, sector_id,
        markup_by_agent_per_pax
    ];

    try {
        const [result] = await connection.execute(sqlQuery, values);
        return result.insertId; // Return the ID of the inserted row
    } catch (error) {
        console.error('Error inserting passenger data:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

const insertTicketSectorDetails = async (connection, bookingId, tripData, pnr) => {
    let {
        stops,
        origin,
        destination,
        departure,
        arrival,
        duration,
        result_index,
        departure_terminal,
        arrival_terminal,
        departure_airport_name,
        arrival_airport_name,
        departure_airport_code,
        arrival_airport_code,
        airline_name,
        airline_code,
        flight_number,
        fare_type,
        base_fare,
        total_tax,
        published_fare,
        offered_fare,
        commission,
        tds_on_commission,
        yq_tax,
        yr_tax,
        k3_tax,
        additional_taxes,
        tdo_markup,
        agent_markup,
        service_fee,
        other_charges,
        transaction_fee
    } = tripData;

    const sqlQuery = `
        INSERT INTO new_flight_sectors (
            booking_id,
            origin,
            destination,
            arrival,
            duration,
            result_index,
            departure_terminal,
            arrival_terminal,
            departure_airport_name,
            arrival_airport_name,
            arrival_airport_code,
            departure_airport_code,
            airline_name,
            airline_code,
            base_fare,
            total_tax,
            published_fare,
            offered_fare,
            commission,
            tds_on_commission,
            yq_tax,
            yr_tax,
            k3_tax,
            additional_taxes,
            tdo_markup,
            agent_markup,
            service_fee,
            other_charges,
            transaction_fee,
            gdspnr,
            total_ssr_amount,
            departure,
            flight_number,
            fare_type,
            stops
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        bookingId,
        origin,
        destination,
        arrival,
        duration,
        result_index,
        departure_terminal,
        arrival_terminal,
        departure_airport_name,
        arrival_airport_name,
        arrival_airport_code,
        departure_airport_code,
        airline_name,
        airline_code,
        base_fare,
        total_tax,
        published_fare,
        offered_fare,
        commission,
        tds_on_commission,
        yq_tax,
        yr_tax,
        k3_tax,
        additional_taxes,
        tdo_markup,
        agent_markup,
        service_fee,
        other_charges,
        transaction_fee,
        pnr,
        0, // total_ssr_amount (defaulted to 0)
        departure,
        flight_number,
        fare_type,
        stops
    ];

    try {
        const [result] = await connection.execute(sqlQuery, values);
        return result.insertId; // Return the ID of the inserted row
    } catch (error) {
        console.error("Error inserting sector details:", error);
        throw error;
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

const insertTicketSegmentData = async (connection, sectorId, bookingId, segmentData) => {
    let {
        origin,
        destination,
        departure,
        arrival,
        duration,
        arrival_terminal,
        departure_terminal,
        departure_airport_name,
        arrival_airport_name,
        departure_airport_code,
        arrival_airport_code,
        airline_name,
        airline_code,
        flight_number,
        layover_time
    } = segmentData;

    const sqlQuery = `
        INSERT INTO new_flight_segments (
            sector_id,
            origin,
            destination,
            departure,
            arrival,
            duration,
            arrival_terminal,
            departure_terminal,
            departure_airport_name,
            arrival_airport_name,
            departure_airport_code,
            arrival_airport_code,
            airline_name,
            airline_code,
            flight_number,
            layover_time,
            booking_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        sectorId,
        origin,
        destination,
        departure,
        arrival,
        duration,
        arrival_terminal,
        departure_terminal,
        departure_airport_name,
        arrival_airport_name,
        departure_airport_code,
        arrival_airport_code,
        airline_name,
        airline_code,
        flight_number,
        layover_time,
        bookingId
    ];

    try {
        await connection.execute(sqlQuery, values);
        console.log("Segment data inserted successfully.");
    } catch (error) {
        console.error("Error inserting segment data:", error);
        throw error;
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
};

const insertSSRData = async (connection, bookingDetailId, ssrData) => {
    const sqlQuery = `
        INSERT INTO new_flight_ssr (
            booking_detail_id,
            ssr_type,
            description,
            price,
            remarks,
            origin,
            destination
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    // Insert meal SSRs
    for (let meal of ssrData.meal) {
        const values = [
            bookingDetailId,
            meal.ssr_type,
            meal.description,
            meal.price,
            meal.remarks,
            meal.origin,
            meal.destination
        ];

        try {
            await connection.execute(sqlQuery, values);
            console.log("Inserted meal SSR successfully.");
        } catch (error) {
            console.error("Error inserting meal SSR:", error);
            throw error;
        }
        finally {
            if (connection) connection.release();  // Return the connection to the pool
        }
    }

    // Insert baggage SSRs
    for (let bag of ssrData.baggage) {
        const values = [
            bookingDetailId,
            bag.ssr_type,
            bag.description,
            bag.price,
            bag.remarks,
            bag.origin,
            bag.destination
        ];

        try {
            await connection.execute(sqlQuery, values);
            console.log("Inserted baggage SSR successfully.");
        } catch (error) {
            console.error("Error inserting baggage SSR:", error);
            throw error;
        }
        finally {
            if (connection) connection.release();  // Return the connection to the pool
        }
    }

    if(ssrData.seat){

        for (let seat of ssrData.seat) {
            const values = [
                bookingDetailId,
                seat.ssr_type,
                seat.description,
                seat.price,
                seat.remarks,
                seat.origin,
                seat.destination
            ];
    
            try {
                await connection.execute(sqlQuery, values);
                console.log("Inserted seat SSR successfully.");
            } catch (error) {
                console.error("Error inserting baggage SSR:", error);
                throw error;
            }
            finally {
                if (connection) connection.release();  // Return the connection to the pool
            }
        }
    }
    
};

const insertCancel = async (connection, cancelData, agentEmail) => {
    const sqlQuery = `
        INSERT INTO new_flight_cancel_queue (
            request_type,
            booking_id,
            request_on,
            request_by,
            cancel_status,
            cancel_charges,
            service_charge,
            vat,
            agent_remarks
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const currentDateTimeInIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    // Prepare values
    const values = [
        cancelData.type,
        cancelData.booking_id,
        currentDateTimeInIST,
        agentEmail,
        'Pending', // Default cancel status
        0,         // Default tdo_cancel_charges
        0,         // Default service_charge
        0,         // Default gst
        cancelData.agent_remarks || null, // Optional remarks
    ];

    try {
        const [result] = await connection.execute(sqlQuery, values);
        console.log("Cancel request inserted successfully.");
        return result.insertId; // Return the last inserted ID
    } catch (error) {
        console.error("Error inserting cancel request:", error);
        throw error;
    }finally {
        if(connection){
            connection.release()
        }
    }
};

const insertCancelDetails = async (connection, cancelId, data) => {
    const sqlQuery = `
        INSERT INTO new_flight_cancel_detail (
            cancel_id,
            airline_code,
            ticket_no,
            pnr_no,
            bill_no,
            bill_date,
            travel_date,
            pax_type,
            flight_number,
            passenger_name,
            salutation,
            base_fare,
            yq_tax,
            k3_tax,
            yr_tax,
            sector,
            made_by,
            journey,
            travel_class,
            supplier,
            fare_type,
            airline_pnr,
            passenger_additional_tax,
            markup_per_pax,
            passenger_other_charges,
            passenger_transaction_fee,
            passenger_service_fee,
            commission,
            total_ssr_amount
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        cancelId,
        data.airline_code,
        data.ticket_no,
        data.pnr_no,
        data.bill_no,
        data.bill_date,
        data.travel_date,
        data.pax_type,
        data.flight_number,
        data.passenger_name,
        data.salutation,
        data.base_fare,
        data.yq_tax,
        data.k3_tax,
        data.yr_tax,
        data.sector,
        data.made_by,
        data.journey,
        data.travel_class,
        data.supplier,
        data.fare_type,
        data.airline_pnr,
        data.additional_tax,
        data.markup_per_pax,
        data.other_tax,
        data.transaction_fee,
        data.service_fee,
        data.commission,
        data.total_ssr_amount
    ];

    try {
        const [result] = await connection.execute(sqlQuery, values);
        console.log('Inserted cancel detail successfully.');
        return result.insertId; // Return the last inserted ID
    } catch (error) {
        console.error('Error inserting cancel detail:', error);
        throw error;
    }finally {
        if(connection){
            connection.release()
        }
    }
};


flightController.ticket_booking_details = async (req,res)=>{
    console.log(req.params);
    const data = {
        id: req.params.id,
        agentEmail:req.agent.agentEmail,userType: req.agent.userType
    };
    res.render("flights/ticket_booking_details",data)
}

flightController.failed_booking_details = async (req,res)=>{
    console.log(req.params);
    const data = {
        id: req.params.id,
        agentEmail:req.agent.agentEmail, userType: req.agent.userType
    };
    res.render("flights/failed_booking_details",data)
}

flightController.hold_booking_details = async (req,res)=>{
    console.log(req.params);
    const data = {
        id: req.params.id,
        agentEmail:req.agent.agentEmail, userType: req.agent.userType
    };
    res.render("flights/hold_booking_details",data)
}

flightController.released_booking_details = async (req,res)=>{
    console.log(req.params);
    const data = {
        id: req.params.id,
        agentEmail:req.agent.agentEmail, userType: req.agent.userType
    };
    res.render("flights/released_booking_details",data)
}

flightController.getTicketDetails = async(req,res) => {

    let {bookingId} = req.body;

    let connection;
    try {

        connection = await connectToDatabase();

        let selectSQL = `
      SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,
    b.wy_invoice_number,
    b.hold_date,
    b.GDSPNR,
    b.last_min_agent_markup,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'passenger_booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'passenger_booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'passenger_email_id', p.email_id,
                'passenger_mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'passenger_remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'passenger_base_fare', p.base_fare,
                'passenger_total_tax', p.total_tax,
                'stops', p.stops,
                'passenger_sector_id', p.sector_id,
                'passenger_yq_tax', p.yq_tax,
                'passenger_yr_tax', p.yr_tax,
                'passenger_k3_tax', p.k3_tax,
                'passenger_additional_tax', p.additional_tax,
                'passenger_published_fare', p.published_fare,
                'passenger_service_fee', p.service_fee,
                'passenger_other_charges', p.other_charges,
                'passenger_transaction_fee', p.transaction_fee,
                'passenger_total_ssr_amount', p.total_ssr_amount,
                'passenger_cancel_status_code', p.cancel_status_code,
                'sector_id', p.sector_id,
                'ssr_data', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'ssr_type', ssr.ssr_type,
                            'description', ssr.description,
                            'price', ssr.price,
                            'remarks', ssr.remarks,
                            'origin', ssr.origin,
                            'destination', ssr.destination
                        )
                    )
                    FROM new_flight_ssr ssr
                    WHERE ssr.booking_detail_id = p.booking_detail_id
                )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'sector_base_fare', s.base_fare,
                'sector_total_tax', s.total_tax,
                'sector_published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'sector_commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'sector_yq_tax', s.yq_tax,
                'sector_yr_tax', s.yr_tax,
                'sector_k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'sector_agent_markup', s.agent_markup,
                'sector_service_fee', s.service_fee,
                'sector_other_charges', s.other_charges,
                'sector_transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'sector_total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'stops', s.stops,
                'sector_cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
WHERE 
    b.trace_id = '${bookingId}'
        `;

      let [recordset]  = await connection.execute(selectSQL);

        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch(err)
    {
        console.log(err)
        res.json({error: true, response: []});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.ticket_new = async (req,res)=>{
    console.log(req.params);
    const data = {
        id: req.params.id,
        type : req.params.type,
        agentEmail:req.agent.agentEmail
    };
    res.render("flights/ticket",data)
}

flightController.getTicketedBookings = async(req,res) => {

    let connection;
    try {

        let {agentEmail} = req.agent
        connection = await connectToDatabase();

        let selectSQL = `
      SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,
    b.wy_invoice_number,
    b.last_min_agent_markup,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'passenger_booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'passenger_booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'passenger_email_id', p.email_id,
                'passenger_mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'passenger_remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'passenger_base_fare', p.base_fare,
                'passenger_total_tax', p.total_tax,
                'stops', p.stops,
                'passenger_sector_id', p.sector_id,
                'passenger_yq_tax', p.yq_tax,
                'passenger_yr_tax', p.yr_tax,
                'passenger_k3_tax', p.k3_tax,
                'passenger_additional_tax', p.additional_tax,
                'passenger_published_fare', p.published_fare,
                'passenger_service_fee', p.service_fee,
                'passenger_other_charges', p.other_charges,
                'passenger_transaction_fee', p.transaction_fee,
                'passenger_total_ssr_amount', p.total_ssr_amount,
                'passenger_cancel_status_code', p.cancel_status_code,
                'sector_id', p.sector_id,
                'ssr_data', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'ssr_type', ssr.ssr_type,
                            'description', ssr.description,
                            'price', ssr.price,
                            'remarks', ssr.remarks,
                            'origin', ssr.origin,
                            'destination', ssr.destination
                        )
                    )
                    FROM new_flight_ssr ssr
                    WHERE ssr.booking_detail_id = p.booking_detail_id
                )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'sector_base_fare', s.base_fare,
                'sector_total_tax', s.total_tax,
                'sector_published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'sector_commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'sector_yq_tax', s.yq_tax,
                'sector_yr_tax', s.yr_tax,
                'sector_k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'sector_agent_markup', s.agent_markup,
                'sector_service_fee', s.service_fee,
                'sector_other_charges', s.other_charges,
                'sector_transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'sector_total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'stops', s.stops,
                'sector_cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
   WHERE 
    b.ticket_status = 'SUCCESS' AND b.agent_email = '${agentEmail}'
        `;

      let [recordset]  = await connection.execute(selectSQL);

        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch(err)
    {
        console.log(err)
        console.log("error")
        res.json({error: true, response: err.message});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.getFailedBookings = async(req,res) => {

    let connection;
    console.log(req.agent)
    let {agentEmail} = req.agent
    try {

        connection = await connectToDatabase();

        let selectSQL = `
      SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,
    b.wy_invoice_number,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'passenger_booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'passenger_booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'passenger_email_id', p.email_id,
                'passenger_mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'passenger_remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'passenger_base_fare', p.base_fare,
                'passenger_total_tax', p.total_tax,
                'stops', p.stops,
                'passenger_sector_id', p.sector_id,
                'passenger_yq_tax', p.yq_tax,
                'passenger_yr_tax', p.yr_tax,
                'passenger_k3_tax', p.k3_tax,
                'passenger_additional_tax', p.additional_tax,
                'passenger_published_fare', p.published_fare,
                'passenger_service_fee', p.service_fee,
                'passenger_other_charges', p.other_charges,
                'passenger_transaction_fee', p.transaction_fee,
                'passenger_total_ssr_amount', p.total_ssr_amount,
                'passenger_cancel_status_code', p.cancel_status_code,
                'sector_id', p.sector_id,
                'ssr_data', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'ssr_type', ssr.ssr_type,
                            'description', ssr.description,
                            'price', ssr.price,
                            'remarks', ssr.remarks,
                            'origin', ssr.origin,
                            'destination', ssr.destination
                        )
                    )
                    FROM new_flight_ssr ssr
                    WHERE ssr.booking_detail_id = p.booking_detail_id
                )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'sector_base_fare', s.base_fare,
                'sector_total_tax', s.total_tax,
                'sector_published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'sector_commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'sector_yq_tax', s.yq_tax,
                'sector_yr_tax', s.yr_tax,
                'sector_k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'sector_agent_markup', s.agent_markup,
                'sector_service_fee', s.service_fee,
                'sector_other_charges', s.other_charges,
                'sector_transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'sector_total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'stops', s.stops,
                'sector_cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
   WHERE 
    b.ticket_status = 'Failed' AND b.agent_email = '${agentEmail}'
        `;

      let [recordset]  = await connection.execute(selectSQL);

        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch(err)
    {
        console.log(err)
        res.json({error: true, response: err.message});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.getHoldBookings = async(req,res) => {

    let connection;
    try {

        connection = await connectToDatabase();

        let{agentEmail} = req.agent
        let selectSQL = `
      SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,
    b.wy_invoice_number,
    b.hold_date,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'passenger_booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'passenger_booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'passenger_email_id', p.email_id,
                'passenger_mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'passenger_remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'passenger_base_fare', p.base_fare,
                'passenger_total_tax', p.total_tax,
                'stops', p.stops,
                'passenger_sector_id', p.sector_id,
                'passenger_yq_tax', p.yq_tax,
                'passenger_yr_tax', p.yr_tax,
                'passenger_k3_tax', p.k3_tax,
                'passenger_additional_tax', p.additional_tax,
                'passenger_published_fare', p.published_fare,
                'passenger_service_fee', p.service_fee,
                'passenger_other_charges', p.other_charges,
                'passenger_transaction_fee', p.transaction_fee,
                'passenger_total_ssr_amount', p.total_ssr_amount,
                'passenger_cancel_status_code', p.cancel_status_code,
                'sector_id', p.sector_id,
                'ssr_data', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'ssr_type', ssr.ssr_type,
                            'description', ssr.description,
                            'price', ssr.price,
                            'remarks', ssr.remarks,
                            'origin', ssr.origin,
                            'destination', ssr.destination
                        )
                    )
                    FROM new_flight_ssr ssr
                    WHERE ssr.booking_detail_id = p.booking_detail_id
                )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'sector_base_fare', s.base_fare,
                'sector_total_tax', s.total_tax,
                'sector_published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'sector_commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'sector_yq_tax', s.yq_tax,
                'sector_yr_tax', s.yr_tax,
                'sector_k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'sector_agent_markup', s.agent_markup,
                'sector_service_fee', s.service_fee,
                'sector_other_charges', s.other_charges,
                'sector_transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'sector_total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'stops', s.stops,
                'sector_cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
   WHERE 
    b.ticket_status = 'HOLD' AND b.agent_email = '${agentEmail}'
        `;

      let [recordset]  = await connection.execute(selectSQL);

        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch(err)
    {
        console.log(err)
        res.json({error: true, response: err.message});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.getReleasedBookings = async(req,res) => {

    let connection;
    try {
let {agentEmail} = req.agent
        connection = await connectToDatabase();

        let selectSQL = `
      SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,
    b.wy_invoice_number,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'passenger_booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'passenger_booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'passenger_email_id', p.email_id,
                'passenger_mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'passenger_remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'passenger_base_fare', p.base_fare,
                'passenger_total_tax', p.total_tax,
                'stops', p.stops,
                'passenger_sector_id', p.sector_id,
                'passenger_yq_tax', p.yq_tax,
                'passenger_yr_tax', p.yr_tax,
                'passenger_k3_tax', p.k3_tax,
                'passenger_additional_tax', p.additional_tax,
                'passenger_published_fare', p.published_fare,
                'passenger_service_fee', p.service_fee,
                'passenger_other_charges', p.other_charges,
                'passenger_transaction_fee', p.transaction_fee,
                'passenger_total_ssr_amount', p.total_ssr_amount,
                'passenger_cancel_status_code', p.cancel_status_code,
                'sector_id', p.sector_id,
                'ssr_data', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'ssr_type', ssr.ssr_type,
                            'description', ssr.description,
                            'price', ssr.price,
                            'remarks', ssr.remarks,
                            'origin', ssr.origin,
                            'destination', ssr.destination
                        )
                    )
                    FROM new_flight_ssr ssr
                    WHERE ssr.booking_detail_id = p.booking_detail_id
                )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'sector_base_fare', s.base_fare,
                'sector_total_tax', s.total_tax,
                'sector_published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'sector_commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'sector_yq_tax', s.yq_tax,
                'sector_yr_tax', s.yr_tax,
                'sector_k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'sector_agent_markup', s.agent_markup,
                'sector_service_fee', s.service_fee,
                'sector_other_charges', s.other_charges,
                'sector_transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'sector_total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'stops', s.stops,
                'sector_cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
   WHERE 
    b.ticket_status = 'RELEASED' AND b.agent_email = '${agentEmail}'
        `;

      let [recordset]  = await connection.execute(selectSQL);

        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch(err)
    {
        console.log(err)
        res.json({error: true, response: err.message});
    }
    finally {
        if (connection) connection.release();  // Return the connection to the pool
    }
}

flightController.sector_cancel = async(req,res) => {
    console.log(req.body)
    let transaction;
    let agentEmail   = req.agent.agentEmail;
    let agent_Id   = req.agent.agentId;
    try {
        transaction = await connectToDatabase();
        let [agentData] = await agentServices.GetAgentData(transaction, agent_Id);
        let agent_phone_no = agentData[0].mobile;
        let agent_name = agentData[0].establishment_name;
        let cancelData = JSON.parse(req.body.cancelQueue)
        let cancelDetailData = JSON.parse(req.body.cancelDetails)
        let bookingId = cancelData.booking_id
        let TravelDate = cancelDetailData[0].travel_date
        let PNR = cancelDetailData[0].airline_pnr
        let airline = cancelDetailData[0].airline_code
        //console.log(cancelData.booking_id)
        //console.log(cancelDetailData[0])
        let cancel_id = await insertCancel(transaction,cancelData,agentEmail)
        for(let i=0; i<cancelDetailData.length; i++) {
            await insertCancelDetails(transaction, cancel_id, cancelDetailData[i])

            await transaction.execute(`UPDATE new_flight_passengers SET cancel_status_code = 1 WHERE booking_detail_id IN (${cancelDetailData.map(d => d.booking_detail_id).join(",")});`);

        }


        await transaction.execute(`
        UPDATE new_flight_sectors
        SET cancel_status_code = 1
        WHERE sector_id = ${cancelData.sector_id}
    `);

        await whatsappMessage.flightCancellationRequest(agent_phone_no,agent_name,bookingId,airline,TravelDate,PNR)
        if(req.agent.SubUser_email){
            let sub_email = req.agent.SubUser_email;
            let [sub] = await agentServices.SubAgent(transaction,sub_email)
            let subMobile = sub[0].mobileNo
            let subName = `${sub[0].firstName} ${sub[0].lastName}`
            await whatsappMessage.flightCancellationRequest(subMobile,subName,bookingId,airline,TravelDate,PNR)
        }
        res.send({error: false})
    }
    catch (e) {
        console.log(e)
        res.send({error: true})
    }
    finally {
        if (transaction) transaction.release(); // Return the connection to the pool
    }
}

flightController.partial_cancel = async(req,res) => {
    console.log(req.body)
    let transaction;
    let agentEmail   = req.agent.agentEmail;
    let agent_Id   = req.agent.agentId;

    try {
        transaction = await connectToDatabase();
        let [agentData] = await agentServices.GetAgentData(transaction, agent_Id);
        let agent_phone_no = agentData[0].mobile;
        let agent_name = agentData[0].establishment_name;
        let cancelData = JSON.parse(req.body.cancelQueue)
        let cancelDetailData = JSON.parse(req.body.cancelDetails)
        let bookingId = cancelData.booking_id
        let TravelDate = cancelDetailData[0].travel_date
        let PNR = cancelDetailData[0].airline_pnr
        let airline = cancelDetailData[0].airline_code

        let cancel_id = await insertCancel(transaction,cancelData,agentEmail)
        for(let i=0; i<cancelDetailData.length; i++) {
            await insertCancelDetails(transaction, cancel_id, cancelDetailData[i])

            await  transaction.execute(`
                UPDATE new_flight_passengers
                SET cancel_status_code = 1
                WHERE booking_detail_id = ${cancelDetailData[i].booking_detail_id}
            `);

        }
        await whatsappMessage.flightCancellationRequest(agent_phone_no,agent_name,bookingId,airline,TravelDate,PNR)
        if(req.agent.SubUser_email){
            let sub_email = req.agent.SubUser_email;
            let [sub] = await agentServices.SubAgent(transaction,sub_email)
            let subMobile = sub[0].mobileNo
            let subName = `${sub[0].firstName} ${sub[0].lastName}`
            await whatsappMessage.flightCancellationRequest(subMobile,subName,bookingId,airline,TravelDate,PNR)
        }
        res.send({error: false})
    }
    catch (e) {
        console.log(e)

        res.send({error: true})
    }finally {
        if(transaction){
            transaction.release()
        }
    }
}

flightController.release_booking = async(req,res) => {
    console.log(req.body);
    let transaction ;
    let {id} = req.body;
    const url = 'http://trvlnxtgateway.parikshan.net/api/CancellationBooking';
    try
    {
        transaction = await connectToDatabase();

        let [sectorData] = await agentServices.getFlightsHold(transaction,id)
        console.log(sectorData)
        let email = sectorData[0].agent_email
        let [agentData] = await agentServices.GetAgentDataMail(transaction, email);
        let agent_phone_no = agentData[0].mobile;
        let agent_name = agentData[0].establishment_name;
        let pnr = sectorData[0].gdspnr
        let departure = sectorData[0].departure
        let Airline = sectorData[0].airline_name
        let bookingId = sectorData[0].booking_id
        let departureDate = new Date(departure);
        let sector =`${sectorData[0].origin} - ${sectorData[sectorData.length - 1].destination}`

        // Extract components for departure
        let depYear = departureDate.getFullYear();
        let depMonth = String(departureDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let depDay = String(departureDate.getDate()).padStart(2, '0');
        let depHours = String(departureDate.getHours()).padStart(2, '0');
        let depMinutes = String(departureDate.getMinutes()).padStart(2, '0');
        let depTime = `${depHours}h:${depMinutes}min`;
        let TravelDate = `${depDay}-${depMonth}-${depYear}`;
        console.log(email,pnr,TravelDate,Airline,agent_phone_no,agent_name,sector)


        const header = {
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                'Content-Type': 'application/json'
            }
        }

        const payload = {
            "trvlnxtPNR": `${id}`
        };


        const ticketResponse = await axios.post(url, payload, header);

        console.log(ticketResponse?.data)

        if (ticketResponse?.data?.ResponseStatusType?.Success === true)
        {
            await transaction.execute(`
                        UPDATE new_flight_booking
                        SET ticket_status = 'RELEASED'
                        WHERE token_id = '${id}'
                    `);
            await whatsappMessage.flightRelease(agent_phone_no,agent_name,bookingId,Airline,TravelDate,depTime,sector,pnr)
            if(req.agent.SubUser_email){
                let sub_email = req.agent.SubUser_email;
                let [sub] = await agentServices.SubAgent(transaction,sub_email)
                let subMobile = sub[0].mobileNo
                let subName = `${sub[0].firstName} ${sub[0].lastName}`
                await whatsappMessage.flightRelease(subMobile,subName,bookingId,Airline,TravelDate,depTime,sector,pnr)
            }
            res.json({"error" : false, "message" : "released Successfully"})
        }
        else {
            res.json({"error" : true, "message" : ticketResponse.data.ResponseStatusType.Message})
        }
    }
    catch(e)
    {
        console.log(e);
        res.json({"error" : true, "message" : "not released"})
    }
    finally {
        if (transaction) transaction.release(); // Return the connection to the pool
    }
}

flightController.confirm_hold = async(req,res) => {
    console.log(req.body);
    let transaction ;
    let {traceid, gdspnr} = req.body;
    const url = 'http://trvlnxtgateway.parikshan.net/api/HoldBooking';
    try
    {
        transaction = await connectToDatabase();
    
      
            const header = {
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'ApiKey': `VFJBVkVMIERFQUwgT25saW5lIC0gQ1VTVDMwMDcyNA==`,
                    'Content-Type': 'application/json'
                }
            }
    
                const payload = {
                   "trackID": `${traceid}`,
"gdspnr": `${gdspnr}`, 
"paymentMode": "1", 
                  };
    
    
                  const ticketResponse = await axios.post(url, payload, header);
    
                  console.log(ticketResponse?.data)
    
                  if (ticketResponse?.data?.ResponseStatusType?.Success === true) 
                    {
                        await transaction.execute(`
                            UPDATE new_flight_booking
                            SET ticket_status = 'SUCCESS'
                            WHERE trace_id = '${traceid}'
                        `);
                  res.json({"error" : false, "message" : "Confirmed Successfully"})
    }
    else
    {
        res.json({"error" : true, "message" : "not Booked"})
    }
    }
    catch(e)
    {
        console.log(e);
        res.json({"error" : true, "message" : "not Booked"})
    }
    finally {
        if (transaction) transaction.release(); // Return the connection to the pool
    }
    }

flightController.agentData = async (req,res) => {
    let transaction;
    try {
        transaction = await connectToDatabase();

        const {agent} = req.params;
        //console.log(agent)
        const [recordset] = await flightServices.AgentData(transaction,agent)
        //console.log(recordset)
        if (recordset.length > 0) {
            res.json({error: false, response: recordset});
        } else {
            res.json({error: true, response: []});
        }
    }
    catch (e) {
        console.error("Error in lastMinMarkup:", e);
        res.status(500).send({
            error: true,
            message: "An error occurred while processing the request.",
        });
    } finally {
        // Release the transaction to the pool
        if (transaction) {
            transaction.release();
        }
    }
}

flightController.lastMinMarkup = async (req, res) => {
    let transaction;
    try {
        transaction = await connectToDatabase();
        const {markup_value, booking_id} = req.body;
        console.log("Markup Value:", markup_value);
        console.log("Booking ID:", booking_id);

        const [recordset] = await flightServices.lastMinMarkup(
            transaction,
            markup_value,
            booking_id
        );

        // Log the result for debugging
        console.log("Recordset:", recordset);

        // Send success response
        res.status(200).send({error: false, message: "Update successful"});
    } catch (e) {
        console.error("Error in lastMinMarkup:", e);
        res.status(500).send({
            error: true,
            message: "An error occurred while processing the request.",
        });
    } finally {
        // Release the transaction to the pool
        if (transaction) {
            transaction.release();
        }
    }
};

module.exports = flightController;
