class HotelCard {
    constructor(hotel,index) {
        this.hotel = hotel;
        this.index = index;
    }

    renderCards(){

        let card =`
        <div id="_${this.hotel.id}" class="card" data-class="${this.hotel.staticContent.name}">
            <div class="row">
                <div class="photo">
                    <img class="maindisplaymage" id="img_${this.hotel.id}" src="${this.hotel.staticContent.heroImage}">
                </div>
                <div class="col info">
                    <div>
                        <a href="#" onclick="GetHotelDetails('${this.hotel.id}'); return false;">
                            <span class="h1">${this.hotel.staticContent.name}</span>
                        </a>

                        <div class="tour-card__rating">`;

        return card;
    }
}

 async function GetHotelDetails(hotel){

}