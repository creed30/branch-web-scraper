var request = require('request');
const fs = require("fs");
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1",
    // this is used for local testing on localstack
    // endpoint: "http://localhost:4566"
    "accessKeyId": "access key here, don't upload the key!",
    "secretAccessKey": "secret key here, don't upload the key!"
});

var docClient = new AWS.DynamoDB.DocumentClient();

const CAMPAIGN_CONTRIBUTION_DISCLOSURE = "campaign contributions disclosure report";
const CAMPAIGN_CONTRIBUTIONS_DISCLOSURE = "campaign contribution disclosure report";
const TABLE = "campaign_finance_pdfs";
const DATE_PARAM = "2019-01-01"

// call Atlanta URL and return json of all candidate metadata

function runMain(city, cityUrl) {

    var options = {
        'method': 'GET',
        'url': cityUrl,
        'headers': {
        }
    };

    request(options, function (err, response) {
        if (err) throw new Error(err);
        // console.log(response.body);


        // used to test by reading the sample of the body response
        // fs.readFile('./test/atlanta-candidate-meta-all.json', 'utf8', (err, data) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {

            // parse JSON string to JSON object
            const atlantaMetadata = JSON.parse(response.body);

            //Top level going through all candidates
            atlantaMetadata.forEach(candidate => {

                // second level going through all documents within each candidate
                candidate.documents.forEach(document => {

                    // check to make sure the document type is not null or empty
                    if (document.documenttype != null && document.documenttype != '') {

                        //convert so we can compare to our enumeration
                        var documentTypeLower = document.documenttype.toLowerCase();

                        //set to check includes because there are different variations such as 
                        // a space at the end and words before and after
                        if (documentTypeLower.includes(CAMPAIGN_CONTRIBUTION_DISCLOSURE) ||
                            documentTypeLower.includes(CAMPAIGN_CONTRIBUTIONS_DISCLOSURE)) {

                            // compare the input date with the date submitted
                            const dateSubmitted = new Date(formatDate(document.datesubmitted));
                            if (dateSubmitted > new Date(DATE_PARAM)) {

                                //set up object to be stored
                                var documentMetadata = document;

                                // removing extra unneeded fields and appending all other fields to the object
                                delete documentMetadata.documentnameid;
                                for (var prop in candidate) {
                                    if (candidate.hasOwnProperty(prop) && prop != 'documents' && prop != 'imgurl') {
                                        documentMetadata[prop] = candidate[prop];
                                    }
                                }
                                console.log(city + dateSubmitted);

                                documentMetadata.documentUrl = `https://easycfangularapi.azurewebsites.net/documents/${documentMetadata.documentid}/viewfinalredactedpdf`
                                // console.log(JSON.stringify(documentMetadata));
                                storeDocumentMetadata(documentMetadata, city);
                            }
                        }
                    }
                });
            });
        }


    });

}

function storeDocumentMetadata(documentMetadata, city) {
    var today = new Date().toISOString().slice(0, 10);

    var cityUploadDate = `${city}-${today}`;
    var params = {
        TableName: TABLE,
        Item: {
            "document-id": documentMetadata.documentid,
            "city-upload-date": cityUploadDate,
            "documentMetadata": documentMetadata
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
}


function formatDate(input) {
    if (input === null) {
        return "0001-01-01";
    }
    return `20${input.substring(6, 8)}-${input.substring(0, 2)}-${input.substring(3, 5)}`;
}


function readUrlsAndWriteAllEasyVote() {
    fs.readFile('./src/urls.json', 'utf8', (err, data) => {
        if (err) throw err;
        const cities = JSON.parse(data);
        for (var city in cities) {
            if (cities[city].active) {
                console.log(city);
                runMain(city, cities[city].dataUrl);
            }
        }

    });


}

readUrlsAndWriteAllEasyVote();
