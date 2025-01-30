data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${var.source_dir}"
  output_path = "${var.output_dir}"
}

resource "aws_lambda_function" "lambda" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  filename      = data.archive_file.lambda.output_path
  function_name = var.function_name
  role          = var.lambda_iam_role
  handler       = "index.test"

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = "nodejs20.x"
}