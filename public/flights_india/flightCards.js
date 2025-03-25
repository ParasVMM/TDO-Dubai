class FlightCards {
    constructor(flight, index,airlineName) {
        this.flight = flight;
        this.index = index;
        this.airlineName = airlineName;
    }

    render() {

        let card = `
        <div class="p-3 d-flex my-2 one-way-new-result-card ">
                                <div class="d-flex flight-info ">
                                    <div class="spacing-0 flex-1 flight-info_flight-details row">
                                        <div class="col-lg-4 col-md-3 col-sm-3 col-3">
                                            <div class="flight-info_flight-details">
                                                <div class="d-flex">
                                                    <div class="d-flex me-2 flight-image"><img class="vertical-bottom" alt="Flight" src="https://content.airhex.com/content/logos/airlines_${this.flight.AirlineCode}_350_350_s.png">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="d-flex flex-column flight-name"><span class="flight-company">${this.airlineName}</span><span class="flight-company-secondary text-capitalize" title="Saver"></span><span class="fs-10 flight-number">${this.flight.AirlineCode}-${this.flight.FlightNumber}</span>
                                            
                                            <a class="fs-14 fw-600 mt-3 app-link-black" onclick="renderSideBar(${this.index})">
                                            Flight Details
                                            </a>
                                                </div>
                                        </div>
                                        <div class="col-lg-8 col-md-9 col-sm-9 col-9">
                                            <div class="row">
                                                <div class="d-flex justify-content-start col-lg-5 col-md-5 col-sm-5 col-4">
                                                    <div class="d-flex flex-column"><span class="title fw-600">${this.flight.Origin.DepTime}</span><span class="fs-12">${this.flight.Origin.DepDate}</span><span class="fs-10">${this.flight.Origin.CityName}</span></div>
                                                </div>
                                                <div class="d-flex justify-content-center px-0 col-lg-2 col-md-2 col-sm-2 col-4">
                                                    <div class="d-flex flex-column text-center"><span class="fs-12 fw-500">${this.flight.totalDuration.hours}h ${this.flight.totalDuration.minutes}m</span>
                                                        <div class="d-flex flex-column">
                                                            <div class="cursor-pointer"><p class="multi-stop-seperator">
                                                                <span class="layover-pointer"></span></p><span class="fs-8 d-inline-block" style="margin-top: 7px;">${this.flight.Stops}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-end col-lg-5 col-md-5 col-sm-5 col-4">
                                                    <div class="d-flex flex-column text-end"><span class="title fw-600">${this.flight.Destination.ArrTime}<span class="extra-days"></span></span><span class="fs-12">${this.flight.Destination.ArrDate}</span><span class="fs-10">${this.flight.Destination.CityName}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class=" d-flex fare-info">
                                    <div class="flex-1 spacing-0 row">
 <div class="col-lg-12 col-md-12 col-sm-12 col-12">
                                         <div class="d-flex flex-column fare-info_details" id="twoFares">
                                        
        `

        for (let i = 0; i < Math.min(2, this.flight.Segments.length); i++) {
            let flightCards = new FareCards(this.flight.Segments[i], i)
            card += flightCards.render(this.index)
        }

        card += `
</div>
<div class="d-flex flex-column fare-info_details hide" id="otherFares${this.index}">
`;

        for (let i = 2; i < this.flight.Segments.length; i++) {
            let flightCards = new FareCards(this.flight.Segments[i], i)
            card += flightCards.render(this.index)
        }


        card += `</div>`;


        card += `<div class="px-0 mt-1 col-lg-12 col-md-12 col-sm-12 col-12">
                                            <div class="d-flex justify-content-end pe-1">
                                                <div class="d-flex justify-content-between flex-1 gap-1">
<div class="d-flex align-items-center flex-1 justify-content-center">
`;

        if (this.flight.Segments.length > 2) {
            card += `
        <a class="fs-12 fw-500 flex-1 app-link-grey" onclick="toggleVisibility(${this.index})">
            <div class="d-flex align-items-center justify-content-center">
                <span>+${this.flight.Segments.length - 2} More fares</span>
                <svg stroke="currentColor" fill="currentColor"
                     stroke-width="0" viewBox="0 0 24 24" height="1em"
                     width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M7 10l5 5 5-5z"></path>
                </svg>
            </div>
        </a>`;
        }

        card += `
</div>
<button type="button"
                                                            class="app-btn app-btn-primary app-btn-medium px-3"
                                                            style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;" onclick="book(${this.index})">
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
</div>
                                  </div>
                                </div>
                            </div>
`

        return card
    }

}

class FareCards {

    constructor(flight, index) {
        this.flight = flight;
        this.index = index;
    }

    render(index) {

        let fareCard = ``;


        if(this.index === 0)
        {
            fareCard = `<div class="fare-component position-relative">
                        <div class="spacing-0 row">
                            <div class="col-lg-6 col-md-6 col-sm-6 col-6"
                                 style="padding-left: 5px; padding-block: 10px;"><label
                                class=" d-flex  fw-500 align-items-center fs-12 cursor-pointer"
                                for="${this.index}"
                                style="color: rgb(30, 30, 30);">
                                <input
                                class="cursor-pointer me-1"
                                id="${this.index}"
                                type="radio"
                                value="${this.index}"
                                name = "${index}"
                                checked
                                >
                                <div class="d-flex flex-column"><span
                                    class="fs-12 text-capitalize dark-grey-color fw-600 text-break">${this.flight.fare}</span>
                              
                                    <div class="fs-10 amenities-info"><span
                                        class="seats-left"><svg stroke="currentColor"
                                                                fill="currentColor"
                                                                stroke-width="0"
                                                                viewBox="0 0 24 24"
                                                                height="1em" width="1em"
                                                                xmlns="http://www.w3.org/2000/svg"><path
                                        fill="none" d="M0 0h24v24H0V0z"></path><path
                                        d="M5 12V3H3v9c0 2.76 2.24 5 5 5h6v-2H8c-1.66 0-3-1.34-3-3zm15.5 6H19v-7c0-1.1-.9-2-2-2h-5V3H6v8c0 1.65 1.35 3 3 3h7v7h4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"></path></svg><span
                                        class="seats-left_text">3</span></span><span
                                        class=" fs-10 refundable-info fw-600 green-color">RF</span><span
                                        class="cabin-baggage"><svg stroke="currentColor"
                                                                   fill="currentColor"
                                                                   stroke-width="0"
                                                                   viewBox="0 0 512 512"
                                                                   height="1em"
                                                                   width="1em"
                                                                   xmlns="http://www.w3.org/2000/svg"><path
                                        d="M454.65 169.4A31.82 31.82 0 00432 160h-64v-16a112 112 0 00-224 0v16H80a32 32 0 00-32 32v216c0 39 33 72 72 72h272a72.22 72.22 0 0050.48-20.55 69.48 69.48 0 0021.52-50.2V192a31.75 31.75 0 00-9.35-22.6zM176 144a80 80 0 01160 0v16H176z"></path></svg><span
                                        class="seats-left_text">15KG</span></span></div>
                                </div>
                            </label></div>
                            <div data-watermark="FW76315FW76315 FW76315FW76315 FW76315FW76315"
                                 class="p-2 d-flex justify-content-center align-items-end one-way-watermarked col-lg-6 col-md-6 col-sm-6 col-6">
                                <div class=" position-relative d-flex flex-column"><span
                                    class="fs-16 fw-600">AED ${this.flight.FareBreakup.PublishedFare}</span><span
                                    class="netFare fs-12 fw-500 hidden">AED ${this.flight.FareBreakup.OfferedFare}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                                        
        `;
        }
        else
        {
            fareCard = `<div class="fare-component position-relative">
                        <div class="spacing-0 row">
                            <div class="col-lg-6 col-md-6 col-sm-6 col-6"
                                 style="padding-left: 5px; padding-block: 10px;"><label
                                class=" d-flex  fw-500 align-items-center fs-12 cursor-pointer"
                                for="${this.index}"
                                style="color: rgb(30, 30, 30);">
                                <input
                                class="cursor-pointer me-1"
                                id="${this.index}"
                                value="${this.index}"
                                type="radio"
                                name = "${index}"
                                >
                                <div class="d-flex flex-column"><span
                                    class="fs-12 text-capitalize dark-grey-color fw-600 text-break">${this.flight.fare}</span>
                                    <div class="fs-10 amenities-info"><span
                                        class="seats-left"><svg stroke="currentColor"
                                                                fill="currentColor"
                                                                stroke-width="0"
                                                                viewBox="0 0 24 24"
                                                                height="1em" width="1em"
                                                                xmlns="http://www.w3.org/2000/svg"><path
                                        fill="none" d="M0 0h24v24H0V0z"></path><path
                                        d="M5 12V3H3v9c0 2.76 2.24 5 5 5h6v-2H8c-1.66 0-3-1.34-3-3zm15.5 6H19v-7c0-1.1-.9-2-2-2h-5V3H6v8c0 1.65 1.35 3 3 3h7v7h4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"></path></svg><span
                                        class="seats-left_text">3</span></span><span
                                        class=" fs-10 refundable-info fw-600 green-color">RF</span><span
                                        class="cabin-baggage"><svg stroke="currentColor"
                                                                   fill="currentColor"
                                                                   stroke-width="0"
                                                                   viewBox="0 0 512 512"
                                                                   height="1em"
                                                                   width="1em"
                                                                   xmlns="http://www.w3.org/2000/svg"><path
                                        d="M454.65 169.4A31.82 31.82 0 00432 160h-64v-16a112 112 0 00-224 0v16H80a32 32 0 00-32 32v216c0 39 33 72 72 72h272a72.22 72.22 0 0050.48-20.55 69.48 69.48 0 0021.52-50.2V192a31.75 31.75 0 00-9.35-22.6zM176 144a80 80 0 01160 0v16H176z"></path></svg><span
                                        class="seats-left_text">15KG</span></span></div>
                                </div>
                            </label></div>
                            <div data-watermark="FW76315FW76315 FW76315FW76315 FW76315FW76315"
                                 class="p-2 d-flex justify-content-center align-items-end one-way-watermarked col-lg-6 col-md-6 col-sm-6 col-6">
                                <div class=" position-relative d-flex flex-column"><span
                                    class="fs-16 fw-600">AED ${this.flight.FareBreakup.PublishedFare}</span><span
                                    class="netFare fs-12 fw-500 hidden">AED ${this.flight.FareBreakup.OfferedFare}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                                        
        `;
        }


        return fareCard;
    }
}

class SegmentInformation
{
    constructor(flight,index, fare) {
        this.flight = flight;
        this.index = index;
        this.fare = fare;
    }

    render()
    {
        let segment = this.flight;

        let segmentCard = '';

        segmentCard+=`
        <div class="selected-flight-details__flight-leg my-2">`;
        if(segment.LayoverTime !== 0)
        {
            segmentCard+=`
                <div class="selected-flight-details__flight-leg_layover py-1 my-2">
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24"
                                     height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
                                </svg>
                                <span class="selected-flight-details__flight-leg_layover__location ms-1">${segment.LayoverTime.hours}h ${segment.LayoverTime.minutes}m layover in ${segment.DepartureCityName}</span>
                            </div>
                `
        }
        segmentCard+=`<div>
                                <div class="selected-flight-details__flight-leg_details d-flex gap-3">
                                    <div><img class="vertical-bottom" alt="Flight"
                                              src="https://content.airhex.com/content/logos/airlines_${segment.AirlineCode}_350_350_s.png"></div>
                                    <div class="d-flex flex-column text-uppercase fs-12 justify-content-center">
                                        <div class="d-flex gap-2"><span class="primary-color">${segment.AirlineName}</span><span>${segment.AirlineCode}-${segment.FlightNumber}</span><span>BOOKING CLASS: ${segment.flightClass}</span>
                                        </div>
                                        <div>${this.fare}</div>
<!--                                        <div class="d-flex gap-2"><span>economy</span><span>32N</span></div>-->
                                    </div>
                                </div>
                                <div class="selected-flight-details__flight-leg_departure my-3">
                                    <div class="d-flex align-items-center"><img
                                            src="/flightWorthCSS/images/flight-details-line.svg" alt="" style="height: 50px;">
                                    </div>
                                    <div class="d-flex flex-column"><span class="dark-grey-color fs-14 fw-600">${segment.DepTime} (${segment.DepDate}) - ${segment.DepartureCityName} - ${segment.DepartureTerminal}</span><span
                                            class="fs-10 mb-2">${segment.DepartureAirportName}</span><span
                                            class="fs-12 grey-color mb-2">Travel Time: ${segment.Duration.hours}h ${segment.Duration.minutes}m</span><span
                                            class="dark-grey-color fs-14 fw-600">${segment.ArrTime} (${segment.ArrDate}) - ${segment.ArrivalCityName} - ${segment.ArrivalTerminal}</span><span
                                            class="fs-10">${segment.ArrivalAirportName}</span></div>
                                </div>
                                <div class="selected-flight-details__flight-leg_amenities"><span>Check In: ${segment.Baggage[0].Weight} ${segment.Baggage[0].Unit}</span>
                                </div>
                            </div>
                        
                        </div>
        `

        return  segmentCard;
    }
}

class TBOFareBreakupCard {

    constructor(fare,index)
    {
        this.fare = fare;
        this.index = index;
    }



