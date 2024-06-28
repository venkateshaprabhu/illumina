import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import fetchData from '@salesforce/apex/ZipCodeController.fetchData'; 
import checkExistingRecord from '@salesforce/apex/ZipCodeController.checkExistingRecord'; 
import ZIP_CODE_OBJECT from '@salesforce/schema/Zip_Code__c'; 
import COUNTRY_FIELD from '@salesforce/schema/Zip_Code__c.Country__c'; 
import POSTCODE_FIELD from '@salesforce/schema/Zip_Code__c.PostCode__c';
import NAME_FIELD from '@salesforce/schema/Zip_Code__c.Name';

export default class ZipCodeComponent extends LightningElement {
    @track zipCode;
    @track selectedPlace = {};
    @track showModal = false;
    picklistOptions = [];
    selectedCountry;

    @wire(getObjectInfo, { objectApiName: ZIP_CODE_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: COUNTRY_FIELD })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.picklistOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
            console.log('Picklist values:', this.picklistOptions);
        } else if (error) {
            console.error('Error retrieving picklist values:', error);
        }
    }

    handleCountryChange(event) {
        this.selectedCountry = event.detail.value;
    }

    handleInputChange(event) {
        this.zipCode = event.target.value;
    }

    handleModalClose(){
        this.showModal = false;
    }

    callAPI() {
        fetchData({ zipCode: this.zipCode, country : this.selectedCountry })
            .then(result => {
                if (result.country === 'United States') {
                    this.handleUSData(result);
                } else {
                    this.storeNonUSData(result);
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleUSData(result) {
        this.selectedPlace = {
            placeName: result.places.length > 0 ? result.places[0].placeName : '',
            country: result.country,
            longitude: result.places.length > 0 ? result.places[0].longitude : '',
            state: result.places.length > 0 ? result.places[0].state : '',
            latitude: result.places.length > 0 ? result.places[0].latitude : '',
            stateAbbreviation: result.places.length > 0 ? result.places[0].stateAbbreviation : ''
        };
        this.showModal = true;
    }

    storeNonUSData(result) {
        // Check if record exists based on PostCode__c using Apex
        checkExistingRecord({ postCode: result.postCode })
            .then(recordId => {
                console.log('testing ');
                console.log(recordId);
                if (recordId) {
                    // Record exists, perform update
                    const fieldsToUpdate = {
                        Id: recordId,
                        Country__c: result.countryAbbreviation,
                        PostCode__c: result.postCode,
                        Name : result.postCode
                    };
                    const recordInput = { fields: fieldsToUpdate };
                    return updateRecord(recordInput);
                } else {

                    const fields = {};
                    fields[COUNTRY_FIELD.fieldApiName] = result.countryAbbreviation;
                    fields[POSTCODE_FIELD.fieldApiName] = result.postCode;
                    fields[NAME_FIELD.fieldApiName] = result.postCode;
                    const recordInput = { apiName: ZIP_CODE_OBJECT.objectApiName, fields };
                    return createRecord(recordInput);


                }
            })
            .then(record => {
                if (record) {
                    this.showToast('Success', 'Non-US data stored successfully', 'success');
                    console.log('Upserted record Id:', record.id);
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}