import { LightningElement, api } from 'lwc';

export default class ModalComponent extends LightningElement {
    @api placeName;
    @api country;
    @api longitude;
    @api state;
    @api latitude;
    @api stateAbbreviation;

    // Method to close the modal
    closeModal() {
        const closeModalEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeModalEvent);
    }
}