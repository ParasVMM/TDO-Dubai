// Wrap everything in an async function

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

let segments = [];

let   flights = '';

let selectedFlight=sessionStorage.getItem("selectedFlight");
let traceId = sessionStorage.getItem("traceId");
let totalAmount = 0;
let grossFare = 0;
async function loadFlightDetails() {

    arr=JSON.parse(selectedFlight);
    console.log(selectedFlight)
    console.log("arr",arr);
    console.log(arr.Segments[0]);
    console.log(traceId);

    for(let i=0; i<arr.Segments[0].flightDetails.length; i++)
    {
        let mySegment=arr.Segments[0].flightDetails[i]
        let obj = {
            "departure": `${mySegment.DepartureCityCode}`,
            "arrival": `${mySegment.ArrivalCityCode}`,
            "departureDateTime": `${mySegment.DepDateTime.replace(/\s+/g, '')}`,
            "arrivalDateTime": `${mySegment.ArrDateTime.replace(/\s+/g, '')}`,
            "flightNumber": `${mySegment.FlightNumber}`
        }
        segments.push(obj);
    }

    grossFare = arr.Segments[0].FareBreakup.PublishedFare;

    flights = [

        {
            "departure": `${arr.Origin.CityCode}`,
            "arrival": `${arr.Destination.CityCode}`,
            "departureDateTime": `${arr.Origin.DepDateTime.replace(/\s+/g, '')}`,
            "BasicFare": arr.Segments[0].FareBreakup.BaseFare,
            "GrossFare": grossFare,
            "segments": segments
        }

    ]
    console.log(flights)
    console.log(arr.Segments[0].FareBreakup.PublishedFare);
    document.getElementById("flightInfo").innerHTML = `<span style="display: none" id="tp">${arr.Segments[0].FareBreakup.PublishedFare}</span>
<span
        class="sector-span">${arr.Origin.CityName}(${arr.Origin.CityCode}) -> ${arr.Destination.CityName}(${arr.Destination.CityCode})</span>
    <span
        class="date-span">${convertToDesiredFormat(`${arr.Origin.DepDate}`)}</span>`;

    // Render flight details
    arr.Segments[0].flightDetails.forEach((flight, index) => {
        const cards = new SegmentInformation(flight, index, arr.Segments[0].fare);
        document.getElementById("flightDetails").innerHTML += cards.render();
    });

    // need to hit airsell method to get a new fare

    let fd = new FormData();

    fd.append("traceId", traceId);
    fd.append("flightKey", arr.Segments[0].ResultIndex);
    fd.append("adult", arr.adults);
    fd.append("child", arr.childs);
    fd.append("infant", arr.infants);
    fd.append("flight", JSON.stringify(flights));

    fareBreakupResponse = await fetch('/flights/AirSell', {
        method: 'POST',
        body : fd
    });

    fareBreakupResponse = await fareBreakupResponse.json();

    console.log(fareBreakupResponse)

    if(fareBreakupResponse.ResponseStatus === 1)
    {

        // Render RIYA fare card
        let TBOFareCard = new TBOFareBreakupCard(fareBreakupResponse.response.response, 0);
        document.getElementById("fareSummary").innerHTML = TBOFareCard.render();

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
            let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
            let adultForm = new PassengerForm("Adult", index+1, passportAtBook, passportAtTicket);
            document.getElementById("AdultForm").innerHTML+= adultForm.render()
            // You can apply any logic here for each adult
        });
        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
            let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
            let adultForm = new PassengerForm("Child", index+1, passportAtBook, passportAtTicket);
            document.getElementById("childForm").innerHTML+= adultForm.render()
            // You can apply any logic here for each adult
        });

        Array(parseInt(arr.infants)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
            let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
            let adultForm = new PassengerForm("Infant", index+1, passportAtBook, passportAtTicket);
            document.getElementById("infantForm").innerHTML+= adultForm.render()
            // You can apply any logic here for each adult
        });

        for(let i =0; i<fareBreakupResponse.response.response.Flights[0].Segments.length; i++)
        {
            let segment = fareBreakupResponse.response.response.Flights[0].Segments;
            console.log("segment",segment);
            segmentArray.push({
                // "SegmentIndicator": segment.SegmentIndicator,
                "Origin": segment[i].OriginDestination.Departure,
                "Destination": segment[i].OriginDestination.Arrival,
            });
            // segment.forEach(segment => {
            //     if (segment.TripIndicator === 1) {
            //         let existingSegment = segmentArray.find(item => item.SegmentIndicator === segment.SegmentIndicator);
            //         if (!existingSegment) {
            //             segmentArray.push({
            //                 "SegmentIndicator": segment.SegmentIndicator,
            //                 "Origin": segment.Origin.Airport.AirportCode,
            //                 "Destination": segment.Destination.Airport.AirportCode,
            //             });
            //         }
            //     }
            // });

            let SeatDynamic = segment?.[i]?.SeatLayoutDetails || "NO SEATS";

            if(SeatDynamic !== "NO SEATS")
                {
               
                            let seatSector = {
                                Origin: segment[i].OriginDestination.Departure,
                                Destination: segment[i].OriginDestination.Arrival
                            }
                            console.log(seatSector);
                            let seatSec = new seatSectors(seatSector, i);
                            console.log(seatSec.renderSeatSectors())
                            document.getElementById("seatSectors").innerHTML += seatSec.renderSeatSectors()
              
    
                }
                else
                {
                    toastMixin.fire({
                        animation: true,  // Enables animation for the toast
                        icon: 'error',  // This sets the warning icon
                        title: `No Extra Seat Facility Available For This FLight.`
                    });
                }

        }

        // let seg = fareBreakupResponse.response.Results.Segments[0].length;
        //
        // let ExistingSegment = segmentArray.find(item => item.Origin === fareBreakupResponse.response.Results.Segments[0][0].Origin.Airport.AirportCode && item.Destination === fareBreakupResponse.response.Results.Segments[0][seg-1].Destination.Airport.AirportCode);
        // if (!ExistingSegment) {
        //     segmentArray.push({
        //         "SegmentIndicator": 0,
        //         "Origin": fareBreakupResponse.response.Results.Segments[0][0].Origin.Airport.AirportCode,
        //         "Destination": fareBreakupResponse.response.Results.Segments[0][seg - 1].Destination.Airport.AirportCode,
        //     });
        // }
        console.log(segmentArray);

        for(let i =0; i<fareBreakupResponse.response.response.Flights[0].Segments.length; i++) {
            let segment = fareBreakupResponse.response.response.Flights[0].Segments[i];
            // let MealDynamic = segment?.SSRMealDetail || "NO MEAL";
            // let Meal = ssrResponse.response?.Meal || "NO MEAL";
            mealArray.push({
                // "SegmentIndicator": segment.SegmentIndicator,
                "mealDetails": segment.SSRMealDetail,
            });

            //  Meal = segment?.SSRMealDetail || "NO MEAL"
            // console.log("meal",Meal)
        }
        console.log("meal",mealArray)
        if(mealArray !== "NO MEAL") {
            for(let i=0;i<segmentArray.length;i++)
            {
                let mealSec = new mealSectors(segmentArray[i], i);
                console.log(mealSec.renderMealSectors())
                document.getElementById("mealSectors").innerHTML += mealSec.renderMealSectors();
            }
            //     let flag = false;
            //     segmentArray.forEach((sector, index)=>{
            //         MealDynamic.forEach((meal,index) => {
            //             console.log(meal.Origin);
            //             console.log(sector.Origin);
            //             if(sector.Origin === meal.Origin && sector.Destination === meal.Destination)
            //             {
            //                 flag = true;
            //
            //             }
            //         })
            //         if(flag) {
            //             let mealSector = {
            //                 Origin: sector.Origin,
            //                 Destination: sector.Destination
            //             }
            //             console.log(mealSector);
            //             let mealSec = new mealSectors(mealSector, index);
            //             console.log(mealSec.renderMealSectors())
            //             document.getElementById("mealSectors").innerHTML += mealSec.renderMealSectors();
            //         }
            //     })
            //
            // }
            //     if(Meal !== "NO MEAL")
            //     {
            //         let mealSector = {
            //             Origin: arr.Origin.CityCode,
            //             Destination: arr.Destination.CityCode
            //         }
            //         console.log(mealSector);
            //         let mealSec = new mealSectors(mealSector, 0);
            //         console.log(mealSec.renderMealSectors())
            //         document.getElementById("mealSectors").innerHTML += mealSec.renderMealSectors();
            //
            //     }
        }
        else
        {
            toastMixin.fire({
                animation: true,  // Enables animation for the toast
                icon: 'error',  // This sets the warning icon
                title: `No Extra Meal Facility Available For This FLight.`
            });
        }

      

        let BaggageDynamic = fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0] || "NO BAGGAGE";
        console.log("baggage",BaggageDynamic)
        if(BaggageDynamic !== "NO BAGGAGE")
        {
            // let baggageflag = false;
            // segmentArray.forEach((sector, index)=>{
            //     BaggageDynamic[0].forEach((meal,index) => {
            //         console.log(meal.Origin);
            //         console.log(sector.Origin);
            //         if(sector.Origin === meal.Origin && sector.Destination === meal.Destination)
            //         {
            //             baggageflag = true;
            //
            //         }
            //     })
            //     if(baggageflag) {
            //         let mealSector = {
            //             Origin: sector.Origin,
            //             Destination: sector.Destination
            //         }
            //         console.log(mealSector);
            //         let mealSec = new baggageSectors(mealSector, index);
            //         console.log(mealSec.renderBaggageSectors())
            //         document.getElementById("baggageSectors").innerHTML += mealSec.renderBaggageSectors()
            //     }
            // })

            // for (let i=0;i<segmentArray.length;i++)
            // {

            // "SegmentIndicator": segment.SegmentIndicator,
            let od= fareBreakupResponse.response.response.Flights[0].OriginDestination
            let origin= od.Departure
            let destination = od.Arrival

            let mealSec = new baggageSectors(origin, destination,0);
            console.log(mealSec.renderBaggageSectors())
            document.getElementById("baggageSectors").innerHTML += mealSec.renderBaggageSectors()
            // }
        }
        else
        {
            toastMixin.fire({
                animation: true,  // Enables animation for the toast
                icon: 'error',  // This sets the warning icon
                title: `No Extra Baggage Facility Available For This FLight.`
            });
        }

        document.querySelector('.meal-sectors-row').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('meal-sector')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.meal-sector').forEach(function (traveller) {
                    traveller.classList.remove('active-meal-sector');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('active-meal-sector');
                updateMealOptions();
            }
        });

        document.querySelector('.baggage-sectors-row').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('baggage-sector')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.baggge-sector').forEach(function (traveller) {
                    traveller.classList.remove('active-baggage-sector');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('active-baggage-sector');
                updateBaggageOptions();
            }
        });

        document.querySelector('.baggage-travellers-info').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('baggage-traveller-name')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.baggage-traveller-name').forEach(function (traveller) {
                    traveller.classList.remove('active-traveller');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('active-traveller');
                updateBaggageOptions();
            }
        });

        document.querySelector('.seat-sectors-row').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('seat-sector')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.seat-sector').forEach(function (traveller) {
                    traveller.classList.remove('active-seat-sector');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('active-seat-sector');
                updateSeatOptions();
            }
        });

        document.querySelector('.seat-travellers-info').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('seat-traveller-name')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.seat-traveller-name').forEach(function (traveller) {
                    traveller.classList.remove('current-traveller-seat-selection');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('current-traveller-seat-selection');
                updateSeatOptions();
            }
        });


        document.querySelector('.travellers-info').addEventListener('click', function (event) {
            // Check if the clicked element has the class 'traveller-name'
            if (event.target.classList.contains('traveller-name')) {
                // Remove 'active-traveller' from all traveller divs
                document.querySelectorAll('.traveller-name').forEach(function (traveller) {
                    traveller.classList.remove('active-traveller');
                });

                // Add 'active-traveller' to the clicked traveller div
                event.target.classList.add('active-traveller');
                updateMealOptions();
            }
        });


        console.log("abc")

        Swal.close();

        if(fareBreakupResponse.response.response.HoldAvailable===true)
        {
            let html=`<button type="button" onclick="HoldBooking()" class="app-btn app-btn-primary app-btn-medium " disabled="" id="ActiveHoldButton"  
                                                style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
                                            Hold Booking
                                        </button>`
            document.getElementById("holdButton").innerHTML=html
        }

        console.log(arr.Segments[0].FareBreakup.PublishedFare,fareBreakupResponse.response.response?.Flights[0].GrossFare)
        let priceBeforeAirsell=arr.Segments[0].FareBreakup.PublishedFare
        let priceAfterAirsell=fareBreakupResponse.response.response?.Flights[0].GrossFare
        if(priceBeforeAirsell!==priceAfterAirsell)
        {
            if(!confirm("Flight Fare Changed, Are you sure you want to continue?")){
                history.back()
            }
            // Swal.fire({
            //     title: "Flight Fare Changed",
            //     text: "Are you sure you want to continue",
            //     icon: "warning",
            //     showCancelButton: true,
            //     confirmButtonColor: "#3085d6",
            //     cancelButtonColor: "#d33",
            //     confirmButtonText: "Yes"
            // }).then((result) => {
            //     if (!result.isConfirmed) {
            //         // history.back();
            //     }
            // });
        }
    }
    else {
        let timerInterval;
        Swal.fire({
            icon: "warning",
            title: "Flight Not Available!",
            html: "The Requested Flight is no longer available. <b></b> Please search for a different flight.",
            timer: 10000, // 10 seconds
            timerProgressBar: true,
            didOpen: () => {
                const timer = Swal.getHtmlContainer().querySelector("b"); // Correctly referencing the <b> tag
                timerInterval = setInterval(() => {
                    if (Swal.getTimerLeft()) {
                        timer.textContent = `${Swal.getTimerLeft()}ms`;
                    }
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval); // Clearing the interval when the alert closes
                // history.back();
            }
        }).then((result) => {
            // Check if the dismissal was triggered by the timer
            if (result.dismiss === Swal.DismissReason.timer) {
                // history.back();
            }
        });
    }

}

