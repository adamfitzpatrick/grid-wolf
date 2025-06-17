#!/usr/bin/perl
use strict;
use warnings;

my $registry = "https://stepinto-913697957162.d.codeartifact.us-west-2.amazonaws.com/npm/stepinto/";

my $token = qx("aws codeartifact get-authorization-token --domain stepinto --domain-owner 913697957162 --region us-west-2 --query authorizationToken --output text --profile stepinto");
system('yarn config set npmRegistries[\"' . $registry . '\"].npmAuthToken ' . $token);
system('yarn config set npmRegistries[\"' . $registry . '\"].npmAlwaysAuth true');
system('yarn config set npmRegistryServer ' . $registry);
