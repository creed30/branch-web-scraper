    // Load the AWS SDK for Node.js.
    var AWS = require("aws-sdk");
    // Set the AWS Region.
    AWS.config.update({
        region: "us-east-1",
        endpoint: "http://localhost:4566"
      });    
    // Create DynamoDB service object.
    var dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
    
    var tableName = "candidate-documents";

    var params = {
    TableName: tableName,
    Select: "ALL_ATTRIBUTES"
    };
    
    
    function doScan(response) {
    if (response.error) ppJson(response.error); // an error occurred
    else {
        ppJson(response.data); // successful response
    
        // More data.  Keep calling scan.
        if ('LastEvaluatedKey' in response.data) {
            response.request.params.ExclusiveStartKey = response.data.LastEvaluatedKey;
            dynamodb.scan(response.request.params)
                .on('complete', doScan)
                .send();
        }
    }
    }
    console.log("Starting a Scan of the table");
    dynamodb.scan(params)
    .on('complete', doScan)
    .send();
    