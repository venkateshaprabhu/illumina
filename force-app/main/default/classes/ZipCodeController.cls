public with sharing class ZipCodeController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> fetchData(String zipCode, String country) {
        Map<String, Object> responseData = new Map<String, Object>();
        String apiUrl = 'http://api.zippopotam.us/'+country+'/' + zipCode;
        HttpRequest request = new HttpRequest();
        request.setEndpoint(apiUrl);
        request.setMethod('GET');
        
        Http http = new Http();
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            return formatKeySet((Map<String, Object>) JSON.deserializeUntyped(response.getBody()));
        } else {
            throw new AuraHandledException('Error calling Zip Code API: ' + response.getStatus());
        }
    }

    private static Map<String, Object> formatKeySet(Map<String, Object> mapData) {

        mapData.put('countryAbbreviation', mapData.remove('country abbreviation'));
        mapData.put('postCode', mapData.remove('post code'));

        List<Object> places = (List<Object>) mapData.get('places');

        for (Object place : places) {
            Map<String, Object> placeMap = (Map<String, Object>) place;
            placeMap.put('placeName', placeMap.remove('place name'));
            placeMap.put('stateAbbreviation', placeMap.remove('state abbreviation'));
        }

        return mapData;

    }

    @AuraEnabled
    public static String checkExistingRecord(String postCode) {
        try {
            Zip_Code__c existingRecord = [
                SELECT Id
                FROM Zip_Code__c
                WHERE PostCode__c = :postCode
                LIMIT 1
            ];
            return existingRecord.Id;
        } catch (Exception e) {
            return null;
        }
    }
}