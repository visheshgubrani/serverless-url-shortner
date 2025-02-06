terraform {
  backend "s3" {
    bucket = "terraformstatestorebucket123"
    key = "terraform.tfstate"
    region = "ap-south-1"
    encrypt = true
    dynamodb_endpoint = "tf-lock-table-url"
  }
}
