@isTest
private class ZipCodeControllerTest {

    @isTest
    static void testFetchData() {
        String zipCode = '10001';
        String country = 'us';
        Test.setMock(HttpCalloutMock.class, new ZipCodeHttpMock());

        Test.startTest();
        Map<String, Object> result = ZipCodeController.fetchData(zipCode, country);
        Test.stopTest();

        System.assertEquals('US', result.get('countryAbbreviation'));
        System.assertEquals('10001', result.get('postCode'));

        List<Object> places = (List<Object>) result.get('places');
        if (!places.isEmpty()) {
            Map<String, Object> place = (Map<String, Object>) places[0];
            System.assertEquals('New York', place.get('placeName'));
            System.assertEquals('NY', place.get('stateAbbreviation'));
        }
    }

    @isTest
    static void testCheckExistingRecord() {
        String postCode = '10001';
        Zip_Code__c testRecord = new Zip_Code__c(PostCode__c = postCode);
        insert testRecord;
        Test.startTest();
        String existingRecordId = ZipCodeController.checkExistingRecord(postCode);
        Test.stopTest();
        System.assertNotEquals(null, existingRecordId);
    }
}