// Function to initialize the phone input field
$(document).ready(function () {
    $('#mobile').intlTelInput({
        initialCountry: "ae", // Default initial country
        separateDialCode: true, // Shows the dial code separately in the input
    });
});

// Function to initialize the phone input field
$(document).ready(function () {
    var phoneInput = $('#mobile').intlTelInput({
        initialCountry: "ae", // Default initial country (UAE)
        separateDialCode: true, // Shows the dial code separately
    });

    // Set initial maxlength and minlength based on the default country
    var countryData = phoneInput.intlTelInput("getSelectedCountryData");
    var initialCountryCode = countryData.iso2;

    // Apply validation based on the initial country
    setValidationForCountry(initialCountryCode);

    // Listen for country change
    $('#mobile').on('countrychange', function() {
        var countryData = phoneInput.intlTelInput("getSelectedCountryData");
        var selectedCountryCode = countryData.iso2;
        setValidationForCountry(selectedCountryCode);
    });

    function setValidationForCountry(countryCode) {
        switch (countryCode) {
            case 'ae': // UAE
                $('#mobile').attr('minlength', 9);
                $('#mobile').attr('maxlength', 9); // Allow 9 digits only
                break;
            case 'us': // USA
            case 'in': // India
                $('#mobile').attr('minlength', 10);
                $('#mobile').attr('maxlength', 10);
                break;
            default:
                $('#mobile').attr('minlength', 9);
                $('#mobile').attr('maxlength', 15); // General format if country-specific not defined
                break;
        }
    }
});

// $(document).ready(function () {
//     var phoneInput = $('#mobile').intlTelInput({
//         initialCountry: "ae", // Default initial country (UAE)
//         separateDialCode: true, // Shows the dial code separately
//     });
//
//     // Listen for country change
//     $('#mobile').on('countrychange', function() {
//         var countryData = phoneInput.intlTelInput("getSelectedCountryData");
//         var selectedCountryCode = countryData.iso2;
//
//         // Apply validation based on the selected country
//         switch (selectedCountryCode) {
//             case 'ae': // UAE
//                 $('#mobile').attr('minlength', 9);
//                 $('#mobile').attr('maxlength', 9);
//                 break;
//             case 'us': // USA
//                 $('#mobile').attr('minlength', 10);
//                 $('#mobile').attr('maxlength', 10);
//                 break;
//             case 'in': // India
//                 $('#mobile').attr('minlength', 10);
//                 $('#mobile').attr('maxlength', 10);
//                 break;
//             // Add more cases for different countries if needed
//             default:
//                 $('#mobile').attr('minlength', 9);
//                 $('#mobile').attr('maxlength', 15); // General format if country-specific not defined
//                 break;
//         }
//     });
// });
// Toggle GST form visibility
function toggleForm() {
    const gstForm = document.getElementById('gst-form');
    const isChecked = document.getElementById('gst-checkbox').checked;

    // Toggle the form display
    gstForm.style.display = isChecked ? 'block' : 'none';

    // Get all input fields in the form
    const gstFields = gstForm.querySelectorAll('input');

    // Toggle the 'required' attribute based on the checkbox status
    gstFields.forEach(field => {
        if (isChecked) {
            field.setAttribute('required', 'required');
        } else {
            field.removeAttribute('required');
        }
    });
}

