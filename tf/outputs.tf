output "firebase_web_config" {
  value = {
    apiKey            = data.google_firebase_web_app_config.spa.api_key
    appId             = data.google_firebase_web_app_config.spa.web_app_id
    authDomain        = data.google_firebase_web_app_config.spa.auth_domain
    measurementId     = data.google_firebase_web_app_config.spa.measurement_id
    messagingSenderId = data.google_firebase_web_app_config.spa.messaging_sender_id
    projectId         = data.google_firebase_web_app_config.spa.project
    storageBucket     = data.google_firebase_web_app_config.spa.storage_bucket
  }
  sensitive = true
}

output "custom_domain_dns_updates" {
  value = google_firebase_hosting_custom_domain.default.required_dns_updates
}