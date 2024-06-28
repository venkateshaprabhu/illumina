@isTest
global class ZipCodeHttpMock implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
        System.assertEquals('http://api.zippopotam.us/us/10001', req.getEndpoint());
        System.assertEquals('GET', req.getMethod());
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"country abbreviation": "US", "post code": "10001", "places": [{"place name": "New York", "state abbreviation": "NY"}]}');
        return res;
    }
}