// Enable or disable button based on terms acceptance
function ActiveButton() {
    var checkbox = document.getElementById("acceptTerms");
    var button = document.getElementById("ActiveButton");
    var holdButton=document.getElementById("ActiveHoldButton")

    if (checkbox.checked) {
        button.disabled = false;
        holdButton.disabled = false;// Enable the button
    } else {
        button.disabled = true;
        holdButton.disabled = true;// Disable the button
    }
}

// Start a countdown timer
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval= setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0;
            clearInterval(interval);
            Swal.fire({
                title: 'Time is up!',
                html: '<div style="font-size: 18px;">The timer has ended.</div>',
                iconHtml: '<img src="https://cdn.jsdelivr.net/npm/sweetalert2@11/assets/success.png" style="width: 50px; height: 50px;">',
                timer: 2000,
                // showConfirmButton: true,
                // confirmButtonText: 'Go Back'
            }).then(() => {
                // Redirect to the previous page
                window.location.href="/flights"
            });
        }
    }, 1000);
}

// On window load, run the loadFlightDetails function and start the timer
window.onload = async function () {

    // Call the async function to load flight details first
    await loadFlightDetails();
    setTimeout(() => {
        try {
            // Close the loader before starting the timer
            Swal.close();

            // Start the timer
            let fifteenMinutes = 60*15,
                display = document.getElementById('timer');
            startTimer(fifteenMinutes, display);
        } catch (error) {
            console.error("An error occurred: ", error);

            // Ensure the loader is closed even if an error occurs
            Swal.close();
        }
    }, 1000);
};

async function ConfirmBooking() {
    paxArray = [];

    if ($("#details").valid()) {
        // Get Contact Information
        let mobileNumber = document.getElementById("mobile").value || "+971";
        let emailID = document.getElementById("leademail").value || "N/A";

        // Get Traveler Details Dynamically
        let travelerDetailsHTML = "";

        function getPassengerDetails(type, count) {
            for (let i = 1; i <= count; i++) {
                let title = document.getElementById(`${type}_title${i}`)?.value || "N/A";
                let firstName = document.getElementById(`${type}_first_name${i}`)?.value || "N/A";
                let lastName = document.getElementById(`${type}_last_name${i}`)?.value || "N/A";
                let dob = document.getElementById(`${type}_dob${i}`)?.value || "N/A";
                let passportNumber = document.getElementById(`${type}_passport_number${i}`)?.value || "N/A";
                let passportIssueDate = document.getElementById(`${type}_passport_issue${i}`)?.value || "N/A";
                let passportExpiryDate = document.getElementById(`${type}_passport_expiry${i}`)?.value || "N/A";
                let passportPlace = document.getElementById(`${type}_passport_place${i}`)?.value || "N/A";

                travelerDetailsHTML += `
            <div class="container">
                <div class="row mb-2">
                    <div class="col-md-12">
                        <p><strong>${type} ${i}:</strong></p>
                    </div>
                </div>

                <!-- First Row: Title, First Name, Last Name -->
                <div class="row">
                    <div class="col-md-2">
                        <p><strong>Title:</strong><br> ${title}</p>
                    </div>
                    <div class="col-md-3">
                        <p><strong>First Name:</strong><br> ${firstName}</p>
                    </div>
                    <div class="col-md-3">
                        <p><strong>Last Name:</strong><br> ${lastName}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Date of Birth:</strong><br> ${dob}</p>
                    </div>
                </div>

                <!-- Second Row: DOB, Passport Details -->
                <div class="row">
                    <div class="col-md-2">
                        <p><strong>Passport Number:</strong><br> ${passportNumber}</p>
                    </div>
                    <div class="col-md-3">
                        <p><strong>Issue Date:</strong><br> ${passportIssueDate}</p>
                    </div>
                    <div class="col-md-3">
                        <p><strong>Expiry Date:</strong><br> ${passportExpiryDate}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Place of Issue:</strong><br> ${passportPlace}</p>
                    </div>
                </div>
                <hr>
            </div>
        `;
            }
        }

        // Extract details for Adults, Children, and Infants
        getPassengerDetails("Adult", parseInt(arr.adults));
        getPassengerDetails("Child", parseInt(arr.childs));
        getPassengerDetails("Infant", parseInt(arr.infants));

        // Inject the dynamic data into the modal
        document.getElementById("reviewMobile").innerText = mobileNumber;
        document.getElementById("reviewEmail").innerText = emailID;
        document.getElementById("reviewTravelerDetails").innerHTML = travelerDetailsHTML;

        // Show the modal
        let modal = new bootstrap.Modal(document.getElementById("reviewBookingModal"));
        modal.show();
    }
}

// Confirm booking validation
async function ConfirmBookingFlight() {
    paxArray =  [];
    if ($("#details").valid()) {
        let modal = bootstrap.Modal.getInstance(document.getElementById("reviewBookingModal"));
        modal.hide();
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

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let adultObject = new makePassengerArray("Adult",fareBreakupResponse.response.response.Flights[0], index+1, "ADULT", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(adultObject.renderTBO());
            allPax.push(adultObject.passengers());
        });

        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let childObject = new makePassengerArray("Child",fareBreakupResponse.response.Results, index+1, "CHILD", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(childObject.renderTBO());
            allPax.push(childObject.passengers());

        });

        Array(parseInt(arr.infants)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let infantObject = new makePassengerArray("Infant",fareBreakupResponse.response.Results, index+1, "INFANT", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(infantObject.renderTBO());
            allPax.push(infantObject.passengers());

        });

        console.log(paxArray);

        if(paxArray.length > 0){

            let otherData = {
                "origin": arr.Origin.CityCode,
                "destination": arr.Destination.CityCode,
            }

            let bookingData = {
                total_no_of_pax : parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants),
                total_adult : arr.adults,
                total_child : arr.childs,
                total_infant :  arr.infants,
                supplier :  "RIYA",
                agent_amount : totalAmount,
                customer_amount : totalAmount,
                trip_type : "ONEWAY",
                platform_fee : 0,
                platform_tax : 0,
                trace_id : arr.TraceId,
                email_id : document.getElementById(`leademail`).value,
                mobile_no : document.getElementById(`mobile`).value,
                markup : 0,
                agent_markup : 0,
                commission : 0,
                tds : 0,
                total_ssr_amount : totalSSRAmount
             }

            let fd = new FormData();

            fd.append("traceId", traceId);
            fd.append("bookingData", JSON.stringify(bookingData));
            fd.append("trips", JSON.stringify(trips));
            fd.append("allPax", JSON.stringify(allPax));
            fd.append('segmentsArray',JSON.stringify(segArray));
            fd.append("otherData", JSON.stringify(otherData))
            fd.append("flight", JSON.stringify([

                {
                    "departure": `${arr.Origin.CityCode}`,
                    "arrival": `${arr.Destination.CityCode}`,
                    "departureDateTime": `${arr.Origin.DepDateTime.replace(/\s+/g, '')}`,
                    "BasicFare": arr.Segments[0].FareBreakup.BaseFare,
                    "GrossFare": grossFare,
                    "segments": segments
                }

            ]))
            fd.append("sellKey", fareBreakupResponse.response.response.SellKey);
            fd.append("passengers", JSON.stringify(paxArray));
            fd.append("email",document.getElementById(`leademail`).value);
            fd.append("mobile",document.getElementById(`mobile`).value);
            fd.append('total', totalAmount);
            fd.append("hold", fareBreakupResponse.response.response.HoldAvailable);
            fd.append("revised", fareBreakupResponse.response.response.Isfarerevised);
            fd.append("totalAdult", arr.adults);
            fd.append("totalChild", arr.childs);
            fd.append("totalInfant", arr.infants);
            fd.append("trip", "ONE WAY");
            fd.append("riyaTrip", "O");

            let res=await fetch("/flights/goToCheckout",{
                method:"POST",
                body:fd,
            });

            if (res.ok) {
                Swal.close();
                window.location.href = '/flights/flightCheckout';

            } else {
                Swal.close();
                alert("problem");
            }


            console.log(res)
        }

    }
}