    render()
    {



        let flight = this.fare.Flights[0];

        let segment = flight.Segments

        let totalFare = 0;

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

        let adultCard = '';
        let childCard = '';
        let infantCard = '';

        let adultCount = ``;
        let childCount = ``;
        let infantCount = ``;

        let adultPublishFare = 0;
        let childPublishFare = 0;
        let infantPublishfare = 0;
        

        
    
    
    

        for (let i = 0; i < flight.FlightPricingInfo.PaxFareDetails.length; i++) {

            let paxFare = flight.FlightPricingInfo.PaxFareDetails[i]

            if (paxFare.PaxType === 'ADT') {

                adultFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                adultBaseFare = parseFloat(paxFare.BasicFare);

                adultPublishFare = parseFloat(paxFare.GrossFare);

                adultTotaltax = parseFloat(paxFare.TotalTax)

                paxFare.PaxTaxDetails.forEach(tax => {
                    if (tax.TaxCode === 'K3') {
                        adultk3Tax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YQ') {
                        adultyqTax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YR') {
                        adultyrTax = tax.TaxAmount;
                    } else if (tax.TaxAmount !== 'TotalTax') {
                        // Sum other taxes excluding K3, YQTax, YR, and TotalTax
                        adultTaxesSum += tax.TaxAmount;
                    }
                });

                adultCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult:</span><span
                                                        class="fw-500">${adultBaseFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${adultyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${adultTaxesSum}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${adultk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${adultyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult Total:</span><span
                                                        class="fw-600">${adultFare}</span></div>
                                        </div>`


                adultCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${parseInt(arr.adults)} x Adult</span><span
                                                        class="fw-600">${adultFare * parseInt(arr.adults)}</span></div>`
            }

            if (paxFare.PaxType === 'CHD') {

                childFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                childBasefare = parseFloat(paxFare.BasicFare);

                childTotalTax = parseFloat(paxFare.TotalTax)

                childPublishFare = parseFloat(paxFare.GrossFare);

                paxFare.PaxTaxDetails.forEach(tax => {
                    if (tax.TaxCode === 'K3') {
                        childk3Tax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YQ') {
                        childyqTax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YR') {
                        childyrTax = tax.TaxAmount;
                    } else if (tax.TaxAmount !== 'TotalTax') {
                        // Sum other taxes excluding K3, YQTax, YR, and TotalTax
                        childTaxesSum += tax.TaxAmount;
                    }
                });
                childCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Child:</span><span
                                                        class="fw-500">${childBasefare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${childyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${childTaxesSum}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${childk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${childyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Child Total:</span><span
                                                        class="fw-600">${childFare}</span></div>
                                        </div>`


                childCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${parseInt(arr.childs)} x Child</span><span
                                                        class="fw-600">${childFare * parseInt(arr.childs)}</span></div>`
            }
            if (paxFare.PaxType === 'INF') {

                infantFare = parseFloat(paxFare.BasicFare) + parseFloat(paxFare.TotalTax)

                infantBaseFare = parseFloat(paxFare.BasicFare);

                infantTotalTax = parseFloat(paxFare.TotalTax)

                infantPublishfare = parseFloat(paxFare.GrossFare);

                paxFare.PaxTaxDetails.forEach(tax => {
                    if (tax.TaxCode === 'K3') {
                        infantk3Tax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YQ') {
                        infantyqTax = tax.TaxAmount;
                    } else if (tax.TaxCode === 'YR') {
                        infantyrTax = tax.TaxAmount;
                    } else if (tax.TaxAmount !== 'TotalTax') {
                        // Sum other taxes excluding K3, YQTax, YR, and TotalTax
                        infantTaxesSum += tax.TaxAmount;
                    }
                });
                infantCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Infant:</span><span
                                                        class="fw-500">${infantBaseFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${infantyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${infantTaxesSum}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${infantk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${infantyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult Total:</span><span
                                                        class="fw-600">${infantFare}</span></div>
                                        </div>`


                infantCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${parseInt(arr.infants)} x Infant</span><span
                                                        class="fw-600">${parseFloat(infantFare) * parseInt(arr.infants)}</span></div>`
            }
        }

        // old
        let totalPax = parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants);

        let markup_by_agent  = 0;

        const fareDifference = 0;
        let markup_type = '';

        let markup_value = 0;

        let totalMarkup = 0;

        let totalPublishFare = 0;

        let totalNetFare = 0

        let commission = 0

        let netPrice = 0

        let tds  = 0


        let totalOtherTaxes = 0


        let calculatedTax = 0;

        totalAmount = (adultFare * parseInt(arr.adults)) + (childFare * parseInt(arr.childs)) + (infantFare * parseInt(arr.infants)) + parseFloat(calculatedTax);

        let amountPayable = (parseFloat(netPrice) + tds + parseFloat(calculatedTax)).toFixed(2);

        paxFare = {
            "Adult" : {
                "commission_per_pax" : 0,
                "markup_per_pax" : 0,
                "markup_by_agent_per_pax" : 0,
                "tds_per_pax" : 0,
                "base_fare"  : adultBaseFare,
                "total_tax" : adultTotaltax,
                "yq_tax" : adultyqTax,
                "yr_tax" : adultyrTax,
                "k3_tax" : adultk3Tax,
                "additional_tax" : adultTaxesSum,
                "published_fare" : adultPublishFare,
                "service_fee" : 0,
                "other_charges" :  0,
                "transaction_fee" : 0
            },
            "Child" : {
                "commission_per_pax" : 0,
                "markup_per_pax" : 0,
                "markup_by_agent_per_pax" : 0,
                "tds_per_pax" : 0,
                "base_fare"  : childBasefare,
                "total_tax" : childTotalTax,
                "yq_tax" : childyqTax,
                "yr_tax" : childyrTax,
                "k3_tax" : childk3Tax,
                "additional_tax" : childTaxesSum,
                "published_fare" : childPublishFare,
                "service_fee" : 0,
                "other_charges" :  0,
                "transaction_fee" : 0
            },
            "Infant" : {
                "commission_per_pax" : 0,
                "markup_per_pax" : 0,
                "markup_by_agent_per_pax" : 0,
                "tds_per_pax" : 0,
                "base_fare"  : infantBaseFare,
                "total_tax" : infantTotalTax,
                "yq_tax" : infantyqTax,
                "yr_tax" : infantyrTax,
                "k3_tax" : infantk3Tax,
                "additional_tax" : infantTaxesSum,
                "published_fare" : infantPublishfare,
                "service_fee" : 0,
                "other_charges" :  0,
                "transaction_fee" : 0
            }
        }

        for(let seg1 = 0; seg1<segment.length; seg1++)
            {
                let currentFlight = segment[seg1];
                let nextFlight = segment[seg1+1];
    
                let layover_time =''
    
    

                let totalMinutes = 0;

           // Parse current flight's TotalTime to minutes
    const [currentHours, currentMinutes] = currentFlight.OriginDestination.TotalTime.split(':').map(Number);
    totalMinutes = currentHours * 60 + currentMinutes;

            
                const totalHours = Math.floor(totalMinutes / 60);
                const remainingMinutes = totalMinutes % 60;


          
                let arrivalTime = currentFlight?.OriginDestination?.ArrivalDateTime;
                let nextDepartureTime = nextFlight?.OriginDestination?.DepartureDateTime;
    
                if (!arrivalTime || !nextDepartureTime) {
                    console.log(`Skipping layover calculation: Missing time information for flight`);
                    layover_time = 'NO_LAYOVER'
                }
                else {
                    // Get the arrival time of the current flight
                    let arrivalMinutes = convertToMinutes(arrivalTime);
    
                    // Get the departure time of the next flight
                    let nextDepartureMinutes = convertToMinutes(nextDepartureTime);
    
                    // Calculate layover in minutes
                    let layoverMinutes = nextDepartureMinutes - arrivalMinutes;
    
                    // Handle layover crossing midnight
                    if (layoverMinutes < 0) {
                        layoverMinutes += 24 * 60; // Add 24 hours in minutes
                    }
    
                    let hours = Math.floor(layoverMinutes / 60);
                    let minutes = layoverMinutes % 60;
    
                    layover_time = `${hours}h ${minutes}m`
                }
    
    // Convert total duration to hours and minutes
              
                let singleSegment = {
                    origin : `${segment[seg1].OriginDestination.Departure}`,
                    destination : `${segment[seg1].OriginDestination.Arrival}`,
                    departure : segment[seg1].OriginDestination.DepartureDateTime,
                    arrival : segment[seg1].OriginDestination.ArrivalDateTime,
                    duration  : `${totalHours}:${remainingMinutes}`,
                    departure_terminal : segment[seg1].DepartureTerminal,
                    arrival_terminal : segment[seg1].ArrivalTerminal,
                    departure_airport_name : `${segment[seg1].OriginDestination.Departure}`,
                    departure_airport_code : `${segment[seg1].OriginDestination.Departure}`,
                    arrival_airport_code : `${segment[seg1].OriginDestination.Arrival}`,
                    arrival_airport_name : `${segment[seg1].OriginDestination.Arrival}`,
                    airline_name :  segment[seg1].Carrier,
                    airline_code :  segment[seg1].Carrier,
                    flight_number : segment[seg1].FlightNumber,
                    layover_time : layover_time
                }
    
                segArray.push(singleSegment)
            }
    
            let trip = {
                stops : segment.length-1,
                origin : `${segment[0].OriginDestination.Departure}`,
                destination : `${segment[0].OriginDestination.Arrival}`,
                departure : segment[0].OriginDestination.DepartureDateTime,
                IsLCC : (flight.AirlineType === 'LCC') ? true : false,
                arrival : segment[0].OriginDestination.ArrivalDateTime,
                duration  : flight.OriginDestination.TotalTime,
                result_index : this.fare.SellKey,
                departure_terminal : segment[0].DepartureTerminal,
                arrival_terminal : segment[0].ArrivalTerminal,
                departure_airport_name : `${segment[0].OriginDestination.Departure}`,
                    departure_airport_code : `${segment[0].OriginDestination.Departure}`,
                    arrival_airport_code : `${segment[segment.length - 1].OriginDestination.Arrival}`,
                    arrival_airport_name : `${segment[segment.length - 1].OriginDestination.Arrival}`,
                    airline_name :  segment[0].Carrier,
                    airline_code :  segment[0].Carrier,
                    flight_number : segment[0].FlightNumber,
                fare_type : flight.FareName,
                base_fare : flight.BasicFare,
                total_tax : flight.TotalTax,
                published_fare : grossFare,
                offered_fare : flight.NetAmount,
                commission : commission,
                tds_on_commission : tds,
                yq_tax : 0,
                yr_tax : 0,
                k3_tax : 0,
                additional_taxes : 0,
                tdo_markup : 0,
                agent_markup : 0,
                service_fee : 0,
                other_charges : 0,
                transaction_fee :  0,
                segments : segArray,
                paxPrice: paxFare
            }

            trips.push(trip);

            console.log("trips",trips)

        return `
       <section class="flight-fare-summary-section">
                                <div class="fare-summary_container flex-1">
                                    <div class="fare-summary_title d-flex justify-content-between align-items-center">
                                        <span>FARE SUMMARY</span>
                                        <button type="button" class="app-btn-transparent p-0 dark-grey-color fs-16" onclick="showPayment()"
                                                style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0"
                                                 viewBox="0 0 512 512" height="1em" width="1em"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path d="M256 105c-101.8 0-188.4 62.4-224 151 35.6 88.6 122.2 151 224 151s188.4-62.4 224-151c-35.6-88.6-122.2-151-224-151zm0 251.7c-56 0-101.8-45.3-101.8-100.7S200 155.3 256 155.3 357.8 200.6 357.8 256 312 356.7 256 356.7zm0-161.1c-33.6 0-61.1 27.2-61.1 60.4s27.5 60.4 61.1 60.4 61.1-27.2 61.1-60.4-27.5-60.4-61.1-60.4z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="fare-summary_table watermarked"
                                         data-watermark="FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 ">
                                        ${adultCard}
                                        ${childCard}
                                        ${infantCard}
    
                                        <div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="text-center fw-600 fs-14 ">Total Fare</div>
                                            ${adultCount}
                                            ${childCount}
                                            ${infantCount}
                                            <div class="d-flex justify-content-between"><span
                                                        class="fw-500">Platform Fee</span><span class="fw-600">AED0</span></div>
                                            <div class="d-flex justify-content-between"><span
                                                        class="fw-500">Platform Tax</span><span class="fw-600">AED${calculatedTax}</span></div>
                                        </div>
                                        <div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2 paymentBreak hidden">
                                        <div class="d-flex justify-content-between fw-600 mb-2">
                                            <span>Payment Breakdown</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Gross Fare By Vendor:</span><span class="fw-500">${totalPublishFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>Magin Given to TDO by Vendor:</span><span class="fw-500">${fareDifference}</span></div>
                                            <div class="d-flex justify-content-between"><span>Net Price For TDO:</span><span class="fw-500">${netPrice}</span></div>
                                        <div class="d-flex justify-content-between"><span>TDO Markup(Already Added in Net):</span><span class="fw-500">${totalMarkup}</span></div>
                                        <div class="d-flex justify-content-between"><span>Travel Agent Markup:</span><span class="fw-500">${markup_by_agent}</span></div>
                                        <div class="d-flex justify-content-between"><span>Commission:</span><span class="fw-500">${commission}</span></div>
                                        <div class="d-flex justify-content-between"><span>TDS On Commission:</span><span class="fw-500">${tds}</span></div>
                                        <div class="d-flex justify-content-between"><span>Platform Fee:</span><span class="fw-500">0</span></div>
                                        <div class="d-flex justify-content-between"><span>Platform Tax:</span><span class="fw-500">${calculatedTax}</span></div>
                                     <div class="d-flex justify-content-between">
    <span>Net Payable by Travel Agent :</span>
    <span class="fw-500">AED${amountPayable}</span>
</div>
  <div class="d-flex justify-content-between"><span>Net Earned By TDO:</span><span class="fw-500">${(parseFloat(totalMarkup)).toFixed(2)}</span></div>
  <div class="d-flex justify-content-between"><span>Net Earned By Agent:</span><span class="fw-500">${((parseFloat(totalPublishFare) - parseFloat(amountPayable)) + parseFloat(markup_by_agent)).toFixed(2)}</span></div>
                                     </div>
                                    </div>
                             
                                    <div class="fare-summary_footer watermarked">
                                        <div class="row spacing-0"><span class="col fare-summary_footer_title">Net Payable</span><span
                                                    class="col fare-summary_footer_value d-flex flex-column"><span id="totalAmountSpan">${(parseFloat(totalAmount)).toFixed(2)}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="my-3 d-none d-sm-block">
                                    <div class="booking-counter-background">
                                        <div class="countdown-timer">
                                            <div class="text-center">
                                                <div class="countdown-timer__timer">
                                                    <div id="timer"><span class="me-1">00</span><span>:</span><span
                                                                class="ms-1">00</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
       `


    }

}


class TRIPJACKFareBreakupCard {

    constructor(fare,adults,childs,infants)
    {
        this.fare = fare;
        this.adults = adults;
        this.childs = childs;
        this.infants = infants;
    }



    render()
    {

        let flight = this.fare.tripInfos[0];
        let totalFare = 0;

        let adultFare = 0;
        let adultCount = ``;
        let childCount = ``;
        let infantCount = ``;
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

        let adultCard = '';
        let childCard = '';
        let infantCard = '';


        let totalPax = parseInt(arr.adults) + parseInt(arr.childs);

        let markup_by_agent  = parseFloat(arr.Segments[0].FareBreakup.MARKUP_ADDED_BY_AGENT);

        const fareDifference = parseFloat((parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF || 0) - parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.NF || 0)).toFixed(2));

        let markup_type = (fareDifference > 0) ? 'PLB' : 'Non PLB';

        let markup_value = arr.Segments[0].FareBreakup.TDO_MARKUP_PLB, markup_percentage = arr.Segments[0].FareBreakup.TDO_MARKUP_PERCENTAGE;

        let totalMarkup = (markup_type === 'PLB') ? ((fareDifference * parseFloat(markup_percentage) / 100)).toFixed(2) : (markup_value + (parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF) * parseFloat(markup_percentage) / 100)).toFixed(2)

        let totalPublishFare = (markup_type === 'PLB') ? parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF) : (parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF) + parseFloat(totalMarkup)).toFixed(2)

        let totalNetFare = (markup_type === 'PLB') ? parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.NF) + parseFloat(totalMarkup) : parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.NF) + parseFloat(totalMarkup)

        let commission = (fareDifference > 0) ? (fareDifference - totalMarkup).toFixed(2) : 0;

        let netPrice = (markup_type === 'PLB') ? ((parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF) + parseFloat(totalMarkup)) - fareDifference).toFixed(2) : (parseFloat(this.fare.totalPriceInfo.totalFareDetail.fC.TF) + parseFloat(totalMarkup) - fareDifference).toFixed(2);

        let tds  = (commission > 0) ? parseFloat((commission * 0.05).toFixed(2)) : 0


        let totalOtherTaxes = (
            (parseFloat(totalMarkup) +
                markup_by_agent) / totalPax
        ).toFixed(2);

        if (flight.totalPriceList[0].fd) {
            if ("ADULT" in flight.totalPriceList[0].fd) {
                adultFare = flight.totalPriceList[0].fd.ADULT.fC.TF
                adultTotaltax = flight.totalPriceList[0].fd.ADULT.fC.TAF
                adultBaseFare = flight.totalPriceList[0].fd.ADULT.fC.BF

                const afCTaxes = flight.totalPriceList[0].fd.ADULT.afC.TAF;

                for (const [taxName, taxValue] of Object.entries(afCTaxes)) {
                    if (taxName === "YQ") {
                        adultyqTax = taxValue;
                    } else if (taxName === "YR") {
                        adultyrTax = taxValue;
                    } else if (taxName === "K3") {
                        adultk3Tax = taxValue;
                    } else {
                        adultTaxesSum += taxValue;
                    }
                }

                adultCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult:</span><span
                                                        class="fw-500">${adultBaseFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${adultyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${(adultTaxesSum + parseFloat(totalOtherTaxes)).toFixed(2)}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${adultk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${adultyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult Total:</span><span
                                                        class="fw-600">${(adultFare + parseFloat(totalOtherTaxes)).toFixed(2)}</span></div>
                                        </div>`


                adultCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${this.adults} x Adult</span><span
                                                        class="fw-600">${((adultFare * parseFloat(this.adults)) + (parseFloat(totalOtherTaxes) * parseFloat(this.adults))).toFixed(2)}</span></div>`

                totalFare += (adultFare * parseFloat(this.adults)) ;
            }
            if ("CHILD" in flight.totalPriceList[0].fd) {
                childFare = flight.totalPriceList[0].fd.CHILD.fC.TF
                childTotalTax =flight.totalPriceList[0].fd.CHILD.fC.TAF;
                childBasefare = flight.totalPriceList[0].fd.CHILD.fC.BF;

                const afCTaxes = flight.totalPriceList[0].fd.CHILD.afC.TAF;

                for (const [taxName, taxValue] of Object.entries(afCTaxes)) {
                    if (taxName === "YQ") {
                        childyqTax = taxValue;
                    } else if (taxName === "YR") {
                        childyrTax = taxValue;
                    } else if (taxName === "K3") {
                        childk3Tax = taxValue;
                    } else {
                        childTaxesSum += taxValue;
                    }
                }

                childCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Child:</span><span
                                                        class="fw-500">${childBasefare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${childyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${(childTaxesSum + parseFloat(totalOtherTaxes)).toFixed(2)}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${childk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${childyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Child Total:</span><span
                                                        class="fw-600">${(childFare + parseFloat(totalOtherTaxes)).toFixed(2)}</span></div>
                                        </div>`


                childCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${this.childs} x Child</span><span
                                                        class="fw-600">${((childFare * parseFloat(this.childs)) + (parseFloat(totalOtherTaxes) * parseFloat(this.childs))).toFixed(2)}</span></div>`

                totalFare += (childFare * parseFloat(this.childs))
            }
            if ("INFANT" in flight.totalPriceList[0].fd) {
                infantFare = flight.totalPriceList[0].fd.INFANT.fC.TF
                infantTotalTax = flight.totalPriceList[0].fd.INFANT.fC.TAF
                infantBaseFare = flight.totalPriceList[0].fd.INFANT.fC.BF;

                const afCTaxes = flight.totalPriceList[0].fd.INFANT.afC.TAF;

                for (const [taxName, taxValue] of Object.entries(afCTaxes)) {
                    if (taxName === "YQ") {
                        infantyqTax = taxValue;
                    } else if (taxName === "YR") {
                        infantyrTax = taxValue;
                    } else if (taxName === "K3") {
                        infantk3Tax = taxValue;
                    } else {
                        infantTaxesSum += taxValue;
                    }
                }

                infantCard = `<div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="d-flex justify-content-between fw-600 mb-2">
                                                <span>Fare/Pax Type</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Infant:</span><span
                                                        class="fw-500">${infantBaseFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>YQ Tax:</span><span
                                                        class="fw-500">${infantyqTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>OtherTaxes:</span><span
                                                        class="fw-500">${infantTaxesSum}</span></div>
                                            <div class="d-flex justify-content-between"><span>K3/AirlineGST:</span><span
                                                        class="fw-500">${infantk3Tax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Fuel Charge:</span><span
                                                        class="fw-500">${infantyrTax}</span></div>
                                            <div class="d-flex justify-content-between"><span>Adult Total:</span><span
                                                        class="fw-600">${infantFare}</span></div>
                                        </div>`


                infantCount = `<div class="d-flex justify-content-between"><span
                                                        class="fw-500">${this.infants} x Infant</span><span
                                                        class="fw-600">${infantFare * parseFloat(this.infants)}</span></div>`

                totalFare += infantFare * parseFloat(this.infants)
            }
        }

        let calculatedTax = (platformFee * (platformTax/100)).toFixed(2);

        totalAmount = totalFare + (totalOtherTaxes * totalPax) + platformFee + parseFloat(calculatedTax);

        let amountPayable = (parseFloat(netPrice) + tds + parseFloat(platformFee) + parseFloat(calculatedTax)).toFixed(2);

        return `
       <section class="flight-fare-summary-section">
                                <div class="fare-summary_container flex-1">
                                    <div class="fare-summary_title d-flex justify-content-between align-items-center">
                                        <span>FARE SUMMARY</span>
                                        <button type="button" class="app-btn-transparent p-0 dark-grey-color fs-16" onclick="showPayment()"
                                                style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0"
                                                 viewBox="0 0 512 512" height="1em" width="1em"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path d="M256 105c-101.8 0-188.4 62.4-224 151 35.6 88.6 122.2 151 224 151s188.4-62.4 224-151c-35.6-88.6-122.2-151-224-151zm0 251.7c-56 0-101.8-45.3-101.8-100.7S200 155.3 256 155.3 357.8 200.6 357.8 256 312 356.7 256 356.7zm0-161.1c-33.6 0-61.1 27.2-61.1 60.4s27.5 60.4 61.1 60.4 61.1-27.2 61.1-60.4-27.5-60.4-61.1-60.4z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="fare-summary_table watermarked"
                                         data-watermark="FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 ">
                                        ${adultCard}
                                        ${childCard}
                                        ${infantCard}
                                        <div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2">
                                            <div class="text-center fw-600 fs-14 ">Total Fare</div>
                                            ${adultCount}
                                            ${childCount}
                                            ${infantCount}
                                                 <div class="d-flex justify-content-between"><span
                                                        class="fw-500">Platform Fee</span><span class="fw-600">AED${platformFee}</span></div>
                                            <div class="d-flex justify-content-between"><span
                                                        class="fw-500">Platform Tax</span><span class="fw-600">AED${calculatedTax}</span></div>
                                        </div>
                                        <div class="row spacing-0 px-2 py-1 d-flex flex-column gap-2 paymentBreak hidden">
                                        <div class="d-flex justify-content-between fw-600 mb-2">
                                            <span>Payment Breakdown</span><span>Amount</span></div>
                                            <div class="d-flex justify-content-between"><span>Gross Fare By Vendor:</span><span class="fw-500">${totalPublishFare}</span></div>
                                            <div class="d-flex justify-content-between"><span>Magin Given to TDO by Vendor:</span><span class="fw-500">${fareDifference}</span></div>
                                            <div class="d-flex justify-content-between"><span>Net Price For TDO:</span><span class="fw-500">${netPrice}</span></div>
                                        <div class="d-flex justify-content-between"><span>TDO Markup(Already Added in Net):</span><span class="fw-500">${totalMarkup}</span></div>
                                        <div class="d-flex justify-content-between"><span>Travel Agent Markup:</span><span class="fw-500">${markup_by_agent}</span></div>
                                        <div class="d-flex justify-content-between"><span>Commission:</span><span class="fw-500">${commission}</span></div>
                                        <div class="d-flex justify-content-between"><span>TDS On Commission:</span><span class="fw-500">${tds}</span></div>
                                        <div class="d-flex justify-content-between"><span>Platform Fee:</span><span class="fw-500">${platformFee}</span></div>
                                        <div class="d-flex justify-content-between"><span>Platform Tax:</span><span class="fw-500">${calculatedTax}</span></div>
                                     <div class="d-flex justify-content-between">
    <span>Net Payable by Travel Agent :</span>
    <span class="fw-500">AED${amountPayable}</span>
</div>
  <div class="d-flex justify-content-between"><span>Net Earned By TDO:</span><span class="fw-500">${(parseFloat(totalMarkup) + parseFloat(platformFee)).toFixed(2)}</span></div>
  <div class="d-flex justify-content-between"><span>Net Earned By Agent:</span><span class="fw-500">${((parseFloat(totalPublishFare) + parseFloat(platformFee) + parseFloat(calculatedTax) - parseFloat(amountPayable)) + parseFloat(markup_by_agent)).toFixed(2)}</span></div>
                                     </div>
                                    </div>
                                    <div class="fare-summary_footer watermarked"
                                         data-watermark="FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 FW76315 ">
                                        <div class="row spacing-0"><span class="col fare-summary_footer_title">Net Payable</span><span
                                                    class="col fare-summary_footer_value d-flex flex-column"><span id="totalAmountSpan">${(parseFloat(totalAmount) - parseFloat(fareDifference)).toFixed(2)}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="my-3 d-none d-sm-block">
                                    <div class="booking-counter-background">
                                        <div class="countdown-timer">
                                            <div class="text-center">
                                                <div class="countdown-timer__timer">
                                                    <div id="timer"><span class="me-1">00</span><span>:</span><span
                                                                class="ms-1">00</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
       `
    }

}

class PassengerForm
{
    constructor(type, index, passportAtHold, passportAtTicket)
    {
        this.type = type;
        this.index = index;
        this.passportAtHold = passportAtHold;
        this.passportAtTicket = passportAtTicket;
    }

    render()
    {
        let title = '';

        if(this.type === 'Adult')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
              <option value="MR">Mr</option>
              <option value="MRS">Mrs</option>
              <option value="MS">Ms</option>
              <option value="MS">Miss</option>
              <option value="MSTR">Mstr</option>
          </select>`;
        }
        if(this.type === 'Child')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                  <option value="MS">Ms</option>
                  <option value="MS">Miss</option>
                  <option value="MSTR">Mstr</option>
              </select>`;
        }
        if(this.type === 'Infant')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                  <option value="MS">Ms</option>
                  <option value="MS">Miss</option>
                  <option value="MSTR">Mstr</option>
                  </select>`;
        }


        let passportDetails = ``;

        if(this.passportAtHold === false && this.passportAtTicket === false)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }
        else if(this.passportAtHold === false)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }
        else if(this.passportAtTicket === false)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }


        return `
         <div class="traveller-count p-2 ps-3">${this.type} ${this.index}</div>
                                        <div class="saved-travellers  fs-14">
                                            <div class="spacing-8 mb-2 row">
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="app-text-input position-relative"><label
                                                                class="position-absolute z-1 text-input-label required">Select
                                                            Title</label>
                                                      ${title}
                                                    </div>
                                                </div>
                                                <div class="mb-sm-0 mb-3 col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">First
                                                            name</label>
                                                           <input name="${this.type}_first_name${this.index}" 
                                                        placeholder=""
                                                        class="traveller-input false" 
                                                        type="text" 
                                                        id="${this.type}_first_name${this.index}" 
                                                        required 
                                                        value=""
                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;"
                                                        oninput="this.value = this.value.replace(/[^A-Za-z\\s]/g, '')">

                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Last
                                                            name</label><input name="${this.type}_last_name${this.index}" placeholder=""
                                                            class="traveller-input false" type="text"
                                                            id="${this.type}_last_name${this.index}" required value=""
                                                            style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;"
                                                            oninput="this.value = this.value.replace(/[^A-Za-z]/g, '')">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Date of Birth
                                                        </label><input name="${this.type}_dob${this.index}" 
       placeholder="Select Date" 
       class="traveller-input false" 
       type="date"
       id="${this.type}_dob${this.index}" 
       required 
       style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;" 
       onfocus="setDateRestrictions(this,'${this.type}')">


                                                    </div>
                                                </div>
                                                ${passportDetails}
                                            </div>
                                            <div class="d-flex justify-content-between">
                                            </div>
                                        </div>
        `
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let dobInputs = document.querySelectorAll("input[id$='_dob']");

    dobInputs.forEach(input => {
        input.addEventListener("keydown", function (e) {
            // Allow backspace, delete, and numbers
            if (!e.key.match(/[0-9-]/) && e.key !== "Backspace" && e.key !== "Delete") {
                e.preventDefault();
            }
        });
    });
});



class PassengerForm1
{
    constructor(type, index, passportAtHold, passportAtTicket)
    {
        this.type = type;
        this.index = index;
        this.passportAtHold = passportAtHold;
        this.passportAtTicket = passportAtTicket;
    }

    render()
    {
        let title = '';

        if(this.type === 'Adult')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="MRS">Mrs</option>
          </select>`;
        }
        if(this.type === 'Child')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                  <option value="Master">Master</option>
                  <option value="Ms">Ms</option>
              </select>`;
        }
        if(this.type === 'Infant')
        {
            title = `  <select  class="traveller-input false" name="${this.type}_title${this.index}" id="${this.type}_title${this.index}" required style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                  <option value="Ms">Ms</option>
                      <option value="Master">Master</option>
                  </select>`;
        }


        let passportDetails = ``;

        if(this.passportAtHold === true && this.passportAtTicket === true)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }
        else if(this.passportAtHold === true)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }
        else if(this.passportAtTicket === true)
        {
            passportDetails+=`<div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Number</label><input name="${this.type}_passport_number${this.index}" placeholder=""
                                                                                 class="traveller-input false" type="text"
                                                                                 id="${this.type}_passport_number${this.index}" required value=""
                                                                                 style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Issue</label><input name="${this.type}_passport_issue${this.index}" placeholder=""
                                                                                        class="traveller-input false" type="date"
                                                                                        id="${this.type}_passport_issue${this.index}" required value="" onfocus="setPassportIssueDateRestrictions(this)"
                                                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Date of Expiry</label><input name="${this.type}_passport_expiry${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="date"
                                                                                         id="${this.type}_passport_expiry${this.index}" required value="" onfocus="setPassportExpiryDateRestrictions(this)"
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Passport
                                                            Place of Issue</label><input name="${this.type}_passport_place${this.index}" placeholder=""
                                                                                         class="traveller-input false" type="text"
                                                                                         id="${this.type}_passport_place${this.index}" required value=""
                                                                                         style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;">
                                                    </div>
                                                </div>`;
        }


        return `
         <div class="traveller-count p-2 ps-3">${this.type} ${this.index}</div>
                                        <div class="saved-travellers  fs-14">
                                            <div class="spacing-8 mb-2 row">
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="app-text-input position-relative"><label
                                                                class="position-absolute z-1 text-input-label required">Select
                                                            Title</label>
                                                      ${title}
                                                        <!--                                                        <div class="app-select title-select css-b62m3t-container"-->
                                                        <!--                                                             id="title"><span id="react-select-3-live-region"-->
                                                        <!--                                                                              class="css-7pg0cj-a11yText"></span><span-->
                                                        <!--                                                                    aria-live="polite" aria-atomic="false"-->
                                                        <!--                                                                    aria-relevant="additions text" role="log"-->
                                                        <!--                                                                    class="css-7pg0cj-a11yText"></span>-->
                                                        <!--                                                            <div class=" css-1mzbvz2-control">-->
                                                        <!--                                                                <div class=" css-13mzt3w">-->
                                                        <!--                                                                    <div class=" css-1jqq78o-placeholder"-->
                                                        <!--                                                                         id="react-select-3-placeholder"></div>-->
                                                        <!--                                                                    <div class=" css-19bb58m" data-value=""><input-->
                                                        <!--                                                                                class="" autocapitalize="none"-->
                                                        <!--                                                                                autocomplete="off" autocorrect="off"-->
                                                        <!--                                                                                id="react-select-3-input"-->
                                                        <!--                                                                                spellcheck="false" tabindex="0"-->
                                                        <!--                                                                                type="text" aria-autocomplete="list"-->
                                                        <!--                                                                                aria-expanded="false"-->
                                                        <!--                                                                                aria-haspopup="true"-->
                                                        <!--                                                                                aria-required="true" role="combobox"-->
                                                        <!--                                                                                aria-activedescendant=""-->
                                                        <!--                                                                                aria-describedby="react-select-3-placeholder"-->
                                                        <!--                                                                                value=""-->
                                                        <!--                                                                                style="color: inherit; background: 0px center; opacity: 1; width: 100%; grid-area: 1 / 2; font: inherit; min-width: 2px; border: 0px; margin: 0px; outline: 0px; padding: 0px;">-->
                                                        <!--                                                                    </div>-->
                                                        <!--                                                                </div>-->
                                                        <!--                                                                <div class=" css-1wy0on6"><span-->
                                                        <!--                                                                            class=" css-1u9des2-indicatorSeparator"></span>-->
                                                        <!--                                                                    <div class=" css-1xc3v61-indicatorContainer"-->
                                                        <!--                                                                         aria-hidden="true">-->
                                                        <!--                                                                        <svg height="20" width="20" viewBox="0 0 20 20"-->
                                                        <!--                                                                             aria-hidden="true" focusable="false"-->
                                                        <!--                                                                             class="css-8mmkcg">-->
                                                        <!--                                                                            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>-->
                                                        <!--                                                                        </svg>-->
                                                        <!--                                                                    </div>-->
                                                        <!--                                                                </div>-->
                                                        <!--                                                            </div>-->
                                                        <!--                                                            <input required="" tabindex="-1" aria-hidden="true"-->
                                                        <!--                                                                   class="css-1a0ro4n-requiredInput" value=""></div>-->
                                                    </div>
                                                </div>
                                                <div class="mb-sm-0 mb-3 col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">First
                                                            name</label>
                                                           <input name="${this.type}_first_name${this.index}" 
                                                        placeholder=""
                                                        class="traveller-input false" 
                                                        type="text" 
                                                        id="${this.type}_first_name${this.index}" 
                                                        required 
                                                        value=""
                                                        style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;"
                                                        oninput="this.value = this.value.replace(/[^A-Za-z\\s]/g, '')">

                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Last
                                                            name</label><input name="${this.type}_last_name${this.index}" placeholder=""
                                                            class="traveller-input false" type="text"
                                                            id="${this.type}_last_name${this.index}" required value=""
                                                            style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;"
                                                            oninput="this.value = this.value.replace(/[^A-Za-z]/g, '')">
                                                    </div>
                                                </div>
                                                <div class="col-lg-3 col-md-3 col-sm-3 col-12">
                                                    <div class="position-relative app-text-input"><label
                                                                class="position-absolute text-input-label required">Date of Birth
                                                        </label><input name="${this.type}_dob${this.index}" 
           placeholder="" 
           class="traveller-input false" 
           type="date" 
           id="${this.type}_dob${this.index}" 
           required 
           value="" 
           style="height: 42px; border: 0.0625rem solid rgb(221, 221, 221); padding: 12px; border-radius: 6px; width: 100%;"
           onfocus="setDateRestrictions(this,'${this.type}')">

                                                    </div>
                                                </div>
                                                ${passportDetails}
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <div><a class="fs-12 app-link-purple">Save Pax Details</a></div>
                                                <div><a class="fs-12 app-link-purple">Select Passengers</a></div>
                                            </div>
                                        </div>
        `
    }
}

class makePassengerArray
{

    constructor(passengerType, fareBreakdown, index, paxType, airlineCode, flightNumber, passportAtBook, passportAtTicket, type)
    {
        this.passengerType = passengerType;
        this.fareBreakdown = fareBreakdown;
        this.index = index;
        this.paxType = paxType;
        this.airlineCode = airlineCode;
        this.flightNumber = flightNumber;
        this.passportAtBook  = passportAtBook;
        this.passportAtTicket = passportAtTicket;
        this.type = type;

    }

    renderTBO()
    {

        let meal  = [];
        let bag = [];
        let seat = [];

    

        if(finalMealArray.length > 0)
        {
            let mealObj = finalMealArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(mealObj.length === 0)
            {
                meal = null;
            }
            else
            {
     
                    mealObj.forEach(myMeal => {
                        let mealobj = {
                            SSRCode : myMeal.SSRCode,
                            SSRKey : myMeal.SSRKey,
                            SegmentReferenceNumber :  myMeal.SSRReferenceNumber
                        }
                        meal.push(mealobj);
                    })
                
            }
        }
 


        if(baggageArray.length > 0)
        {
            let bagObj = baggageArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(bagObj.length === 0)
            {
                bag = [];
            }
            else {
              
                    bagObj.forEach(myBag => {
                        let bagobj = {
                            SSRCode : myBag.SSRCode,
                            SSRKey : myBag.SSRKey,
                            SegmentReferenceNumber :  myBag.SSRReferenceNumber
                        }
                        bag.push(bagobj);
                    })
            }
        }

        if(selectedSeats.length > 0)
            {
                let bagObj = selectedSeats.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);
    
                if(bagObj.length === 0)
                {
                    seat = [];
                }
                else {
                  
                        bagObj.forEach(myBag => {
                            let bagobj = {
                                SeatName : myBag.seatNo,
                                SeatAmount : myBag.price,
                                SeatKeyRef : myBag.SeatKeyRef,
                                SegmentReferenceNumber :  myBag.SegmentReferenceNumber,
                                FlightNumber : myBag.FlightNumber
                            }
                            seat.push(bagobj);
                        })
                }
            }



        let flight = this.fareBreakdown;


        let obj = {
            "paxType": this.paxType,
            "profession":"yjgq",
            "title":document.getElementById(`${this.passengerType}_title${this.index}`).value,
            "firstName": document.getElementById(`${this.passengerType}_first_name${this.index}`).value,
            "middleName": "",
            "lastName": document.getElementById(`${this.passengerType}_last_name${this.index}`).value,
            "frequentFlyNo":"",
            "mcoAmount":0,
            "markUp":0,
            "gender": "Male",
            "dateOfBirth": `${document.getElementById(`${this.passengerType}_dob${this.index}`).value}`,
            "BaggageDetails":bag,
            "MealsDetails":meal,
            "SeatDetails": seat
        }

        let passport = {};


        // if(this.passportAtBook === true && this.type === "HOLD")
        // {
        //     passport = {
        //         "CountryCode": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
        //         "CellCountryCode": "+91",
        //         "PassportNo": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
        //         "PassportExpiry": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}T00:00:00`,
        //         "PassportIssueDate": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}T00:00:00`,
        //         "PassportIssueCountryCode": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
        //     }
        //
        //     obj = {...obj , ...passport}
        //
        // }

        if(this.passportAtTicket === false  || this.passportAtBook === false)
        {
            passport = {
                // "CountryCode": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
                // "CellCountryCode": "+91",
                "passportNo": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
                "passportExpiry": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}T00:00:00`,
                // "PassportIssueDate": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}T00:00:00`,
                "passportIssueCountry": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
            }
            obj = {...obj , ...passport}

        }


        return  obj;
    }

    passengers()
    {

        let totalSSRAmount = 0;

        let meal  = [];
        let bag = [];
        let seat = [];

    

        if(finalMealArray.length > 0)
        {
            let mealObj = finalMealArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(mealObj.length === 0)
            {
                meal = null;
            }
            else
            {
                    mealObj.forEach(myMeal => {
                        let singleMeal = {
                            "origin" : myMeal.origin,
                            "destination" : myMeal.destination,
                            "ssr_type" : 'meal',
                            "description" : myMeal.title,
                            "price" : myMeal.price,
                            "remarks" : "Extra Meal Added"
                        }
                        totalSSRAmount += parseFloat(myMeal.price)
                        meal.push(singleMeal);
                    })

            }
        }
        else
        {
            meal = [];
        }


        if(baggageArray.length > 0)
        {
            let bagObj = baggageArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(bagObj.length === 0)
            {
                bag = [];
            }
            else
            {
                bagObj.forEach(myBag => {
                    let singleBag = {
                        "origin" : myBag.origin,
                        "destination" : myBag.destination,
                        'ssr_type' : "Baggage",
                        'description' : myBag.title,
                        'price' : myBag.price,
                        'remarks' : 'Extra Baggage Added'
                    }
                    totalSSRAmount += parseFloat(myBag.price)
                    bag.push(singleBag);
                })

            }
        }
        else
        {
            bag = [];
        }

        if(selectedSeats.length > 0)
            {
                let bagObj = selectedSeats.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);
    
                if(bagObj.length === 0)
                {
                    seat = [];
                }
                else
                {
                    bagObj.forEach(myBag => {
                        let singleBag = {
                            "origin" : myBag.origin,
                            "destination" : myBag.destination,
                            'ssr_type' : "Seat",
                            'description' : myBag.seatNo,
                            'price' : myBag.price,
                            'remarks' : 'Extra Seat Added'
                        }
                        totalSSRAmount += parseFloat(myBag.price)
                        seat.push(singleBag);
                    })
    
                }
            }
            else
            {
                seat = [];
            }


        let obj = {
            "salutation": document.getElementById(`${this.passengerType}_title${this.index}`).value,
            "first_name": document.getElementById(`${this.passengerType}_first_name${this.index}`).value,
            "last_name": document.getElementById(`${this.passengerType}_last_name${this.index}`).value,
            "pax_type": this.passengerType,
            "gender": 1,
            "date_of_birth": `${document.getElementById(`${this.passengerType}_dob${this.index}`).value}T00:00:00`,
            "address": "TDO Address",
            "country_code": "IN",
            "cell_country_code": "+91",
            "city": "Amritsar",
            "mobile_no": document.getElementById(`mobile`).value,
            "email_id": document.getElementById(`leademail`).value,
            "is_lead_pax": true,
            "total_ssr_amount" : totalSSRAmount,
            "ssr" : {
                'meal' : meal,
                'baggage' : bag,
                'seat' : seat
            }
        }

        let passport = {};


        if(this.passportAtBook === true && this.type === "HOLD")
        {
            passport = {
                "passport_no": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
                "passport_expiry": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}T00:00:00`,
                "passport_issue_date": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}T00:00:00`,
                "passport_issue_country_code": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
            }

            obj = {...obj , ...passport}

        }

        if(this.passportAtTicket === true && this.type === "TICKET")
        {
            passport = {

                "passport_no": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
                "passport_expiry": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}T00:00:00`,
                "passport_issue_date": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}T00:00:00`,
                "passport_issue_country_code": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
            }
            obj = {...obj , ...passport}

        }

       
        // let fare = paxFare[this.passengerType.toUpperCase()]
        //
        // obj = {...obj, ...fare}


        return  obj;
    }

    renderTRIPJACK()
    {


        let meal  = [];
        let bag = [];

        if(mealArray.length > 0)
        {
            let mealObj = mealArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(mealObj.length === 0)
            {
                meal = null;
            }
            else
            {
                mealObj.forEach(myMeal => {
                    let obj = {
                        "key" : myMeal.segmentId,
                        "code" : myMeal.code
                    }
                    meal.push(obj);
                })

            }
        }
        else
        {
            meal = null;
        }


        if(baggageArray.length > 0)
        {
            let bagObj = baggageArray.filter(meal => meal.id === `${this.passengerType}_first_name${this.index}`);

            if(bagObj.length === 0)
            {
                bag = null;
            }
            else
            {
                bagObj.forEach(myBag => {
                    let obj = {
                        "key" : myBag.segmentId,
                        "code" : myBag.code
                    }
                    bag.push(obj);
                })

            }
        }
        else
        {
            bag = null;
        }


        let flight = this.fareBreakdown;




        let paxBaseFare = 0;
        let paxTax  = 0;


        let obj = {
            "ti": document.getElementById(`${this.passengerType}_title${this.index}`).value,
            "fN": document.getElementById(`${this.passengerType}_first_name${this.index}`).value,
            "lN": document.getElementById(`${this.passengerType}_last_name${this.index}`).value,
            "pt": `${this.passengerType.toUpperCase()}`,
            "dob": `${document.getElementById(`${this.passengerType}_dob${this.index}`).value}`,
            "ssrMealInfos": meal,
            "ssrBaggageInfos": bag
        }

        let passport = {};

        if(this.passportAtBook === true && this.type === "HOLD")
        {
            passport = {
                "pNum": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
                "eD": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}`,
                "pNat": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
                "pid": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}`
            }

            obj = {...obj , ...passport}
        }

        if(this.passportAtTicket === true && this.type === "TICKET")
        {
            passport = {
                "pNum": document.getElementById(`${this.passengerType}_passport_number${this.index}`).value,
                "eD": `${document.getElementById(`${this.passengerType}_passport_expiry${this.index}`).value}`,
                "pNat": document.getElementById(`${this.passengerType}_passport_place${this.index}`).value,
                "pid": `${document.getElementById(`${this.passengerType}_passport_issue${this.index}`).value}`
            }
            obj = {...obj , ...passport}

        }

        return  obj;
    }

}

class mealSectors
{
    constructor(sector, index)
    {
        console.log("sectorsss",sector)
        this.sector  = sector;
        this.index = index;
    }
    renderMealSectors()
    {
        let active = '';

        active = (this.index === 0) ? 'meal-sector active-meal-sector' : 'meal-sector';

        return `<div class="${active}" id="${this.sector.Origin}-${this.sector.Destination}">${this.sector.Origin} - ${this.sector.Destination}</div>`;
    }
}

class baggageSectors
{
    constructor(origin, destination,index)
    {
        console.log(origin,destination)
        this.origin  = origin;
        this.destination = destination;
        this.index=index;
    }
    renderBaggageSectors()
    {
        let active = '';

        active = (this.index === 0) ? 'baggage-sector active-baggage-sector' : 'baggage-sector';

        return `<div class="${active}" id="${this.origin}-${this.destination}">${this.origin} - ${this.destination}</div>`;
    }
}

class mealOptions
{
    constructor(meal, index, traveller, origin, destination, segmentIndex)
    {
        console.log("aaaa",meal, index, traveller, origin, destination, segmentIndex)
        this.meal = meal;
        this.index = index;
        this.traveller = traveller;
        this.origin = origin;
        this.destination = destination;
        this.segmentIndex = segmentIndex;
    }

    renderMealDynamicOptions()
    {
        console.log("mdo")
        let price = this.meal?.SSRAmount || this.meal?.amount || 0;
        let button = '';

        let traveller =    finalMealArray.findIndex(meal => meal.id === this.traveller && meal.index === this.index && meal.origin === this.origin && meal.destination === this.destination);

        if(traveller !== -1) {
            button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="removeMeal(${traveller}, ${this.index}, ${this.segmentIndex},'${this.traveller}')"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Remove
          </button>`;
        }
        else
        {
            button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="AddMeal(${this.index},'${this.origin}','${this.destination}','${this.traveller}', ${this.segmentIndex},${price})"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Add
          </button>`;
        }



        return `
        <div class="col-sm-6">
    <div class="card p-2 mb-2">
        <div class="d-flex align-items-center">
            <!-- Meal Image -->
            <div>
                <img class="meal-image" src="https://static.iween.co.in/airlinelogos/mealicon.svg"
                     alt="1-Vegetable junglee sandwich in white bread" style="width: 60px; height: auto;">
            </div>

            <!-- Meal Info -->
            <div class="ps-3 pe-3 w-100 d-flex flex-column">
                <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.meal?.SSRDescription || this.meal?.desc || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>
                <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.meal?.SSRCode || this.meal?.desc || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>
                <!-- Price and Button -->
                <div class="d-flex justify-content-between align-items-center">
                    <p class="ssr-card__meal-name">AED ${this.meal?.SSRAmount.toFixed(2) || this.meal?.amount || 0}</p>
                  ${button}
                </div>
            </div>
        </div>
    </div>
</div>

        `;
    }

    renderMealOptions()
    {

        let price = this.meal?.Price || 0;
        let button = '';

        let traveller =    finalMealArray.findIndex(meal => meal.id === this.traveller && meal.index === this.index && meal.origin === this.origin && meal.destination === this.destination);

        if(traveller !== -1) {
            button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="removeMeal(${traveller}, ${this.index}, ${this.segmentIndex},'${this.traveller}')"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Remove
          </button>`;
        }
        else
        {
            button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="AddMeal(${this.index},'${this.origin}','${this.destination}','${this.traveller}', ${this.segmentIndex},${price})"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Add
          </button>`;
        }



        return `
        <div class="col-sm-6">
    <div class="card p-2 mb-2">
        <div class="d-flex align-items-center">
            <!-- Meal Image -->
            <div>
                <img class="meal-image" src="https://static.iween.co.in/airlinelogos/mealicon.svg"
                     alt="1-Vegetable junglee sandwich in white bread" style="width: 60px; height: auto;">
            </div>

            <!-- Meal Info -->
            <div class="ps-3 pe-3 w-100 d-flex flex-column">
                <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.meal?.Description || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>

                <!-- Price and Button -->
                <div class="d-flex justify-content-between align-items-center">
                    <p class="ssr-card__meal-name">AED${this.meal?.Price || 0}</p>
                  ${button}
                </div>
            </div>
        </div>
    </div>
</div>

        `;
    }
}

class baggageOptions
{
    constructor(baggage, index, traveller, origin, destination, segmentIndex)
    {

        this.baggage = baggage;
        this.index = index;
        this.traveller = traveller;
        this.origin = origin;
        this.destination = destination;
        this.segmentIndex = segmentIndex;
    }

    renderBaggageOptions()
    {
        console.log("ggg")
        if(this.segmentIndex === 0)
        {

            let price = this.baggage?.SSRAmount || 0;
            console.log(this.baggage.SSRAmount)
            let button = '';

            let traveller =    baggageArray.findIndex(meal => meal.id === this.traveller && meal.index === this.index && meal.origin === this.origin && meal.destination === this.destination);

            if(traveller !== -1) {
                button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="removeBaggage(${traveller}, ${this.index}, ${this.segmentIndex},'${this.traveller}')"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Remove
          </button>`;
            }
            else
            {
                button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="AddBaggage(${this.index},'${this.origin}','${this.destination}','${this.traveller}', ${this.segmentIndex},${price})"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Add
          </button>`;
            }



            return `
        <div class="col-sm-6">
    <div class="card p-2 mb-2">
        <div class="d-flex align-items-center">
            <!-- Meal Image -->
            <div>
                <img class="meal-image" src="https://static.iween.co.in/airlinelogos/excessbaggage.svg"
                     alt="1-Vegetable junglee sandwich in white bread" style="width: 60px; height: auto;">
            </div>

            <!-- Meal Info -->
            <div class="ps-3 pe-3 w-100 d-flex flex-column">
            <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.baggage?.SSRDescription || this.baggage?.desc || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>
                <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.baggage?.SSRCode || this.baggage?.desc || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>

                <!-- Price and Button -->
                <div class="d-flex justify-content-between align-items-center">
                    <p class="ssr-card__meal-name">AED ${this.baggage?.SSRAmount.toFixed(2) || this.baggage?.amount || 0}</p>
                  ${button}
                </div>
            </div>
        </div>
    </div>
</div>

        `;
        }
        else
        {
            let amount = this.baggage?.amount || 0
            if(amount === 0)
            {

                let price = this.baggage?.Price || this.baggage?.amount || 0;
                let button = '';

                let traveller =    baggageArray.findIndex(meal => meal.id === this.traveller && meal.index === this.index && meal.origin === this.origin && meal.destination === this.destination);

                if(traveller !== -1) {
                    button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="removeBaggage(${traveller}, ${this.index}, ${this.segmentIndex},'${this.traveller}')"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Remove
          </button>`;
                }
                else
                {
                    button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="AddBaggage(${this.index},'${this.origin}','${this.destination}','${this.traveller}', ${this.segmentIndex},${price})"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Add
          </button>`;
                }



                return `
        <div class="col-sm-6">
    <div class="card p-2 mb-2">
        <h4 style="text-align: center">What Baggage Select In The First Segment Is Applicable for this Segment as well</h4>
    </div>
</div>

        `;
            }
            else
            {

                let price = this.baggage?.Price || this.baggage?.amount || 0;
                let button = '';

                let traveller =    baggageArray.findIndex(meal => meal.id === this.traveller && meal.index === this.index && meal.origin === this.origin && meal.destination === this.destination);

                if(traveller !== -1) {
                    button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="removeBaggage(${traveller}, ${this.index}, ${this.segmentIndex},'${this.traveller}')"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Remove
          </button>`;
                }
                else
                {
                    button = `<button type="button"
                           class="app-btn app-btn-primary app-btn-medium ssr-card__add-btn" onclick="AddBaggage(${this.index},'${this.origin}','${this.destination}','${this.traveller}', ${this.segmentIndex},${price})"
                           style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
              Add
          </button>`;
                }



                return `
        <div class="col-sm-6">
    <div class="card p-2 mb-2">
        <div class="d-flex align-items-center">
            <!-- Meal Image -->
            <div>
                <img class="meal-image" src="https://static.iween.co.in/airlinelogos/mealicon.svg"
                     alt="1-Vegetable junglee sandwich in white bread" style="width: 60px; height: auto;">
            </div>

            <!-- Meal Info -->
            <div class="ps-3 pe-3 w-100 d-flex flex-column">
                <div class="flex-1">
                    <p class="ssr-card__meal-name">${this.baggage?.Code || this.baggage?.desc || 'No Meal'}</p>
                    <p class="ssr-card__meal-description"></p>
                </div>

                <!-- Price and Button -->
                <div class="d-flex justify-content-between align-items-center">
                    <p class="ssr-card__meal-name">AED${this.baggage?.Price || this.baggage?.amount || 0}</p>
                  ${button}
                </div>
            </div>
        </div>
    </div>
</div>

        `;
            }
        }
    }
}

class mealPassengers
{
    constructor(pax, index)
    {
        this.pax = pax;
        this.index = index;
    }

    renderMealPassengers()
    {
        let active = '';

        active = (this.pax === "Adult" && this.index === 1) ? 'traveller-name active-traveller' : 'traveller-name';

        return `
    <div class="${active}" id="${this.pax}_first_name${this.index}">${document.getElementById(`${this.pax}_first_name${this.index}`).value}
    <div class="text-center m-2 separator" id="${this.pax}_first_name${this.index}separator">Aed 0</div>
    </div>
`;

    }
}

class seatPassengers
{
    constructor(pax, index)
    {
        this.pax = pax;
        this.index = index;
    }

    renderSeatPassengers()
    {
        let active = '';

        active = (this.pax === "Adult" && this.index === 1) ? 'seat-traveller-name current-traveller-seat-selection' : 'seat-traveller-name';

        return `
    <div class="${active}" id="${this.pax}_first_name${this.index}"><span>${document.getElementById(`${this.pax}_first_name${this.index}`).value}</span>
    <div id="${this.pax}_first_name${this.index}seat"></div>
    </div><br>
`;

    }
}

class seatSectors
{
    constructor(sector, index, segmentIndex)
    {
        this.sector  = sector;
        this.index = index;
        this.segmentIndex = segmentIndex
    }
    renderSeatSectors()
    {
        let active = '';

        active = (this.index === 0) ? 'seat-sector active-seat-sector' : 'seat-sector';

        return `<div class="${active}" id="${this.index}-${this.sector.Origin}-${this.sector.Destination}">${this.sector.Origin} - ${this.sector.Destination}</div>`;
    }

}

class baggagePassengers
{
    constructor(pax, index)
    {
        this.pax = pax;
        this.index = index;
    }

    renderBaggagePassengers()
    {
        let active = '';

        active = (this.pax === "Adult" && this.index === 1) ? 'baggage-traveller-name active-traveller' : 'baggage-traveller-name';

        return `
    <div class="${active}" id="${this.pax}_first_name${this.index}">${document.getElementById(`${this.pax}_first_name${this.index}`).value}
    <div class="text-center m-2 separator" id="${this.pax}_first_name${this.index}baggage">Aed 0</div>
    </div>
`;

    }
}


// This function will render the fare breakup for the selected flight in flight search page
async function renderSideBar(index) {
    // Get the selected flight's segments
    const selectedFlight = (filteredFlights.length > 0) ? filteredFlights[index] :  flightData[index];
    console.log(selectedFlight)

    let selectedValue;
    // Get all radio buttons with the name "gender"
    const radios = document.getElementsByName(index);

    // Iterate through the radio buttons
    for (let i = 0; i < radios.length; i++) {
        // Check if the current radio button is selected
        if (radios[i].checked) {
            // Display the value of the selected radio button
            selectedValue = radios[i].value;
            break;  // Exit the loop once a selected button is found
        }
    }

    // Define dynamic content using template literals (backticks)
    let content = `
    <div class="fade modal-backdrop show" id="div1"></div>
    `;

    // Create a wrapper div to hold the content
    let wrapper = document.createElement("div");

    // Set the innerHTML of the wrapper to the dynamic content
    wrapper.innerHTML = content;

    // Insert the wrapper before the body content
    document.body.parentNode.insertBefore(wrapper, document.body);

    let mySideBar = `
      <div class="modal-dialog slide-from-right-animation modal-fullscreen" id="ans">
        <div class="modal-content">
            <div class="modal-header">
                <div class="app-sidebar__title modal-title h4">Flight Details</div>
                <button type="button" class="btn-close" aria-label="Close"  onclick="removeDiv()"></button>
            </div>
            <div class="flight-details-sidebar modal-body">
                <div class="flight-details_tabs">
                    <div class="flight-details_tabs_container">
                       <button class="tab-btn" data-target="flight-info">Flight Information</button>
                            <button class="tab-btn" data-target="fare-breakup">Fare Breakup</button>
                            <button class="tab-btn" data-target="baggage">Baggage</button>
                            <button class="tab-btn" data-target="fare-rules">Fare Rules</button>
                                   </div>
                </div>
                <div class="tab-content" id="flight-info">
                <div class="selected-flight-details__trip-details mt-2 ">
                    <div class="d-flex gap-2 trip-content align-items-center"><span class="sector-span">${selectedFlight.Origin.CityName}(${selectedFlight.Origin.CityCode}) -&gt; ${selectedFlight.Destination.CityName}(${selectedFlight.Destination.CityCode})</span><span
                            class="date-span">One Way  ${convertToDesiredFormat(`${selectedFlight.Origin.DepDate}`)}</span></div>
                </div>
                <div class="p-0 p-lg-3">
                    <section class="selected-flight-details">`

    selectedFlight.Segments[selectedValue].flightDetails.forEach((segment, index) => {
        const segmentCard = new SegmentInformation(segment, index, selectedFlight.Segments[selectedValue].fare)
        mySideBar+= segmentCard.render()
    })


    mySideBar +=`</section>
                </div>
                </div>
                <div class="tab-content" id="fare-breakup">
                 <div class="fare-breakup mt-3">
    <div class="fare-breakup_header">
        <div class="fare-breakup_header_title">FARE BREAKUP SUMMARY</div>
        <div class="fare-breakup_header_value">AMOUNT</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">Base Fare</div>
        <div style="position: absolute;left: 49%;top;10% ">AED</div>
        <div class="fare-breakup_value">${selectedFlight.Segments[selectedValue].FareBreakup.BaseFare}</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">YQ Tax</div>
        <div style="position: absolute;left: 49%;top;15% ">AED</div>
        <div class="fare-breakup_value">0</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">OT Tax</div>
        <div style="position: absolute;left: 49%;top;20% ">AED</div>
        <div class="fare-breakup_value">${selectedFlight.Segments[selectedValue].FareBreakup.totalTax}</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">K3</div>
        <div style="position: absolute;left: 49%;top;25% ">AED</div>
        <div class="fare-breakup_value">0</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">GST</div>
        <div style="position: absolute;left: 49%;top;30% ">AED</div>
        <div class="fare-breakup_value">0</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">HC</div>
        <div style="position: absolute;left: 49%;top;35% ">AED</div>
        <div class="fare-breakup_value">0</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">TDS</div>
        <div style="position: absolute;left: 49%;top;40% ">AED</div>
        <div class="fare-breakup_value">0</div>
    </div>
    <div class="fare-breakup_content">
        <div class="fare-breakup_title">Discount</div>
        <div style="position: absolute;left: 49%;top;45% ">AED</div>
        <div class="fare-breakup_value">${selectedFlight.Segments[selectedValue].FareBreakup.Discount}</div>
    </div>
    <div class="fare-breakup_footer">
        <div class="fare-breakup_title">Grand Total</div>
        <div style="position: absolute;left: 49%;top;50% ">AED</div>
        <div class="fare-breakup_value">${selectedFlight.Segments[selectedValue].FareBreakup.PublishedFare}</div>
    </div>
    <div class="fare-breakup_footer">
        <div class="fare-breakup_title">Net Fare</div>
        <div style="position: absolute;left: 49%;top;55% ">AED</div>
        <div class="fare-breakup_value">${selectedFlight.Segments[selectedValue].FareBreakup.OfferedFare}</div>
    </div>
</div>
</div>
<div class="tab-content" id="baggage">
                 <div class="baggage-table p-0 p-lg-3 mt-3">
    <div><img src="/images/others/baggage-vector.svg" alt=""></div>
    <div class="my-2 d-flex flex-column">
        <div class="flex-column baggage-table_value_header mb-1">${selectedFlight.Origin.CityCode}-${selectedFlight.Destination.CityCode}</div>
        <div class="baggage-table_value"><span class="fw-500">Check In baggage</span><span class="fw-600">15Kg</span>
        </div>
    </div>
<!--    <div class="my-2 d-flex flex-column">-->
<!--        <div class="flex-column baggage-table_value_header mb-1">BOM-TRV</div>-->
<!--        <div class="baggage-table_value"><span class="fw-500">Check In baggage</span><span class="fw-600">ADT-15Kg CHD-15Kg</span>-->
<!--        </div>-->
<!--    </div>-->
<!--    <div class="my-2 d-flex flex-column">-->
<!--        <div class="flex-column baggage-table_value_header mb-1">TRV-BLR</div>-->
<!--        <div class="baggage-table_value"><span class="fw-500">Check In baggage</span><span class="fw-600">ADT-15Kg CHD-15Kg</span>-->
<!--        </div>-->
<!--    </div>-->
    <div style="line-height: 1rem;"><span class="fs-10 grey-color">Baggage Disclaimer:- . Hand Baggage: Airlines permits only one (1pc) bag weighing not more than 7 KGS. In addition to the one piece of Hand Baggage permitted, Few Airlines may permit Customer to carry one additional personal article such as ladies purse or a small bag containing laptop not weighing more than 3 KGS. . Infant Baggage: Passenger Traveling with Infant are allowed to carry 1 Pc of additional Hand Baggage not exceeding 7 KGS. . The baggage information is just for reference, Please check with airline for more specific information.</span>
    </div>
</div>
</div>
<div class="tab-content" id="fare-rules">
</div>
            </div>
        </div>
    </div>
      `;

    document.getElementById("div2").innerHTML = mySideBar

    // Add a class to the body
    document.body.classList.add("modal-open");

    // Add inline styles to body
    document.body.style.color = "overflow: hidden";
    document.body.style.fontSize = "padding-right: 17px";

    initializeTabs();

    // Display the first tab content by default
    const firstTabContent = document.querySelector('.tab-content');
    if (firstTabContent) {
        // Hide all tab content first
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        firstTabContent.style.display = 'block';
    }

    // Add the 'selected-tab-btn' class to the first tab button
    const firstTabBtn = document.querySelector('.tab-btn');
    if (firstTabBtn) {
        firstTabBtn.classList.add('selected-tab-btn');
    }

    if(selectedFlight.Supplier === Suppliers.TBO)
    {
        let fd = new FormData();
        fd.append("traceId", selectedFlight.TraceId);
        fd.append("ResultIndex", selectedFlight.Segments[selectedValue].ResultIndex);

        // Fetch fare rule asynchronously
        let fareResponse = await fetch("/flights/fetchRule", {
            method: "POST",
            body: fd
        });

        // Parse JSON response
        fareResponse = await fareResponse.json();

        console.log(fareResponse);

        let fareRule = '';

        for(let i =0 ; i<fareResponse.response.FareRules.length; i++)
        {
            fareRule += fareResponse.response.FareRules[i].FareRuleDetail;
        }

        document.getElementById("fare-rules").innerHTML = fareRule;
    }

}

function convertToDesiredFormat(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Format: "16 Sep, 2024"
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    return formattedDate;
}



// flight book
async function book(index) {
    Swal.fire({
        html: `
        <div class="loading-container">
            <img src="/images/new.gif" class="img-fluid" style="height: 400px;width:400px"/>

        </div>
    `,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: 'transparent',
        customClass: {
            popup: 'custom-toast'
        }
    });


    let myArr =  (filteredFlights.length > 0) ? filteredFlights : flightData;

    // Deep copy the selected flight to avoid modifying the original array
    let selectedFlight = JSON.parse(JSON.stringify(myArr[index]));

    console.log("Selected flight before modification:", selectedFlight);

    let selectedValue;
    // Get all radio buttons with the name matching the index
    const radios = document.getElementsByName(index);

    // Iterate through the radio buttons to find the selected one
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            selectedValue = radios[i].value;
            break;  // Stop once the selected button is found
        }
    }

    // Replace Segments with the selected value
    selectedFlight.Segments = [myArr[index].Segments[selectedValue]];  // Ensure it's in array format

    console.log("Selected flight after modification:", selectedFlight);

    // Original flightData remains unchanged
    console.log("Original flight data after modification attempt:", flightData[index]);

    let fd = new FormData();
    fd.append("agentEmail", localStorage.getItem("agentEmail"));
    fd.append("traceId", selectedFlight.TraceId);
    fd.append("returnId", null);
    fd.append("book", JSON.stringify(selectedFlight));
    fd.append("returnBook", null);
    fd.append("markup", 0);
    fd.append("platformFee", 0);
    fd.append("platformTax", 0);

    // let response = await fetch("/flights/makeSearchingSession", {
    //     method: 'POST',
    //     body: fd
    // });
    //
    // if (response.ok) {
    Swal.close();
    sessionStorage.setItem("selectedFlight",JSON.stringify(selectedFlight))
    sessionStorage.setItem("traceId",selectedFlight.TraceId)
    try {
        const response = await fetch('/flights/book', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (data.responseCode === 1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: data.message,
                });
            }
        } else {
            // If it's not JSON, assume it's an HTML response
            window.location.href = '/flights/bookbook';
        }
    }
    catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
        });
    }
  // } else {
    //     Swal.close();
    //     alert("problem")
    // }
}

// I will Declared all filter logic here

function AirlineFIlter()
{

    // Create a map to store counts for each airline
    const airlineCounts = new Map();

    // Calculate counts for each airline
    flightData.forEach((flight) => {
        let airline = Airlines.find(a => a.Code === flight.AirlineCode);

        // If found, use the airline name; otherwise, use a default value
        let airlineName = airline ? airline.Name : "Unknown Airline";
        airlineCounts.set(airlineName, (airlineCounts.get(airlineName) || 0) + 1);
    });

    // Create and append elements for each airline
    airlineCounts.forEach((count, airlineName) => {
        const checkboxId = `brand${airlineName.replace(/\s/g, '')}`;
        const checkbox = `  <label
                                            class=" d-flex  fw-500 align-items-center fs-12 cursor-pointer app-check-box"
                                            style="color: rgb(91, 91, 91);" for="${checkboxId}">
            <input id="${checkboxId}" value="${airlineName}" type="checkbox"
                   name="carrier"
                   style="margin-right: 7px; appearance: none; width: 15px; height: 15px; border-radius: 3px; border: 1px solid rgb(91, 91, 91);" onclick="applyFilters()">${airlineName}</label>
`;

        const div = `
           ${checkbox}
        `;

        document.getElementById('airlineFilter').innerHTML += div
    });
}

function fareFIlter()
{

    // Create a map to store counts for each airline
    const fareCounts = new Map();

    // Calculate counts for each airline
    flightData.forEach((flight) => {
        flight.Segments.forEach((segment, index) => {
            const airlineName = segment.fare;
            fareCounts.set(airlineName, (fareCounts.get(airlineName) || 0) + 1);
        })
    });

    // Create and append elements for each airline
    fareCounts.forEach((count, airlineName) => {
        const checkboxId = `brand${airlineName.replace(/\s/g, '')}`;
        const checkbox = `  <label
                                            class=" d-flex  fw-500 align-items-center fs-12 cursor-pointer app-check-box"
                                            style="color: rgb(91, 91, 91);" for="${checkboxId}">
            <input id="${checkboxId}" value="${airlineName}" type="checkbox"
                   name="allfares"
                   style="margin-right: 7px; appearance: none; width: 15px; height: 15px; border-radius: 3px; border: 1px solid rgb(91, 91, 91);" onclick="applyFilters()">${airlineName}</label>
`;

        const div = `
           ${checkbox}
        `;

        document.getElementById('fareFilter').innerHTML += div
    });
}

async function PriceFilterDiv() {
    const priceDiv = document.getElementById("priceFilter");
    priceDiv.innerHTML = '';
    const publishedFares = [];

    // Collect PublishedFares
    flightData.forEach(flight => {
        // Iterate through each detail in the flight
        flight.Segments.forEach(detail => {
            // Push the PublishedFare to the publishedFares array
            publishedFares.push(detail.FareBreakup.PublishedFare);
        });
    });

    // Calculate min and max values from the array of PublishedFares
    const minPublishedFare = Math.min(...publishedFares);
    const maxPublishedFare = Math.max(...publishedFares);

    const div = `
        <div class="d-flex text-lh-1">
            <span>AED &nbsp;</span>
            <span id="rangeSliderExample3MinResult" class=""></span>
            <span class="mx-0dot5">&nbsp; —&nbsp; </span>
            <span>AED &nbsp;</span>
            <span id="rangeSliderExample3MaxResult" class=""></span>
        </div>
        <input class="js-range-slider" type="text"
            data-extra-classes="u-range-slider height-35"
            data-result-min="#rangeSliderExample3MinResult"
            data-result-max="#rangeSliderExample3MaxResult">
    `;

    priceDiv.insertAdjacentHTML('beforeend', div);

    // Initialize ionRangeSlider for price filter
    $(document).ready(function () {
        $("#rangeSliderExample3MinResult").text(minPublishedFare);
        $("#rangeSliderExample3MaxResult").text(maxPublishedFare);
        $(".js-range-slider").ionRangeSlider({
            skin: "round",
            type: "double",
            grid: false,
            hide_from_to: true,
            hide_min_max: true,
            min: minPublishedFare,
            max: maxPublishedFare,
            from: minPublishedFare,
            to: maxPublishedFare,
            prefix: "Aed",
            onChange: function (data) {
                $("#rangeSliderExample3MinResult").text(data.from);
                $("#rangeSliderExample3MaxResult").text(data.to);

                // Call the applyFilters function with the range slider value
                applyFilters();
            }
        });
    });
}


async function stopsFilter() {

    // Create a map to store counts for each stops option
    const stopsCounts = new Map();

    // Calculate counts for each stops option
    flightData.forEach((flight) => {
        const stops = `${flight.Stops}`;  // Use 'stops' property, default to 'Non Stop' if undefined
        stopsCounts.set(stops, (stopsCounts.get(stops) || 0) + 1);
    });

    console.log(stopsCounts)

    // Create and append elements for each stops option
    stopsCounts.forEach((count, stopsOption) => {
        console.log(stopsOption)
        const checkboxId = `stops${stopsOption.replace(/\s/g, '')}`;
        console.log(checkboxId)
        console.log(checkboxId)
        const checkbox = `  <label
                                            class=" d-flex  fw-500 align-items-center fs-12 cursor-pointer app-check-box"
                                            style="color: rgb(91, 91, 91);" for="${checkboxId}">
            <input id="${checkboxId}" value="${stopsOption}" type="checkbox"
                 name="stops" style="margin-right: 7px; appearance: none; width: 15px; height: 15px; border-radius: 3px; border: 1px solid rgb(91, 91, 91);" onclick="applyFilters()">${stopsOption}</label>
`;
        const div = `
            ${checkbox}
        `;


        console.log(div);

        document.getElementById('stopFilter').innerHTML += div;
    });
}

function applyFilters() {
    flightData = flightData.map(flight => {
        let airline = Airlines.find(a => a.Code === flight.AirlineCode);
        return { ...flight, airlineName: airline ? airline.Name : "Unknown Airline" };
    })
    let arr = flightData;

    const flightNumberValue = document.getElementById("fSearch").value.trim();

    // Get checked airlines and fares
    const checkedAirlines = Array.from(document.querySelectorAll('input[name="carrier"]:checked'))
        .map(checkbox => checkbox.value);
    const checkedFares = Array.from(document.querySelectorAll('input[name="allfares"]:checked'))
        .map(checkbox => checkbox.value);
    const checkedStops = Array.from(document.querySelectorAll('input[name="stops"]:checked'))
        .map(checkbox => checkbox.value);

    const selectedChip = document.querySelector('.app-chip-selected');
    const aselectedChip = document.querySelector('.a-app-chip-selected');

    let selectedId = null;
    if (selectedChip) {
        selectedId = selectedChip.getAttribute('id');
        console.log("Selected ID:", selectedId);
    }

    let aselectedId = null;
    if (aselectedChip) {
        aselectedId = aselectedChip.getAttribute('id');
        console.log("Selected ID:", aselectedId);
    }
    // Get the range slider instance and its current values
    const sliderInstance = $(".js-range-slider").data("ionRangeSlider");
    const minPrice = sliderInstance.result.from;
    const maxPrice = sliderInstance.result.to;

    // Filter flights based on airlines, fares, price, and selected time ID
    filteredFlights = arr.filter(flight => {
        const flightNumberMatch = flightNumberValue ? flight.FlightNumber.includes(flightNumberValue) : true; // Match flight number using "like"
        const airlineMatch = checkedAirlines.length === 0 || checkedAirlines.includes(flight.airlineName);
        const airlineStops = checkedStops.length === 0 || checkedStops.includes(flight.Stops);
        const fareMatch = checkedFares.length === 0 || flight.Segments.some(segment => checkedFares.includes(segment.fare));
        const priceMatch = flight.Segments.some(segment => {
            const publishedFare = segment.FareBreakup.PublishedFare;
            return publishedFare >= minPrice && publishedFare <= maxPrice;
        });

        // Check if flight's time ID matches the selected chip ID
        const timeMatch = selectedId ? flight.Origin.Time === selectedId : true;
        const atimeMatch = aselectedId ? flight.Destination.Time === aselectedId : true;

        return airlineMatch && fareMatch && priceMatch && timeMatch && atimeMatch && airlineStops && flightNumberMatch;
    });

    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results

    // Check if there are filtered flights and render appropriately
    if (filteredFlights.length > 0) {
        // Efficient DOM manipulation using Document Fragment
        const fragment = document.createDocumentFragment();
        filteredFlights.forEach((flight, index) => {
            let airline = Airlines.find(a => a.Code === flight.AirlineCode);

            // If found, use the airline name; otherwise, use a default value
            let airlineName = airline ? airline.Name : "Unknown Airline";
            const flightCard = new FlightCards(flight, index,airlineName);
            const cardElement = document.createElement('div');
            cardElement.innerHTML = flightCard.render();
            fragment.appendChild(cardElement); // Append each card to the fragment
        });

        renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go
    } else {
        // If no matches found, render a message
        renderResults.innerHTML = '<div class="no-results">No flights found matching your criteria.</div>';
    }
}


// book page scripts here
function  AddMeal(index, origin, destination, traveller, segmentIndex, price)
{

    let m = finalMealArray.findIndex(me => me.id === traveller && me.origin ===origin && me.destination ===destination);

    if(m !== -1)
    {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'warning',  // This sets the warning icon
            title: `Multiple Meal per Pax are not allowed.`
        });
    }
    else
    {
        let meal = {
            index : index,
            id : traveller,
            title : `${mealArray[segmentIndex].mealDetails.SSRDetails[index].SSRDescription}`,
            origin : origin,
            destination  : destination,
            price : price,
            mealObject : mealArray[segmentIndex].mealDetails.SSRDetails[index],
            SSRCode : mealArray[segmentIndex].mealDetails.SSRDetails[index].SSRCode,
            SSRKey : mealArray[segmentIndex].mealDetails.SSRDetails[index].SSRKey,
            SSRReferenceNumber : mealArray[segmentIndex].mealDetails.SSRDetails[index].SegmentReferenceNumber
            // mealObject : (arr.Supplier === Suppliers.TBO) ? ssrResponse.response?.MealDynamic?.[0]?.[index] || ssrResponse.response?.Meal[index] || 'NO MEAL' : fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.MEAL[index] || 'No Meal',
            // segmentId : fareBreakupResponse?.response?.tripInfos?.[0]?.sI?.[segmentIndex].id || 0,
            // code : fareBreakupResponse?.response?.tripInfos?.[0]?.sI?.[segmentIndex]?.ssrInfo?.MEAL?.[index].code
        }

        finalMealArray.push(meal);

        totalAmount+= price;

        grossFare+=price;

        totalSSRAmount+=price;

        document.getElementById("totalAmountSpan").innerHTML = totalAmount.toFixed(2);

        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'success',  // This sets the warning icon
            title: `${mealArray[segmentIndex].mealDetails.SSRDetails[index].SSRDescription} Meal is Added`
            // (arr.Supplier === Suppliers.TBO) ? `${ssrResponse.response?.MealDynamic?.[0]?.[index]?.AirlineDescription || ssrResponse.response?.Meal?.[index]?.Description || 'No Meal'} is Added` : `${fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.MEAL[index].desc || 'No Meal'} is Added` // Warning message to display
        });

        console.log(finalMealArray)

        updateMealOptions();
        calculateMealPrice(traveller)
    }
}

function removeMeal(index,mealIndex, segmentIndex, traveller)
{
    totalAmount-= finalMealArray[index].price ;

    grossFare-=finalMealArray[index].price;

    totalSSRAmount-=finalMealArray[index].price;

    document.getElementById("totalAmountSpan").innerHTML = totalAmount.toFixed(2);

    finalMealArray.splice(index, 1);

    toastMixin.fire({
        animation: true,  // Enables animation for the toast
        icon: 'success',  // This sets the warning icon
         title: `${mealArray[segmentIndex].mealDetails.SSRDetails[mealIndex].SSRDescription} Meal is Removed`
        // (arr.Supplier === Suppliers.TBO) ? `${ssrResponse.response?.MealDynamic?.[0]?.[mealIndex]?.AirlineDescription || ssrResponse.response?.Meal?.[mealIndex]?.Description || 'No Meal'} is Removed` : `${fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.MEAL[mealIndex].desc || 'No Meal'} is Removed` // Warning message to display
    });

    updateMealOptions()
    calculateMealPrice(traveller)
}

function  AddBaggage(index, origin, destination, traveller, segmentIndex, price)
{
    console.log(index, origin, destination, traveller, segmentIndex, price)
    let bag = baggageArray.findIndex(baggage => baggage.id === traveller);

    if(bag !== -1)
    {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'warning',  // This sets the warning icon
            title: `Multiple baggage per segment are not allowed.`
        });
    }
    else
    {
        let meal = {
            index : index,
            id : traveller,
            origin : origin,
            title : `${fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SSRDescription}`,
            destination  : destination,
            price : price,
            baggageObject : fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index],
            SSRCode : fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SSRCode,
            SSRKey : fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SSRKey,
            SSRReferenceNumber : fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SegmentReferenceNumber
            // baggageObject : (arr.Supplier === Suppliers.TBO) ? ssrResponse.response?.Baggage[0][index] || 'NO BAGGAGE' : fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.BAGGAGE[index] || 'NO BAGGAGE',
            // segmentId : fareBreakupResponse?.response?.tripInfos?.[0]?.sI?.[segmentIndex].id || 0,
            // code : fareBreakupResponse?.response?.tripInfos?.[0]?.sI?.[segmentIndex]?.ssrInfo?.BAGGAGE?.[index].code
        }

        baggageArray.push(meal);

        console.log("test",baggageArray)

        totalAmount+= price;

        grossFare+=price;

        totalSSRAmount+=price

        document.getElementById("totalAmountSpan").innerHTML = totalAmount.toFixed(2);



        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'success',  // This sets the warning icon
            title:  `${fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SSRDescription} Baggage is Added`
            // (arr.Supplier === Suppliers.RIYA) ? `${ssrResponse.response?.Baggage?.[0]?.[index]?.Code || 'NO BAGGAGE'} is Added` : `${fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.BAGGAGE[index].desc || 'NO BAGGAGE'} is Added` // Warning message to display
        });

        console.log(mealArray)

        updateBaggageOptions();
        calculateBaggagePrice(traveller)
    }

}

function removeBaggage(index,mealIndex, segmentIndex, traveller)
{

    totalAmount-= baggageArray[index].price ;

    grossFare-= baggageArray[index].price 

totalSSRAmount-= baggageArray[index].price 
    document.getElementById("totalAmountSpan").innerHTML = totalAmount.toFixed(2);

    baggageArray.splice(index, 1);

    toastMixin.fire({
        animation: true,  // Enables animation for the toast
        icon: 'success',  // This sets the warning icon
        title: `${fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0].SSRDetails[index].SSRDescription} Baggage is Removed`
        // (arr.Supplier === Suppliers.TBO) ? `${ssrResponse.response?.Baggage?.[0]?.[mealIndex]?.Code  || 'No BAGGAGE'} is Removed` : `${fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.BAGGAGE[mealIndex].desc || 'NO BAGGAGE'} is Removed` // Warning message to display
    });

    updateBaggageOptions();
    calculateBaggagePrice(traveller)
}

function calculateMealPrice(index)
{
    console.log("travellerIndex",index)
    let personPrice = 0;

    let person = mealArray.filter(p => p.id === index);

    person.forEach(meal => {
        personPrice += meal.price;
    })

    document.getElementById(`${index}separator`).innerHTML  = `Aed ${personPrice}`

}

function calculateTotalMealPrice() {
    let totalMealPrice = 0;

    // First, create a mapping to accumulate meal prices per person
    let personMealPrices = {};

    // Accumulate the total price for each person
    mealArray.forEach(meal => {
        if (!personMealPrices[meal.id]) {
            personMealPrices[meal.id] = 0; // Initialize the price for this person
        }

        personMealPrices[meal.id] += parseFloat(meal.price); // Accumulate meal price for this person
    });

    // Now set the accumulated price for each person in the corresponding separator
    // Object.keys(personMealPrices).forEach(personId => {
    //     document.getElementById(`${personId}separator`).innerHTML = `Aed ${personMealPrices[personId].toFixed(2)}`;
    // });

    // Calculate the total price across all meals for all persons
    totalMealPrice = Object.values(personMealPrices).reduce((acc, price) => acc + price, 0);

    console.log('Total Meal Price:', totalMealPrice);
}

function calculateBaggagePrice(index)
{
    let personPrice = 0;

    let person = baggageArray.filter(p => p.id === index);

    person.forEach(meal => {
        personPrice += meal.price;
    })

    document.getElementById(`${index}baggage`).innerHTML  = `Aed ${personPrice}`

}

function calculateTotalBaggagePriceNew() {
    let totalBaggagePrice = 0;

    // First, create a mapping to accumulate meal prices per person
    let personBaggagePrices = {};

    // Accumulate the total price for each person
    baggageArray.forEach(meal => {
        if (!personBaggagePrices[meal.id]) {
            personBaggagePrices[meal.id] = 0; // Initialize the price for this person
        }

        personBaggagePrices[meal.id] += parseFloat(meal.price); // Accumulate meal price for this person
    });

    // Now set the accumulated price for each person in the corresponding separator
    Object.keys(personBaggagePrices).forEach(personId => {
        document.getElementById(`${personId}baggage`).innerHTML = `Aed ${personBaggagePrices[personId].toFixed(2)}`;
    });

    // Calculate the total price across all meals for all persons
    totalBaggagePrice = Object.values(personBaggagePrices).reduce((acc, price) => acc + price, 0);

    console.log('Total Meal Price:', totalBaggagePrice);
}


// gitanshu functions

// Functions in flightCards.js

function parseCustomDate(dateStr) {
    console.log("Raw date input: ", dateStr); // Debugging log

    // Use Date.parse() to attempt automatic parsing of the string
    const parsedDate = new Date(Date.parse(dateStr));

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
        console.error('Invalid date string:', dateStr);
        return null;
    }

    console.log("Parsed Date: ", parsedDate); // Debugging log
    return parsedDate;
}

function setDateRestrictions(input,paxType) {
    // Assuming arr.Origin.DepDate is in "21 Sept 2024" format
    const depDateStr = arr.Origin.DepDate;

    // Parse the custom date string
    const currentDate = parseCustomDate(depDateStr);

    if (!currentDate) {
        console.error('Invalid date in arr.Origin.DepDate:', depDateStr);
        return;
    }

    let maxDate,minDate;

    // Modify the max date based on this.type (use the type from your logic)
    const type = paxType; // This should come from your server-side logic or JS logic

    console.log("User type: ", type); // Debugging log

    if (type === 'Adult') {
        // Subtract 12 years from the current date for Adults
        maxDate = new Date(currentDate);
        maxDate.setFullYear(currentDate.getFullYear() - 12);
        // Subtract 18 years
    } else if (type === 'Child') {
        // Children must be between 2 and 12 years old, but can select a date 2 days less than 12 years ago
        maxDate = new Date(currentDate);
        minDate = new Date(currentDate);

        // Set max date (youngest child age, 2 years ago)
        maxDate.setFullYear(currentDate.getFullYear() - 2);

        // Set min date (oldest child age, 12 years ago minus 2 days)
        minDate.setFullYear(currentDate.getFullYear() - 12);
        minDate.setDate(minDate.getDate() + 2); // Subtract 2 days from the minimum date
    }else if(type==='Infant')
    {
        maxDate = new Date(currentDate);
        minDate = new Date(currentDate);
        // Set min date (oldest child age, 18 years ago)
        // maxDate.setFullYear(currentDate);
        maxDate.setDate(maxDate.getDate() - 10);
        minDate.setFullYear(currentDate.getFullYear()-2);
        minDate.setDate(minDate.getDate() + 2);
    }
    else {
        console.error('Unknown type:', type);
        return;
    }

    // Check if maxDate is correctly calculated
    if (maxDate) {
        console.log("Calculated Max Date: ", maxDate); // Debugging log
        const formattedMaxDate = maxDate.toISOString().split('T')[0];
        input.setAttribute('max', formattedMaxDate);
        console.log('Max Date Set:', formattedMaxDate); // Debugging log
    } else {
        console.error('Failed to calculate maxDate');
    }

    if (minDate) {
        const formattedMinDate = minDate.toISOString().split('T')[0];
        input.setAttribute('min', formattedMinDate);
        console.log('Min Date Set:', formattedMinDate); // Debugging log
    }
}


function setPassportIssueDateRestrictions(inputElement) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const minDate = `${currentYear - 5}-01-01`; // Start of 5 years ago
    const maxDate = currentDate.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    inputElement.setAttribute('min', minDate);
    inputElement.setAttribute('max', maxDate);
}




function setPassportExpiryDateRestrictions(inputElement) {
    const currentDate = new Date();
    const minDate = currentDate.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    inputElement.setAttribute('min', minDate); // Set minimum date to today
}


// Add click event listener to all elements with the class 'app-chip'
document.querySelectorAll('.app-chip').forEach(function (chip) {
    chip.addEventListener('click', function (event) {
        // Check if the clicked chip is already selected
        const isSelected = event.currentTarget.classList.contains('app-chip-selected');

        // Remove 'app-chip-selected' class from all chips
        document.querySelectorAll('.app-chip').forEach(function (traveller) {
            traveller.classList.remove('app-chip-selected');
        });

        // If the clicked chip was not selected, add the class
        if (!isSelected) {
            event.currentTarget.classList.add('app-chip-selected');
        }

        // Call applyFilters (no parameters needed)
        applyFilters();
    });
});

// Add click event listener to all elements with the class 'app-chip'
document.querySelectorAll('.a-app-chip').forEach(function (chip) {
    chip.addEventListener('click', function (event) {
        // Check if the clicked chip is already selected
        const isSelected = event.currentTarget.classList.contains('a-app-chip-selected');

        // Remove 'app-chip-selected' class from all chips
        document.querySelectorAll('.a-app-chip').forEach(function (traveller) {
            traveller.classList.remove('a-app-chip-selected');
        });

        // If the clicked chip was not selected, add the class
        if (!isSelected) {
            event.currentTarget.classList.add('a-app-chip-selected');
        }

        // Call applyFilters (no parameters needed)
        applyFilters();
    });
});

function showNet() {
    const netFareElements = document.querySelectorAll('.netFare');

    // Toggle the class that controls visibility for each element
    netFareElements.forEach(element => {
        element.classList.toggle('hidden');
    });
}

function showPayment() {
    const netFareElements = document.querySelectorAll('.paymentBreak');

    // Toggle the class that controls visibility for each element
    netFareElements.forEach(element => {
        element.classList.toggle('hidden');
    });
}


// dummy


function sortAir() {
    resetSortColors();
    var airElement = document.querySelector("#sortAir a");
    airElement.classList.remove('app-link-grey');
    airElement.classList.add('app-link-primary');
    addSvgIcon(airElement);
    sortArrival.isAscending = false;
    sortDeparture.isAscending = false;
    sortPrice.isAscending = false;

    let myArr =  (filteredFlights.length > 0) ? filteredFlights : flightData;

    // Toggle between ascending and descending sorting orders
    if (!sortAir.isAscending) {
        myArr.sort((a, b) => a.AirlineName.localeCompare(b.AirlineName)); // Ascending order
    } else {
        myArr.sort((a, b) => b.AirlineName.localeCompare(a.AirlineName)); // Descending order
    }

    // Invert the sorting order flag
    sortAir.isAscending = !sortAir.isAscending;

    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results

    // Efficient DOM manipulation using Document Fragment
    const fragment = document.createDocumentFragment();
    myArr.forEach((flight, index) => {
        const flightCard = new FlightCards(flight, index);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = flightCard.render();
        fragment.appendChild(cardElement); // Append each card to the fragment
    });

    renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go

}

// Set initial sorting order flag
sortAir.isAscending = false;

function sortPrice() {
    resetSortColors();
    var priceElement = document.querySelector("#sortPrice a");
    priceElement.classList.remove('app-link-grey');
    priceElement.classList.add('app-link-primary');
    addSvgIcon(priceElement);
    sortDeparture.isAscending = false;
    sortAir.isAscending = false;
    sortArrival.isAscending = false;


    let myArr =  (filteredFlights.length > 0) ? filteredFlights : flightData;
    // Toggle between ascending and descending sorting orders
    if (!sortPrice.isAscending) {
        myArr.sort((a, b) => a.Segments[0].FareBreakup.PublishedFare - b.Segments[0].FareBreakup.PublishedFare); // Ascending order
    } else {
        myArr.sort((a, b) => b.Segments[0].FareBreakup.PublishedFare - a.Segments[0].FareBreakup.PublishedFare); // Descending order
    }

    // Invert the sorting order flag
    sortPrice.isAscending = !sortPrice.isAscending;

    // Render the sorted items
    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results


    // Efficient DOM manipulation using Document Fragment
    const fragment = document.createDocumentFragment();
    myArr.forEach((flight, index) => {
        const flightCard = new FlightCards(flight, index);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = flightCard.render();
        fragment.appendChild(cardElement); // Append each card to the fragment
    });

    renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go

}

// Set initial sorting order flag
sortPrice.isAscending = true;

function sortDeparture() {
    resetSortColors();
    var departureElement = document.querySelector("#sortDeparture a");
    departureElement.classList.remove('app-link-grey');
    departureElement.classList.add('app-link-primary');
    addSvgIcon(departureElement);
    sortPrice.isAscending = false;
    sortAir.isAscending = false;
    sortArrival.isAscending = false;

    let myArr =  (filteredFlights.length > 0) ? filteredFlights : flightData;

    // Toggle between ascending and descending sorting orders
    if (!sortDeparture.isAscending) {
        myArr.sort((a, b) => a.Origin.DepTime.localeCompare(b.Origin.DepTime)); // Ascending order
    } else {
        myArr.sort((a, b) => b.Origin.DepTime.localeCompare(a.Origin.DepTime)); // Descending order
    }

    // Invert the sorting order flag
    sortDeparture.isAscending = !sortDeparture.isAscending;

    // Render the sorted items
    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results


    // Efficient DOM manipulation using Document Fragment
    const fragment = document.createDocumentFragment();
    myArr.forEach((flight, index) => {
        const flightCard = new FlightCards(flight, index);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = flightCard.render();
        fragment.appendChild(cardElement); // Append each card to the fragment
    });

    renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go

}

// Set initial sorting order flag
sortDeparture.isAscending = false;

function sortArrival() {
    resetSortColors();
    var arrivalElement = document.querySelector("#sortArrival a");
    arrivalElement.classList.remove('app-link-grey');
    arrivalElement.classList.add('app-link-primary');
    addSvgIcon(arrivalElement);
    sortPrice.isAscending = false;
    sortAir.isAscending = false;
    sortDeparture.isAscending = false;

    let myArr =  (filteredFlights.length > 0) ? filteredFlights : flightData;
    // Toggle between ascending and descending sorting orders
    if (!sortArrival.isAscending) {
        myArr.sort((a, b) => a.Destination.ArrTime.localeCompare(b.Destination.ArrTime)); // Ascending order
    } else {
        myArr.sort((a, b) => b.Destination.ArrTime.localeCompare(a.Destination.ArrTime)); // Descending order
    }

    // Invert the sorting order flag
    sortArrival.isAscending = !sortArrival.isAscending;

    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results

    // Efficient DOM manipulation using Document Fragment
    const fragment = document.createDocumentFragment();
    myArr.forEach((flight, index) => {
        const flightCard = new FlightCards(flight, index);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = flightCard.render();
        fragment.appendChild(cardElement); // Append each card to the fragment
    });

    renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go

}
// Set initial sorting order flag
sortArrival.isAscending = false;
function sortDuration() {
    resetSortColors();
    var durationElement = document.querySelector("#sortDuration a");
    durationElement.classList.remove('app-link-grey');
    durationElement.classList.add('app-link-primary');
    addSvgIcon(durationElement);
    sortPrice.isAscending = false;
    sortAir.isAscending = false;
    sortArrival.isAscending = false;

    let myArr = (filteredFlights.length > 0) ? filteredFlights : flightData;

    // Toggle between ascending and descending sorting orders for duration
    if (!sortDuration.isAscending) {
        myArr.sort((a, b) => {
            // Convert total duration into minutes for sorting
            const durationA = a.totalDuration.hours * 60 + a.totalDuration.minutes;
            const durationB = b.totalDuration.hours * 60 + b.totalDuration.minutes;
            return durationA - durationB; // Ascending order (shorter duration first)
        });
    } else {
        myArr.sort((a, b) => {
            const durationA = a.totalDuration.hours * 60 + a.totalDuration.minutes;
            const durationB = b.totalDuration.hours * 60 + b.totalDuration.minutes;
            return durationB - durationA; // Descending order (longer duration first)
        });
    }

    // Invert the sorting order flag
    sortDuration.isAscending = !sortDuration.isAscending;

    // Cache the renderResults element
    const renderResults = document.getElementById("renderResults");
    renderResults.innerHTML = ''; // Clear previous results

    // Efficient DOM manipulation using Document Fragment
    const fragment = document.createDocumentFragment();
    myArr.forEach((flight, index) => {
        const flightCard = new FlightCards(flight, index);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = flightCard.render();
        fragment.appendChild(cardElement); // Append each card to the fragment
    });

    renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go
}
// Set initial sorting order flag for duration
sortDuration.isAscending = false;


// function sortDuration() {
//     resetSortColors();
//     var durationElement = document.querySelector("#sortDuration a");
//     durationElement.classList.remove('app-link-grey');
//     durationElement.classList.add('app-link-primary');
//     addSvgIcon(durationElement);
//     sortPrice.isAscending = false;
//     sortAir.isAscending = false;
//     sortArrival.isAscending = false;
//
//     let myArr = (filteredFlights.length > 0) ? filteredFlights : flightData;
//
//     // Toggle between ascending and descending sorting orders for duration
//     if (!sortDuration.isAscending) {
//         myArr.sort((a, b) => a.totalDuration.hours - b.totalDuration.hours); // Ascending order (shorter duration first)
//     } else {
//         myArr.sort((a, b) => b.totalDuration.hours - a.totalDuration.hours); // Descending order (longer duration first)
//     }
//
//     // Invert the sorting order flag
//     sortDuration.isAscending = !sortDuration.isAscending;
//
//     // Cache the renderResults element
//     const renderResults = document.getElementById("renderResults");
//     renderResults.innerHTML = ''; // Clear previous results
//
//     // Efficient DOM manipulation using Document Fragment
//     const fragment = document.createDocumentFragment();
//     myArr.forEach((flight, index) => {
//         const flightCard = new FlightCards(flight, index);
//         const cardElement = document.createElement('div');
//         cardElement.innerHTML = flightCard.render();
//         fragment.appendChild(cardElement); // Append each card to the fragment
//     });
//
//     renderResults.appendChild(fragment); // Append the entire fragment to the DOM in one go
// }
// // Set initial sorting order flag for duration
// sortDuration.isAscending = false;

const svgIcon = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0"
         viewBox="0 0 24 24" height="1em" width="1em"
         xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M19 15l-1.41-1.41L13 18.17V2h-2v16.17l-4.59-4.59L5 15l7 7 7-7z"></path>
    </svg>
`;

function resetSortColors() {
    // Remove the 'app-link-red' class and SVG from all sort options
    var sortOptions = document.querySelectorAll('.sort-option');
    sortOptions.forEach(function (option) {
        option.classList.remove('app-link-primary');
        option.classList.add('app-link-grey');

        // Remove the existing SVG if present
        let svgElement = option.querySelector("svg");
        if (svgElement) {
            svgElement.remove();
        }
    });
}

function addSvgIcon(element) {
    // Add the SVG to the clicked element
    element.innerHTML += svgIcon;
}
// Sorting function for airline name
function sortByAirlineName(a, b) {
    var isDescending = true;
    var isAscending = true;

// we're looking ahead; loop from the first element to one before the last element
    for (var i=0, l=flightData.length-1; i<l; i++)
    {

        ////////////////////////////////////////////////////////////

        // log to the console to show what's happening for each loop iteration

        // this is the ith iteration
        console.log("loop iteration %s", i);

        // breaking isDescending down:
        // is this value greater than the next value?
        console.log("A: (%s > %s) = %s", array[i], array[i+1], (arr[i] > arr[i+1]));

        // have all values been descending so far?
        console.log("B: isDescending: %s", isDescending);

        // if this value is greater than the next and all values have been descending so far, isDescending remains true. Otherwise, it's set to false.
        console.log("are A and B both true? %s", (isDescending && (arr[i] > arr[i+1])));

        // add a line break for clarity
        console.log("");

        ////////////////////////////////////////////////////////////


        // true if this is greater than the next and all other so far have been true
        isDescending = isDescending && (flightData[i] > flightData[i+1]);

        // true if this is less than the next and all others so far have been true
        isAscending = isAscending && (flightData[i] < flightData[i+1]);

    }

    if (isAscending)
    {
        alert("asc")
        return b.airline.localeCompare(a.airline);
    }
    else if (isDescending)
    {
        alert("dsc");
        return a.airline.localeCompare(b.airline);
    }
    else
    {
        alert("no");
        return a.airline.localeCompare(b.airline);
    }

}

// Sorting function for duration
function sortByDuration(a, b) {
    return a.formattedDuration - b.formattedDuration;
}

// Sorting function for departure date
function sortByDepartureDate(a, b) {
    return new Date(a.formattedDepartureTime) - new Date(b.formattedDepartureTime);
}

// Sorting function for price
function sortByPrice(a, b) {
    return a.details[0].PublishedFare - b.details[0].PublishedFare;
}

function calculateDuration(deptTime, arrTime) {
    // Convert ISO 8601 datetime strings to Date objects
    const departure = new Date(deptTime);
    const arrival = new Date(arrTime);

    // Calculate the difference in milliseconds
    let durationMs = arrival - departure;

    // If the duration is negative (indicating an overnight case where arrival is the next day)
    if (durationMs < 0) {
        durationMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
    }

    // Convert milliseconds to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

function convertToMinutes(timeString) {
    let [date, time] = timeString.split('T');
    let [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
