var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:4566"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "candidate-documents";

var today = new Date().toISOString().slice(0, 10);
var documentId = "BA75580A-6192-4C67-B469-B4796786672C";
var cityUploadDate = `atlanta-${today}`;

var params = {
    TableName:table,
    Item:{
        "document-id": documentId,
        "city-upload-date": cityUploadDate,
        "info":{
            "plot": "Nothing happens at all.",
            "rating": 0
        }
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});