async function HoldBooking() {
    paxArray =  [];
    if ($("#details").valid()) {
        // let totalPrice=document.getElementById("tp").innerText
        // console.log(totalPrice)
        // window.location.href = "/flights/checkout/"+totalPrice
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

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let adultObject = new makePassengerArray("Adult",fareBreakupResponse.response.response.Flights[0], index+1, "ADULT", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(adultObject.renderTBO());
            allPax.push(adultObject.passengers());
        });

        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let childObject = new makePassengerArray("Child",fareBreakupResponse.response.Results, index+1, "CHILD", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(childObject.renderTBO());
            allPax.push(childObject.passengers());

        });

        Array(parseInt(arr.infants)).fill().forEach((_, index) => {
            let passportAtBook = fareBreakupResponse?.response?.response?.Flights?.[0]?.IspassportNumberblanktopass || true;
            let passportAtTicket = fareBreakupResponse?.response?.response?.Flights?.[0]?.Ispassportdetailsblank || true;
            let infantObject = new makePassengerArray("Infant",fareBreakupResponse.response.Results, index+1, "INFANT", arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET");
            paxArray.push(infantObject.renderTBO());
            allPax.push(infantObject.passengers());

        });

        console.log(paxArray);

        if(paxArray.length > 0){

            let otherData = {
                "origin": arr.Origin.CityCode,
                "destination": arr.Destination.CityCode,
            }

            let bookingData = {
                total_no_of_pax : parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants),
                total_adult : arr.adults,
                total_child : arr.childs,
                total_infant :  arr.infants,
                supplier :  "RIYA",
                agent_amount : totalAmount,
                customer_amount : totalAmount,
                trip_type : "ONEWAY",
                platform_fee : 0,
                platform_tax : 0,
                trace_id : arr.TraceId,
                email_id : document.getElementById(`leademail`).value,
                mobile_no : document.getElementById(`mobile`).value,
                markup : 0,
                agent_markup : 0,
                commission : 0,
                tds : 0,
                total_ssr_amount : totalSSRAmount
             }

            let fd = new FormData();

            fd.append("traceId", traceId);
            fd.append("bookingData", JSON.stringify(bookingData));
            fd.append("trips", JSON.stringify(trips));
            fd.append("allPax", JSON.stringify(allPax));
            fd.append('segmentsArray',JSON.stringify(segArray));
            fd.append("otherData", JSON.stringify(otherData))
            fd.append("flight", JSON.stringify([

                {
                    "departure": `${arr.Origin.CityCode}`,
                    "arrival": `${arr.Destination.CityCode}`,
                    "departureDateTime": `${arr.Origin.DepDateTime.replace(/\s+/g, '')}`,
                    "BasicFare": arr.Segments[0].FareBreakup.BaseFare,
                    "GrossFare": grossFare,
                    "segments": segments
                }
        
            ]))
            fd.append("sellKey", fareBreakupResponse.response.response.SellKey);
            fd.append("passengers", JSON.stringify(paxArray));
            fd.append("email",document.getElementById(`leademail`).value);
            fd.append("mobile",document.getElementById(`mobile`).value);
            fd.append('total', totalAmount);
            fd.append("hold", fareBreakupResponse.response.response.HoldAvailable);
            fd.append("revised", fareBreakupResponse.response.response.Isfarerevised);
            fd.append("totalAdult", arr.adults);
            fd.append("totalChild", arr.childs);
            fd.append("totalInfant", arr.infants);
            fd.append("trip", "ONE WAY");
            fd.append("riyaTrip", "O");

            let res=await fetch("/flights/hold",{
                method:"POST",
                body:fd,
            });

            res = await res.json();

                      if (res.error === false) {
                        Swal.close();
                        partyPopper()
            } else {
                Swal.close();
                alert("problem");
            }


           
        }

    }
    //
    // var currentDate = new Date();
    // // Get the current date and time
    // var currentYear = currentDate.getFullYear();
    // var currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
    // var currentDay = currentDate.getDate();
    // var currentHour = currentDate.getHours();
    // var currentMinute = currentDate.getMinutes();
    // var currentSecond = currentDate.getSeconds();
    // let am_pm = '';
    // if (currentHour > 12)
    //     am_pm = "PM"
    // else
    //     am_pm = "AM"
    //
    // let bookDT = `${currentYear + "/" + currentMonth + "/" + currentDay} ${currentHour + ':' + currentMinute + ":" + currentSecond}`
    // console.log(bookDT);
    // let AdultBaseFare = 0;
    // let ChildBaseFare = 0;
    // let InfantBaseFare = 0;
    // let AdultTax = 0;
    // let ChildTax = 0;
    // let InfantTax = 0;
    // let gst = "NOT NEEDED";
    //
    //
    // // Check if GST checkbox is checked
    // if ($('#gst-checkbox').is(':checked')) {
    //     // Validate GST Form if the checkbox is checked
    //     const gstIsValid = await validateGSTForm();
    //
    //     if (!gstIsValid) {
    //         // If GST validation fails, return early and stop further execution
    //         console.log("GST validation failed.");
    //         return;
    //     }
    //     else
    //     {
    //         const gstNumber = document.getElementsByName("gstnumber")[0].value;
    //         const companyName = document.getElementsByName("gstcompany")[0].value;
    //         const companyEmail = document.getElementsByName("gstemail")[0].value;
    //         const gstPhone = document.getElementsByName("gstphone")[0].value;
    //         const gstAddress = document.getElementsByName("gstaddress")[0].value;
    //
    //         gst = {
    //             gstNumber : gstNumber,
    //             companyName : companyName,
    //             companyEmail : companyEmail,
    //             gstPhone : gstPhone,
    //             gstAddress : gstAddress
    //         }
    //     }
    // }
    //
    //
    // if ($("#details").valid()) {
    //
    //     Swal.fire({
    //         html: `
    //         <div class="loading-container">
    //             <img src="/images/new.gif" class="img-fluid" style="height: 400px;width:400px"/>
    //
    //         </div>
    //     `,
    //         allowOutsideClick: false,
    //         showConfirmButton: false,
    //         background: 'transparent',
    //         customClass: {
    //             popup: 'custom-toast'
    //         }
    //     });
    //     if(arr.Supplier === Suppliers.TBO)
    //     {
    //         Array(parseInt(arr.adults)).fill().forEach((_, index) => {
    //             let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
    //             let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
    //             let adultObject = new makePassengerArray("Adult",fareBreakupResponse.response.Results, index+1, 1, arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET",gst);
    //             paxArray.push(adultObject.renderTBO());
    //             AdultBaseFare = adultObject.renderTBO().Fare.BaseFare;
    //             AdultTax = adultObject.renderTBO().Fare.Tax;
    //         });
    //
    //         Array(parseInt(arr.childs)).fill().forEach((_, index) => {
    //             let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
    //             let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
    //             let childObject = new makePassengerArray("Child",fareBreakupResponse.response.Results, index+1, 2, arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET", gst);
    //             paxArray.push(childObject.renderTBO());
    //             ChildBaseFare = childObject.renderTBO().Fare.BaseFare;
    //             ChildTax = childObject.renderTBO().Fare.Tax;
    //         });
    //
    //         Array(parseInt(arr.infants)).fill().forEach((_, index) => {
    //             let passportAtBook = fareBreakupResponse.response?.Results?.IsPassportRequiredAtBook || false;
    //             let passportAtTicket = fareBreakupResponse.response?.Results?.IsPassportRequiredAtTicket || false;
    //             let infantObject = new makePassengerArray("Infant",fareBreakupResponse.response.Results, index+1, 3, arr.AirlineCode, arr.FlightNumber, passportAtBook, passportAtTicket, "TICKET", gst);
    //             paxArray.push(infantObject.renderTBO());
    //             InfantBaseFare = infantObject.renderTBO().Fare.BaseFare;
    //             InfantTax = infantObject.renderTBO().Fare.Tax;
    //         });
    //
    //         console.log(paxArray);
    //
    //
    //
    //
    //         if(paxArray.length > 0)
    //         {
    //             let otherData = {
    //                 "origin" : arr.Origin.CityCode,
    //                 "destination" : arr.Destination.CityCode,
    //                 "fareType" : arr.Segments[0].fare,
    //                 "adultBaseFare" : AdultBaseFare,
    //                 "childBaseFare" : ChildBaseFare,
    //                 "infantBaseFare" : InfantBaseFare,
    //                 "adultTax" : AdultTax,
    //                 "childTax" : ChildTax,
    //                 "infantTax" : InfantTax,
    //                 "otherCharges" : fareBreakupResponse.response.Results.Fare.OtherCharges,
    //                 "serviceFee" : fareBreakupResponse.response.Results.Fare.ServiceFee,
    //                 "publishedFare" : fareBreakupResponse.response.Results.Fare.PublishedFare,
    //                 "offeredFare" : fareBreakupResponse.response.Results.Fare.OfferedFare
    //             }
    //
    //
    //
    //             if(fareBreakupResponse.response.Results.IsLCC)
    //             {
    //                 let fd = new FormData();
    //
    //                 fd.append("traceId", arr.TraceId);
    //                 fd.append("ResultIndex", arr.Segments[0].ResultIndex);
    //                 fd.append("Passengers", JSON.stringify(paxArray));
    //                 fd.append("otherData", JSON.stringify(otherData))
    //                 fd.append("totalPax", parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants));
    //                 fd.append("totalAdult", arr.adults);
    //                 fd.append("totalChild", arr.childs);
    //                 fd.append("totalInfant", arr.infants);
    //                 fd.append("stops", arr.Segments[0].flightDetails.length-1);
    //                 fd.append("price", fareBreakupResponse.response.IsPriceChanged);
    //                 fd.append("passport", []);
    //                 fd.append("flightType", 'lccWithPass');
    //                 fd.append("total",totalAmount);
    //                 fd.append("agentEmail", localStorage.getItem("agentEmail"));
    //                 fd.append("bookDT", bookDT);
    //                 fd.append("lastTicketDate", "");
    //                 fd.append("isRefundable", fareBreakupResponse.response.Results.IsRefundable);
    //                 fd.append("tripType", "ONE_WAY");
    //                 fd.append("trip", "departure");
    //                 fd.append("ssrAmount", 0);
    //                 fd.append("markup",0);
    //                 fd.append("platformFee", 0);
    //                 fd.append("platformTax", 0);
    //
    //                 let res = await fetch("/goToCheckout", {
    //                     method: "POST",
    //                     body: fd
    //                 });
    //
    //
    //                 if(res.ok)
    //                 {
    //                     window.location.href = '/flightCheckout';
    //                 }
    //                 else
    //                 {
    //                     alert("problem")
    //                 }
    //             }
    //             else
    //             {
    //                 let fd = new FormData();
    //
    //                 fd.append("traceId", arr.TraceId);
    //                 fd.append("ResultIndex", arr.Segments[0].ResultIndex);
    //                 fd.append("Passengers", JSON.stringify(paxArray));
    //                 fd.append("otherData", JSON.stringify(otherData))
    //                 fd.append("totalPax", parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants));
    //                 fd.append("totalAdult", arr.adults);
    //                 fd.append("totalChild", arr.childs);
    //                 fd.append("totalInfant", arr.infants);
    //                 fd.append("stops", arr.Segments[0].flightDetails.length-1);
    //                 fd.append("price", fareBreakupResponse.response.IsPriceChanged);
    //                 fd.append("passport", []);
    //                 fd.append("flightType", 'directTicket');
    //                 fd.append("total",totalAmount);
    //                 fd.append("agentEmail", localStorage.getItem("agentEmail"));
    //                 fd.append("bookDT", bookDT);
    //                 fd.append("lastTicketDate", "");
    //                 fd.append("isRefundable", fareBreakupResponse.response.Results.IsRefundable);
    //                 fd.append("tripType", "ONE_WAY");
    //                 fd.append("trip", "departure");
    //                 fd.append("ssrAmount", 0);
    //                 fd.append("markup",0);
    //                 fd.append("platformFee", 0);
    //                 fd.append("platformTax", 0);
    //
    //                 let res = await fetch("/flights/directBooking", {
    //                     method: "POST",
    //                     body: fd
    //                 });
    //
    //
    //                 res = await res.json();
    //
    //                 console.log(res);
    //
    //                 let passportDetailsArray = [];
    //
    //
    //                 if (res.ResponseStatus === 1) {
    //
    //                     let fd1 = new FormData();
    //
    //
    //                     fd1.append("traceId", arr.TraceId);
    //                     fd1.append("ResultIndex", arr.Segments[0].ResultIndex);
    //                     fd1.append("PNR", res.response.Response.PNR);
    //                     fd1.append("BookingId", res.response.Response.BookingId);
    //                     fd1.append("Passengers", JSON.stringify(paxArray));
    //                     fd1.append("otherData", JSON.stringify(otherData))
    //                     fd1.append("totalPax", parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants));
    //                     fd1.append("totalAdult", arr.adults);
    //                     fd1.append("totalChild", arr.childs);
    //                     fd1.append("totalInfant", arr.infants);
    //                     fd1.append("passport", JSON.stringify(passportDetailsArray));
    //                     fd1.append("bookingNo", res.bid);
    //                     fd1.append("stops", arr.Segments[0].flightDetails.length-1);
    //                     fd1.append("price", fareBreakupResponse.response.IsPriceChanged);
    //                     fd1.append("passport", []);
    //                     fd1.append("flightType", 'directTicket');
    //                     fd1.append("total",totalAmount);
    //                     fd1.append("agentEmail", localStorage.getItem("agentEmail"));
    //                     fd1.append("bookDT", bookDT);
    //                     fd1.append("lastTicketDate", "");
    //                     fd1.append("isRefundable", fareBreakupResponse.response.Results.IsRefundable);
    //                     fd1.append("tripType", "ONE_WAY");
    //                     fd1.append("trip", "departure");
    //                     fd1.append("ssrAmount", 0);
    //                     fd1.append("markup",0);
    //                     fd1.append("platformFee", 0);
    //                     fd1.append("platformTax", 0);
    //
    //                     let res1 = await fetch("/goToCheckout", {
    //                         method: "POST",
    //                         body: fd1
    //                     });
    //
    //
    //                     if(res1.ok)
    //                     {
    //                         window.location.href = '/flightCheckout';
    //                     }
    //                     else
    //                     {
    //                         alert("problem")
    //                     }
    //
    //
    //                 }
    //                 else if (res.ResponseStatus === 14) {
    //                     let timerInterval;
    //                     Swal.fire({
    //                         title: "Return Flight Failed",
    //                         icon : "error",
    //                         html:  `<h2 style="color: red">Error Occurred</h2> <br> <b></b> milliseconds.`,
    //                         timer: 4000,
    //                         timerProgressBar: true,
    //                         allowOutsideClick: false,  // Disable outside click
    //                         didOpen: () => {
    //                             Swal.showLoading();
    //                             const timer = Swal.getPopup().querySelector("b");
    //                             timerInterval = setInterval(() => {
    //                                 timer.textContent = `${Swal.getTimerLeft()}`;
    //                             }, 100);
    //                         },
    //                         willClose: () => {
    //                             clearInterval(timerInterval);
    //                         }
    //                     }).then(async (result) => {
    //                         /* Read more about handling dismissals below */
    //                         if (result.dismiss === Swal.DismissReason.timer) {
    //                             window.location.href="/FailedBookings"
    //                         }
    //                     });
    //                 }
    //                 else {
    //                     let timerInterval;
    //                     Swal.fire({
    //                         title: "Book Flight Failed",
    //                         icon : "error",
    //                         html:  `<h2 style="color: red">Error Occurred</h2> <br> <b></b> milliseconds.`,
    //                         timer: 4000,
    //                         timerProgressBar: true,
    //                         allowOutsideClick: false,  // Disable outside click
    //                         didOpen: () => {
    //                             Swal.showLoading();
    //                             const timer = Swal.getPopup().querySelector("b");
    //                             timerInterval = setInterval(() => {
    //                                 timer.textContent = `${Swal.getTimerLeft()}`;
    //                             }, 100);
    //                         },
    //                         willClose: () => {
    //                             clearInterval(timerInterval);
    //                         }
    //                     }).then(async (result) => {
    //                         /* Read more about handling dismissals below */
    //                         if (result.dismiss === Swal.DismissReason.timer) {
    //                             window.location.href="/FailedBookings"
    //                         }
    //                     });
    //                 }
    //             }
    //
    //         }
    //     }
    //     else if(arr.Supplier === Suppliers.TRIPJACK)
    //     {
    //         Array(parseInt(arr.adults)).fill().forEach((_, index) => {
    //             let pmValue = fareBreakupResponse.response?.conditions?.pcs?.pm || false; // Fallback value if pm is missing
    //             let adultObject = new makePassengerArray("Adult",fareBreakupResponse.response.tripInfos[0], index+1, 1, arr.AirlineCode, arr.FlightNumber, pmValue, pmValue, "TICKET", gst);
    //             paxArray.push(adultObject.renderTRIPJACK());
    //         });
    //
    //         Array(parseInt(arr.childs)).fill().forEach((_, index) => {
    //             let pmValue = fareBreakupResponse.response?.conditions?.pcs?.pm || false; // Fallback value if pm is missing
    //             let childObject = new makePassengerArray("Child",fareBreakupResponse.response.tripInfos[0], index+1, 2, arr.AirlineCode, arr.FlightNumber, pmValue, pmValue, "TICKET", gst);
    //             paxArray.push(childObject.renderTRIPJACK());
    //         });
    //
    //         Array(parseInt(arr.infants)).fill().forEach((_, index) => {
    //             let pmValue = fareBreakupResponse.response?.conditions?.pcs?.pm || false; // Fallback value if pm is missing
    //             let infantObject = new makePassengerArray("Infant",fareBreakupResponse.response.tripInfos[0], index+1, 3, arr.AirlineCode, arr.FlightNumber, pmValue, pmValue, "TICKET", gst);
    //             paxArray.push(infantObject.renderTRIPJACK());
    //         });
    //
    //         if(paxArray.length > 0){
    //             let fd = new FormData();
    //             fd.append("supplier", 'TRIPJACK');
    //             fd.append("bookingId", fareBreakupResponse.response.bookingId);
    //             fd.append("TF", parseFloat(fareBreakupResponse.response.totalPriceInfo.totalFareDetail.fC.TF));
    //             fd.append("email", document.getElementById(`leademail`).value);
    //             fd.append("contact", document.getElementById(`mobile`).value);
    //             fd.append("traceId", arr.Segments[0].ResultIndex);
    //             fd.append("Passengers", JSON.stringify(paxArray));
    //             fd.append("totalPax", parseInt(arr.adults) + parseInt(arr.childs) + parseInt(arr.infants));
    //             fd.append("totalAdult", arr.adults);
    //             fd.append("totalChild", arr.childs);
    //             fd.append("totalInfant", arr.infants);
    //             fd.append("stops", arr.Segments[0].flightDetails.length -1);
    //             fd.append("gst",JSON.stringify(gst));
    //             fd.append("total", totalAmount);
    //             fd.append("returnMarkup", 0);
    //             fd.append("agentEmail", localStorage.getItem("agentEmail"));
    //             fd.append("bookDT", bookDT);
    //             fd.append("tripType", "ONE_WAY");
    //             fd.append("ssrAmount", 0);
    //             fd.append("markup", 0);
    //             fd.append("platformFee", 0);
    //             fd.append("platformTax", 0);
    //             fd.append("isDomestic", fareBreakupResponse.response.searchQuery.isDomestic);
    //             fd.append("fareType", arr.Segments[0].fare);
    //
    //             let res = await fetch("/goToCheckout", {
    //                 method: "POST",
    //                 body: fd
    //             });
    //
    //             if (res.ok) {
    //                 window.location.href = '/flightCheckout';
    //             } else {
    //                 alert("problem");
    //             }
    //         }
    //     }
    // }
}

