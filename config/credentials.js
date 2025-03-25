module.exports = {
    development: {
        searchList: 'http://rhapi.parikshan.net/api/AutoSuggestion?term=',
        AvailabilityBlocking: "http://rhapi.parikshan.net/api/AvailabilityBlocking",
        GetStaticContent: "http://rhapi.parikshan.net/api/GetStaticContent/GetStaticContent",
        GetRoomsAndRate: "http://rhapi.parikshan.net/api/RoomsAndRates/GetRoomsAndRates",
        priceCheck: "http://rhapi.parikshan.net/api/PriceCheck",
        HotelBooking: "http://rhapi.parikshan.net/api/HotelBooking",
        BookingCancel: "http://rhapi.parikshan.net/api/BookingCancel",
    },
    production: {

    },

    easConfig: {
        key: "##########",
        salt: "###########",
        env: "test",
        enable_iframe: 0,
    }
};