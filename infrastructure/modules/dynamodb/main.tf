resource "aws_dynamodb_table" "url-table" {
  name           = var.dynamo_db_table_name
  billing_mode   = var.dynamo_db_billing_mode
  read_capacity  = var.dynamo_db_read_capacity
  write_capacity = var.dynamo_db_write_capacity
  hash_key       = var.dynamo_db_hash_key

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = var.dynamo_db_table_name
    Environment = "dev"
  }
}