function MealModal() {
    document.getElementById("mealTravellers").innerHTML = '';

    if ($("#details").valid()) {

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let adultForm = new mealPassengers("Adult", index+1);
            document.getElementById("mealTravellers").innerHTML+= adultForm.renderMealPassengers()
            // You can apply any logic here for each adult
        });

        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let adultForm = new mealPassengers("Child", index+1);
            document.getElementById("mealTravellers").innerHTML+= adultForm.renderMealPassengers();
            // You can apply any logic here for each adult
        });

        const msector = document.querySelectorAll('.meal-sector');
        const travellers = document.querySelectorAll('.traveller-name');

        updateMealOptions();
        let mealmodal
        for(let i =0; i<fareBreakupResponse.response.response.Flights[0].Segments.length; i++) {
            let segment = fareBreakupResponse.response.response.Flights[0].Segments[i];

            mealmodal = segment?.SSRMealDetail || "NO MEAL";
        }
        console.log("mealmodal",mealmodal)
        if(mealmodal !== "NO MEAL") {
            $("#mealModal").modal("show");
        }
        else {
            toastMixin.fire({
                animation: true,  // Enables animation for the toast
                icon: 'error',  // This sets the warning icon
                title: `No Extra Meal Facility Available For This FLight.`
            });
        }


    }
    else
    {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'warning',  // This sets the warning icon
            title: 'Please Fill Passenger Details First'  // Warning message to display
        });
    }
}

