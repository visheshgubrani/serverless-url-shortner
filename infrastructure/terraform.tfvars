region = "ap-south-1"

# DyanmoDb
dynamo_db_table_name = "urls"
dynamo_db_read_capacity = 1
dynamo_db_write_capacity = 1
dynamo_db_hash_key = "id"
dynamo_db_billing_mode = "PROVISIONED"

lambda_basic_policy         = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
lambda_dynamodb_read_policy = "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess"
lambda_dynamodb_put_policy = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
role_name                   = "lambda_url_policy"