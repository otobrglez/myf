{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: let
  unstable-pkgs = import inputs.unstable-nixpkgs {
    inherit (pkgs.stdenv) system;
    config.allowUnfree = true; 
  };
in {
  cachix.enable = false;
  name = "myf";

  packages = [
    unstable-pkgs.nodejs_24
    unstable-pkgs.terraform
    unstable-pkgs.google-cloud-sdk
    pkgs.git
  ];

  languages.javascript = {
    enable = true;
    package = unstable-pkgs.nodejs_24;
    yarn.enable = true;
    yarn.install.enable = true;
  };

  enterShell = ''
    export GCP_PROJECT_ID=my-f-484214
    gcloud config set project $GCP_PROJECT_ID 
    # gcloud auth application-default set-quota-project $GCP_PROJECT_ID
  '';
}