function BaggageModal() {
    document.getElementById("baggageTravellers").innerHTML = '';

    if ($("#details").valid()) {

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let adultForm = new baggagePassengers("Adult", index+1);
            document.getElementById("baggageTravellers").innerHTML+= adultForm.renderBaggagePassengers()
            // You can apply any logic here for each adult
        });

        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let adultForm = new baggagePassengers("Child", index+1);
            document.getElementById("baggageTravellers").innerHTML+= adultForm.renderBaggagePassengers();
            // You can apply any logic here for each adult
        });

        const msector = document.querySelectorAll('.baggage-sector');
        const travellers = document.querySelectorAll('.traveller-name');

        updateBaggageOptions();
        let BaggageDynamic = fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0] || "NO BAGGAGE";
        console.log("baggage",BaggageDynamic)
        if(BaggageDynamic !== "NO BAGGAGE") {
            $("#baggageModal").modal("show");
        }
        else {
            toastMixin.fire({
                animation: true,  // Enables animation for the toast
                icon: 'error',  // This sets the warning icon
                title: `No Extra Baggage Facility Available For This FLight.`
            });
        }
    }
    else
    {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'warning',  // This sets the warning icon
            title: 'Please Fill Passenger Details First'  // Warning message to display
        });
    }
}

function seatModal() {
    document.getElementById("seatTravellers").innerHTML = '';

    if ($("#details").valid()) {

        Array(parseInt(arr.adults)).fill().forEach((_, index) => {
            let adultForm = new seatPassengers("Adult", index+1);
            document.getElementById("seatTravellers").innerHTML+= adultForm.renderSeatPassengers()
            // You can apply any logic here for each adult
        });

        Array(parseInt(arr.childs)).fill().forEach((_, index) => {
            let adultForm = new seatPassengers("Child", index+1);
            document.getElementById("seatTravellers").innerHTML+= adultForm.renderSeatPassengers();
            // You can apply any logic here for each adult
        });


        updateSeatOptions();

        $("#seatModal").modal("show");
    }
    else
    {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'warning',  // This sets the warning icon
            title: 'Please Fill Passenger Details First'  // Warning message to display
        });
    }
}


function updateMealOptions()
{
    console.log("dhgb")
    document.getElementById("mealOptions").innerHTML = '';

    const msector = document.querySelectorAll('.meal-sector');
    const travellers = document.querySelectorAll('.traveller-name');
    console.log(msector)
    console.log(travellers)
    msector.forEach(function(sector) {
        if (sector.classList.contains('active-meal-sector')) {
            console.log("sectorggg",sector)
            const selectedSectorId = sector.id;
            console.log("Selected Sector ID:", selectedSectorId);

            travellers.forEach((traveller, index) => {
                if(traveller.classList.contains('active-traveller'))
                {
                    const selectedTraveller = traveller.id;

                    if(arr.Supplier === Suppliers.RIYA)
                    {
                        console.log("hsn")
                        let MealDynamic = mealArray || "NO MEAL";
                        // let Meal = MealDynamic.mealDetails || "NO MEAL";
                        if(MealDynamic !== 'NO MEAL')
                        {
                            console.log("md",MealDynamic)
                            // console.log("m",Meal)
                            console.log("kjhbv jn")
                            for(let i=0;i<MealDynamic.length;i++)
                            {
                                for(let j=0;j<MealDynamic[i].mealDetails?.SSRDetails?.length;j++)
                                {
                                    if(fareBreakupResponse.response.response.Flights[0].Segments[i].OriginDestination.Departure === selectedSectorId.split("-")[0] && fareBreakupResponse.response.response.Flights[0].Segments[i].OriginDestination.Arrival === selectedSectorId.split("-")[1]) {
                                        let meals = MealDynamic[i].mealDetails.SSRDetails[j]
                                        let mealOption = new mealOptions(meals, j, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1], i)
                                        console.log("mo", mealOption, i, j)
                                        document.getElementById("mealOptions").innerHTML += mealOption.renderMealDynamicOptions()
                                    }
                                }
                            }
                            // MealDynamic.forEach((meal,index) => {
                            //     console.log("cghvb")
                            //     // if(meal.Origin === selectedSectorId.split("-")[0] && meal.Destination === selectedSectorId.split("-")[1]) {
                            //     //     console.log("ygfh")
                            //         let mealOption = new mealOptions(meal, index, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1],0)
                            //     console.log(mealOption)
                            //     document.getElementById("mealOptions").innerHTML += mealOption.renderMealDynamicOptions()
                            //     // }
                            // })
                        }
                        else if(Meal !== 'NO MEAL')
                        {
                            console.log("kjhbv jn")
                            Meal.forEach((meal,index) => {
                                let mealOption = new mealOptions(meal, index, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1],0)
                                document.getElementById("mealOptions").innerHTML += mealOption.renderMealOptions()

                            })
                        }
                    }
                    else
                    {
                        console.log("kjhbv jn")
                        fareBreakupResponse.response.tripInfos[0].sI.forEach((segment,segmentIndex) => {
                            let MealDynamic =  fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.MEAL  || "NO MEAL";
                            if(MealDynamic !== 'NO MEAL')
                            {
                                MealDynamic.forEach((meal,index) => {
                                    if(segment.da.cityCode === selectedSectorId.split("-")[0] && segment.aa.cityCode === selectedSectorId.split("-")[1]) {

                                        let mealOption = new mealOptions(meal, index, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1], segmentIndex)
                                        document.getElementById("mealOptions").innerHTML += mealOption.renderMealDynamicOptions()
                                    }
                                })
                            }
                        })
                    }
                    calculateTotalMealPrice();
                    return
                }
            })

            return;  // Since you can't break out of forEach, this stops further execution in this iteration
        }
    });
}

