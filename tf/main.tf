provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}

provider "google-beta" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}
// ... exi

resource "google_project_service" "services" {
  for_each = toset([
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "storage.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_firebase_project" "default" {
  provider   = google-beta
  project    = var.project_id
  depends_on = [google_project_service.services]
}

resource "google_firebase_web_app" "spa" {
  provider     = google-beta
  project      = var.project_id
  display_name = var.web_app_name
  depends_on   = [google_firebase_project.default]
}

resource "google_firebase_hosting_site" "full" {
  provider = google-beta
  project  = var.project_id
  // site_id  = "myf-live"
  site_id = var.project_id
  app_id  = google_firebase_web_app.spa.app_id
}

data "google_firebase_web_app_config" "spa" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.spa.app_id
}

resource "google_firestore_database" "default" {
  project                     = var.project_id
  name                        = "(default)"
  location_id                 = var.firestore_location
  type                        = "FIRESTORE_NATIVE"
  app_engine_integration_mode = "DISABLED"
  database_edition            = "STANDARD"
  deletion_policy             = "DELETE"
  depends_on                  = [google_project_service.services]
}

resource "google_identity_platform_config" "auth" {
  project = var.project_id

  authorized_domains = [
    "localhost",
    "127.0.0.1",
    "myf.pinkstack.com",
    "${var.project_id}.firebaseapp.com",
    "${var.project_id}.web.app"
  ]

  multi_tenant {
    allow_tenants = false
  }

  sign_in {
    allow_duplicate_emails = true

    anonymous {
      enabled = false
    }

    email {
      enabled           = true
      password_required = true
    }

    phone_number {
      enabled = false
    }


  }

  depends_on = [google_project_service.services, google_firebase_project.default]
}

resource "google_storage_bucket" "uploads" {
  name                        = "${var.project_id}-uploads"
  location                    = var.storage_location
  uniform_bucket_level_access = true
  force_destroy               = true
  depends_on                  = [google_project_service.services, google_firebase_project.default]
}

resource "google_firebase_storage_bucket" "uploads" {
  provider  = google-beta
  project   = var.project_id
  bucket_id = google_storage_bucket.uploads.name

  depends_on = [
    google_project_service.services,
    google_firebase_project.default,
    google_storage_bucket.uploads
  ]
}

resource "google_firebase_hosting_custom_domain" "default" {
  provider      = google-beta
  project       = var.project_id
  site_id       = google_firebase_hosting_site.full.site_id
  custom_domain = "myf.pinkstack.com"
}

resource "google_firebaserules_ruleset" "firestore" {
  project = var.project_id
  source {
    files {
      name    = "firestore.rules"
      content = <<EOF
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF
    }
  }
}

resource "google_firebaserules_release" "firestore" {
  name         = "cloud.firestore"
  ruleset_name = google_firebaserules_ruleset.firestore.name
  project      = var.project_id
}
