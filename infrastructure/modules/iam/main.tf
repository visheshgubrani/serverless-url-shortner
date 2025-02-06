data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_iam" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# Attach Cloudwatch Logs and DynamoDB policies to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_iam.name #name
  policy_arn = var.lambda_basic_policy
}

resource "aws_iam_role_policy_attachment" "lambda_dynamo_db" {
  role       = aws_iam_role.lambda_iam.name #name
  policy_arn = var.lambda_dynamodb_read_policy
}

resource "aws_iam_role_policy_attachment" "lambda_dynamo_db_put" {
  role       = aws_iam_role.lambda_iam.name #name
  policy_arn = var.lambda_dynamodb_put_policy
}

