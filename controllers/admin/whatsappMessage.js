const axios = require("axios");


const whatsappMessage = {}


whatsappMessage.sendSignupMessage = async (agentName, number) => {
    console.log(agentName, number);

    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "signup_tdo_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: agentName
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }

}

whatsappMessage.sendWhatsAppOTP = async (otp, number) => {
    console.log(otp, number)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';


    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": `${number}`,
        "type": "template",
        "template": {
            "name": "otp_tdo",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": otp
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "text",
                            "text": otp
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.sendAgentActivationMessage  = async (number,email, password) => {
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "agent_activation_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: email
                        },
                        {
                            type: "text",
                            text: password
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }

}

whatsappMessage.flightSuccessBooking = async (number,name,bookingId,airline,flightNumber,sectors,departure,arrival,departureAirport,arrivalAirport,PNR,PassengerName,NumberOfPassengers) => {
    console.log(number,name,bookingId,airline,flightNumber,sectors,departure,arrival,departureAirport,arrivalAirport,PNR,PassengerName,NumberOfPassengers);
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_success_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: flightNumber
                        },
                        {
                            type: "text",
                            text: sectors
                        },
                        {
                            type: "text",
                            text: departure
                        },
                        {
                            type: "text",
                            text: arrival
                        },
                        {
                            type: "text",
                            text: departureAirport
                        },
                        {
                            type: "text",
                            text: arrivalAirport
                        },
                        {
                            type: "text",
                            text: PNR
                        },
                        {
                            type: "text",
                            text: PassengerName
                        },
                        {
                            type: "text",
                            text: NumberOfPassengers
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.flightFailedBooking = async (number,name,bookingId,airline,departure,TravelDate,PassengerName,PaymentStatus,Amount) => {
    console.log(number,name,bookingId,airline,departure,TravelDate,PassengerName,PaymentStatus,Amount)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_failure_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: departure
                        },
                        {
                            type: "text",
                            text: TravelDate
                        },
                        {
                            type: "text",
                            text: PassengerName
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: PaymentStatus
                        },
                        {
                            type: "text",
                            text: Amount
                        }

                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.flightHoldBooking = async (number,name,bookingId,airline,flightNumber,sectors,departure,arrival,PNR,holdTime) => {
    console.log(number,name,airline,flightNumber,sectors,departure,arrival,PNR,holdTime)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_hold_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: flightNumber
                        },
                        {
                            type: "text",
                            text: sectors
                        },
                        {
                            type: "text",
                            text: departure
                        },
                        {
                            type: "text",
                            text: arrival
                        },
                        {
                            type: "text",
                            text: PNR
                        },
                        {
                            type: "text",
                            text: holdTime
                        }

                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.flightCancellationRequest = async (number,name,bookingId,airline,TravelDate,PNR) => {
    //console.log(number,name,bookingId,airline,departure,TravelDate,PassengerName,PaymentStatus,Amount)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_cancellation_request_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: TravelDate
                        },
                        {
                            type: "text",
                            text: PNR
                        }

                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.flightCancellationApproved = async (number,name,bookingId,airline,TravelDate,PNR,RefundAmount) => {
    //console.log(number,name,bookingId,airline,departure,TravelDate,PassengerName,PaymentStatus,Amount)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_cancel_approve_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: TravelDate
                        },
                        {
                            type: "text",
                            text: PNR
                        },
                        {
                            type: "text",
                            text: RefundAmount
                        }

                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.flightRelease = async (number,name,bookingId,airline,TravelDate,DepartureTime,Sectors,PNR) => {
    //console.log(number,name,bookingId,airline,departure,TravelDate,PassengerName,PaymentStatus,Amount)
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "flight_release_booking_dubai",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        },
                        {
                            type: "text",
                            text: bookingId
                        },
                        {
                            type: "text",
                            text: airline
                        },
                        {
                            type: "text",
                            text: TravelDate
                        },
                        {
                            type: "text",
                            text: DepartureTime
                        },
                        {
                            type: "text",
                            text: Sectors
                        },
                        {
                            type: "text",
                            text: PNR
                        }

                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

whatsappMessage.subUserLogin = async (number,email,password) => {
    const url = 'https://graph.facebook.com/v21.0/432635183274450/messages';
    const accessToken = 'EAARyQ60XoZCABO7eRqxMA2C925ICcZC4fUMR8YH7aWKgpVXoZC7FGzm5jOg7ZBTi2bLxwm5ghjFIZATqwyQdZCpyi6nTRZCTAJrVkduxqZCS3Y1ZAQZA1OPUc9Ty5u9cnFT47Ux6P28E7mmGZAMFkd4ixU1qhS1QY3RPsaZCOkkglO09ZCfJvKXxeheup1biTAtQZBuwFh0AZDZD';

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const data = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
            name: "sub_sub",
            language: {
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: email
                        },
                        {
                            type: "text",
                            text: password
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, data, {headers});
        // Handle success
        console.log('Response:', response.data);
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }

}

module.exports = whatsappMessage;