function updateBaggageOptions()
{
    console.log("xehwd")
    document.getElementById("baggageOptions").innerHTML = '';

    const msector = document.querySelectorAll('.baggage-sector');
    const travellers = document.querySelectorAll('.baggage-traveller-name');
    console.log("hjvh")
    console.log(msector.length)
    // msector.forEach(function(sector) {
    //     if (sector.classList.contains('active-baggage-sector')) {
    //         const selectedSectorId = sector.id;
    //         console.log("Selected Sector ID:", selectedSectorId);
    let od= fareBreakupResponse.response.response.Flights[0].OriginDestination
    let origin= od.Departure
    let destination = od.Arrival
    travellers.forEach((traveller, index) => {
        if(traveller.classList.contains('active-traveller'))
        {
            const selectedTraveller = traveller.id;

            if(arr.Supplier === "RIYA")
            {
                console.log("egxsaj")
                let Baggage = fareBreakupResponse.response.response.Flights[0]?.SSRBaggageDetail?.[0] || "NO BAGGAGE";
                if(Baggage !== 'NO BAGGAGE')
                {
                    console.log("gdscx",Baggage)
                    for(let i=0;i<Baggage.SSRDetails.length;i++)
                    {
                        let mealOption = new baggageOptions(Baggage.SSRDetails[i], i, selectedTraveller, origin,destination,0)
                        console.log(mealOption)
                        document.getElementById("baggageOptions").innerHTML += mealOption.renderBaggageOptions()
                    }
                    // Baggage[0].forEach((meal,index) => {
                    //     if(meal.Origin === selectedSectorId.split("-")[0] && meal.Destination === selectedSectorId.split("-")[1]) {
                    //
                    //         let mealOption = new baggageOptions(meal, index, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1],0)
                    //         document.getElementById("baggageOptions").innerHTML += mealOption.renderBaggageOptions()
                    //     }
                    // })
                }
                else
                {
                    toastMixin.fire({
                        animation: true,  // Enables animation for the toast
                        icon: 'error',  // This sets the warning icon
                        title: `No Extra Baggage Facility Available For This FLight.`
                    });
                }
            }
            else
            {
                fareBreakupResponse.response.tripInfos[0].sI.forEach((segment,segmentIndex) => {
                    let MealDynamic =  fareBreakupResponse.response?.tripInfos[0]?.sI[segmentIndex]?.ssrInfo?.BAGGAGE  || "NO BAGGAGE";
                    if(MealDynamic !== 'NO BAGGAGE')
                    {
                        MealDynamic.forEach((meal,index) => {
                            if(segment.da.cityCode === selectedSectorId.split("-")[0] && segment.aa.cityCode === selectedSectorId.split("-")[1]) {

                                let mealOption = new baggageOptions(meal, index, selectedTraveller, selectedSectorId.split("-")[0], selectedSectorId.split("-")[1], segmentIndex)
                                document.getElementById("baggageOptions").innerHTML += mealOption.renderBaggageOptions()
                            }
                        })
                    }
                    else
                    {
                        toastMixin.fire({
                            animation: true,  // Enables animation for the toast
                            icon: 'error',  // This sets the warning icon
                            title: `No Extra Baggage Facility Available For This FLight.`
                        });
                    }
                })
            }
            calculateTotalBaggagePriceNew()
            return
        }
    })

    return;  // Since you can't break out of forEach, this stops further execution in this iteration
    //     }
    // });
}

function updateSeatOptions()
{

    document.getElementById("renderSeats").innerHTML = '';

    const msector = document.querySelectorAll('.seat-sector');
    const travellers = document.querySelectorAll('.seat-traveller-name');

    msector.forEach(function(sector) {
        if (sector.classList.contains('active-seat-sector')) {
            const selectedSectorId = sector.id;
            console.log("Selected Sector ID:", selectedSectorId);

            travellers.forEach((traveller, index) => {
                if(traveller.classList.contains('current-traveller-seat-selection'))
                {
                    const selectedTraveller = traveller.id;

                    if(arr.Supplier === Suppliers.RIYA)
                    {

                        let Baggage = fareBreakupResponse.response.response.Flights[0].Segments[selectedSectorId.split("-")[0]].SeatLayoutDetails.DiaplayLayout[0]                        || "NO SEAT";
                        if(Baggage !== 'NO SEAT')
                        {
                            makeSeats(parseInt(selectedSectorId.split("-")[0]), selectedSectorId.split("-")[1], selectedSectorId.split("-")[2])
                        }
                        else
                        {
                            toastMixin.fire({
                                animation: true,  // Enables animation for the toast
                                icon: 'error',  // This sets the warning icon
                                title: `No Extra Baggage Facility Available For This FLight.`
                            });
                        }
                    }
                    else
                    {

                        let seatDynamic =  ssrResponse?.response?.tripSeatMap?.tripSeat?.[selectedSectorId] || 'NO SEAT';

                            if(seatDynamic !== 'NO SEAT')
                            {
                               renderSeatstj(selectedSectorId)
                            }
                            else
                            {
                                toastMixin.fire({
                                    animation: true,  // Enables animation for the toast
                                    icon: 'error',  // This sets the warning icon
                                    title: `No Extra Seat Facility Available For This FLight.`
                                });
                            }

                    }

                    return
                }
            })

            return;  // Since you can't break out of forEach, this stops further execution in this iteration
        }
    });
}

async function validateGSTForm() {
    const gstNumber = document.getElementsByName("gstnumber")[0].value;
    const companyName = document.getElementsByName("gstcompany")[0].value;
    const companyEmail = document.getElementsByName("gstemail")[0].value;
    const gstPhone = document.getElementsByName("gstphone")[0].value;
    const gstAddress = document.getElementsByName("gstaddress")[0].value;

    // Updated GST number regex (15 characters, typical structure for Indian GST)
    const gstNumberRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/;
    // Allow company names with letters, numbers, spaces, and certain special characters
    const companyNameRegex = /^[A-Za-z0-9&.\s]+$/;
    // Allow for emails with longer TLDs
    const companyEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    // Phone number regex remains the same for 10-digit numbers
    const gstPhoneRegex = /^\d{10}$/;
    // Loosen the address regex to allow more special characters
    const gstAddressRegex = /^[A-Za-z0-9\s.,-\/'&]+$/;

    // Validation logic
    if (!gstNumberRegex.test(gstNumber)) {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'error',  // This sets the warning icon
            title: `Please Enter Valid GST Number.`
        });
        return false;
    }

    if (!companyNameRegex.test(companyName)) {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'error',  // This sets the warning icon
            title: `Please Enter Valid Company Name.`
        });
        return false;
    }

    if (!companyEmailRegex.test(companyEmail)) {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'error',  // This sets the warning icon
            title: `Please Enter Valid Company Email.`
        });
        return false;
    }

    if (!gstPhoneRegex.test(gstPhone)) {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'error',  // This sets the warning icon
            title: `Please Enter Valid Company Phone.`
        });
        return false;
    }

    if (!gstAddressRegex.test(gstAddress)) {
        toastMixin.fire({
            animation: true,  // Enables animation for the toast
            icon: 'error',  // This sets the warning icon
            title: `Please Enter Valid Company Address.`
        });
        return false;
    }

    return true;
}

