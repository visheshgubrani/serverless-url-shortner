module "dynamo_db_table" {
  source = "./modules/dynamodb"
  dynamo_db_table_name = var.dynamo_db_table_name
  dynamo_db_billing_mode = var.dynamo_db_billing_mode
  dynamo_db_hash_key = var.dynamo_db_hash_key
  dynamo_db_read_capacity = var.dynamo_db_read_capacity
  dynamo_db_write_capacity = var.dynamo_db_write_capacity
}

module "lambda_iam_policy" {
  source = "./modules/iam"
  lambda_basic_policy = var.lambda_basic_policy
  lambda_dynamodb_read_policy = var.lambda_dynamodb_read_policy
  lambda_dynamodb_put_policy = var.lambda_dynamodb_put_policy
  role_name = var.role_name
}

module "shorten_url_function" {
  source = "./modules/lambda"
  function_name = "shortenUrl"
  source_dir = "${path.module}/modules/lambda/shortenUrl"
  output_dir = "${path.module}/modules/lambda/shortenUrl/shorten_url.zip"
  lambda_iam_role = module.lambda_iam_policy.lambda_role_arn
}

module "redirect_url_function" {
  source = "./modules/lambda"
  function_name = "redirectUrl"
  source_dir = "${path.module}/modules/lambda/redirectUrl"
  output_dir = "${path.module}/modules/lambda/redirectUrl/redirect_url.zip"
  lambda_iam_role = module.lambda_iam_policy.lambda_role_arn
}

module "url_stats_function" {                                         
  source = "./modules/lambda"
  function_name = "urlStats"
  source_dir = "${path.module}/modules/lambda/urlStats"
  output_dir = "${path.module}/modules/lambda/urlStats/url_stats.zip"
  lambda_iam_role = module.lambda_iam_policy.lambda_role_arn
}