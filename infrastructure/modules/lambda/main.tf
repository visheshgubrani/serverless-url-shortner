data "archive_file" "lambda" {
  type        = "zip"
  source_dir = "${var.source_dir}"
  output_path = "${var.output_dir}"
}

resource "aws_lambda_function" "lambda" {
  filename      = data.archive_file.lambda.output_path
  function_name = var.function_name
  role          = var.lambda_iam_role
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = "nodejs20.x"
}