function makeSeats(sId, origin, destination)
{
    document.getElementById("renderSeats").innerHTML = '';

    let seatArray = JSON.parse(fareBreakupResponse.response.response.Flights[0].Segments[sId].SeatLayoutDetails.DiaplayLayout[0].Layout)

    let seatsArray = fareBreakupResponse.response.response.Flights[0].Segments[sId].SeatLayoutDetails.SeatLayout

    let SegmentReferenceNumber = fareBreakupResponse.response.response.Flights[0].Segments[sId].SeatLayoutDetails.SegmentReferenceNumber;


    let flightNumber = fareBreakupResponse.response.response.Flights[0].Segments[sId].FlightNumber

    console.log(seatArray)

    selectedSeats.forEach(seat => {
        // Clear the seat information for each traveller before updating
        document.getElementById(`${seat.id}seat`).innerHTML = ''; // Empty the content
    });

    selectedSeats.forEach(seat => {
        if (seat.index === parseInt(sId)) {
            document.getElementById(`${seat.id}seat`).innerHTML += `
        <small class="traveller-name__subheading">${seat.seatNo} • ₹${seat.price}</small>
        <button type="button" class="app-btn-secondary" onclick="removeSeat(${seat.index}, '${seat.id}', '${seat.seatNo}')"
            style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
        </button>
        `;
        }
    });

    let priceLegends = ``;

    let priceColorMap = {};

    let totalSeatPrice = 0;




    let rowDisplay = '';

    seatArray.forEach((row) => {
        rowDisplay += `<div class="d-flex position-relative">`;
    
        for (let key in row) {
            let seatNo = row[key];
            if (seatNo) {
                const seat = seatsArray.find(seat => seat.SeatName === seatNo);
                const price  = seat? seat.SeatAmount : 0; 
                const seatRef = seat? seat.SeatKeyRef : 0
                rowDisplay += `
                    <div class="d-flex flex-column align-items-center" onclick="AddSeat(${sId},${price},'${seatNo}', '${seatRef}', '${SegmentReferenceNumber}', '${flightNumber}', '${origin}', '${destination}')">
                        <div class="flight-seat-map_row-designator">${seatNo}</div>
                        <div class="flight-seat-map_seat" id="${seatNo}">
                            <div class="seat-text">${seatNo}</div>
                        </div>
                    </div>`;
            } else {
                rowDisplay += `
                    <div class="d-flex flex-column align-items-center">
                        <div class="flight-seat-map_seat1 flight-seat-map_aisle-space"></div>
                    </div>`;
            }
        }
    
        rowDisplay += `</div>`;
    });

    document.getElementById("renderSeats").innerHTML = rowDisplay;


}


function AddSeat(segmentIndex, price, seatCode, SeatKey, SegmentReferenceNumber, flightNumber, origin, destination) {


    const travellers = document.querySelectorAll('.seat-traveller-name');

    travellers.forEach((traveller, index) => {
        if (traveller.classList.contains('current-traveller-seat-selection')) {
            const selectedTraveller = traveller.id;

            // Find the seat for the selected traveller and segment
            let seatIndex = selectedSeats.findIndex(seat => seat.id === selectedTraveller && seat.index === segmentIndex);

            // If the seat exists, update it (or remove the previous seat selection)
            if (seatIndex !== -1) {
                // Remove the previous seat selection from UI
                const previousSeatNo = selectedSeats[seatIndex].seatNo;
                if (previousSeatNo) {
                    document.getElementById(previousSeatNo).classList.remove('flight-seat-map_selected-seat');
                    document.getElementById(seatCode).classList.add('flight-seat-map_selected-seat');

                }

                // Update the seat information for the traveller
                grossFare-=selectedSeats[seatIndex].price;
                selectedSeats[seatIndex].seatNo = seatCode;
                selectedSeats[seatIndex].SeatKeyRef = SeatKey;
                selectedSeats[seatIndex].price = price;
                document.getElementById(`${selectedTraveller}seat`).innerHTML = `<div class="d-flex gap-2 selected-seats align-items-center"><small class="traveller-name__subheading">${seatCode} • ₹${price}</small> <button type="button" class="app-btn-secondary "  onclick="removeSeat(${segmentIndex},'${selectedTraveller}','${seatCode}')"  style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg> </button></div>`

            }
            // If no seat exists, add a new seat for the traveller
            else {
                let seat = {
                    origin : origin,
                    destination : destination,
                    index: segmentIndex,
                    id: selectedTraveller,
                    price: price,
                    segmentId: segmentIndex || 0,
                    seatNo: seatCode,
                    SeatKeyRef : SeatKey,
                    SegmentReferenceNumber : SegmentReferenceNumber,
                    FlightNumber : flightNumber
                };

                // Add the new seat information to the selectedSeats array
                selectedSeats.push(seat);
                console.log(selectedSeats)
                document.getElementById(seatCode).classList.add('flight-seat-map_selected-seat');

                document.getElementById(`${selectedTraveller}seat`).innerHTML = `<div class="d-flex gap-2 selected-seats align-items-center"><small class="traveller-name__subheading">${seatCode} • ₹${price}</small> <button type="button" class="app-btn-secondary " onclick="removeSeat(${segmentIndex},'${selectedTraveller}','${seatCode}')" style="padding: 0.5rem; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 10px; font-weight: 600;"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg> </button></div>`
            }

            // Update the total amounts
           
            totalAmount += price;

            grossFare+=price;

            totalSSRAmount+=price
         

            document.getElementById("totalAmountSpan").innerHTML = totalAmount;

            // Show the toast message
            toastMixin.fire({
                animation: true,
                icon: 'success',
                title: `${seatCode}` });

            console.log(selectedSeats);

        }
    });
}

function removeSeat(index, traveller, seatCode)
{

    let seatIndex = selectedSeats.findIndex(seat => seat.index === index && seat.id === traveller && seat.seatNo === seatCode)


    totalAmount-= selectedSeats[seatIndex].price ;

    grossFare-= selectedSeats[index].price 

    totalSSRAmount-= selectedSeats[index].price 
 

    document.getElementById("totalAmountSpan").innerHTML = totalAmount;

    document.getElementById(seatCode).classList.remove('flight-seat-map_selected-seat');

    selectedSeats.splice(seatIndex, 1);

    toastMixin.fire({
        animation: true,  // Enables animation for the toast
        icon: 'success',  // This sets the warning icon
        title: seatCode
       });



    document.getElementById(`${traveller}seat`).innerHTML = '';

}


function partyPopper() {
    // Hide the modal if it's already open
    $('#modals').modal('hide');
    $('#modalp').modal('hide');
    $('#modalr').modal('hide');

    // Window dimensions
    let W = window.innerWidth;
    let H = window.innerHeight;

    // Get the canvas and context for drawing confetti
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const maxConfettis = 150;
    const particles = [];

    // Array of possible confetti colors
    const possibleColors = [
        "DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue",
        "Gold", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate",
        "Crimson"
    ];

    // Helper function to generate random numbers between a range
    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    // Particle class for confetti
    function confettiParticle() {
        this.x = Math.random() * W; // x
        this.y = Math.random() * H - H; // y
        this.r = randomFromTo(11, 33); // radius
        this.d = Math.random() * maxConfettis + 11;
        this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;

        this.draw = function() {
            context.beginPath();
            context.lineWidth = this.r / 2;
            context.strokeStyle = this.color;
            context.moveTo(this.x + this.tilt + this.r / 3, this.y);
            context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
            return context.stroke();
        };
    }

    // Draw confetti particles on the canvas
    function Draw() {
        const results = [];

        // Request animation frame to keep the animation going
        requestAnimationFrame(Draw);

        // Clear the canvas and draw each confetti particle
        context.clearRect(0, 0, W, window.innerHeight);

        for (let i = 0; i < maxConfettis; i++) {
            results.push(particles[i].draw());
        }

        let particle = {};
        let remainingFlakes = 0;

        // Update the position of each particle
        for (let i = 0; i < maxConfettis; i++) {
            particle = particles[i];

            // Animate confetti
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

            // Count how many confetti particles are still visible
            if (particle.y <= H) remainingFlakes++;

            // Reset particle when it goes out of view
            if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
                particle.x = Math.random() * W;
                particle.y = -30;
                particle.tilt = Math.floor(Math.random() * 10) - 20;
            }
        }

        return results;
    }

    // Resize event to update canvas size dynamically
    window.addEventListener(
        "resize", function() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        },
        false
    );

    // Create confetti particles
    for (let i = 0; i < maxConfettis; i++) {
        particles.push(new confettiParticle());
    }

    // Initialize the canvas size and start the animation
    canvas.width = W;
    canvas.height = H;
    Draw();

    // Show the modal with the success message and OK button
    $('#popper').modal('show');

    // Add custom HTML for success message and OK button
    $('body').append(`
    <div id="successMessage" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; font-size: 2rem; z-index: 9999;">
        <div style="margin-bottom: 20px; font-weight: bold; font-size: 2.5rem;"><span style='font-size:100px;'>&#128512;</span><br>Your Booking has been HOLD!</div>
         <button id="okButton" style="padding: 10px 20px; font-size: 1rem; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
    </div>
`);

    // Ensure the canvas is behind all other elements by explicitly setting its z-index
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";  // Canvas stays behind the modal and success message


    // Button click handler to close the modal and reset the background
    $('#okButton').on('click', function() {
        $('#popper').modal('hide');
       
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        window.location.href = '/flights/viewHoldBookings'
    });
}

