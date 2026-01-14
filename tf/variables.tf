variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-west1"
}

variable "web_app_name" {
  type    = string
  default = "myf"
}

variable "firestore_location" {
  type    = string
  default = "eur3"
}

variable "storage_location" {
  type    = string
  default = "EUROPE-WEST1"
}
